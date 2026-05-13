import mongoose from "mongoose";

const generateOrderId = () => `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
      default: generateOrderId,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productKey: String,
        name: String,
        image: String,
        category: String,
        color: String,
        quantity: Number,
        price: Number,
        originalPrice: Number,
        selectedSize: String,
      },
    ],
    address: {
      name: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["Ordered", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Ordered",
    },
    subtotal: Number,
    shipping: { type: Number, default: 0 },
    total: Number,
    orderDate: { type: Date, default: Date.now },
    deliveryDate: Date,
    notes: String,
  },
  { timestamps: true }
);

// Safety net for legacy documents created without the default.
orderSchema.pre("validate", function (next) {
  if (!this.orderId) {
    this.orderId = generateOrderId();
  }
  next();
});

export const Order = mongoose.model("Order", orderSchema);
