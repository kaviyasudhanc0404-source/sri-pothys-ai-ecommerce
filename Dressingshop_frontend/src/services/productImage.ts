type ProductImageInput = {
  image?: string;
  name?: string;
  category?: string;
  occasion?: string;
  color?: string;
};

const curatedProductImages: Record<string, string> = {
  "Kanchipuram Silk Saree - Royal Blue": "/images/products/sarees/saree-1.svg?v=2",
  "Banarasi Silk Saree - Maroon Gold": "/images/products/sarees/banarasi-maroon-gold.jpg?v=1",
  "Chiffon Saree - Party Wear": "/images/products/sarees/saree-3.svg?v=2",
  "Cotton Saree - Summer Collection": "/images/products/sarees/cotton-saree-summer.jpg?v=1",
  "Pattu Saree - Temple Border": "/images/products/sarees/pattu-saree-temple.jpg?v=1",
  "Mysore Silk Saree - Ivory": "/images/products/sarees/mysore-silk-ivory.jpg?v=1",
  "Designer Lehenga - Bridal Pink": "/images/products/lehengas/lehenga-1.svg?v=2",
  "Kids Lehenga - Little Princess": "/images/products/kids/lehenga-1.svg?v=2",
  "Silk Kurta Set - Festival Gold": "/images/products/mens/kurta-1.svg?v=2",
  "Designer Kurta - Festive Red": "/images/products/mens/designer-kurta-festive-red.jpg?v=1",
  "Men's Sherwani - Wedding Gold": "/images/products/mens/sherwani-1.svg?v=2",
  "Anarkali Suit - Royal Purple": "/images/products/suits/anarkali-royal-purple.jpg?v=1",
  "Cotton Kurti - Floral Print": "/images/products/women/kurti-floral.svg?v=2",
  "Designer Kurti - Ethnic Blue": "/images/products/women/kurti-ethnic.svg?v=2",
};

const productImageOverrides: Record<string, string> = {
  "Banarasi Silk Saree - Maroon Gold": "/images/products/sarees/banarasi-maroon-gold.jpg?v=1",
  "Cotton Saree - Summer Collection": "/images/products/sarees/cotton-saree-summer.jpg?v=1",
  "Pattu Saree - Temple Border": "/images/products/sarees/pattu-saree-temple.jpg?v=1",
  "Mysore Silk Saree - Ivory": "/images/products/sarees/mysore-silk-ivory.jpg?v=1",
  "Designer Kurta - Festive Red": "/images/products/mens/designer-kurta-festive-red.jpg?v=1",
  "Anarkali Suit - Royal Purple": "/images/products/suits/anarkali-royal-purple.jpg?v=1",
};

const emptyLocalProductImages = new Set([
  "/images/products/kids/lehenga-1.svg",
  "/images/products/lehengas/lehenga-1.svg",
  "/images/products/mens/kurta-1.svg",
  "/images/products/mens/kurta-2.svg",
  "/images/products/mens/sherwani-1.svg",
  "/images/products/sarees/saree-1.svg",
  "/images/products/sarees/saree-2.svg",
  "/images/products/sarees/saree-3.svg",
  "/images/products/sarees/saree-4.svg",
  "/images/products/sarees/saree-5.svg",
  "/images/products/sarees/saree-6.svg",
  "/images/products/suits/suit-1.svg",
]);

const keywordFallbacks: Array<{ matcher: RegExp; image: string }> = [
  { matcher: /ronaldo|t-shirt|t shirt|tee|polo/i, image: "/images/products/mens/tshirt-1.svg?v=2" },
  { matcher: /saree/i, image: "/images/products/sarees/saree-1.svg?v=2" },
  { matcher: /sherwani/i, image: "/images/products/mens/sherwani-1.svg?v=2" },
  { matcher: /kurta/i, image: "/images/products/mens/kurta-1.svg?v=2" },
  { matcher: /kurti|top/i, image: "/images/products/women/kurti-floral.svg?v=2" },
  { matcher: /lehenga/i, image: "/images/products/lehengas/lehenga-1.svg?v=2" },
  { matcher: /kids/i, image: "/images/products/kids/lehenga-1.svg?v=2" },
  { matcher: /anarkali|suit/i, image: "/images/products/suits/suit-1.svg?v=2" },
  { matcher: /dress|jumpsuit|palazzo|skirt/i, image: "/images/products/women/kurti-ethnic.svg?v=2" },
];

const safeHostedPatterns = [
  /^\/images\/products\//i,
  /^\/placeholder\.svg$/i,
  /^data:image\//i,
  /^https?:\/\/.+/i,
];

const unsafeImagePatterns = [
  /encrypted-tbn\d*\.gstatic\.com/i,
  /googleusercontent\.com/i,
  /google\./i,
  /shopping\?q=tbn:/i,
  /tbm=isch/i,
  /imgurl=/i,
  /^blob:/i,
];

const getNormalizedText = (product: ProductImageInput) =>
  `${product.name || ""} ${product.category || ""} ${product.occasion || ""} ${product.color || ""}`.trim();

export const getFallbackProductImage = (product: ProductImageInput): string => {
  if (product.name && curatedProductImages[product.name]) {
    return curatedProductImages[product.name];
  }

  const normalizedText = getNormalizedText(product);
  const keywordMatch = keywordFallbacks.find(({ matcher }) => matcher.test(normalizedText));
  return keywordMatch?.image || "/placeholder.svg";
};

const isProblematicProductImage = (image?: string): boolean => {
  if (!image || !image.trim()) return true;

  const trimmed = image.trim();
  if (emptyLocalProductImages.has(trimmed)) {
    return true;
  }

  if (unsafeImagePatterns.some((pattern) => pattern.test(trimmed))) {
    return true;
  }

  if (safeHostedPatterns.some((pattern) => pattern.test(trimmed))) {
    return false;
  }

  return false;
};

export const resolveProductImage = (product: ProductImageInput): string => {
  if (product.name && productImageOverrides[product.name]) {
    return productImageOverrides[product.name];
  }

  if (!isProblematicProductImage(product.image)) {
    return product.image!.trim();
  }

  return getFallbackProductImage(product);
};
