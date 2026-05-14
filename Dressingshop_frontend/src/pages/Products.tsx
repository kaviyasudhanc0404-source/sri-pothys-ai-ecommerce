import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import QuickPreviewModal from "@/components/QuickPreviewModal";
import { Product } from "@/data/products";
import { fetchProducts } from "@/services/productCatalog";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const colorOptions = ["Red", "Blue", "Maroon", "Pink", "Gold", "Green", "Purple", "Cream", "Black", "White", "Beige", "Khaki", "Multi"];

const Products = () => {
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("popularity");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    const query = params.get("search") || "";
    setSearch(query);
  }, [params]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setLoading(true);
      try {
        const liveProducts = await fetchProducts();
        if (!cancelled) setProducts(liveProducts);
      } catch (error) {
        if (!cancelled) {
          toast.error("Could not load products", {
            description: getErrorMessage(error) || "Please refresh and try again.",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProducts().catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const categoryOptions = useMemo(() => Array.from(new Set(products.map((product) => product.category))), [products]);
  const occasionOptions = useMemo(() => Array.from(new Set(products.map((product) => product.occasion))), [products]);

  const toggleFilter = (arr: string[], val: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const filtered = useMemo(() => {
    const result = products.filter((product) => {
      if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
      if (selectedColors.length && !selectedColors.includes(product.color)) return false;
      if (selectedCategories.length && !selectedCategories.includes(product.category)) return false;
      if (selectedOccasions.length && !selectedOccasions.includes(product.occasion)) return false;
      if (search && !`${product.name} ${product.category} ${product.color}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    switch (sortBy) {
      case "price-low":
        return [...result].sort((a, b) => a.price - b.price);
      case "price-high":
        return [...result].sort((a, b) => b.price - a.price);
      case "rating":
        return [...result].sort((a, b) => b.rating - a.rating);
      default:
        return [...result].sort((a, b) => b.reviews - a.reviews);
    }
  }, [priceRange, products, search, selectedCategories, selectedColors, selectedOccasions, sortBy]);

  const activeFilters = selectedColors.length + selectedCategories.length + selectedOccasions.length + (priceRange[0] > 0 || priceRange[1] < 30000 ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedColors([]);
    setSelectedCategories([]);
    setSelectedOccasions([]);
    setPriceRange([0, 30000]);
    setSearch("");
    setParams({});
  };

  const toggleFilters = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileFiltersOpen((prev) => !prev);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const filtersContent = (
    <div className="space-y-6">
      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setParams(e.target.value ? { search: e.target.value } : {});
          }}
          placeholder="Search products..."
          className="w-full bg-muted rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/30"
        />
      </div>

      <div>
        <h3 className="font-display font-semibold text-sm mb-3">Price Range</h3>
        <input
          type="range"
          min={0}
          max={30000}
          step={500}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>₹{priceRange[0].toLocaleString()}</span>
          <span>₹{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      <div>
        <h3 className="font-display font-semibold text-sm mb-3">Category</h3>
        <div className="space-y-2">
          {categoryOptions.map((category) => (
            <label key={category} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => toggleFilter(selectedCategories, category, setSelectedCategories)}
                className="rounded accent-primary"
              />
              {category}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display font-semibold text-sm mb-3">Occasion</h3>
        <div className="flex flex-wrap gap-2">
          {occasionOptions.map((occasion) => (
            <button
              key={occasion}
              onClick={() => toggleFilter(selectedOccasions, occasion, setSelectedOccasions)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                selectedOccasions.includes(occasion) ? "gradient-maroon text-primary-foreground border-transparent" : "border-border hover:bg-muted"
              }`}
            >
              {occasion}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display font-semibold text-sm mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              onClick={() => toggleFilter(selectedColors, color, setSelectedColors)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                selectedColors.includes(color) ? "gradient-gold text-maroon-dark border-transparent font-bold" : "border-border hover:bg-muted"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="gradient-maroon py-10 sm:py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-2">Our Collection</h1>
          <p className="text-primary-foreground/70">Discover {products.length}+ live styles from the store</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-6 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={toggleFilters} className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-border hover:bg-muted text-sm transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> Filters {activeFilters > 0 && <span className="w-5 h-5 rounded-full gradient-gold text-[10px] font-bold flex items-center justify-center text-maroon-dark">{activeFilters}</span>}
            </button>
            {activeFilters > 0 && <button onClick={clearAllFilters} className="text-xs text-destructive hover:underline">Clear All</button>}
            <span className="text-sm text-muted-foreground">{loading ? "Loading..." : `${filtered.length} products`}</span>
          </div>

          <div className="flex w-full items-center gap-3 sm:w-auto">
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">Sort:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="max-w-[190px] bg-transparent outline-none font-medium cursor-pointer">
                <option value="popularity">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="shrink-0 overflow-hidden hidden lg:block"
              >
                <div className="w-[260px]">
                  {filtersContent}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="flex-1">
            {loading ? (
              <div className="text-center py-20 text-muted-foreground">Loading products...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">:</div>
                <h3 className="font-display text-xl font-bold mb-2">No products found</h3>
                <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters or search</p>
                <button onClick={clearAllFilters} className="btn-gold text-sm">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {filtered.map((product) => (
                  <ProductCard key={String(product.id)} product={product} onQuickView={setQuickView} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="fixed right-0 top-0 z-50 h-full w-[88vw] max-w-[360px] bg-card border-l border-border p-4 sm:p-6 lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-lg">Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-2 rounded-full hover:bg-muted" aria-label="Close filters">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {filtersContent}
              <div className="mt-6 flex gap-2">
                <button onClick={clearAllFilters} className="flex-1 px-4 py-2 rounded-2xl border border-border text-sm">Clear</button>
                <button onClick={() => setMobileFiltersOpen(false)} className="flex-1 btn-gold text-sm">Apply</button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {quickView && <QuickPreviewModal product={quickView} onClose={() => setQuickView(null)} />}
    </div>
  );
};

export default Products;
