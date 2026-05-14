import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Truck, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/services/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

type OrderItem = {
  productKey?: string;
  name: string;
  image: string;
  price: number;
};

type OrderRecord = {
  _id: string;
  createdAt: string;
  total: number;
  orderStatus: string;
  items: OrderItem[];
};

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  Delivered: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
  Shipped: { icon: Truck, color: "text-blue-600", bg: "bg-blue-100" },
  Processing: { icon: Clock, color: "text-gold-dark", bg: "bg-gold/10" },
  Ordered: { icon: Clock, color: "text-gold-dark", bg: "bg-gold/10" },
};

const statusSteps = ["Ordered", "Processing", "Shipped", "Delivered"];

const OrderHistory = () => {
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      if (!token || !isAuthenticated) {
        if (!cancelled) {
          setOrders([]);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await apiRequest<{ orders: OrderRecord[] }>("/orders/user/orders", {
          method: "GET",
          token,
        });
        if (!cancelled) setOrders(data?.orders ?? []);
      } catch (error) {
        if (!cancelled) {
          toast.error("Could not load orders", {
            description: getErrorMessage(error) || "Please try again.",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOrders().catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token]);

  return (
    <div className="min-h-screen">
      <div className="gradient-maroon py-10">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground">My Orders</h1>
          <p className="text-primary-foreground/60 text-sm mt-1">Track and manage your orders</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-4">
        {loading ? (
          <div className="glass-card rounded-2xl p-6 text-center text-muted-foreground">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center">
            <h2 className="font-display text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-sm text-muted-foreground mb-4">Once you place an order, it will appear here.</p>
            <Link to="/products" className="btn-gold">Shop Now</Link>
          </div>
        ) : (
          orders.map((order, index) => {
            const config = statusConfig[order.orderStatus] || statusConfig.Ordered;
            const StatusIcon = config.icon;
            const currentStep = statusSteps.indexOf(order.orderStatus);

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-display font-bold break-all">Order #{order._id.slice(-8).toUpperCase()}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.color} ${config.bg}`}>
                        <StatusIcon className="w-3 h-3" /> {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Ordered on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="font-bold text-lg shrink-0">₹{order.total.toLocaleString()}</span>
                </div>

                <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
                  {order.items.map((item, itemIndex) => (
                    <Link key={`${order._id}-${itemIndex}`} to={item.productKey ? `/products/${item.productKey}` : "/products"} className="flex items-center gap-3 bg-muted/50 rounded-xl p-2 pr-4 shrink-0">
                      <img src={item.image} alt={item.name} className="w-12 h-16 object-cover rounded-lg" />
                      <div>
                        <p className="text-xs font-semibold line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">₹{item.price.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  {statusSteps.map((step, stepIndex) => (
                    <React.Fragment key={step}>
                      <div className={`flex items-center gap-1 ${stepIndex <= currentStep ? "text-primary" : "text-muted-foreground/30"}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${stepIndex <= currentStep ? "gradient-gold text-maroon-dark" : "bg-muted"}`}>
                          {stepIndex < currentStep ? "✓" : stepIndex + 1}
                        </div>
                        <span className="text-[10px] hidden sm:inline">{step}</span>
                      </div>
                      {stepIndex < statusSteps.length - 1 && (
                        <div className={`flex-1 h-0.5 rounded ${stepIndex < currentStep ? "gradient-gold" : "bg-muted"}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
