import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";

export const createOrder = async (req, res) => {
  try {
    const { items, address, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item" });
    }

    if (!address || !paymentMethod) {
      return res.status(400).json({ error: "Address and payment method are required" });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      let dbProduct = null;

      if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
        dbProduct = await Product.findById(item.productId);
      }

      const unitPrice = dbProduct?.price ?? Number(item.price);
      if (!unitPrice || !item.quantity) {
        return res.status(400).json({ error: "Each order item must include price and quantity" });
      }

      subtotal += unitPrice * Number(item.quantity);

      orderItems.push({
        productId: dbProduct?._id,
        productKey: item.productKey || item.productId || String(item.name || ""),
        name: dbProduct?.name || item.name,
        image: dbProduct?.image || item.image,
        category: dbProduct?.category || item.category,
        color: dbProduct?.color || item.color,
        quantity: Number(item.quantity),
        price: unitPrice,
        originalPrice: dbProduct?.originalPrice ?? item.originalPrice,
        selectedSize: item.selectedSize,
      });
    }

    const shipping = subtotal >= 999 ? 0 : 99;
    const total = subtotal + shipping;

    const order = new Order({
      userId: req.user.id,
      items: orderItems,
      address,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "Ordered",
      subtotal,
      shipping,
      total,
      notes,
    });

    await order.save();

    if (req.body.clearCartAfterOrder) {
      await User.findByIdAndUpdate(req.user.id, { $set: { cart: [] } });
    }

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Failed to create order" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.json({
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json({
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Ordered", "Processing", "Shipped", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus: status,
        deliveryDate: status === "Delivered" ? new Date() : undefined,
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update order" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "firstName lastName email phone")
      .sort({ createdAt: -1 });

    res.json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};
