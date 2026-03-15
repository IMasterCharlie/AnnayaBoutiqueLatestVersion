import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, Package, Users, Plus, Edit,
  Trash2, ArrowLeft, MapPin, Clock, Truck, CheckCircle, XCircle,
  LogOut, TrendingUp, X, Mail, Phone, ShoppingBag, Loader2
} from "lucide-react";
import api from "../lib/api";
import { formatCurrency, cn } from "../lib/utils";
import { toast } from "sonner";
import { useUserStore } from "../store/useUserStore";
import { useAuth0 } from "@auth0/auth0-react";
import { ImageUpload } from "../components/admin/ImageUpload";

// ─── CustomerTab ──────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  Delivered: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Shipped: "bg-sky-50 text-sky-600 border-sky-100",
  Cancelled: "bg-rose-50 text-rose-600 border-rose-100",
  Processing: "bg-amber-50 text-amber-600 border-amber-100",
};

const CustomerTab = ({
  usersList,
  adminAuthId,
  formatCurrency,
}: {
  usersList: any[];
  adminAuthId: string;
  formatCurrency: (n: number) => string;
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const handleSelectCustomer = async (u: any) => {
    setSelectedCustomer(u);
    setCustomerOrders([]);
    setOrdersLoading(true);
    try {
      const res = await api.get(`/api/admin/users/${u._id}/orders`, {
        headers: { "x-auth0-id": adminAuthId },
      });
      setCustomerOrders(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCustomerOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const totalSpent = customerOrders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  /* ── DETAIL VIEW ── */
  if (selectedCustomer) {
    const u = selectedCustomer;
    return (
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-20">
          <button
            onClick={() => { setSelectedCustomer(null); setCustomerOrders([]); }}
            className="flex items-center gap-2.5 text-slate-500 hover:text-royal font-bold transition-all hover:-translate-x-1"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Customers
          </button>
          <span className="font-mono text-xs text-slate-400 font-bold uppercase tracking-widest">
            #{u._id.substring(u._id.length - 12).toUpperCase()}
          </span>
        </div>

        <div className="p-8 lg:p-12">
          {/* Profile row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 pb-10 border-b border-slate-100">
            <div className="shrink-0">
              {u.picture ? (
                <img src={u.picture} alt={u.name} className="w-20 h-20 rounded-[24px] border-2 border-slate-100 shadow-lg" />
              ) : (
                <div className="w-20 h-20 rounded-[24px] bg-royal text-gold flex items-center justify-center font-black text-3xl border-2 border-royal/20 shadow-lg">
                  {u.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{u.name}</h3>
              <div className="flex flex-wrap gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                  <Mail className="w-3.5 h-3.5 text-royal/60" /> {u.email}
                </span>
                {u.phone && (
                  <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                    <Phone className="w-3.5 h-3.5 text-royal/60" /> {u.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-300" />
                  Joined {new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}
                </span>
              </div>
              <span className={cn(
                "mt-3 inline-block px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ring-inset",
                u.role === "admin" ? "bg-royal text-gold ring-gold/20" : "bg-slate-100 text-slate-500 ring-slate-200"
              )}>
                {u.role || "Customer"}
              </span>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4 shrink-0">
              <div className="text-center px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-3xl font-bold text-royal">{customerOrders.length}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Orders</p>
              </div>
              <div className="text-center px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalSpent)}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Total Spent</p>
              </div>
            </div>
          </div>

          {/* Orders */}
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-royal" /> Order History
          </h4>

          {ordersLoading ? (
            <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" /> Fetching orders…
            </div>
          ) : customerOrders.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-slate-200" />
              <p className="font-medium">No orders placed yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customerOrders.map((order: any) => (
                <div key={order._id} className="bg-slate-50 rounded-[28px] border border-slate-100 overflow-hidden hover:shadow-md transition-all">
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-100 bg-white">
                    <div>
                      <p className="font-mono text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                        #{order._id.substring(order._id.length - 12).toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                        STATUS_STYLES[order.status] || STATUS_STYLES.Processing
                      )}>
                        {order.status}
                      </span>
                      <span className="text-lg font-bold text-royal">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-slate-100">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-xl shrink-0 shadow-sm" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Size: <span className="text-royal font-bold">{item.size}</span>
                            &nbsp;·&nbsp;Qty: <span className="text-royal font-bold">{item.qty}</span>
                          </p>
                          <p className="text-xs font-bold text-slate-500 mt-1">{formatCurrency(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping address */}
                  {order.shippingAddress && (
                    <div className="px-6 pb-4 flex items-start gap-2 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-300 shrink-0" />
                      <span>
                        {order.shippingAddress.fullName}, {order.shippingAddress.addressLine1},
                        {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.postalCode}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── LIST VIEW ── */
  return (
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="p-8 border-b border-slate-50">
        <h3 className="text-2xl font-bold text-slate-900">CRM — Customer Relations</h3>
        <p className="text-sm text-slate-500 mt-1 font-medium italic">
          {usersList.length} registered profiles · Click any row to see full details &amp; orders
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            <tr>
              <th className="px-8 py-5">Profile</th>
              <th className="px-8 py-5">Communication</th>
              <th className="px-8 py-5">Joined</th>
              <th className="px-8 py-5 text-right">Role</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-50">
            {usersList.map((u: any) => (
              <tr
                key={u._id}
                className="hover:bg-royal/5 transition-colors cursor-pointer group"
                onClick={() => handleSelectCustomer(u)}
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-5">
                    {u.picture ? (
                      <img src={u.picture} alt={u.name} className="w-12 h-12 rounded-[18px] border-2 border-slate-100 shadow-sm group-hover:ring-2 group-hover:ring-royal/20 transition-all" />
                    ) : (
                      <div className="w-12 h-12 rounded-[18px] bg-royal text-gold flex items-center justify-center font-black text-lg border-2 border-royal/20 shadow-lg shadow-royal/10">
                        {u.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-slate-900 text-base group-hover:text-royal transition-colors">{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        #{u._id.substring(u._id.length - 8)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="font-bold text-slate-900">{u.email}</div>
                  <div className="text-xs text-slate-400 mt-1">{u.phone || "No phone"}</div>
                </td>
                <td className="px-8 py-6 text-xs text-slate-500 font-bold uppercase tracking-tight">
                  {new Date(u.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </td>
                <td className="px-8 py-6 text-right">
                  <span className={cn(
                    "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ring-inset",
                    u.role === "admin" ? "bg-royal text-gold ring-gold/20" : "bg-white text-slate-400 ring-slate-100"
                  )}>
                    {u.role || "Customer"}
                  </span>
                </td>
              </tr>
            ))}
            {usersList.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium italic">No customers registered yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({ totalOrders: 0, revenue: 0, productsCount: 0 });
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedAdminOrder, setSelectedAdminOrder] = useState<any>(null);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: "", description: "", price: "", stock: "", category: "Lehenga",
    images: [] as string[], sizes: [] as string[], colors: [] as { name: string, hex: string }[],
    rating: 0, reviewCount: 0
  });
  const [sizeInput, setSizeInput] = useState("");
  const [colorNameInput, setColorNameInput] = useState("");
  const [colorHexInput, setColorHexInput] = useState("#000000");
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const { user, isAuthenticated, isLoading } = useAuth0();
  const isAdminUser = useUserStore(state => state.role === "admin");

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !user?.sub || !isAdminUser) return;
      try {
        const headers = { "x-auth0-id": user.sub };
        const [prodRes, statsRes, ordersRes, usersRes] = await Promise.all([
          api.get("/api/products"),
          api.get("/api/admin/stats", { headers }),
          api.get("/api/admin/orders", { headers }),
          api.get("/api/admin/users", { headers }),
        ]);
        setProducts(prodRes.data);
        setOrders(ordersRes.data);
        setUsersList(usersRes.data);
        setStats({
          totalOrders: statsRes.data.totalOrders || 0,
          revenue: statsRes.data.revenue || 0,
          productsCount: statsRes.data.productsCount || prodRes.data.length,
        });
      } catch (err) {
        console.error("Error fetching admin data", err);
      }
    };
    fetchData();
  }, [isAuthenticated, user, isAdminUser]);

  if (isLoading) {
    return <div className="pt-32 text-center text-royal font-bold">Initializing Admin Console...</div>;
  }

  if (!isAuthenticated || !isAdminUser) {
    return (
      <div className="pt-32 pb-20 px-4 min-h-[70vh] flex flex-col items-center justify-center bg-cream">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6 border border-rose-100">
          <XCircle className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-royal mb-4">403 Forbidden</h1>
        <p className="text-slate-500 max-w-md text-center font-medium leading-relaxed">
          Access denied. This portal is restricted to authorized administrators only.
        </p>
        <Link to="/" className="mt-8 px-8 py-3 bg-royal text-white rounded-2xl font-bold shadow-lg shadow-royal/20 hover:scale-105 transition-transform">
          Return to Storefront
        </Link>
      </div>
    );
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!user?.sub) return;
    try {
      await api.put(
        `/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { "x-auth0-id": user.sub } }
      );
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      if (selectedAdminOrder?._id === orderId) {
        setSelectedAdminOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleOpenProductModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || "", description: product.description || "", price: product.price || "",
        stock: product.stock || "", category: product.category || "Lehenga",
        images: product.images || [], sizes: product.sizes || [], colors: product.colors || [],
        rating: product.rating || 0, reviewCount: product.reviewCount || 0
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: "", description: "", price: "", stock: "", category: "Lehenga", images: [], sizes: [], colors: [], rating: 0, reviewCount: 0 });
    }
    setSizeInput("");
    setColorNameInput("");
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.sub) return;
    setIsSavingProduct(true);
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        originalPrice: Number(productForm.price),
        stock: Number(productForm.stock),
        rating: Number(productForm.rating),
        reviewCount: Number(productForm.reviewCount)
      };
      if (editingProduct) {
        const res = await api.put(`/api/products/${editingProduct._id}`, payload, { headers: { "x-auth0-id": user.sub } });
        setProducts(products.map(p => p._id === editingProduct._id ? res.data : p));
        toast.success("Product updated successfully");
      } else {
        const res = await api.post("/api/products", payload, { headers: { "x-auth0-id": user.sub } });
        setProducts([res.data, ...products]);
        toast.success("New product published");
      }
      setIsProductModalOpen(false);
    } catch (error) {
      toast.error("Error saving product details");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!user?.sub || !window.confirm("Confirm product deletion?")) return;
    try {
      await api.delete(`/api/products/${id}`, { headers: { "x-auth0-id": user.sub } });
      setProducts(products.filter(p => p._id !== id));
      toast.success("Product removed");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Inventory", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "users", label: "Customers", icon: Users },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* ─────────────── Admin Navigation Bar ─────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 shadow-2xl">
        <div className="max-w-[1500px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => { setActiveTab("dashboard"); setSelectedAdminOrder(null); }} className="flex items-center gap-3 mr-6">
              <div className="w-9 h-9 rounded-xl bg-royal flex items-center justify-center ring-2 ring-gold/40 shadow-inner">
                <span className="font-serif text-gold font-bold text-lg leading-none">A</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-white font-bold text-sm tracking-tight">Annaya Boutique</span>
                <span className="text-[9px] text-slate-500 tracking-[0.2em] font-bold uppercase mt-1">Management Console</span>
              </div>
            </button>

            <div className="hidden md:flex items-center gap-1 border-l border-slate-800 pl-4 py-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedAdminOrder(null); }}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300",
                    activeTab === tab.id
                      ? "bg-white/10 text-white shadow-lg ring-1 ring-white/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-gold" : "opacity-60")} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end leading-none">
              <span className="text-white text-[11px] font-bold uppercase tracking-wider">{user?.name}</span>
              <span className="text-gold/80 text-[10px] items-center gap-1 flex mt-1 font-bold">
                <CheckCircle className="w-2.5 h-2.5" /> Verified Admin
              </span>
            </div>
            {user?.picture && (
              <img src={user.picture} alt="" className="w-9 h-9 rounded-full ring-2 ring-slate-800 p-0.5" />
            )}
            <Link
              to="/"
              className="group flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-royal text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all ml-2"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Exit Console</span>
            </Link>
          </div>
        </div>

        {/* Mobile Nav Strip */}
        <div className="md:hidden flex gap-1 overflow-x-auto no-scrollbar px-4 pb-2 bg-slate-900 border-t border-slate-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedAdminOrder(null); }}
              className={cn(
                "flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all shrink-0 mt-2",
                activeTab === tab.id
                  ? "bg-white/10 text-white ring-1 ring-white/20"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-gold" : "")} />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ─────────────── Main Shell ─────────────── */}
      <div className="pt-[104px] md:pt-24 pb-20 px-4 max-w-[1500px] mx-auto min-h-screen">

        {/* 1. Dashboard */}
        {activeTab === "dashboard" && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="mb-10 lg:flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-serif font-bold text-slate-900">Dashboard Overview</h2>
                <p className="text-slate-500 font-medium mt-1">Real-time statistics for your storefront.</p>
              </div>
              <div className="mt-4 lg:mt-0 px-4 py-2 bg-white rounded-xl border border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-400 shadow-sm">
                <Clock className="w-4 h-4" /> Updated just now
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-royal/5 transition-all group overflow-hidden relative">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-50 rounded-full blur-3xl group-hover:bg-emerald-100 transition-colors" />
                <div className="relative">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-emerald-100">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Total Revenue Generated</p>
                  <h2 className="text-4xl font-bold text-slate-900 tracking-tight">{formatCurrency(stats.revenue)}</h2>
                  <div className="mt-6 flex items-center gap-2 bg-emerald-50/50 w-fit px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase">Live Transaction Data</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-royal/5 transition-all group overflow-hidden relative">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-royal/5 rounded-full blur-3xl group-hover:bg-royal/10 transition-colors" />
                <div className="relative">
                  <div className="w-12 h-12 bg-royal/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-royal/20">
                    <ShoppingCart className="w-6 h-6 text-royal" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Order Fulfillment Queue</p>
                  <h2 className="text-4xl font-bold text-slate-900 tracking-tight">{stats.totalOrders}</h2>
                  <p className="mt-6 text-[11px] text-slate-500 font-bold uppercase tracking-wider">Across all regions</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-royal/5 transition-all group overflow-hidden relative">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-50 rounded-full blur-3xl group-hover:bg-amber-100 transition-colors" />
                <div className="relative">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-amber-100">
                    <Package className="w-6 h-6 text-amber-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Inventory Catalogue</p>
                  <h2 className="text-4xl font-bold text-slate-900 tracking-tight">{stats.productsCount}</h2>
                  <p className="mt-6 text-[11px] text-slate-500 font-bold uppercase tracking-wider">Active SKU Count</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Inventory */}
        {activeTab === "products" && (
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 lg:text-2xl">Catalogue Management</h3>
                <p className="text-sm text-slate-500 mt-1">Manage, update, and deploy your product listings.</p>
              </div>
              <button
                onClick={() => handleOpenProductModal()}
                className="px-6 py-3 bg-royal text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-sapphire shadow-xl shadow-royal/10 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" /> Launch New SKU
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-5">Product Master</th>
                    <th className="px-8 py-5">Classification</th>
                    <th className="px-8 py-5 text-right">Unit Price</th>
                    <th className="px-8 py-5 text-center">Stock</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-50">
                  {products.map((p: any) => (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-5">
                          <img src={p.images[0]} alt="" className="w-14 h-16 object-cover rounded-xl shadow-sm border border-slate-100" />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-base">{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono mt-1 uppercase">ID: {p._id.substring(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">{p.category}</span>
                      </td>
                      <td className="px-8 py-5 text-right font-bold text-royal text-lg">{formatCurrency(p.price)}</td>
                      <td className="px-8 py-5 text-center">
                        <div className={cn(
                          "px-3 py-1.5 rounded-xl font-bold text-xs inline-block min-w-[60px]",
                          p.stock > 10 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                          {p.stock}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenProductModal(p)} className="p-2.5 text-slate-400 hover:text-royal hover:bg-royal/5 rounded-xl transition-all">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeleteProduct(p._id)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium italic">Catalogue is currently empty.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Orders */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
            {selectedAdminOrder ? (
              <div className="flex flex-col">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-20">
                  <button
                    onClick={() => setSelectedAdminOrder(null)}
                    className="flex items-center gap-2.5 text-slate-500 hover:text-royal font-bold transition-all hover:-translate-x-1"
                  >
                    <ArrowLeft className="w-5 h-5" /> Exit Detailed View
                  </button>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Tracking Number</span>
                    <span className="font-mono text-base font-bold text-slate-900 mb-0">#{selectedAdminOrder._id.toUpperCase()}</span>
                  </div>
                </div>

                <div className="p-8 lg:p-12">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Status Workflow</h4>
                      <p className="text-2xl font-serif font-bold text-slate-900">Live Delivery Tracking</p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-[20px] ring-1 ring-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-3">Update Order Progress:</span>
                      <select
                        value={selectedAdminOrder.status}
                        onChange={e => handleStatusChange(selectedAdminOrder._id, e.target.value)}
                        className={cn(
                          "px-5 py-2.5 rounded-xl text-xs font-bold border-none outline-none cursor-pointer shadow-sm transition-all",
                          selectedAdminOrder.status === "Delivered" ? "bg-emerald-500 text-white" :
                            selectedAdminOrder.status === "Shipped" ? "bg-sky-500 text-white" :
                              selectedAdminOrder.status === "Cancelled" ? "bg-rose-500 text-white" :
                                "bg-amber-500 text-white"
                        )}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-16">
                    {selectedAdminOrder.status === "Cancelled" ? (
                      <div className="flex items-center gap-6 bg-rose-50 p-8 rounded-[32px] border border-rose-100 shadow- inner shadow-rose-200/20">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md text-rose-500 shrink-0">
                          <XCircle className="w-8 h-8" />
                        </div>
                        <div>
                          <h5 className="font-bold text-rose-900 text-2xl">Transaction Revoked</h5>
                          <p className="text-rose-600/80 mt-1 font-medium italic">This order file was manually closed by administrative staff.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative px-2">
                        <div className="absolute top-7 left-0 w-full h-1.5 bg-slate-100 rounded-full hidden sm:block" />
                        <div
                          className="absolute top-7 left-0 h-1.5 bg-emerald-400 rounded-full hidden sm:block transition-all duration-1000 ease-out"
                          style={{
                            width: selectedAdminOrder.status === "Delivered" ? "100%" :
                              selectedAdminOrder.status === "Shipped" ? "50%" : "8%"
                          }}
                        />
                        <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-8 sm:gap-0">
                          {[
                            { label: "Processing", icon: Clock, desc: "Awaiting Logistics", active: true },
                            { label: "Shipped", icon: Truck, desc: "Package in Transit", active: selectedAdminOrder.status !== "Processing" },
                            { label: "Delivered", icon: CheckCircle, desc: "Receipt Confirmed", active: selectedAdminOrder.status === "Delivered" },
                          ].map(step => (
                            <div key={step.label} className="flex sm:flex-col items-center gap-4 sm:gap-3 text-center">
                              <div className={cn(
                                "w-14 h-14 rounded-full flex items-center justify-center border-4 shrink-0 transition-all duration-500",
                                step.active && selectedAdminOrder.status === step.label
                                  ? "bg-royal text-white border-white shadow-2xl shadow-royal/40 ring-[6px] ring-royal/10 scale-110"
                                  : step.active
                                    ? "bg-emerald-500 text-white border-white shadow-xl shadow-emerald-500/20"
                                    : "bg-white text-slate-200 border-slate-50"
                              )}>
                                <step.icon className="w-6 h-6" />
                              </div>
                              <div className="text-left sm:text-center mt-1">
                                <p className={cn("text-base font-bold", step.active ? "text-slate-900" : "text-slate-300")}>{step.label}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 hidden sm:block">{step.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
                    <div className="group">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-royal" /> Destination Data
                      </h4>
                      <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-royal/5 transition-all">
                        <p className="font-bold text-slate-900 text-xl mb-1">{selectedAdminOrder.shippingAddress?.fullName}</p>
                        <p className="text-base text-slate-500 mb-6 font-medium">{selectedAdminOrder.shippingAddress?.phoneNumber}</p>
                        <div className="p-5 bg-white rounded-2xl border border-slate-100 text-slate-600 leading-relaxed font-medium">
                          {selectedAdminOrder.shippingAddress?.addressLine1}
                          {selectedAdminOrder.shippingAddress?.addressLine2 && <><br />{selectedAdminOrder.shippingAddress.addressLine2}</>}
                          <br />
                          {selectedAdminOrder.shippingAddress?.city}, {selectedAdminOrder.shippingAddress?.state} — {selectedAdminOrder.shippingAddress?.postalCode}
                        </div>
                      </div>
                    </div>

                    <div className="group">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                        <Users className="w-5 h-5 text-royal" /> Financial Audit
                      </h4>
                      <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-royal/5 transition-all h-full">
                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Placement Date</span>
                            <span className="font-bold text-slate-900">{new Date(selectedAdminOrder.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                          </div>
                          <div className="flex justify-between items-end">
                            <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Acquisition Mode</span>
                            <span className="px-3 py-1 bg-royal/10 text-royal text-xs font-bold rounded-lg uppercase tracking-widest">{selectedAdminOrder.paymentMethod}</span>
                          </div>
                          {selectedAdminOrder.razorpayPaymentId && (
                            <div className="pt-4 border-t border-slate-200">
                              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Razorpay Authentication Token</span>
                              <span className="font-mono text-xs text-slate-900 font-medium bg-white px-3 py-1.5 rounded-lg border border-slate-100 block">{selectedAdminOrder.razorpayPaymentId}</span>
                            </div>
                          )}
                          <div className="pt-8 mt-4 border-t-2 border-slate-200 flex justify-between items-center group">
                            <span className="font-serif font-bold text-slate-400 text-lg">Net Settlement</span>
                            <span className="text-3xl font-bold text-royal tracking-tight group-hover:scale-105 transition-transform">{formatCurrency(selectedAdminOrder.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="animate-in fade-in duration-1000">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Manifest Inventory</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedAdminOrder.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-6 p-6 rounded-[28px] border border-slate-100 bg-white hover:shadow-lg transition-all">
                          <img src={item.image} alt={item.name} className="w-24 h-32 object-cover rounded-2xl shadow-sm" />
                          <div className="flex flex-col justify-center flex-1">
                            <h5 className="font-bold text-slate-900 text-xl leading-tight mb-2 tracking-tight">{item.name}</h5>
                            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">
                              <div className="flex items-center gap-1.5">Size <span className="text-royal font-black">{item.size}</span></div>
                              <div className="flex items-center gap-1.5">Qty <span className="text-royal font-black">{item.qty}</span></div>
                            </div>
                            <div className="text-lg font-bold text-royal">{formatCurrency(item.price)} <span className="text-[10px] text-slate-300 font-normal">per unit</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="p-8 border-b border-slate-50">
                  <h3 className="text-2xl font-bold text-slate-900">Global Acquisitions</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Monitoring {orders.length} transaction entries.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      <tr>
                        <th className="px-8 py-5">Internal SKU ID</th>
                        <th className="px-8 py-5">Log Date</th>
                        <th className="px-8 py-5">Client Identity</th>
                        <th className="px-8 py-5 text-right">Settlement</th>
                        <th className="px-8 py-5 text-center">Status Control</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-50">
                      {orders.map((order: any) => (
                        <tr
                          key={order._id}
                          className="hover:bg-slate-50/80 transition-all cursor-pointer group"
                          onClick={() => setSelectedAdminOrder(order)}
                        >
                          <td className="px-8 py-6 font-mono text-[11px] text-slate-400 group-hover:text-royal group-hover:font-bold transition-colors">
                            #{order._id.substring(order._id.length - 12).toUpperCase()}
                          </td>
                          <td className="px-8 py-6 text-slate-500 font-bold text-xs uppercase">
                            {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                          </td>
                          <td className="px-8 py-6">
                            <div className="font-bold text-slate-900 text-base">{order.shippingAddress?.fullName}</div>
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{order.shippingAddress?.city} — {order.shippingAddress?.postalCode}</div>
                          </td>
                          <td className="px-8 py-6 text-right font-bold text-royal text-lg tracking-tight">{formatCurrency(order.totalAmount)}</td>
                          <td className="px-8 py-6 text-center" onClick={e => e.stopPropagation()}>
                            <select
                              value={order.status}
                              onChange={e => handleStatusChange(order._id, e.target.value)}
                              className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm outline-none cursor-pointer silk-transition",
                                order.status === "Delivered" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                  order.status === "Shipped" ? "bg-sky-50 text-sky-600 border-sky-100" :
                                    order.status === "Cancelled" ? "bg-rose-50 text-rose-600 border-rose-100" :
                                      "bg-amber-50 text-amber-600 border-amber-100"
                              )}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-8 py-24 text-center text-slate-400 font-medium animate-pulse uppercase tracking-[0.25em]">Awaiting Incoming Transactions...</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. Customers */}
        {activeTab === "users" && (() => {
          // local state lives inside an IIFE-rendered sub-component via closure trick
          // We manage selectedUser + orders via component-level state declared at the top
          return null; // placeholder, real render below
        })()}
        {activeTab === "users" && (
          <CustomerTab
            usersList={usersList}
            adminAuthId={user?.sub || ""}
            formatCurrency={formatCurrency}
          />
        )}
      </div>

      {/* ─────────────── Catalogue Editor Modal ─────────────── */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] w-full max-w-2xl my-8 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-gradient-to-br from-slate-50 to-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-royal rounded-[24px] flex items-center justify-center shadow-2xl shadow-royal/30 text-gold scale-90">
                  {editingProduct ? <Edit className="w-6 h-6" /> : <Plus className="w-7 h-7" />}
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-slate-900">
                    {editingProduct ? "Revise Catalogue Listing" : "Initialize New Product"}
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mt-1">Inventory Management System</p>
                </div>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full font-bold transition-all text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-10 max-h-[70vh] overflow-y-auto no-scrollbar">
              <form onSubmit={handleSaveProduct} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Master Name</label>
                    <input required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:bg-white focus:border-royal/10 focus:ring-4 focus:ring-royal/5 text-slate-900 text-sm font-bold transition-all" placeholder="E.g. Royal Blue Velvet Lehenga" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Classification</label>
                    <select required value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:bg-white focus:border-royal/10 focus:ring-4 focus:ring-royal/5 text-slate-900 text-sm font-bold transition-all cursor-pointer">
                      <option>Lehenga</option>
                      <option>Saree</option>
                      <option>Kurti</option>
                      <option>Ready to Wear</option>
                      <option>Co-ord Set</option>
                      <option>Frock</option>
                      <option>Suit</option>
                      <option>Special</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Unit Valuation (₹)</label>
                    <input required type="number" min="0" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:bg-white focus:border-royal/10 focus:ring-4 focus:ring-royal/5 text-slate-900 text-sm font-bold transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Warehouse Stock</label>
                    <input required type="number" min="0" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:bg-white focus:border-royal/10 focus:ring-4 focus:ring-royal/5 text-slate-900 text-sm font-bold transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Initial Rating</label>
                    <input type="number" step="0.1" min="0" max="5" value={productForm.rating} onChange={e => setProductForm({ ...productForm, rating: Number(e.target.value) })} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:bg-white focus:border-royal/10 focus:ring-4 focus:ring-royal/5 text-slate-900 text-sm font-bold transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Review Count</label>
                    <input type="number" min="0" value={productForm.reviewCount} onChange={e => setProductForm({ ...productForm, reviewCount: Number(e.target.value) })} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:bg-white focus:border-royal/10 focus:ring-4 focus:ring-royal/5 text-slate-900 text-sm font-bold transition-all" />
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Size Variants</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {productForm.sizes.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-royal/10 text-royal px-3 py-1.5 rounded-xl text-xs font-bold">
                          {s} <button type="button" onClick={() => setProductForm({ ...productForm, sizes: productForm.sizes.filter((_, i) => i !== idx) })}><X className="w-4 h-4 hover:text-rose-500" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input value={sizeInput} onChange={e => setSizeInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (sizeInput) { setProductForm({ ...productForm, sizes: [...productForm.sizes, sizeInput] }); setSizeInput(""); } } }} className="flex-1 px-4 py-3 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-royal/10 text-sm font-bold" placeholder="Add size (e.g. M, L, XL) and hit Enter" />
                      <button type="button" onClick={() => { if (sizeInput) { setProductForm({ ...productForm, sizes: [...productForm.sizes, sizeInput] }); setSizeInput(""); } }} className="px-6 bg-slate-200 hover:bg-slate-300 rounded-[20px] font-bold text-sm text-slate-600 transition-colors">Add</button>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Color Variants</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {productForm.colors.map((c, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
                          <div className="w-4 h-4 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: c.hex }}></div>
                          {c.name}
                          <button type="button" onClick={() => setProductForm({ ...productForm, colors: productForm.colors.filter((_, i) => i !== idx) })}><X className="w-4 h-4 text-slate-400 hover:text-rose-500" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input value={colorNameInput} onChange={e => setColorNameInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (colorNameInput) { setProductForm({ ...productForm, colors: [...productForm.colors, { name: colorNameInput, hex: colorHexInput }] }); setColorNameInput(""); } } }} className="flex-1 px-4 py-3 bg-slate-50 border-2 border-transparent rounded-[20px] outline-none focus:bg-white focus:border-royal/10 text-sm font-bold" placeholder="Color name (e.g. Navy Blue)" />
                      <input type="color" value={colorHexInput} onChange={e => setColorHexInput(e.target.value)} className="w-14 h-[44px] bg-slate-50 border-2 border-transparent rounded-xl outline-none cursor-pointer p-0.5" />
                      <button type="button" onClick={() => { if (colorNameInput) { setProductForm({ ...productForm, colors: [...productForm.colors, { name: colorNameInput, hex: colorHexInput }] }); setColorNameInput(""); } }} className="px-6 bg-slate-200 hover:bg-slate-300 rounded-[20px] font-bold text-sm text-slate-600 transition-colors">Add</button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Visual Asset Matrix</label>
                  <ImageUpload images={productForm.images} onChange={(urls) => setProductForm({ ...productForm, images: urls })} userToken={user?.sub || ""} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Catalogue Narrative</label>
                  <textarea required value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] outline-none focus:bg-white focus:border-royal/10 focus:ring-4 focus:ring-royal/5 text-slate-900 text-sm font-bold transition-all min-h-[140px] leading-relaxed" />
                </div>
              </form>
            </div>

            <div className="p-10 border-t border-slate-50 bg-slate-50/30 flex justify-end gap-5">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="px-8 py-4 text-slate-400 font-bold hover:text-slate-900 rounded-[20px] transition-all uppercase tracking-widest text-[11px]"
              >
                Discard Changes
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={isSavingProduct}
                className="px-10 py-4 bg-royal text-white font-bold rounded-[20px] hover:bg-sapphire shadow-2xl shadow-royal/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-[11px] flex items-center gap-3"
              >
                {isSavingProduct ? "Commiting..." : (editingProduct ? "Store Revisions" : "Deploy Catalogue Listing")}
                <CheckCircle className="w-4 h-4 text-gold" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
