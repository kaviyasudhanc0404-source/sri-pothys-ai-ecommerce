import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Sparkles, Camera, X, Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { products, Product } from "@/data/products";
import { analyzeImage, ImageAnalysis } from "@/services/tensorflowStylist";
import { toast } from "sonner";

const AIRecommendations = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<Product[] | null>(null);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [baseAnalysis, setBaseAnalysis] = useState<ImageAnalysis | null>(null);
  const [refineForm, setRefineForm] = useState({
    gender: "unisex",
    occasion: "Casual",
    fashionCategory: "unknown",
  });
  const [dragOver, setDragOver] = useState(false);

  const resetUploadState = () => {
    setUploadedImage(null);
    setResults(null);
    setAnalysis(null);
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      setAnalyzing(false);
      toast.error("Could not read image", {
        description: "Please try another image file.",
      });
    };

    reader.onload = async (event) => {
      const imageDataUrl = event.target?.result;
      if (typeof imageDataUrl !== "string") {
        setAnalyzing(false);
        toast.error("Could not read image", {
          description: "Please try another image file.",
        });
        return;
      }

      setUploadedImage(imageDataUrl);
      setResults(null);
      setAnalysis(null);
      setAnalyzing(true);

      try {
        toast.info("Analyzing your image with browser AI...", { duration: 2000 });
        const analysisResult = await analyzeImage(file);
        const recommendations = filterProductsByAnalysis(analysisResult);

        setAnalysis(analysisResult);
        setBaseAnalysis(analysisResult);
        setRefineForm({
          gender: analysisResult.gender,
          occasion: analysisResult.occasion,
          fashionCategory: analysisResult.fashionCategory,
        });
        setResults(recommendations);

        toast.success(`Found ${recommendations.length} matching outfits`, {
          description: `${analysisResult.fashionCategory.replace("-", " ")} | ${analysisResult.occasion}`,
        });
      } catch (error: any) {
        setAnalysis(null);
        setResults(null);
        toast.error("Analysis Failed", {
          description: error.message || "Please try uploading a different image.",
        });
      } finally {
        setAnalyzing(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const filterProductsByAnalysis = (result: ImageAnalysis): Product[] => {
    let filteredProducts = products;

    if (result.gender === "male") {
      filteredProducts = filteredProducts.filter((product) => product.gender === "male" || product.gender === "unisex");
    } else if (result.gender === "female") {
      filteredProducts = filteredProducts.filter((product) => product.gender === "female" || product.gender === "unisex");
    }

    const preferredColors = getPreferredColors(result.skinTone);

    return filteredProducts
      .map((product) => {
        let score = 0;

        if (result.gender !== "unisex" && product.gender === result.gender) score += 10;
        if (colorMatches(product.color, result.detectedColors)) score += 8;
        if (preferredColors.length && preferredColors.some((color) => normalizeColor(product.color) === color)) score += 4;
        if (product.occasion.toLowerCase() === result.occasion.toLowerCase()) score += 3;
        if (matchesFashionCategory(product, result.fashionCategory)) score += 3;
        if (result.labels.some((label) => product.name.toLowerCase().includes(label) || product.category.toLowerCase().includes(label))) score += 2;
        if (product.isNew) score += 1;
        if (product.badge) score += 1;

        return { product, score };
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, 12)
      .map(({ product }) => product);
  };

  const applyRefinement = () => {
    if (!baseAnalysis) return;

    const next: ImageAnalysis = {
      ...baseAnalysis,
      gender: refineForm.gender as ImageAnalysis["gender"],
      occasion: refineForm.occasion,
      fashionCategory: refineForm.fashionCategory as ImageAnalysis["fashionCategory"],
      isLowConfidence: false,
      description: "Recommendations refined based on your selection.",
    };

    setAnalysis(next);
    setResults(filterProductsByAnalysis(next));
  };

  const resetRefinement = () => {
    if (!baseAnalysis) return;
    setAnalysis(baseAnalysis);
    setResults(filterProductsByAnalysis(baseAnalysis));
    setRefineForm({
      gender: baseAnalysis.gender,
      occasion: baseAnalysis.occasion,
      fashionCategory: baseAnalysis.fashionCategory,
    });
  };

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];

    if (file?.type.startsWith("image/")) {
      handleFile(file);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <div className="gradient-hero py-12 sm:py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-4">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-sm text-primary-foreground">AI Style Assistant</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Find Your Perfect Outfit</h1>
            <p className="text-primary-foreground/70 max-w-lg mx-auto">
              Upload your photo and we will analyze the image locally, then suggest outfits that match your style.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto mb-12">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`relative border-2 border-dashed rounded-3xl p-5 sm:p-10 text-center transition-all ${
              dragOver ? "border-gold bg-gold/5 scale-[1.02]" : "border-border hover:border-primary/50"
            }`}
          >
            {uploadedImage ? (
              <div className="relative inline-block max-w-full">
                <img src={uploadedImage} alt="Uploaded" className="max-h-64 w-auto rounded-2xl shadow-lg mx-auto" />
                <button
                  onClick={resetUploadState}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>

                {(analysis || results) && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-2xl text-left">
                    <p className="text-sm font-semibold mb-2">Style Picks for You</p>
                    {results?.length ? (
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {results.slice(0, 5).map((product) => (
                          <li key={product.id}>{product.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">Upload a photo to get personalized outfit picks.</p>
                    )}

                    <div className="mt-4">
                      <p className="text-xs font-semibold mb-2">Fashion Tips</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {buildFashionTips(analysis, results).map((tip) => (
                          <li key={tip}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {analysis && (
                  <div className="mt-4 p-4 bg-muted/40 rounded-2xl text-left">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold">Refine Recommendations</p>
                      <button onClick={resetRefinement} className="text-xs text-muted-foreground hover:text-foreground">Reset</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground">Category</label>
                        <select
                          value={refineForm.gender}
                          onChange={(event) => setRefineForm((prev) => ({ ...prev, gender: event.target.value }))}
                          className="mt-1 w-full bg-background rounded-xl px-3 py-2 text-xs border border-border"
                        >
                          <option value="female">Women</option>
                          <option value="male">Men</option>
                          <option value="unisex">Unisex</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground">Occasion</label>
                        <select
                          value={refineForm.occasion}
                          onChange={(event) => setRefineForm((prev) => ({ ...prev, occasion: event.target.value }))}
                          className="mt-1 w-full bg-background rounded-xl px-3 py-2 text-xs border border-border"
                        >
                          {[
                            "Casual",
                            "Formal",
                            "Party",
                            "Wedding",
                            "Festival",
                          ].map((value) => (
                            <option key={value} value={value}>{value}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground">Fashion Type</label>
                        <select
                          value={refineForm.fashionCategory}
                          onChange={(event) => setRefineForm((prev) => ({ ...prev, fashionCategory: event.target.value }))}
                          className="mt-1 w-full bg-background rounded-xl px-3 py-2 text-xs border border-border"
                        >
                          <option value="womens-ethnic">Women's Ethnic</option>
                          <option value="mens-ethnic">Men's Ethnic</option>
                          <option value="western-top">Western Topwear</option>
                          <option value="western-bottom">Western Bottomwear</option>
                          <option value="full-look">Full Outfit</option>
                          <option value="unknown">General Fashion</option>
                        </select>
                      </div>
                    </div>
                    <button onClick={applyRefinement} className="btn-gold text-xs mt-4">Apply</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-display text-lg font-bold mb-2">Upload Your Photo</h3>
                <p className="text-sm text-muted-foreground mb-4">Drag and drop or click to browse</p>
                <label className="btn-gold text-sm cursor-pointer inline-block">
                  <Camera className="w-4 h-4 inline mr-2" />
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) handleFile(file);
                    }}
                  />
                </label>
                <p className="text-xs text-muted-foreground mt-4">Tip: Use a clear, full-body photo for best results</p>
              </>
            )}
          </div>
        </div>

        <AnimatePresence>
          {analyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
              <Loader2 className="w-10 h-10 text-gold mx-auto mb-4 animate-spin" />
              <h3 className="font-display text-lg font-bold mb-1">Analyzing your style...</h3>
              <p className="text-sm text-muted-foreground">Running browser-side fashion analysis and matching your best outfits</p>
              <div className="mt-6 max-w-xs mx-auto space-y-2">
                {["Loading model", "Extracting outfit-region colors", "Scoring the best matches"].map((step, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.4 }}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <Sparkles className="w-3 h-3 text-gold" /> {step}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {results && !analyzing && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl font-bold mb-2">Recommended for You</h2>
                <p className="text-sm text-muted-foreground">Recommendations now prioritize fashion type, outfit colors, and occasion instead of weak generic labels</p>
              </div>

              {/* Mobile: horizontal swipe */}
              <div className="sm:hidden flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
                {results.map((product) => (
                  <div key={product.id} className="shrink-0 min-w-[76vw] max-w-[76vw] min-[420px]:min-w-[260px] min-[420px]:max-w-[260px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Tablet/Desktop: grid */}
              <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!uploadedImage && (
          <section className="mt-14 sm:mt-20 glass-card rounded-3xl p-5 sm:p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 mb-4">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold-dark">How It Works</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">AI-Powered Styling</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Upload your photo, let the browser-side fashion model inspect the image, then explore your recommended outfits.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { step: "1", title: "Upload Photo", desc: "Share a clear photo of yourself" },
                { step: "2", title: "AI Analysis", desc: "The browser-side model compares your image against fashion-specific outfit prompts" },
                { step: "3", title: "Get Recommendations", desc: "See tailored picks based on your photo" },
              ].map((item) => (
                <div key={item.step} className="p-4 bg-muted/50 rounded-2xl">
                  <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center text-sm font-bold text-maroon-dark mx-auto mb-3">
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

function matchesFashionCategory(product: Product, fashionCategory: ImageAnalysis["fashionCategory"]) {
  if (fashionCategory === "womens-ethnic") {
    return product.gender === "female" && ["Sarees", "Lehengas", "Suits"].includes(product.category);
  }

  if (fashionCategory === "mens-ethnic") {
    return product.gender === "male" && product.occasion !== "Casual";
  }

  if (fashionCategory === "western-top") {
    return product.garmentType === "upper";
  }

  if (fashionCategory === "western-bottom") {
    return product.garmentType === "lower";
  }

  if (fashionCategory === "full-look") {
    return product.garmentType === "full";
  }

  return false;
}

function normalizeColor(color: string) {
  const normalized = color.toLowerCase();
  if (normalized.includes("maroon")) return "maroon";
  if (normalized.includes("gold")) return "gold";
  if (normalized.includes("pink")) return "pink";
  if (normalized.includes("purple")) return "purple";
  if (normalized.includes("red")) return "red";
  if (normalized.includes("blue")) return "blue";
  if (normalized.includes("green")) return "green";
  if (normalized.includes("black")) return "black";
  if (normalized.includes("white")) return "white";
  if (normalized.includes("cream") || normalized.includes("ivory") || normalized.includes("beige")) return "beige";
  if (normalized.includes("yellow")) return "yellow";
  if (normalized.includes("orange")) return "orange";
  if (normalized.includes("brown")) return "brown";
  return normalized;
}

function colorMatches(productColor: string, detectedColors: string[]) {
  const productNormalized = normalizeColor(productColor);
  return detectedColors.some((color) => normalizeColor(color) === productNormalized);
}

function getPreferredColors(tone: ImageAnalysis["skinTone"]) {
  if (tone === "light") return ["maroon", "red", "blue", "green", "black", "purple"];
  if (tone === "medium") return ["maroon", "gold", "blue", "green", "purple", "pink"];
  if (tone === "deep") return ["gold", "yellow", "white", "beige", "red", "blue"];
  return [];
}

function buildFashionTips(analysis: ImageAnalysis | null, picks: Product[] | null) {
  if (!analysis) {
    return ["Upload a clear, front-facing photo for the best match."];
  }

  const tips: string[] = [];
  const preferredColors = getPreferredColors(analysis.skinTone);

  if (analysis.detectedColors.length) {
    tips.push(`We matched your outfit colors: ${analysis.detectedColors.join(", ")}.`);
  }

  if (preferredColors.length) {
    tips.push(`Colors that flatter your skin tone: ${preferredColors.join(", ")}.`);
  }

  if (analysis.gender === "male") {
    tips.push("Try crisp shirts, kurtas, or sherwanis in the suggested palette.");
  } else if (analysis.gender === "female") {
    tips.push("Sarees, kurtis, and lehengas in the suggested palette will stand out.");
  } else {
    tips.push("Focus on silhouettes you like, then match them with the suggested colors.");
  }

  if (picks?.length) {
    tips.push("Check the top picks above and start with the first 2-3 options.");
  }

  return tips;
}

export default AIRecommendations;
