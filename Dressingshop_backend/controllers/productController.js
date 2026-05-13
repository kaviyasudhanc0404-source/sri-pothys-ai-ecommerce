import { Product } from "../models/Product.js";
import mongoose from "mongoose";

const normalizeLabel = (value) => {
  if (value === undefined || value === null) return value;
  const text = String(value).trim();
  if (!text) return text;
  return text
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

export const getAllProducts = async (req, res) => {
  try {
    const { category, occasion, color, minPrice, maxPrice, search, sort } = req.query;
    const filters = {};

    if (category) filters.category = category;
    if (occasion) filters.occasion = occasion;
    if (color) filters.color = color;

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    if (search) {
      filters.name = { $regex: search, $options: "i" };
    }

    let query = Product.find(filters);

    // Sorting
    if (sort === "price-low") {
      query = query.sort({ price: 1 });
    } else if (sort === "price-high") {
      query = query.sort({ price: -1 });
    } else if (sort === "rating") {
      query = query.sort({ rating: -1 });
    } else if (sort === "newest") {
      query = query.sort({ createdAt: -1 });
    } else {
      query = query.sort({ reviews: -1 }); // Default: popularity
    }

    const products = await query.exec();

    res.json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      originalPrice,
      image,
      category,
      occasion,
      color,
      size,
      rating,
      reviews,
      description,
      badge,
      isNew,
      sku,
      stock,
    } = req.body;

    const product = new Product({
      name: String(name || "").trim(),
      price,
      originalPrice,
      image: String(image || "").trim(),
      category: normalizeLabel(category),
      occasion: normalizeLabel(occasion),
      color: normalizeLabel(color),
      size: (Array.isArray(size) ? size : [size]).map((item) => String(item).trim()).filter(Boolean),
      rating,
      reviews,
      description: description ? String(description).trim() : undefined,
      badge: badge ? String(badge).trim() : undefined,
      isNew,
      sku: sku ? String(sku).trim() : `SKU-${Date.now()}`,
      stock: stock ?? 100,
    });

    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Failed to create product" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    const payload = {
      ...req.body,
      ...(req.body.name !== undefined ? { name: String(req.body.name).trim() } : {}),
      ...(req.body.image !== undefined ? { image: String(req.body.image).trim() } : {}),
      ...(req.body.category !== undefined ? { category: normalizeLabel(req.body.category) } : {}),
      ...(req.body.occasion !== undefined ? { occasion: normalizeLabel(req.body.occasion) } : {}),
      ...(req.body.color !== undefined ? { color: normalizeLabel(req.body.color) } : {}),
      ...(req.body.size !== undefined
        ? {
            size: (Array.isArray(req.body.size) ? req.body.size : [req.body.size])
              .map((item) => String(item).trim())
              .filter(Boolean),
          }
        : {}),
      ...(req.body.description !== undefined ? { description: String(req.body.description).trim() } : {}),
      ...(req.body.badge !== undefined ? { badge: req.body.badge ? String(req.body.badge).trim() : undefined } : {}),
      ...(req.body.sku !== undefined ? { sku: req.body.sku ? String(req.body.sku).trim() : undefined } : {}),
    };

    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Failed to update product" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

export const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const numericRating = Number(rating);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    if (!comment || !String(comment).trim()) {
      return res.status(400).json({ error: "Review comment is required" });
    }

    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const reviewerId = req.user?.id;
    const reviewerName = [req.user?.firstName, req.user?.lastName].filter(Boolean).join(" ").trim() || "Customer";

    if (!reviewerId) {
      return res.status(401).json({ error: "Access token required" });
    }

    const existing = product.reviewEntries?.find((entry) => entry.user?.toString() === reviewerId);
    if (existing) {
      return res.status(400).json({ error: "You have already reviewed this product" });
    }

    const reviewEntry = {
      user: reviewerId,
      name: reviewerName,
      rating: numericRating,
      comment: String(comment).trim(),
    };

    product.reviewEntries = product.reviewEntries || [];
    product.reviewEntries.unshift(reviewEntry);

    const previousCount = Number(product.reviews || 0);
    const previousRating = Number(product.rating || 0);
    const nextCount = previousCount + 1;
    const totalScore = previousRating * previousCount + numericRating;

    product.reviews = nextCount;
    product.rating = Number((totalScore / nextCount).toFixed(1));

    await product.save();

    res.status(201).json({
      message: "Review added successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add review" });
  }
};
