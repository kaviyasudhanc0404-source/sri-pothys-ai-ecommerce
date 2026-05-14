import { Fragment, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Smartphone, Banknote, MapPin, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/services/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

type CheckoutItem = {
  productKey: string;
  name: string;
  image: string;
  category: string;
  color: string;
  price: number;
  originalPrice: number;
  quantity: number;
  selectedSize: string;
  id?: string;
};

type AddressForm = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, clearCart } = useCart();
  const { token, isAuthenticated, user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [step, setStep] = useState(1);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [address, setAddress] = useState<AddressForm>({
    fullName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const buyNowItem = (location.state as { buyNowItem?: CheckoutItem } | null)?.buyNowItem;
  const checkoutItems = useMemo<CheckoutItem[]>(
    () =>
      buyNowItem
        ? [buyNowItem]
        : items.map((item) => ({
            id: item.id,
            productKey: item.productKey,
            name: item.name,
            image: item.image,
            category: item.category,
            color: item.color,
            price: item.price,
            originalPrice: item.originalPrice,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
          })),
    [buyNowItem, items]
  );

  const subtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [checkoutItems]
  );
  const shipping = subtotal >= 999 ? 0 : 99;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (checkoutItems.length === 0) {
      navigate("/cart");
    }
  }, [checkoutItems.length, isAuthenticated, navigate]);

  const updateAddressField = (field: keyof AddressForm, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validateAddress = () => {
    const fields = Object.values(address).map((value) => value.trim());
    return fields.every(Boolean);
  };

  const handlePlaceOrder = async () => {
    if (!token) {
      toast.error("Please login to continue");
      return;
    }

    if (!validateAddress()) {
      toast.error("Please complete the delivery address");
      setStep(1);
      return;
    }

    setPlacingOrder(true);
    try {
      const data = await apiRequest<{ order: unknown }>("/orders", {
        method: "POST",
        token,
        body: JSON.stringify({
          items: checkoutItems,
          address: {
            name: address.fullName,
            address: address.address,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            phone: address.phone,
          },
          paymentMethod,
          clearCartAfterOrder: !buyNowItem,
        }),
      });

      if (!buyNowItem) {
        await clearCart();
      }

      toast.success("Order placed successfully");
      navigate("/order-success", { state: { order: data?.order } });
    } catch (error) {
      toast.error("Order could not be placed", {
        description: getErrorMessage(error) || "Please try again.",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="gradient-maroon py-10">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground">Checkout</h1>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {["Address", "Payment", "Review"].map((label, index) => (
              <Fragment key={label}>
                <div className={`flex items-center gap-1.5 ${step > index + 1 ? "text-gold" : step === index + 1 ? "text-primary-foreground" : "text-primary-foreground/40"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > index + 1 ? "gradient-gold text-maroon-dark" : step === index + 1 ? "border border-primary-foreground" : "border border-primary-foreground/40"}`}>
                    {step > index + 1 ? "✓" : index + 1}
                  </span>
                  <span className="text-xs font-medium">{label}</span>
                </div>
                {index < 2 && <ChevronRight className="w-4 h-4 text-primary-foreground/30" />}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="w-5 h-5 text-gold" />
                  <h2 className="font-display text-xl font-bold">Delivery Address</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "fullName", label: "Full Name", placeholder: "Enter your name" },
                    { key: "phone", label: "Phone", placeholder: "+91 88702 94044" },
                    { key: "address", label: "Address Line 1", placeholder: "House/Flat No., Street", full: true },
                    { key: "city", label: "City", placeholder: "City" },
                    { key: "state", label: "State", placeholder: "State" },
                    { key: "pincode", label: "Pincode", placeholder: "600001" },
                  ].map((field) => (
                    <div key={field.key} className={field.full ? "md:col-span-2" : ""}>
                      <label className="text-xs font-semibold mb-1.5 block">{field.label}</label>
                      <input
                        value={address[field.key as keyof AddressForm]}
                        onChange={(event) => updateAddressField(field.key as keyof AddressForm, event.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/30"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (!validateAddress()) {
                      toast.error("Please fill all address details");
                      return;
                    }
                    setStep(2);
                  }}
                  className="btn-gold mt-6 w-full sm:w-auto"
                >
                  Continue to Payment
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-6">
                <h2 className="font-display text-xl font-bold mb-6">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { id: "upi", icon: Smartphone, label: "UPI Payment", desc: "Google Pay, PhonePe, Paytm" },
                    { id: "card", icon: CreditCard, label: "Credit/Debit Card", desc: "Visa, Mastercard, RuPay" },
                    { id: "cod", icon: Banknote, label: "Cash on Delivery", desc: "Pay when you receive" },
                  ].map(({ id, icon: Icon, label, desc }) => (
                    <button
                      key={id}
                      onClick={() => setPaymentMethod(id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        paymentMethod === id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${paymentMethod === id ? "text-primary" : "text-muted-foreground"}`} />
                      <div>
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="min-h-11 px-6 py-3 rounded-2xl border border-border text-sm font-medium hover:bg-muted">Back</button>
                  <button onClick={() => setStep(3)} className="btn-gold flex-1">Review Order</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-6">
                <h2 className="font-display text-xl font-bold mb-6">Review Your Order</h2>
                <div className="space-y-3 mb-6">
                  {checkoutItems.map((item) => (
                    <div key={`${item.productKey}-${item.selectedSize}`} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <img src={item.image} alt={item.name} className="w-12 h-16 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} • Size: {item.selectedSize}</p>
                      </div>
                      <span className="text-sm font-bold shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl bg-muted/50 p-4 mb-6 text-sm">
                  <p className="font-semibold mb-1">Shipping to</p>
                  <p>{address.fullName}</p>
                  <p>{address.address}, {address.city}, {address.state} - {address.pincode}</p>
                  <p>{address.phone}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => setStep(2)} className="min-h-11 px-6 py-3 rounded-2xl border border-border text-sm font-medium hover:bg-muted">Back</button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handlePlaceOrder} disabled={placingOrder} className="btn-gold flex-1 text-base disabled:opacity-60">
                    {placingOrder ? "Placing Order..." : `Place Order • ₹${(subtotal + shipping).toLocaleString()}`}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>

          <div>
            <div className="glass-card-strong rounded-2xl p-6 lg:sticky lg:top-24">
              <h3 className="font-display font-bold mb-4">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className={shipping === 0 ? "text-green-600 font-medium" : ""}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span></div>
                <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span>₹{(subtotal + shipping).toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
