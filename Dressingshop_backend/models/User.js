import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    addresses: [
      {
        id: mongoose.Schema.Types.ObjectId,
        name: String,
        address: String,
        city: String,
        state: String,
        pincode: String,
        phone: String,
        isDefault: Boolean,
      },
    ],
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
    },
    cart: [
      {
        productKey: { type: String, required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        category: String,
        color: String,
        price: { type: Number, required: true },
        originalPrice: Number,
        selectedSize: String,
        quantity: { type: Number, default: 1 },
      },
    ],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  return await bcryptjs.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);
