import { useCallback, useEffect, useMemo, useState, type ElementType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, ShoppingBag, Package, Users, BarChart3, Settings, Plus, Pencil, Trash2, DollarSign, Boxes, ChevronLeft, ChevronRight, LogOut, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/services/api";
import { safeStorage } from "@/lib/storage";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: ShoppingBag },
  { id: "orders", label: "Orders", icon: Package },
  { id: "customers", label: "Customers", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const statusColors: Record<string, string> = {
  Delivered: "text-green-600 bg-green-100",
  Shipped: "text-blue-600 bg-blue-100",
  Processing: "text-gold-dark bg-gold/10",
  Ordered: "text-primary bg-primary/10",
  Cancelled: "text-destructive bg-destructive/10",
};

type AdminDashboardStats = {
  totalRevenue: number;
  orders: number;
  customers: number;
  products: number;
  activeCustomers?: number;
};

type AdminMonthlyRevenueEntry = {
  month: string;
  revenue: number;
};

type AdminRecentOrder = {
  id: string;
  _id: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
};

type AdminDashboardData = {
  stats: AdminDashboardStats;
  monthlyRevenue: AdminMonthlyRevenueEntry[];
  recentOrders: AdminRecentOrder[];
};

type AdminAnalyticsOverview = {
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
};

type AdminTopProduct = {
  name: string;
  quantity: number;
  revenue: number;
};

type AdminAnalyticsData = {
  overview: AdminAnalyticsOverview;
  orderStatusBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  topProducts: AdminTopProduct[];
  recentUsers?: Array<{ id: string; joinedAt: string; isActive?: boolean; lastLoginAt?: string }>;
};

type AdminProduct = {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  occasion: string;
  color: string;
  size: string[];
  rating: number;
  reviews: number;
  description?: string;
  badge?: string;
  stock?: number;
  sku?: string;
  isNew?: boolean;
};

type AdminOrderItem = {
  name: string;
  quantity: number;
};

type AdminOrder = {
  _id: string;
  orderId?: string;
  orderStatus: string;
  createdAt: string;
  total: number;
  items?: AdminOrderItem[];
  userId?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
};

type AdminUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  isActive?: boolean;
  ordersCount?: number;
  totalSpent?: number;
};

type StatCard = {
  label: string;
  value: string;
  icon: ElementType;
};

type ProductFormState = {
  name: string;
  price: string;
  originalPrice: string;
  image: string;
  category: string;
  occasion: string;
  color: string;
  size: string;
  rating: string;
  reviews: string;
  description: string;
  badge: string;
  stock: string;
  sku: string;
  isNew: boolean;
};

const emptyProduct: ProductFormState = {
  name: "",
  price: "0",
  originalPrice: "0",
  image: "",
  category: "Sarees",
  occasion: "Wedding",
  color: "Blue",
  size: "Free Size",
  rating: "4.5",
  reviews: "0",
  description: "",
  badge: "",
  stock: "100",
  sku: "",
  isNew: false,
};

const productTextFields = [
  "name",
  "image",
  "price",
  "originalPrice",
  "category",
  "occasion",
  "color",
  "size",
  "rating",
  "reviews",
  "stock",
  "sku",
  "badge",
] as const;

const Admin = () => {
  const { token, user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customers, setCustomers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [settingsForm, setSettingsForm] = useState({ firstName: "", lastName: "", phone: "" });

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
    else if (user?.role !== "admin") navigate("/");
  }, [isAuthenticated, navigate, user]);

  useEffect(() => {
    if (user) setSettingsForm({ firstName: user.firstName || "", lastName: user.lastName || "", phone: user.phone || "" });
  }, [user]);

  const loadAll = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [d, p, o, c, a] = await Promise.all([
        apiRequest<AdminDashboardData>("/admin/dashboard", { token }),
        apiRequest<{ products: AdminProduct[] }>("/products"),
        apiRequest<{ orders: AdminOrder[] }>("/orders", { token }),
        apiRequest<{ users: AdminUser[] }>("/admin/users", { token }),
        apiRequest<AdminAnalyticsData>("/admin/analytics", { token }),
      ]);
      setDashboard(d || null);
      setProducts(p?.products || []);
      setOrders(o?.orders || []);
      setCustomers(c?.users || []);
      setAnalytics(a || null);
    } catch (error) {
      toast.error("Failed to load admin data", { description: getErrorMessage(error) || "Please try again." });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAll().catch(() => setLoading(false));
  }, [loadAll]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const stats = useMemo<StatCard[]>(() => dashboard ? [
    { label: "Total Revenue", value: `₹${Number(dashboard?.stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign },
    { label: "Orders", value: Number(dashboard?.stats?.orders || 0).toLocaleString(), icon: Package },
    { label: "Customers", value: Number(dashboard?.stats?.customers || 0).toLocaleString(), icon: Users },
    { label: "Products", value: Number(dashboard?.stats?.products || 0).toLocaleString(), icon: Boxes },
  ] : [], [dashboard]);

  const monthlyRevenue = dashboard?.monthlyRevenue ?? [];
  const maxRevenue = Math.max(1, ...monthlyRevenue.map((x) => Number(x.revenue || 0)));
  const overview = analytics?.overview;
  const averageOrderValue = Math.round(overview?.averageOrderValue || 0);
  const totalOrders = Number(overview?.totalOrders || 0);
  const totalCustomers = Number(overview?.totalCustomers || 0);
  const ordersPerCustomer = totalCustomers ? (totalOrders / totalCustomers).toFixed(1) : "0.0";
  const statusEntries = Object.entries(analytics?.orderStatusBreakdown || {});
  const statusTotal = statusEntries.reduce((sum, [, value]) => sum + Number(value || 0), 0);
  const categoryEntries = Object.entries(analytics?.categoryBreakdown || {});
  const categoryTotal = categoryEntries.reduce((sum, [, value]) => sum + Number(value || 0), 0);
  const topProducts = analytics?.topProducts || [];
  const topRevenue = Math.max(1, ...topProducts.map((item) => Number(item.revenue || 0)));

  const setField = <K extends keyof ProductFormState>(k: K, v: ProductFormState[K]) =>
    setProductForm((p) => ({ ...p, [k]: v }));

  const editProduct = (p: AdminProduct) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name, price: String(p.price), originalPrice: String(p.originalPrice), image: p.image, category: p.category,
      occasion: p.occasion, color: p.color, size: (p.size || []).join(", "), rating: String(p.rating), reviews: String(p.reviews),
      description: p.description || "", badge: p.badge || "", stock: String(p.stock ?? 100), sku: p.sku || "", isNew: !!p.isNew,
    });
  };

  const resetProduct = () => { setEditingProduct(null); setProductForm(emptyProduct); };

  const saveProduct = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice),
        rating: Number(productForm.rating),
        reviews: Number(productForm.reviews),
        stock: Number(productForm.stock),
        size: productForm.size.split(",").map((x) => x.trim()).filter(Boolean),
      };
      if (editingProduct) await apiRequest(`/products/${editingProduct._id}`, { method: "PUT", token, body: JSON.stringify(payload) });
      else await apiRequest("/products", { method: "POST", token, body: JSON.stringify(payload) });
      toast.success(editingProduct ? "Product updated" : "Product created");
      resetProduct();
      await loadAll();
    } catch (error) {
      toast.error("Could not save product", { description: getErrorMessage(error) || "Please check the form." });
    } finally { setSaving(false); }
  };

  const removeProduct = async (id: string) => {
    if (!token) return;
    try { await apiRequest(`/products/${id}`, { method: "DELETE", token }); toast.success("Product deleted"); await loadAll(); }
    catch (error) { toast.error("Could not delete product", { description: getErrorMessage(error) || "Please try again." }); }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    if (!token) return;
    try { await apiRequest(`/orders/${id}/status`, { method: "PUT", token, body: JSON.stringify({ status }) }); toast.success("Order updated"); await loadAll(); }
    catch (error) { toast.error("Could not update order", { description: getErrorMessage(error) || "Please try again." }); }
  };

  const updateCustomer = async (id: string, payload: Partial<Pick<AdminUser, "firstName" | "lastName" | "phone" | "role" | "isActive">>) => {
    if (!token) return;
    try { await apiRequest(`/admin/users/${id}`, { method: "PUT", token, body: JSON.stringify(payload) }); toast.success("User updated"); await loadAll(); }
    catch (error) { toast.error("Could not update user", { description: getErrorMessage(error) || "Please try again." }); }
  };

  const removeCustomer = async (id: string) => {
    if (!token) return;
    try { await apiRequest(`/admin/users/${id}`, { method: "DELETE", token }); toast.success("User deleted"); await loadAll(); }
    catch (error) { toast.error("Could not delete user", { description: getErrorMessage(error) || "Please try again." }); }
  };

  const saveSettings = async () => {
    if (!token || !user) return;
    try {
      const data = await apiRequest<{ user?: { firstName?: string; lastName?: string; phone?: string } }>("/auth/profile", { method: "PUT", token, body: JSON.stringify(settingsForm) });
      const nextUser = {
        ...user,
        firstName: data?.user?.firstName || user.firstName,
        lastName: data?.user?.lastName || user.lastName,
        phone: data?.user?.phone || user.phone,
      };
      safeStorage.set("authUser", JSON.stringify(nextUser));
      toast.success("Admin profile updated");
    } catch (error) {
      toast.error("Could not update settings", { description: getErrorMessage(error) || "Please try again." });
    }
  };

  if (!isAuthenticated || user?.role !== "admin") return null;

  return (
    <div className="min-h-screen flex overflow-x-hidden">
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} hidden md:flex shrink-0 gradient-maroon text-primary-foreground transition-all duration-300 flex-col`}>
        <div className="p-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center text-xs font-bold text-maroon-dark">SP</div>
          {sidebarOpen && <span className="font-display font-bold text-sm">Admin Panel</span>}
        </div>
        <nav className="flex-1 px-2 space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActive(id); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${active === id ? "bg-primary-foreground/15 text-gold" : "text-primary-foreground/70 hover:bg-primary-foreground/10"}`}
            >
              <Icon className="w-4 h-4 shrink-0" />{sidebarOpen && <span>{label}</span>}
            </button>
          ))}
        </nav>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-4 text-primary-foreground/50 hover:text-primary-foreground">{sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</button>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="sticky top-0 z-10 glass-card-strong border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden p-2 rounded-full hover:bg-muted" aria-label="Open menu">
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="font-display text-lg sm:text-xl font-bold capitalize truncate">{active}</h1>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <button onClick={() => void loadAll()} className="text-xs text-primary hover:underline">Refresh Data</button>
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">Back to Store</Link>
            <button onClick={handleLogout} className="text-xs text-destructive hover:underline inline-flex items-center gap-1">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm md:hidden"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className="fixed left-0 top-0 z-50 h-full w-[86vw] max-w-[320px] gradient-maroon text-primary-foreground p-4 sm:p-6 md:hidden overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center text-xs font-bold text-maroon-dark">SP</div>
                    <span className="font-display font-bold text-sm">Admin Panel</span>
                  </div>
                  <button onClick={() => setMobileSidebarOpen(false)} className="p-2 rounded-full hover:bg-primary-foreground/10" aria-label="Close menu">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <nav className="space-y-2">
                  {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => { setActive(id); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${active === id ? "bg-primary-foreground/15 text-gold" : "text-primary-foreground/80 hover:bg-primary-foreground/10"}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </nav>
                <div className="mt-6 border-t border-primary-foreground/20 pt-4 space-y-2">
                  <button
                    onClick={() => void loadAll()}
                    className="w-full flex min-h-11 items-center rounded-2xl px-4 text-sm text-primary-foreground/90 hover:bg-primary-foreground/10"
                  >
                    Refresh Data
                  </button>
                  <Link
                    to="/"
                    className="flex min-h-11 items-center rounded-2xl px-4 text-sm text-primary-foreground/90 hover:bg-primary-foreground/10"
                  >
                    Back to Store
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex min-h-11 items-center rounded-2xl px-4 text-sm text-destructive hover:bg-destructive/10"
                  >
                    Logout
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="p-4 sm:p-6 lg:p-8">
          {loading ? <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">Loading admin dashboard...</div> : (
            <>
              {active === "dashboard" && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin Overview</p>
                    <h2 className="font-display text-2xl font-bold">Store Performance</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-3 py-1 rounded-full bg-muted">Live updates</span>
                    <span className="px-3 py-1 rounded-full bg-muted">Auto refresh</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {stats.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="glass-card rounded-3xl p-5 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-[10px] font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Live</span>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold break-words">{value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{label}</p>
                      <div className="absolute -right-10 -bottom-10 h-24 w-24 rounded-full bg-primary/10" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
                  <div className="glass-card rounded-3xl p-4 sm:p-6 overflow-hidden">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5">
                      <h3 className="font-display font-bold">Revenue Overview</h3>
                      <span className="text-xs text-muted-foreground">Last 6 months</span>
                    </div>
                    <div className="h-52 flex items-end gap-1.5 sm:gap-2 overflow-hidden">
                      {monthlyRevenue.map((m) => (
                        <div key={m.month} className="flex-1 group h-full flex items-end">
                          <div
                            className="w-full gradient-gold rounded-t-2xl relative"
                            style={{ height: `${Math.max(8, (m.revenue / maxRevenue) * 100)}%` }}
                          >
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100">
                              ₹{m.revenue.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between gap-1 mt-3 text-[9px] sm:text-[10px] text-muted-foreground">
                      {monthlyRevenue.map((m) => <span key={m.month}>{m.month}</span>)}
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl overflow-hidden">
                    <div className="p-5 flex items-center justify-between">
                      <h3 className="font-display font-bold">Recent Orders</h3>
                      <button onClick={() => setActive("orders")} className="text-xs text-primary hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[420px]">
                        <thead>
                          <tr className="border-t border-border text-xs text-muted-foreground">
                            <th className="text-left px-5 py-3">Order ID</th>
                            <th className="text-left px-5 py-3">Customer</th>
                            <th className="text-left px-5 py-3">Amount</th>
                            <th className="text-left px-5 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboard.recentOrders.map((o) => (
                            <tr key={o._id} className="border-t border-border">
                              <td className="px-5 py-3 font-semibold">{o.id}</td>
                              <td className="px-5 py-3">{o.customer}</td>
                              <td className="px-5 py-3 font-semibold">₹{o.amount.toLocaleString()}</td>
                              <td className="px-5 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[o.status] || "bg-muted text-foreground"}`}>{o.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>}

              {active === "products" && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Catalog Manager</p>
                    <h2 className="font-display text-lg font-bold">All Products ({products.length})</h2>
                  </div>
                  <button onClick={resetProduct} className="btn-gold text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>

                  <div className="glass-card rounded-3xl p-4 sm:p-5">
                  <h3 className="font-display font-bold mb-4">{editingProduct ? "Edit Product" : "Create Product"}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {productTextFields.map((f) => (
                      <div key={f} className={f === "image" || f === "size" ? "md:col-span-2" : ""}>
                        <label className="text-xs font-semibold mb-1.5 block capitalize">{f}</label>
                        <input value={productForm[f]} onChange={(e) => setField(f, e.target.value)} className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/30" />
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold mb-1.5 block">Description</label>
                      <textarea value={productForm.description} onChange={(e) => setField("description", e.target.value)} rows={3} className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/30" />
                    </div>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={productForm.isNew} onChange={(e) => setField("isNew", e.target.checked)} /> Mark as New</label>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-5">
                    <button onClick={saveProduct} disabled={saving} className="btn-gold text-sm disabled:opacity-60">{saving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}</button>
                    <button onClick={resetProduct} className="px-4 py-2 rounded-2xl border border-border text-sm hover:bg-muted">Clear</button>
                  </div>
                </div>

                <div className="glass-card rounded-3xl overflow-hidden">
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm min-w-[680px]">
                      <thead><tr className="border-b border-border text-xs text-muted-foreground"><th className="text-left px-5 py-3">Product</th><th className="text-left px-5 py-3">Category</th><th className="text-left px-5 py-3">Price</th><th className="text-left px-5 py-3">Stock</th><th className="text-left px-5 py-3">Actions</th></tr></thead>
                      <tbody>{products.map((p) => <tr key={p._id} className="border-b border-border hover:bg-muted/50"><td className="px-5 py-3"><div className="flex items-center gap-3"><img src={p.image} alt="" className="w-10 h-12 object-cover rounded-lg" /><div><p className="font-semibold line-clamp-1 max-w-[220px]">{p.name}</p><p className="text-xs text-muted-foreground">{p.sku || "No SKU"}</p></div></div></td><td className="px-5 py-3 text-muted-foreground">{p.category}</td><td className="px-5 py-3 font-semibold">₹{p.price.toLocaleString()}</td><td className="px-5 py-3">{p.stock ?? 0}</td><td className="px-5 py-3"><div className="flex gap-1"><button onClick={() => editProduct(p)} className="p-1.5 rounded-lg hover:bg-muted"><Pencil className="w-3.5 h-3.5" /></button><button onClick={() => void removeProduct(p._id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button></div></td></tr>)}</tbody>
                    </table>
                  </div>
                  <div className="grid gap-4 p-5 md:hidden">{products.map((p) => <div key={p._id} className="border border-border rounded-2xl p-4 space-y-3"><div className="flex items-start gap-3"><img src={p.image} alt="" className="w-12 h-16 object-cover rounded-lg" /><div><p className="font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">{p.category}</p><p className="text-xs text-muted-foreground">SKU: {p.sku || "No SKU"}</p></div></div><div className="flex items-center justify-between text-sm"><span className="font-semibold">₹{p.price.toLocaleString()}</span><span className="text-muted-foreground">Stock: {p.stock ?? 0}</span></div><div className="flex gap-2"><button onClick={() => editProduct(p)} className="px-3 py-1.5 rounded-xl bg-muted text-xs">Edit</button><button onClick={() => void removeProduct(p._id)} className="px-3 py-1.5 rounded-xl bg-destructive/10 text-destructive text-xs">Delete</button></div></div>)}</div>
                </div>
              </motion.div>}

              {active === "orders" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Fulfillment</p>
                    <h2 className="font-display text-lg font-bold">Order Management</h2>
                  </div>
                  <div className="glass-card rounded-3xl overflow-hidden">
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-sm min-w-[820px]"><thead><tr className="border-b border-border text-xs text-muted-foreground"><th className="text-left px-5 py-3">Order ID</th><th className="text-left px-5 py-3">Customer</th><th className="text-left px-5 py-3">Items</th><th className="text-left px-5 py-3">Amount</th><th className="text-left px-5 py-3">Status</th><th className="text-left px-5 py-3">Date</th></tr></thead><tbody>{orders.map((o) => <tr key={o._id} className="border-b border-border hover:bg-muted/50"><td className="px-5 py-3 font-semibold">{o.orderId}</td><td className="px-5 py-3"><div><p>{o.userId ? `${o.userId.firstName} ${o.userId.lastName}` : "Guest User"}</p><p className="text-xs text-muted-foreground">{o.userId?.email}</p></div></td><td className="px-5 py-3 text-xs text-muted-foreground">{(o.items || []).slice(0,2).map((i)=>`${i.name} x${i.quantity}`).join(", ")}</td><td className="px-5 py-3 font-semibold">₹{o.total.toLocaleString()}</td><td className="px-5 py-3"><select value={o.orderStatus} onChange={(e)=>void updateOrderStatus(o._id,e.target.value)} className={`px-2 py-1 rounded-full text-xs font-semibold border-0 ${statusColors[o.orderStatus] || "bg-muted text-foreground"}`}>{["Ordered","Processing","Shipped","Delivered","Cancelled"].map((s)=><option key={s} value={s}>{s}</option>)}</select></td><td className="px-5 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>
                    <div className="grid gap-4 p-5 md:hidden">{orders.map((o) => <div key={o._id} className="border border-border rounded-2xl p-4 space-y-3"><div className="flex items-center justify-between"><p className="font-semibold">{o.orderId}</p><span className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</span></div><div><p className="text-sm">{o.userId ? `${o.userId.firstName} ${o.userId.lastName}` : "Guest User"}</p><p className="text-xs text-muted-foreground">{o.userId?.email}</p></div><p className="text-xs text-muted-foreground">{(o.items || []).slice(0,2).map((i)=>`${i.name} x${i.quantity}`).join(", ")}</p><div className="flex items-center justify-between"><span className="font-semibold">₹{o.total.toLocaleString()}</span><select value={o.orderStatus} onChange={(e)=>void updateOrderStatus(o._id,e.target.value)} className={`px-2 py-1 rounded-full text-xs font-semibold border-0 ${statusColors[o.orderStatus] || "bg-muted text-foreground"}`}>{["Ordered","Processing","Shipped","Delivered","Cancelled"].map((s)=><option key={s} value={s}>{s}</option>)}</select></div></div>)}</div>
                  </div>
                </motion.div>
              )}

              {active === "customers" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Audience</p>
                    <h2 className="font-display text-lg font-bold">Customer Management</h2>
                  </div>
                  <div className="glass-card rounded-3xl overflow-hidden">
                    <div className="hidden md:block overflow-x-auto"><table className="w-full text-sm min-w-[820px]"><thead><tr className="border-b border-border text-xs text-muted-foreground"><th className="text-left px-5 py-3">Customer</th><th className="text-left px-5 py-3">Role</th><th className="text-left px-5 py-3">Orders</th><th className="text-left px-5 py-3">Spent</th><th className="text-left px-5 py-3">Status</th><th className="text-left px-5 py-3">Actions</th></tr></thead><tbody>{customers.map((c) => <tr key={c._id} className="border-b border-border hover:bg-muted/50"><td className="px-5 py-3"><div><p className="font-semibold">{c.firstName} {c.lastName}</p><p className="text-xs text-muted-foreground">{c.email}</p><p className="text-xs text-muted-foreground">{c.phone || "No phone"}</p></div></td><td className="px-5 py-3"><select value={c.role} onChange={(e)=>void updateCustomer(c._id,{ role:e.target.value })} className="bg-muted rounded-xl px-2 py-1 text-xs"><option value="user">User</option><option value="admin">Admin</option></select></td><td className="px-5 py-3">{c.ordersCount}</td><td className="px-5 py-3 font-semibold">₹{c.totalSpent.toLocaleString()}</td><td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.isActive === false ? "bg-destructive/10 text-destructive" : "bg-green-100 text-green-600"}`}>{c.isActive === false ? "Disabled" : "Active"}</span></td><td className="px-5 py-3"><div className="flex gap-2"><button onClick={()=>void updateCustomer(c._id,{ isActive:c.isActive === false })} className="text-xs text-primary hover:underline">{c.isActive === false ? "Enable" : "Disable"}</button>{c._id !== user?.id && <button onClick={()=>void removeCustomer(c._id)} className="text-xs text-destructive hover:underline">Delete</button>}</div></td></tr>)}</tbody></table></div>
                    <div className="grid gap-4 p-5 md:hidden">{customers.map((c) => <div key={c._id} className="border border-border rounded-2xl p-4 space-y-3"><div><p className="font-semibold">{c.firstName} {c.lastName}</p><p className="text-xs text-muted-foreground">{c.email}</p><p className="text-xs text-muted-foreground">{c.phone || "No phone"}</p></div><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Orders</span><span className="text-sm font-semibold">{c.ordersCount}</span></div><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Spent</span><span className="text-sm font-semibold">₹{c.totalSpent.toLocaleString()}</span></div><div className="flex items-center justify-between"><select value={c.role} onChange={(e)=>void updateCustomer(c._id,{ role:e.target.value })} className="bg-muted rounded-xl px-2 py-1 text-xs"><option value="user">User</option><option value="admin">Admin</option></select><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.isActive === false ? "bg-destructive/10 text-destructive" : "bg-green-100 text-green-600"}`}>{c.isActive === false ? "Disabled" : "Active"}</span></div><div className="flex gap-2"><button onClick={()=>void updateCustomer(c._id,{ isActive:c.isActive === false })} className="text-xs text-primary">{c.isActive === false ? "Enable" : "Disable"}</button>{c._id !== user?.id && <button onClick={()=>void removeCustomer(c._id)} className="text-xs text-destructive">Delete</button>}</div></div>)}</div>
                  </div>
                </motion.div>
              )}

              {active === "analytics" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="relative overflow-hidden rounded-3xl gradient-maroon p-6 md:p-8 text-primary-foreground">
                    <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/25 blur-3xl" />
                    <div className="absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-primary/25 blur-3xl" />
                    <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.24em] text-primary-foreground/60">Store Pulse</p>
                        <h2 className="font-display text-2xl md:text-3xl font-bold">Analytics Snapshot</h2>
                        <p className="text-sm text-primary-foreground/70 mt-1">Track live performance, customer flow, and demand signals.</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full bg-primary-foreground/15 text-xs">Live metrics</span>
                        <span className="px-3 py-1 rounded-full bg-primary-foreground/15 text-xs">Admin view</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="glass-card rounded-3xl p-5 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Avg Order Value</p>
                        <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-gold-dark" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold mt-3">₹{averageOrderValue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Revenue per order</p>
                      <div className="absolute -right-10 -bottom-10 h-24 w-24 rounded-full bg-gold/10" />
                    </div>
                    <div className="glass-card rounded-3xl p-5 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Orders</p>
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold mt-3">{totalOrders.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Across all channels</p>
                      <div className="absolute -right-10 -bottom-10 h-24 w-24 rounded-full bg-primary/10" />
                    </div>
                    <div className="glass-card rounded-3xl p-5 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Customers</p>
                        <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold mt-3">{totalCustomers.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Active buyers</p>
                      <div className="absolute -right-10 -bottom-10 h-24 w-24 rounded-full bg-green-200/40" />
                    </div>
                    <div className="glass-card rounded-3xl p-5 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Orders per Customer</p>
                        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-foreground" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold mt-3">{ordersPerCustomer}</p>
                      <p className="text-xs text-muted-foreground mt-1">Engagement depth</p>
                      <div className="absolute -right-10 -bottom-10 h-24 w-24 rounded-full bg-foreground/10" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-6">
                    <div className="glass-card rounded-3xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display font-bold">Order Status Breakdown</h3>
                        <span className="text-xs text-muted-foreground">{statusTotal.toLocaleString()} orders</span>
                      </div>
                      <div className="space-y-4">
                        {statusEntries.map(([status, value]) => {
                          const count = Number(value || 0);
                          const percent = statusTotal ? Math.round((count / statusTotal) * 100) : 0;
                          return (
                            <div key={status} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[status] || "bg-muted text-foreground"}`}>{status}</span>
                                <span className="text-sm font-semibold">{count}</span>
                              </div>
                              <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div className="h-full gradient-gold" style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                          );
                        })}
                        {!statusEntries.length && <p className="text-sm text-muted-foreground">No status data yet.</p>}
                      </div>
                    </div>

                    <div className="glass-card rounded-3xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display font-bold">Category Distribution</h3>
                        <span className="text-xs text-muted-foreground">{categoryTotal.toLocaleString()} items</span>
                      </div>
                      <div className="space-y-4">
                        {categoryEntries.map(([category, value]) => {
                          const count = Number(value || 0);
                          const percent = categoryTotal ? Math.round((count / categoryTotal) * 100) : 0;
                          return (
                            <div key={category} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{category}</span>
                                <span className="text-sm font-semibold">{count}</span>
                              </div>
                              <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div className="h-full gradient-maroon" style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                          );
                        })}
                        {!categoryEntries.length && <p className="text-sm text-muted-foreground">No category data yet.</p>}
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-bold">Top Selling Products</h3>
                      <span className="text-xs text-muted-foreground">{topProducts.length} products</span>
                    </div>
                    <div className="space-y-4">
                      {topProducts.map((product, index: number) => (
                        <div key={product.name} className="flex flex-col gap-3 border-b border-border pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full gradient-gold text-maroon-dark text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.quantity} units sold</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-28 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full gradient-gold"
                                style={{ width: `${Math.min(100, Math.round((Number(product.revenue || 0) / (topRevenue || 1)) * 100))}%` }}
                              />
                            </div>
                            <span className="font-semibold">₹{Number(product.revenue || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                      {!topProducts.length && <p className="text-sm text-muted-foreground">No sales data yet.</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {active === "settings" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Preferences</p>
                    <h2 className="font-display text-lg font-bold">Admin Profile Settings</h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
                    <div className="glass-card rounded-3xl p-6">
                      <h3 className="font-display font-bold mb-6">Profile Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-xs font-semibold mb-1.5 block">First Name</label><input value={settingsForm.firstName} onChange={(e)=>setSettingsForm((p)=>({...p,firstName:e.target.value}))} className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/30" /></div>
                        <div><label className="text-xs font-semibold mb-1.5 block">Last Name</label><input value={settingsForm.lastName} onChange={(e)=>setSettingsForm((p)=>({...p,lastName:e.target.value}))} className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/30" /></div>
                        <div><label className="text-xs font-semibold mb-1.5 block">Phone</label><input value={settingsForm.phone} onChange={(e)=>setSettingsForm((p)=>({...p,phone:e.target.value}))} className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/30" /></div>
                        <div><label className="text-xs font-semibold mb-1.5 block">Email</label><input value={user?.email || ""} disabled className="w-full bg-muted rounded-2xl px-4 py-3 text-sm opacity-70" /></div>
                      </div>
                      <button onClick={saveSettings} className="btn-gold mt-6 text-sm">Save Settings</button>
                    </div>
                    <div className="glass-card rounded-3xl p-6">
                      <h3 className="font-display font-bold mb-4">Live Store Summary</h3>
                      <div className="space-y-4 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Products in database</span><span className="font-semibold">{dashboard?.stats.products}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Customers in database</span><span className="font-semibold">{dashboard?.stats.customers}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Orders in database</span><span className="font-semibold">{dashboard?.stats.orders}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Total revenue</span><span className="font-semibold">₹{dashboard?.stats.totalRevenue.toLocaleString()}</span></div></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
