import { Product, ReviewEntry } from "@/data/products";
import { apiRequest } from "@/services/api";
import { resolveProductImage } from "@/services/productImage";

type ApiProduct = {
  _id?: string;
  id?: string | number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  occasion: string;
  color: string;
  size?: string[];
  rating?: number;
  reviews?: number;
  reviewEntries?: ApiReviewEntry[];
  description?: string;
  badge?: string;
  isNew?: boolean;
  stock?: number;
  sku?: string;
};

type ApiReviewEntry = {
  _id?: string;
  user?: string;
  name?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
};

const normalizeReviewEntry = (entry: ApiReviewEntry, index: number): ReviewEntry => ({
  id: entry._id || `${entry.user || "review"}-${index}`,
  name: entry.name || "Customer",
  rating: Number(entry.rating ?? 0),
  comment: entry.comment || "",
  createdAt: entry.createdAt,
});

const inferGender = (category: string): Product["gender"] => {
  const normalized = category.toLowerCase();
  if (normalized.includes("kid")) return "kids";
  if (normalized.includes("men") || normalized.includes("shirt") || normalized.includes("t shirt") || normalized.includes("tshirt")) return "male";
  if (["sarees", "lehengas", "suits", "women", "dress", "kurti", "top"].some((key) => normalized.includes(key))) return "female";
  return "unisex";
};

const inferGarmentType = (category: string, name: string): Product["garmentType"] => {
  const normalized = `${category} ${name}`.toLowerCase();
  if (["pant", "jean", "cargo", "chino", "skirt", "lower"].some((key) => normalized.includes(key))) return "lower";
  if (["shirt", "t shirt", "tshirt", "top", "kurti", "jacket", "upper"].some((key) => normalized.includes(key))) return "upper";
  return "full";
};

const normalizeProduct = (product: ApiProduct): Product => ({
  id: product._id || product.id || product.name,
  name: product.name,
  price: Number(product.price),
  originalPrice: Number(product.originalPrice ?? product.price),
  image: resolveProductImage(product),
  category: product.category,
  occasion: product.occasion,
  color: product.color,
  size: Array.isArray(product.size) && product.size.length ? product.size : ["Free Size"],
  rating: Number(product.rating ?? 4),
  reviews: Number(product.reviews ?? 0),
  reviewEntries: product.reviewEntries?.map(normalizeReviewEntry),
  description: product.description || "",
  badge: product.badge,
  isNew: Boolean(product.isNew),
  gender: inferGender(product.category),
  garmentType: inferGarmentType(product.category, product.name),
  stock: product.stock,
  sku: product.sku,
});

export const fetchProducts = async (search = ""): Promise<Product[]> => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const data = await apiRequest<{ products: ApiProduct[] }>(`/products${query}`);
  return (data?.products ?? []).map(normalizeProduct);
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const data = await apiRequest<{ product: ApiProduct }>(`/products/${id}`);
  if (!data?.product) {
    throw new Error("Product not found");
  }
  return normalizeProduct(data.product);
};

export const submitProductReview = async (
  productId: string,
  payload: { rating: number; comment: string },
  token: string
): Promise<Product> => {
  const data = await apiRequest<{ product: ApiProduct }>(`/products/${productId}/reviews`, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });

  if (!data?.product) {
    throw new Error("Updated product was not returned");
  }

  return normalizeProduct(data.product);
};
