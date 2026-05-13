import { User } from "../models/User.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";

export const getDashboardData = async (req, res) => {
  try {
    const [orders, users, products] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).limit(8).populate("userId", "firstName lastName email"),
      User.find().select("_id role isActive createdAt"),
      Product.find().select("_id stock category"),
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const orderCount = orders.length ? await Order.countDocuments() : 0;
    const customerCount = users.filter((user) => user.role === "user").length;
    const productCount = products.length;
    const activeCustomers = users.filter((user) => user.role === "user" && user.isActive !== false).length;

    const monthlyRevenueMap = new Map();
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let offset = 11; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setMonth(date.getMonth() - offset);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      monthlyRevenueMap.set(key, { month: monthLabels[date.getMonth()], revenue: 0 });
    }

    const allOrders = await Order.find().select("total createdAt");
    allOrders.forEach((order) => {
      const date = new Date(order.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (monthlyRevenueMap.has(key)) {
        monthlyRevenueMap.get(key).revenue += order.total || 0;
      }
    });

    const recentOrders = orders.map((order) => ({
      id: order.orderId,
      _id: order._id,
      customer: order.userId ? `${order.userId.firstName} ${order.userId.lastName}` : "Guest User",
      amount: order.total,
      status: order.orderStatus,
      date: order.createdAt,
    }));

    res.json({
      stats: {
        totalRevenue,
        orders: orderCount,
        customers: customerCount,
        products: productCount,
        activeCustomers,
      },
      monthlyRevenue: Array.from(monthlyRevenueMap.values()),
      recentOrders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    const userIds = users.map((user) => user._id);

    const orderStats = await Order.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: "$userId",
          ordersCount: { $sum: 1 },
          totalSpent: { $sum: "$total" },
        },
      },
    ]);

    const orderMap = new Map(orderStats.map((item) => [String(item._id), item]));

    res.json({
      users: users.map((user) => {
        const stats = orderMap.get(String(user._id));
        return {
          ...user,
          ordersCount: stats?.ordersCount || 0,
          totalSpent: stats?.totalSpent || 0,
        };
      }),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, role, isActive } = req.body;

    if (id === req.user.id && role && role !== "admin") {
      return res.status(400).json({ error: "You cannot remove your own admin access" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(role !== undefined ? { role } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ error: "You cannot delete your own admin account" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await Order.deleteMany({ userId: user._id });

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export const getAnalyticsData = async (req, res) => {
  try {
    const [orders, products, users] = await Promise.all([
      Order.find().select("total orderStatus createdAt items"),
      Product.find().select("category stock reviews rating"),
      User.find().select("role isActive createdAt lastLoginAt"),
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const averageOrderValue = orders.length ? totalRevenue / orders.length : 0;
    const totalProducts = products.length;
    const totalCustomers = users.filter((user) => user.role === "user").length;

    const orderStatusBreakdown = orders.reduce((acc, order) => {
      acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
      return acc;
    }, {});

    const categoryBreakdown = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    const topProductsMap = new Map();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!item.name) return;
        const existing = topProductsMap.get(item.name) || { name: item.name, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity || 0;
        existing.revenue += (item.quantity || 0) * (item.price || 0);
        topProductsMap.set(item.name, existing);
      });
    });

    const topProducts = Array.from(topProductsMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const recentUsers = users
      .filter((user) => user.role === "user")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((user) => ({
        id: user._id,
        joinedAt: user.createdAt,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
      }));

    res.json({
      overview: {
        totalRevenue,
        averageOrderValue,
        totalOrders: orders.length,
        totalProducts,
        totalCustomers,
      },
      orderStatusBreakdown,
      categoryBreakdown,
      topProducts,
      recentUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
};
