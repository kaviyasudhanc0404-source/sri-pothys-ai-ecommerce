import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems, isLoading } = useCart();

  const handleQuantityChange = async (itemId: string, quantity: number) => {
    try {
      await updateQuantity(itemId, quantity);
    } catch (error) {
      toast.error("Cart update failed", {
        description: getErrorMessage(error) || "Please try again.",
      });
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Could not remove item", {
        description: getErrorMessage(error) || "Please try again.",
      });
    }
  };

  if (!isLoading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-6 text-sm">Looks like you haven't added anything yet</p>
          <Link to="/products" className="btn-gold">Start Shopping</Link>
        </motion.div>
      </div>
    );
  }

  const shipping = totalPrice >= 999 ? 0 : 99;
  const total = totalPrice + shipping;

  return (
    <div className="min-h-screen">
      <div className="gradient-maroon py-10">
        <div className="container mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-primary-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground">Shopping Cart ({totalItems})</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">Loading your cart...</div>
            ) : (
              items.map((item) => (
                <motion.div key={item.id} layout className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
                  <img src={item.image} alt={item.name} className="w-full sm:w-24 aspect-[4/3] sm:aspect-auto sm:h-32 object-cover rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.productKey}`} className="font-display font-semibold text-sm hover:text-primary line-clamp-2">{item.name}</Link>
                    <p className="text-xs text-muted-foreground mt-1">Size: {item.selectedSize} • {item.color}</p>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mt-2">
                      <span className="font-bold">₹{item.price.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground line-through">₹{item.originalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                      <div className="inline-flex items-center gap-2 border border-border rounded-xl px-1.5 py-0.5">
                        <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => handleRemove(item.id)} className="p-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div>
            <div className="glass-card-strong rounded-2xl p-6 lg:sticky lg:top-24">
              <h3 className="font-display font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                  <span className="font-semibold">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? "text-green-600" : ""}`}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gold">Add ₹{(999 - totalPrice).toLocaleString()} more for free shipping!</p>
                )}
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-bold">₹{total.toLocaleString()}</span>
                </div>
              </div>
              <Link to="/checkout" className="btn-gold w-full mt-6 flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/products" className="block text-center text-sm text-primary hover:underline mt-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
