import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

const confettiColors = ["#D4AF37", "#800020", "#E91E63", "#FFD700", "#FF69B4", "#FF6B6B"];

const Confetti = () => {
  const pieces = Array.from({ length: 50 }, (_, index) => ({
    id: index,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    size: 6 + Math.random() * 8,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ y: -20, x: `${piece.left}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: 0, rotate: 720 }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: "easeIn" }}
          className="absolute"
          style={{ left: `${piece.left}%`, width: piece.size, height: piece.size, backgroundColor: piece.color, borderRadius: Math.random() > 0.5 ? "50%" : "2px" }}
        />
      ))}
    </div>
  );
};

const OrderSuccess = () => {
  const location = useLocation();
  const order = (location.state as { order?: { _id: string; createdAt: string } } | null)?.order;
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {showConfetti && <Confetti />}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="glass-card-strong rounded-3xl p-6 sm:p-10 max-w-lg w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center mx-auto mb-6 shadow-gold"
        >
          <CheckCircle className="w-10 h-10 text-maroon-dark" />
        </motion.div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-3">Order Placed Successfully</h1>
        <p className="text-muted-foreground mb-6">Thank you for shopping with Sri Pothys. Your payment and order details have been saved, and we will start processing it shortly.</p>

        <div className="bg-muted/50 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-bold">{order ? `#${order._id.slice(-8).toUpperCase()}` : "Recently created"}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Estimated Delivery</span>
            <span className="font-bold">5-7 Business Days</span>
          </div>
          {order?.createdAt && (
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Placed On</span>
              <span className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/orders" className="flex-1 btn-maroon text-sm flex items-center justify-center gap-2">
            <Package className="w-4 h-4" /> Track Order
          </Link>
          <Link to="/products" className="flex-1 btn-gold text-sm flex items-center justify-center gap-2">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
