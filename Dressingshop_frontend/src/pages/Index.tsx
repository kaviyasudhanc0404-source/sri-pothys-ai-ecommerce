import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Star, Sparkles, Gift, Truck, RotateCcw, Shield, Mail } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import QuickPreviewModal from "@/components/QuickPreviewModal";
import { products, categories, occasions, Product } from "@/data/products";
import { toast } from "sonner";

const Homepage = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const carouselRef = useRef<HTMLDivElement>(null);
  const trustBadgesRef = useRef<HTMLDivElement>(null);
  const categoriesRowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    carouselRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  const trending = products.filter((p) => p.rating >= 4.5);
  const recommended = products.slice(0, 6);
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = () => {
    const trimmedEmail = newsletterEmail.trim();

    if (!trimmedEmail) {
      toast.error("Email required", {
        description: "Please enter your email to subscribe.",
      });
      return;
    }

    toast.success("Subscribed", {
      description: "Thanks for joining. Watch your inbox for new arrivals and offers.",
    });
    setNewsletterEmail("");
  };

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isMobile || reduceMotion) return;

    const startAutoScroll = (element: HTMLDivElement | null, speedPxPerFrame: number) => {
      if (!element) return () => {};

      let rafId = 0;
      const tick = () => {
        const maxScrollLeft = element.scrollWidth - element.clientWidth;
        if (maxScrollLeft <= 0) {
          rafId = window.requestAnimationFrame(tick);
          return;
        }

        element.scrollLeft += speedPxPerFrame;
        if (element.scrollLeft >= maxScrollLeft - 1) {
          element.scrollLeft = 0;
        }

        rafId = window.requestAnimationFrame(tick);
      };

      rafId = window.requestAnimationFrame(tick);
      return () => window.cancelAnimationFrame(rafId);
    };

    const stopBadges = startAutoScroll(trustBadgesRef.current, 0.4);
    const stopCategories = startAutoScroll(categoriesRowRef.current, 0.5);

    return () => {
      stopBadges();
      stopCategories();
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero min-h-[calc(100svh-8rem)] lg:min-h-[85vh] flex items-center py-12 sm:py-16">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.4\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />

        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center relative z-10">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-6">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-sm text-primary-foreground font-medium">Grand Festival Collection {currentYear}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6">
              Where <span className="text-gradient-gold">Tradition</span> Meets <span className="italic font-elegant">Elegance</span>
            </h1>

            <p className="text-base sm:text-lg text-primary-foreground/80 mb-8 max-w-lg leading-relaxed">
              Discover the finest collection of handwoven silk sarees, designer lehengas, and premium ethnic wear. Crafted with love since 2000.
            </p>

            {/* Mobile collage (desktop collage is shown on lg+) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mb-8 lg:hidden"
            >
              <div className="relative">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
                    <img
                      src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=650&fit=crop"
                      alt="Silk Saree"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="grid grid-rows-2 gap-3">
                    <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                      <img
                        src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&h=380&fit=crop"
                        alt="Traditional Kurta"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                      <img
                        src="https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=500&h=380&fit=crop"
                        alt="Lehenga"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass-card-strong rounded-2xl px-4 py-2 shadow-gold"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-gold text-gold" />
                    <span className="text-sm font-bold">4.9 Rating</span>
                    <span className="text-xs text-muted-foreground">• 50K+ Reviews</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <div className="flex flex-col min-[420px]:flex-row flex-wrap gap-3 sm:gap-4">
              <Link to="/products" className="btn-gold text-sm sm:text-base flex items-center gap-2">
                Shop Collection <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/ai-stylist" className="btn-maroon text-sm sm:text-base flex items-center gap-2 border border-primary-foreground/20">
                <Sparkles className="w-4 h-4" /> AI Stylist
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 sm:flex sm:flex-wrap sm:items-center sm:gap-6">
              <div><span className="text-2xl sm:text-3xl font-bold text-primary-foreground">50K+</span><p className="text-[11px] sm:text-xs text-primary-foreground/60">Happy Customers</p></div>
              <div><span className="text-2xl sm:text-3xl font-bold text-primary-foreground">5000+</span><p className="text-[11px] sm:text-xs text-primary-foreground/60">Products</p></div>
              <div><span className="text-2xl sm:text-3xl font-bold text-primary-foreground">25+</span><p className="text-[11px] sm:text-xs text-primary-foreground/60">Years Legacy</p></div>
            </div>

          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="hidden lg:block">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-3xl overflow-hidden shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop" alt="Silk Saree" className="w-full h-64 object-cover" />
                  </div>
                  <div className="rounded-3xl overflow-hidden shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=300&fit=crop" alt="Traditional Kurta" className="w-full h-44 object-cover" />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="rounded-3xl overflow-hidden shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=400&h=300&fit=crop" alt="Lehenga" className="w-full h-44 object-cover" />
                  </div>
                  <div className="rounded-3xl overflow-hidden shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop" alt="Men's Wear" className="w-full h-64 object-cover" />
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass-card-strong rounded-2xl px-5 py-3 shadow-gold">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-gold text-gold" />
                  <span className="text-sm font-bold">4.9 Rating</span>
                  <span className="text-xs text-muted-foreground">• 50K+ Reviews</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-6 border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div ref={trustBadgesRef} className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:overflow-visible">
            {[
              { icon: Truck, label: "Free Shipping", sub: "Orders above ₹999" },
              { icon: RotateCcw, label: "Easy Returns", sub: "7-day return policy" },
              { icon: Shield, label: "Authentic Products", sub: "100% genuine" },
              { icon: Gift, label: "Gift Wrapping", sub: "Free premium wrap" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="shrink-0 flex items-center gap-3 justify-center py-2 sm:shrink">
                <Icon className="w-5 h-5 text-gold" />
                <div>
                  <p className="text-xs font-semibold">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Shop by Category</h2>
            <p className="text-muted-foreground">Explore our curated collections</p>
          </motion.div>

          <div ref={categoriesRowRef} className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 sm:gap-4 sm:overflow-visible">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="shrink-0 min-w-[72vw] max-w-[72vw] min-[420px]:min-w-[240px] min-[420px]:max-w-[240px] snap-start sm:min-w-0 sm:max-w-none"
              >
                <Link to="/products" className="group block text-center">
                  <div className="relative aspect-square rounded-3xl overflow-hidden mb-3 shadow-lg">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                    <div className="absolute bottom-3 inset-x-3 text-center">
                      <span className="text-2xl">{cat.icon}</span>
                    </div>
                  </div>
                  <h3 className="font-display font-semibold text-sm">{cat.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{cat.count}+ Items</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Carousel */}
      <section className="py-12 sm:py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Trending Now</h2>
              <p className="text-muted-foreground mt-1">Most loved by our customers</p>
            </div>
            <div className="hidden sm:flex gap-2">
              <button onClick={() => scroll("left")} className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => scroll("right")} className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div ref={carouselRef} className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory">
            {trending.map((product) => (
              <div key={product.id} className="min-w-[76vw] max-w-[76vw] min-[420px]:min-w-[220px] min-[420px]:max-w-[220px] sm:min-w-[260px] sm:max-w-[260px] snap-start">
                <ProductCard product={product} onQuickView={setQuickViewProduct} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Occasion */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Shop by Occasion</h2>
            <p className="text-muted-foreground">Find the perfect outfit for every moment</p>
          </motion.div>

          <div className="flex gap-5 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 sm:overflow-visible">
            {occasions.map((occ, i) => (
              <motion.div
                key={occ.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="shrink-0 min-w-[76vw] max-w-[76vw] min-[420px]:min-w-[260px] min-[420px]:max-w-[260px] snap-start sm:min-w-0 sm:max-w-none"
              >
                <Link to="/products" className="group relative block aspect-[3/4] rounded-3xl overflow-hidden shadow-lg">
                  <img src={occ.image} alt={occ.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="font-display text-2xl font-bold text-primary-foreground mb-1">{occ.name}</h3>
                    <p className="text-sm text-primary-foreground/70">{occ.tagline}</p>
                    <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-gold">
                      Explore <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended */}
      <section className="py-12 sm:py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-10">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Recommended for You</h2>
              <p className="text-muted-foreground mt-1">Curated picks just for you</p>
            </div>
            <Link to="/products" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-2 xl:grid-cols-4 md:gap-4 md:overflow-visible">
            {recommended.map((product) => (
              <div key={product.id} className="shrink-0 min-w-[76vw] max-w-[76vw] min-[420px]:min-w-[260px] min-[420px]:max-w-[260px] md:shrink md:min-w-0 md:max-w-none">
                <ProductCard product={product} onQuickView={setQuickViewProduct} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-14 sm:py-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20.5z\" fill=\"%23ffffff\" fill-opacity=\"0.4\" fill-rule=\"evenodd\"/%3E%3C/svg%3E')" }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Mail className="w-10 h-10 text-gold mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-3">Stay in Style</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto">Get exclusive offers, new arrivals, and festive collection updates delivered to your inbox.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                className="flex-1 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-2xl px-5 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/50 outline-none focus:border-gold"
              />
              <button className="btn-gold w-full sm:w-auto" onClick={handleNewsletterSubmit}>Subscribe</button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Preview Modal */}
      {quickViewProduct && <QuickPreviewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
    </div>
  );
};

export default Homepage;
