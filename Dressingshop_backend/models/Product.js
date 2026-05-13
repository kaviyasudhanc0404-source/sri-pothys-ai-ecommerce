import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    image: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    occasion: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    size: [String],
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: { type: Number, default: 0 },
    reviewEntries: { type: [reviewSchema], default: [] },
    description: String,
    badge: String,
    isNew: { type: Boolean, default: false },
    stock: { type: Number, default: 100 },
    sku: { type: String, unique: true },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

export const Product = mongoose.model("Product", productSchema);
