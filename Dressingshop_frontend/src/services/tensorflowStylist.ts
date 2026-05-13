import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

export interface ImageAnalysis {
  description: string;
  gender: "male" | "female" | "unisex";
  skinTone: "light" | "medium" | "deep" | "unknown";
  detectedColors: string[];
  style: string;
  occasion: string;
  labels: string[];
  confidence: number;
  fashionCategory: "womens-ethnic" | "mens-ethnic" | "western-top" | "western-bottom" | "full-look" | "unknown";
  isLowConfidence: boolean;
}

type ColorRegion = "torso" | "full";

type FashionPrompt = {
  label: string;
  gender: ImageAnalysis["gender"];
  style: ImageAnalysis["style"];
  occasion: ImageAnalysis["occasion"];
  fashionCategory: ImageAnalysis["fashionCategory"];
  tags: string[];
};

const MIN_STRONG_CONFIDENCE = 0.4;
const MIN_SEPARATION = 0.12;
const MODEL_TIMEOUT_MS = 20000;
const MOBILENET_MODEL_URLS = [
  import.meta.env.VITE_TFJS_MOBILENET_MODEL_URL,
  "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v2_1.0_224/model.json",
  "https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet_v2_1.0_224/model.json",
  "https://unpkg.com/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet_v2_1.0_224/model.json",
].filter(Boolean) as string[];

const PROMPTS: FashionPrompt[] = [
  {
    label: "a man wearing a formal white shirt",
    gender: "male",
    style: "formal",
    occasion: "Formal",
    fashionCategory: "western-top",
    tags: ["formal shirt", "mens shirt", "office wear"],
  },
  {
    label: "a man wearing a casual t-shirt or polo shirt",
    gender: "male",
    style: "casual",
    occasion: "Casual",
    fashionCategory: "western-top",
    tags: ["t-shirt", "polo shirt", "casual top"],
  },
  {
    label: "a man wearing trousers or pants",
    gender: "male",
    style: "casual",
    occasion: "Casual",
    fashionCategory: "western-bottom",
    tags: ["trousers", "pants", "bottomwear"],
  },
  {
    label: "a man wearing a kurta or traditional ethnic outfit",
    gender: "male",
    style: "ethnic",
    occasion: "Festival",
    fashionCategory: "mens-ethnic",
    tags: ["kurta", "ethnic wear", "festival"],
  },
  {
    label: "a man wearing a sherwani or wedding outfit",
    gender: "male",
    style: "wedding",
    occasion: "Wedding",
    fashionCategory: "mens-ethnic",
    tags: ["sherwani", "wedding wear", "traditional groom"],
  },
  {
    label: "a woman wearing a saree",
    gender: "female",
    style: "ethnic",
    occasion: "Wedding",
    fashionCategory: "womens-ethnic",
    tags: ["saree", "traditional wear", "ethnic"],
  },
  {
    label: "a woman wearing a lehenga or bridal outfit",
    gender: "female",
    style: "wedding",
    occasion: "Wedding",
    fashionCategory: "womens-ethnic",
    tags: ["lehenga", "bridal", "wedding wear"],
  },
  {
    label: "a woman wearing a kurti or salwar suit",
    gender: "female",
    style: "ethnic",
    occasion: "Festival",
    fashionCategory: "womens-ethnic",
    tags: ["kurti", "salwar suit", "festival wear"],
  },
  {
    label: "a woman wearing a western top or blouse",
    gender: "female",
    style: "casual",
    occasion: "Casual",
    fashionCategory: "western-top",
    tags: ["top", "blouse", "western topwear"],
  },
  {
    label: "a woman wearing a dress or gown for a party",
    gender: "female",
    style: "party",
    occasion: "Party",
    fashionCategory: "full-look",
    tags: ["dress", "gown", "party wear"],
  },
  {
    label: "a person wearing jeans skirt or bottomwear",
    gender: "unisex",
    style: "casual",
    occasion: "Casual",
    fashionCategory: "western-bottom",
    tags: ["jeans", "skirt", "bottomwear"],
  },
  {
    label: "a person wearing a full casual outfit",
    gender: "unisex",
    style: "casual",
    occasion: "Casual",
    fashionCategory: "full-look",
    tags: ["full outfit", "casual look", "day wear"],
  },
];

let classifierPromise: Promise<mobilenet.MobileNet> | null = null;

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> =>
  await new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error(message)), timeoutMs);
    promise
      .then((value) => {
        window.clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timeout);
        reject(error);
      });
  });

export async function analyzeImage(imageFile: File): Promise<ImageAnalysis> {
  await configureTensorflow();

  const image = await fileToImage(imageFile);
  const focusCanvas = getCenterCropCanvas(image);
  const faceCanvas = getFaceCropCanvas(image);
  const torsoColors = extractDominantColors(image, "torso");
  const fullColors = extractDominantColors(image, "full");
  const detectedColors = dedupeColors([...torsoColors, ...fullColors]).slice(0, 4);
  const skinTone = estimateSkinTone(image);

  try {
    const classifier = await withTimeout(getClassifier(), MODEL_TIMEOUT_MS, "Model load timed out");
    const bodyPredictions = await withTimeout(classifier.classify(focusCanvas), MODEL_TIMEOUT_MS, "Model inference timed out");
    const facePredictions = await withTimeout(classifier.classify(faceCanvas), MODEL_TIMEOUT_MS, "Model inference timed out");
    const predictions = mergePredictions([
      { entries: bodyPredictions, weight: 0.45 },
      { entries: facePredictions, weight: 0.55 },
    ]);

    if (!Array.isArray(predictions) || predictions.length === 0) {
      return buildFallbackAnalysis(detectedColors, 0, { skinTone });
    }

    const genderHint = detectGenderFromPredictions(predictions);
    const bestPrompt = pickPromptFromPredictions(bodyPredictions, genderHint.gender);
    const topPrediction = bodyPredictions[0];
    const secondPrediction = bodyPredictions[1];
    const confidence = topPrediction?.probability ?? 0;
    const separation = Math.max(0, confidence - (secondPrediction?.probability ?? 0));
    const isLowConfidence = confidence < MIN_STRONG_CONFIDENCE || separation < MIN_SEPARATION || !bestPrompt;

    const inferredOccasion = inferOccasionFromColors(detectedColors);
    const inferredStyle = inferStyleFromOccasion(inferredOccasion);
    const cleanedLabels = filterFashionLabels(predictions);
    const labelGender = inferGenderFromLabels(cleanedLabels);
    const inferredGender = labelGender !== "unisex" ? labelGender : genderHint.strength > 0.05 ? genderHint.gender : "unisex";

    if (!bestPrompt) {
      return buildFallbackAnalysis(detectedColors, confidence, {
        gender: inferredGender,
        occasion: inferredOccasion,
        style: inferredStyle,
        labels: cleanedLabels,
        skinTone,
      });
    }

    const mergedOccasion = tuneOccasion(bestPrompt.occasion, detectedColors, bestPrompt.fashionCategory);
    const mergedStyle = tuneStyle(bestPrompt.style, mergedOccasion);

    return {
      description: buildDescription(bestPrompt, detectedColors, isLowConfidence),
      gender: isLowConfidence ? inferredGender : bestPrompt.gender,
      skinTone,
      detectedColors: detectedColors.length > 0 ? detectedColors : ["neutral"],
      style: isLowConfidence ? inferredStyle : mergedStyle,
      occasion: isLowConfidence ? inferredOccasion : mergedOccasion,
      labels: cleanedLabels,
      confidence,
      fashionCategory: isLowConfidence ? "unknown" : bestPrompt.fashionCategory,
      isLowConfidence,
    };
  } catch (error) {
    console.warn("Fashion analysis model unavailable, using fallback analysis:", error);
    classifierPromise = null;
    return buildFallbackAnalysis(detectedColors, 0, { skinTone });
  } finally {
    image.remove();
  }
}

async function configureTensorflow() {
  if (!tf.getBackend()) {
    try {
      await tf.setBackend("webgl");
    } catch {
      await tf.setBackend("cpu");
    }
  }
  await tf.ready();
}

async function getClassifier() {
  if (!classifierPromise) {
    classifierPromise = loadMobileNet();
  }

  return classifierPromise;
}

async function loadMobileNet() {
  let lastError: unknown = null;

  for (const modelUrl of MOBILENET_MODEL_URLS) {
    try {
      return await mobilenet.load({ version: 2, alpha: 1.0, modelUrl });
    } catch (error) {
      lastError = error;
    }
  }

  try {
    return await mobilenet.load({ version: 2, alpha: 1.0 });
  } catch (error) {
    throw lastError ?? error;
  }
}

function pickPromptFromPredictions(
  predictions: Array<{ className: string; probability: number }>,
  genderHint: ImageAnalysis["gender"]
) {
  const topCandidates = predictions.slice(0, 5);
  let bestPrompt: FashionPrompt | undefined;
  let bestScore = 0;

  const eligiblePrompts = PROMPTS.filter(
    (prompt) => genderHint === "unisex" || prompt.gender === "unisex" || prompt.gender === genderHint
  );

  for (const prompt of eligiblePrompts) {
    const keywords = buildPromptKeywords(prompt);
    const score = topCandidates.reduce((total, entry) => {
      const label = entry.className.toLowerCase();
      const match = keywords.some((keyword) => label.includes(keyword));
      return total + (match ? entry.probability : 0);
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestPrompt = prompt;
    }
  }

  return bestScore > 0.06 ? bestPrompt : undefined;
}

function detectGenderFromPredictions(predictions: Array<{ className: string; probability: number }>) {
  const maleTokens = ["man", "male", "boy", "groom", "suit", "tie", "tuxedo", "beard", "mustache", "sherwani", "kurta"];
  const femaleTokens = ["woman", "female", "girl", "bride", "dress", "gown", "skirt", "saree", "sari", "lehenga", "kurti", "abaya", "lipstick"];

  const scoreTokens = (tokens: string[]) =>
    predictions.reduce((sum, entry) => {
      const label = entry.className.toLowerCase();
      return tokens.some((token) => label.includes(token)) ? sum + entry.probability : sum;
    }, 0);

  const maleScore = scoreTokens(maleTokens);
  const femaleScore = scoreTokens(femaleTokens);
  const strength = Math.abs(maleScore - femaleScore);

  if (maleScore - femaleScore > 0.05) return { gender: "male" as const, strength };
  if (femaleScore - maleScore > 0.05) return { gender: "female" as const, strength };
  return { gender: "unisex" as const, strength };
}

function getCenterCropCanvas(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return image;

  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const cropScale = 0.72;
  const cropWidth = Math.round(sourceWidth * cropScale);
  const cropHeight = Math.round(sourceHeight * cropScale);
  const sx = Math.max(0, Math.round((sourceWidth - cropWidth) / 2));
  const sy = Math.max(0, Math.round((sourceHeight - cropHeight) / 2));

  canvas.width = 224;
  canvas.height = 224;
  ctx.drawImage(image, sx, sy, cropWidth, cropHeight, 0, 0, 224, 224);

  return canvas;
}

function getFaceCropCanvas(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return image;

  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const cropWidth = Math.round(sourceWidth * 0.36);
  const cropHeight = Math.round(sourceHeight * 0.28);
  const sx = Math.max(0, Math.round((sourceWidth - cropWidth) / 2));
  const sy = Math.max(0, Math.round(sourceHeight * 0.12));

  canvas.width = 224;
  canvas.height = 224;
  ctx.drawImage(image, sx, sy, cropWidth, cropHeight, 0, 0, 224, 224);

  return canvas;
}

function mergePredictions(
  sources: Array<{ entries: Array<{ className: string; probability: number }>; weight: number }>
) {
  const merged = new Map<string, number>();

  for (const source of sources) {
    for (const entry of source.entries) {
      const key = entry.className;
      merged.set(key, (merged.get(key) ?? 0) + entry.probability * source.weight);
    }
  }

  return [...merged.entries()]
    .map(([className, probability]) => ({ className, probability }))
    .sort((left, right) => right.probability - left.probability)
    .slice(0, 10);
}

function buildPromptKeywords(prompt: FashionPrompt) {
  const base = prompt.tags.flatMap((tag) => tag.toLowerCase().split(/\s+/));

  const extra = [
    ...(prompt.gender === "male" ? ["mens", "man", "boy"] : []),
    ...(prompt.gender === "female" ? ["womens", "woman", "girl", "ladies"] : []),
  ];

  const labelExtras: Record<string, string[]> = {
    "a man wearing a formal white shirt": ["shirt", "dress shirt", "suit", "blazer"],
    "a man wearing a casual t-shirt or polo shirt": ["t-shirt", "tshirt", "tee", "polo"],
    "a man wearing trousers or pants": ["trouser", "pants", "jean", "denim", "chino"],
    "a man wearing a kurta or traditional ethnic outfit": ["kurta", "traditional", "ethnic"],
    "a man wearing a sherwani or wedding outfit": ["sherwani", "wedding", "groom"],
    "a woman wearing a saree": ["saree", "sari", "silk"],
    "a woman wearing a lehenga or bridal outfit": ["lehenga", "bridal", "gown"],
    "a woman wearing a kurti or salwar suit": ["kurti", "salwar", "kameez", "suit"],
    "a woman wearing a western top or blouse": ["top", "blouse", "shirt"],
    "a woman wearing a dress or gown for a party": ["dress", "gown", "skirt"],
    "a person wearing jeans skirt or bottomwear": ["jean", "skirt", "pant", "bottom"],
    "a person wearing a full casual outfit": ["outfit", "casual", "street"],
  };

  return [...new Set([...base, ...extra, ...(labelExtras[prompt.label] || [])].filter(Boolean))];
}

function buildFallbackAnalysis(
  detectedColors: string[],
  confidence: number,
  overrides?: Partial<Pick<ImageAnalysis, "gender" | "occasion" | "style" | "labels" | "skinTone">>
): ImageAnalysis {
  const occasion = overrides?.occasion ?? inferOccasionFromColors(detectedColors);
  const style = overrides?.style ?? inferStyleFromOccasion(occasion);
  const gender = overrides?.gender ?? "unisex";
  const skinTone = overrides?.skinTone ?? "unknown";

  return {
    description: "The image could not be classified confidently into a catalog fashion type, so broad color-based recommendations are being used.",
    gender,
    skinTone,
    detectedColors: detectedColors.length > 0 ? detectedColors : ["neutral"],
    style,
    occasion,
    labels: overrides?.labels?.length ? overrides.labels : ["general fashion"],
    confidence,
    fashionCategory: "unknown",
    isLowConfidence: true,
  };
}

function inferOccasionFromColors(colors: string[]) {
  const normalized = colors.map((color) => color.toLowerCase());
  if (normalized.some((color) => ["gold", "maroon", "beige"].includes(color))) return "Wedding" as const;
  if (normalized.some((color) => ["black", "white", "navy", "blue"].includes(color))) return "Formal" as const;
  if (normalized.some((color) => ["pink", "purple", "red"].includes(color))) return "Party" as const;
  return "Casual" as const;
}

function inferStyleFromOccasion(occasion: ImageAnalysis["occasion"]): ImageAnalysis["style"] {
  if (occasion === "Wedding") return "wedding";
  if (occasion === "Formal") return "formal";
  if (occasion === "Party") return "party";
  return "casual";
}

function filterFashionLabels(predictions: Array<{ className: string; probability: number }>) {
  const fashionTokens = [
    "saree",
    "sari",
    "lehenga",
    "kurta",
    "kurti",
    "sherwani",
    "shirt",
    "t-shirt",
    "tshirt",
    "polo",
    "dress",
    "gown",
    "skirt",
    "suit",
    "blazer",
    "jean",
    "trouser",
    "pants",
    "jacket",
    "sweater",
    "sweatshirt",
  ];

  const labels = predictions
    .filter((entry) => fashionTokens.some((token) => entry.className.toLowerCase().includes(token)))
    .slice(0, 3)
    .map((entry) => entry.className.split(",")[0].trim());

  return labels.length ? labels : ["general fashion"];
}

function inferGenderFromLabels(labels: string[]): ImageAnalysis["gender"] {
  const normalized = labels.map((label) => label.toLowerCase());
  const maleHints = ["suit", "blazer", "tuxedo", "sherwani", "kurta", "shirt", "trouser", "jean", "pants", "jersey"];
  const femaleHints = ["saree", "sari", "lehenga", "kurti", "dress", "gown", "skirt", "blouse"];

  if (normalized.some((label) => maleHints.some((hint) => label.includes(hint)))) return "male";
  if (normalized.some((label) => femaleHints.some((hint) => label.includes(hint)))) return "female";
  return "unisex";
}

function estimateSkinTone(image: HTMLImageElement): ImageAnalysis["skinTone"] {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) return "unknown";

  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;

  const sx = Math.round(sourceWidth * 0.3);
  const sy = Math.round(sourceHeight * 0.15);
  const sw = Math.round(sourceWidth * 0.4);
  const sh = Math.round(sourceHeight * 0.35);

  canvas.width = 64;
  canvas.height = 64;
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, 64, 64);

  const { data } = ctx.getImageData(0, 0, 64, 64);
  let skinPixels = 0;
  let luminanceSum = 0;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha < 200) continue;

    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];

    const cb = 128 - 0.168736 * red - 0.331264 * green + 0.5 * blue;
    const cr = 128 + 0.5 * red - 0.418688 * green - 0.081312 * blue;

    if (cr > 133 && cr < 173 && cb > 77 && cb < 127) {
      const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
      luminanceSum += luminance;
      skinPixels += 1;
    }
  }

  if (skinPixels < 40) return "unknown";

  const avgLuminance = luminanceSum / skinPixels;
  if (avgLuminance >= 170) return "light";
  if (avgLuminance >= 120) return "medium";
  return "deep";
}

function tuneOccasion(
  occasion: ImageAnalysis["occasion"],
  colors: string[],
  fashionCategory: ImageAnalysis["fashionCategory"]
): ImageAnalysis["occasion"] {
  if (fashionCategory === "womens-ethnic" || fashionCategory === "mens-ethnic") {
    return colors.includes("gold") || colors.includes("maroon") ? "Wedding" : occasion;
  }

  if (colors.includes("black") && colors.includes("white") && occasion === "Casual") {
    return "Formal";
  }

  return occasion;
}

function tuneStyle(style: ImageAnalysis["style"], occasion: ImageAnalysis["occasion"]): ImageAnalysis["style"] {
  if (occasion === "Wedding") return "wedding";
  if (occasion === "Formal") return "formal";
  return style;
}

function buildDescription(prompt: FashionPrompt, colors: string[], isLowConfidence: boolean) {
  const colorText = colors.slice(0, 3).join(", ") || "neutral tones";

  if (isLowConfidence) {
    return `The browser-side fashion classifier found a weak match for ${prompt.tags[0]}. Using ${colorText} from the outfit region, broad recommendations are shown instead of forcing a wrong category.`;
  }

  return `The browser-side fashion classifier matched this photo to ${prompt.tags[0]}. Outfit-region colors ${colorText} are used to refine the recommendations.`;
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load uploaded image."));
    };

    image.src = url;
  });
}


function extractDominantColors(image: HTMLImageElement, region: ColorRegion): string[] {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) {
    return ["neutral"];
  }

  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;

  let sx = 0;
  let sy = 0;
  let sw = sourceWidth;
  let sh = sourceHeight;

  if (region === "torso") {
    sx = Math.round(sourceWidth * 0.25);
    sy = Math.round(sourceHeight * 0.28);
    sw = Math.round(sourceWidth * 0.5);
    sh = Math.round(sourceHeight * 0.42);
  }

  canvas.width = 96;
  canvas.height = 96;
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, 96, 96);

  const { data } = ctx.getImageData(0, 0, 96, 96);
  const counts = new Map<string, number>();

  for (let index = 0; index < data.length; index += 16) {
    if (data[index + 3] < 200) continue;
    const color = rgbToColorName(data[index], data[index + 1], data[index + 2]);
    counts.set(color, (counts.get(color) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([color]) => color)
    .slice(0, 3);
}

function dedupeColors(colors: string[]) {
  return [...new Set(colors.filter(Boolean))];
}

function rgbToColorName(red: number, green: number, blue: number) {
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const brightness = (max + min) / 2;

  if (brightness < 35) return "black";
  if (brightness > 220 && delta < 20) return "white";
  if (delta < 18) return "gray";

  const hue = getHue(red, green, blue);

  if (hue < 15 || hue >= 345) return brightness > 165 ? "pink" : "red";
  if (hue < 40) return brightness < 120 ? "brown" : "orange";
  if (hue < 65) return brightness > 175 ? "beige" : "yellow";
  if (hue < 170) return "green";
  if (hue < 255) return "blue";
  if (hue < 320) return "purple";
  return "brown";
}

function getHue(red: number, green: number, blue: number) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (delta === 0) return 0;

  let hue = 0;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;

  const normalized = hue * 60;
  return Math.round(normalized < 0 ? normalized + 360 : normalized);
}

