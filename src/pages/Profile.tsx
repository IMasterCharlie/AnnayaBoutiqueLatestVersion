import React, { useState, useEffect } from "react";
import { User, Package, MapPin, Settings, ChevronRight, LogOut, Loader2, Plus, X, Navigation, ArrowLeft, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import api from "../lib/api";

export const Profile = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const { user, isAuthenticated, isLoading, logout, loginWithRedirect } = useAuth0();
  const [dbUser, setDbUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    deliveryNotes: "",
    isDefault: false
  });

  const tabs = [
    { id: "orders", label: "My Orders", icon: Package },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  useEffect(() => {
    const syncUserAndFetchData = async () => {
      if (isAuthenticated && user?.sub) {
        setIsSyncing(true);
        try {
          // Fetch Orders (Address fetching is handled when switching to the address tab or can be appended here later, 
          // currently Profile Address tab uses the /api/users/me endpoint in its own section if needed.
          // For now, just fetch orders to populate the default tab)
          const ordersRes = await api.get(`/api/users/orders?auth0Id=${user.sub}`);
          setOrders(ordersRes.data);
          
          // Also fetch the user profile so the UI can display their phone number/details
          const profileRes = await api.get(`/api/users/me?auth0Id=${user.sub}`);
          setDbUser(profileRes.data);
        } catch (error) {
          console.error("Failed to sync profile data:", error);
        } finally {
          setIsSyncing(false);
        }
      }
    };
    syncUserAndFetchData();
  }, [isAuthenticated, user]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Use OpenStreetMap Nominatim for free reverse geocoding
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );

          if (response.data && response.data.address) {
            const addr = response.data.address;
            setAddressForm(prev => ({
              ...prev,
              city: addr.city || addr.town || addr.village || addr.county || "",
              state: addr.state || "",
              postalCode: addr.postcode || "",
              country: addr.country || "",
            }));
          }
        } catch (error) {
          console.error("Error fetching location data:", error);
          alert("Failed to fetch address details from location.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        console.error("Geolocation error:", error);
        alert("Could not get your location. Please enter your address manually.");
      }
    );
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.sub) return;

    setIsSavingAddress(true);
    try {
      const response = await api.put("/api/users/address", {
        auth0Id: user.sub,
        address: addressForm
      });
      // Update local state with new addresses
      setDbUser((prev: any) => ({ ...prev, addresses: response.data }));
      setIsAddressModalOpen(false);
      
      // Reset form
      setAddressForm({
        fullName: "", phoneNumber: "", addressLine1: "", addressLine2: "",
        city: "", state: "", postalCode: "", country: "", deliveryNotes: "", isDefault: false
      });
    } catch (error) {
      console.error("Failed to save address:", error);
      alert("Failed to save address. Please try again.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  if (isLoading || isSyncing) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center pt-20">
        <Loader2 className="w-10 h-10 text-royal animate-spin mb-4" />
        <p className="text-royal font-bold">Loading profile...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center pt-20 px-4 text-center">
        <div className="w-24 h-24 bg-sky/10 rounded-full flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-sky" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-royal mb-4">You are not logged in</h2>
        <p className="text-slate-500 mb-8 max-w-xs">
          Log in to view your orders, saved addresses, and manage your account settings.
        </p>
        <button
          onClick={() => loginWithRedirect()}
          className="px-8 py-4 bg-royal text-white font-bold rounded-full hover:shadow-lg transition-all"
        >
          Log In / Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20 lg:pb-10 pt-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-royal rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden mb-10">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-gold/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {user.picture ? (
              <img src={user.picture} alt={user.name} className="w-24 h-24 rounded-full border-4 border-white/20 object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center text-3xl font-bold font-serif">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-serif font-bold mb-2">{user.name}</h1>
              <p className="text-white/70 text-sm">{user.email}</p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
                Verified Member
              </div>
            </div>
            <button 
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="md:ml-auto p-4 bg-white/10 hover:bg-white/20 rounded-2xl silk-transition flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-bold text-sm hidden md:block">Log Out</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold silk-transition whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-royal text-white shadow-lg shadow-royal/20" 
                  : "bg-white text-slate-500 border border-slate-100 hover:border-royal"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === "orders" && (
            <>
              {selectedOrder ? (
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="flex items-center gap-2 text-slate-500 hover:text-royal font-bold tracking-wide transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" /> Back to Orders
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-400">ORDER #{selectedOrder._id.substring(0, 8).toUpperCase()}</span>
                  </div>
                  
                  <div className="p-6 md:p-8">
                    {/* Visual Timeline */}
                    <div className="mb-12">
                      <h4 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Order Status</h4>
                      
                      {selectedOrder.status === "Cancelled" ? (
                        <div className="flex items-center gap-4 bg-rose-50 p-6 rounded-2xl border border-rose-100">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-rose-500 shrink-0">
                            <XCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <h5 className="font-bold text-rose-700 text-lg">Order Cancelled</h5>
                            <p className="text-sm text-rose-600/80 mt-1">This order has been cancelled and will not be fulfilled.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          {/* Progress Line Background */}
                          <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-100 -translate-y-1/2 rounded-full hidden sm:block"></div>
                          
                          {/* Progress Line Active */}
                          <div 
                            className="absolute top-1/2 left-0 h-1.5 bg-emerald-400 -translate-y-1/2 rounded-full hidden sm:block transition-all duration-1000 ease-out"
                            style={{ 
                              width: selectedOrder.status === "Delivered" ? "100%" : 
                                     selectedOrder.status === "Shipped" ? "50%" : "0%" 
                            }}
                          ></div>

                          {/* Steps */}
                          <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-6 sm:gap-0">
                            {/* Processing Step */}
                            <div className="flex sm:flex-col items-center gap-4 sm:gap-2 text-center">
                              <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors border-4 shrink-0",
                                selectedOrder.status === "Processing" ? "bg-royal text-white border-white shadow-royal/30 ring-4 ring-royal/10" : 
                                "bg-emerald-500 text-white border-white shadow-emerald-500/30"
                              )}>
                                <Clock className="w-5 h-5" />
                              </div>
                              <div className="text-left sm:text-center mt-0 sm:mt-2">
                                <p className="text-sm font-bold text-slate-900">Processing</p>
                                <p className="text-xs text-slate-500 mt-1">We are preparing your items</p>
                              </div>
                            </div>

                            {/* Shipped Step */}
                            <div className="flex sm:flex-col items-center gap-4 sm:gap-2 text-center">
                              <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors border-4 shrink-0",
                                selectedOrder.status === "Processing" ? "bg-white text-slate-300 border-slate-50 shadow-none relative" : 
                                selectedOrder.status === "Shipped" ? "bg-royal text-white border-white shadow-royal/30 ring-4 ring-royal/10" :
                                "bg-emerald-500 text-white border-white shadow-emerald-500/30"
                              )}>
                                <Truck className="w-5 h-5" />
                              </div>
                              <div className="text-left sm:text-center mt-0 sm:mt-2">
                                <p className={cn(
                                  "text-sm font-bold",
                                  selectedOrder.status === "Processing" ? "text-slate-400" : "text-slate-900"
                                )}>Shipped</p>
                                <p className="text-xs text-slate-500 mt-1">On the way to you</p>
                              </div>
                            </div>

                            {/* Delivered Step */}
                            <div className="flex sm:flex-col items-center gap-4 sm:gap-2 text-center">
                              <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors border-4 shrink-0",
                                selectedOrder.status === "Delivered" ? "bg-emerald-500 text-white border-white shadow-emerald-500/30 ring-4 ring-emerald-500/10" : 
                                "bg-white text-slate-300 border-slate-50 shadow-none"
                              )}>
                                <CheckCircle className="w-5 h-5" />
                              </div>
                              <div className="text-left sm:text-center mt-0 sm:mt-2">
                                <p className={cn(
                                  "text-sm font-bold",
                                  selectedOrder.status === "Delivered" ? "text-slate-900" : "text-slate-400"
                                )}>Delivered</p>
                                <p className="text-xs text-slate-500 mt-1">Package arrived</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-100">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> Shipping Address
                        </h4>
                        <div className="bg-slate-50/80 p-5 rounded-2xl">
                          <p className="font-bold text-slate-900 mb-1">{selectedOrder.shippingAddress?.fullName}</p>
                          <p className="text-sm text-slate-500 mb-3">{selectedOrder.shippingAddress?.phoneNumber}</p>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {selectedOrder.shippingAddress?.addressLine1}
                            {selectedOrder.shippingAddress?.addressLine2 && <><br />{selectedOrder.shippingAddress?.addressLine2}</>}
                            <br />
                            {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} — {selectedOrder.shippingAddress?.postalCode}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Order Summary</h4>
                        <div className="bg-slate-50/80 p-5 rounded-2xl space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Date Placed</span>
                            <span className="font-bold text-slate-900">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Payment</span>
                            <span className="font-bold text-slate-900 capitalize">{selectedOrder.paymentMethod}</span>
                          </div>
                          {selectedOrder.razorpayPaymentId && (
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Transaction ID</span>
                              <span className="font-mono text-xs text-slate-900 mt-0.5">{selectedOrder.razorpayPaymentId}</span>
                            </div>
                          )}
                          <div className="pt-3 mt-3 border-t border-slate-200/60 flex justify-between items-center">
                            <span className="font-bold text-slate-900">Total Paid</span>
                            <span className="text-xl font-bold text-royal">₹{selectedOrder.totalAmount}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Items in Order</h4>
                      <div className="space-y-4">
                        {selectedOrder.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                            <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-xl" />
                            <div className="flex-1">
                              <h5 className="font-bold text-slate-900 text-lg leading-tight mb-1">{item.name}</h5>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mb-3">
                                <span>Size: <strong className="text-slate-700">{item.size}</strong></span>
                                <span>Color: <strong className="text-slate-700">{item.color}</strong></span>
                                <span>Qty: <strong className="text-slate-700">{item.qty}</strong></span>
                              </div>
                              <div className="font-bold text-royal">₹{item.price} each</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <div 
                    key={order._id} 
                    onClick={() => setSelectedOrder(order)}
                    className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-royal/30 hover:shadow-md cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-royal transition-colors">Order #{order._id.substring(0, 8).toUpperCase()}</span>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                          order.status === "Delivered" ? "bg-emerald-100 text-emerald-600" : 
                          order.status === "Cancelled" ? "bg-rose-100 text-rose-600" :
                          order.status === "Shipped" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"
                        )}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm text-slate-600">{order.items.map((i: any) => `${i.name} × ${i.qty}`).join(', ')}</p>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                      <span className="text-lg font-bold text-royal">₹{order.totalAmount}</span>
                      <button className="p-3 bg-slate-50 group-hover:bg-royal group-hover:text-white rounded-xl silk-transition">
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
                  <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">You haven't placed any orders yet.</p>
                </div>
              )}
            </>
          )}

          {activeTab === "addresses" && (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-serif font-bold text-royal">Saved Addresses</h3>
                <button 
                  onClick={() => setIsAddressModalOpen(true)}
                  className="text-sm font-bold text-sapphire hover:underline flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add New
                </button>
              </div>
              
              <div className="space-y-4">
                {dbUser?.addresses && dbUser.addresses.length > 0 ? (
                  dbUser.addresses.map((address: any) => (
                    <div key={address._id} className={cn(
                      "p-6 rounded-2xl border-2 relative",
                      address.isDefault ? "border-royal bg-royal/5" : "border-slate-100"
                    )}>
                      {address.isDefault && (
                        <div className="absolute top-4 right-4 text-[10px] font-bold text-royal bg-white px-2 py-1 rounded-full border border-royal/20">DEFAULT</div>
                      )}
                      <p className="font-bold text-slate-900 mb-1">{address.fullName}</p>
                      <p className="text-sm text-slate-500 mb-3">{address.phoneNumber}</p>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {address.addressLine1}
                        {address.addressLine2 && <><br />{address.addressLine2}</>}
                        <br />
                        {address.city}, {address.state} — {address.postalCode}
                        <br />
                        {address.country}
                      </p>
                      {address.deliveryNotes && (
                        <p className="text-xs text-slate-400 mt-2 italic">Note: {address.deliveryNotes}</p>
                      )}
                      <div className="mt-4 flex gap-4">
                        <button className="text-xs font-bold text-royal hover:underline">Edit</button>
                        <button className="text-xs font-bold text-rose-500 hover:underline">Delete</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm italic">No addresses saved yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
              <div>
                <h3 className="text-lg font-serif font-bold text-royal mb-6">Account Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-slate-50">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                      <p className="font-bold text-slate-900">{user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-slate-50">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                      <p className="font-bold text-slate-900">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-slate-50">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Auth0 Sub</p>
                      <p className="font-bold text-slate-900 text-xs truncate max-w-[200px]">{user.sub}</p>
                    </div>
                  </div>
                </div>
              </div>
              <button className="w-full py-4 bg-rose-50 text-rose-500 font-bold rounded-2xl hover:bg-rose-100 silk-transition">
                Delete Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Address Modal Overlay */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-royal/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
          >
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-serif font-bold text-royal">Add New Address</h2>
              <button 
                onClick={() => setIsAddressModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-sapphire/5 rounded-2xl border border-sapphire/10">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-sapphire/10 rounded-full text-sapphire">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-royal mb-1">Use Current Location</h4>
                    <p className="text-xs text-slate-500 mb-3">Allow access to automatically fill in your city, state, postal code, and country.</p>
                    <button 
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className="text-xs font-bold px-4 py-2 bg-sapphire text-white rounded-lg hover:bg-royal transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLocating ? <Loader2 className="w-3 h-3 animate-spin"/> : null}
                      {isLocating ? "Locating..." : "Auto-fill Location"}
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name *</label>
                    <input 
                      required
                      type="text" 
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({...addressForm, fullName: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire/20 focus:border-sapphire"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number *</label>
                    <input 
                      required
                      type="tel" 
                      value={addressForm.phoneNumber}
                      onChange={(e) => setAddressForm({...addressForm, phoneNumber: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire/20 focus:border-sapphire"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address Line 1 *</label>
                  <input 
                    required
                    type="text" 
                    placeholder="House No, Building, Street"
                    value={addressForm.addressLine1}
                    onChange={(e) => setAddressForm({...addressForm, addressLine1: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire/20 focus:border-sapphire"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address Line 2 <span className="text-slate-300 font-normal">(Optional)</span></label>
                  <input 
                    type="text" 
                    placeholder="Apartment, Suite, Unit, etc."
                    value={addressForm.addressLine2}
                    onChange={(e) => setAddressForm({...addressForm, addressLine2: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire/20 focus:border-sapphire"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City *</label>
                    <input 
                      required
                      type="text" 
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire/20 focus:border-sapphire"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">State/Province *</label>
                    <input 
                      required
                      type="text" 
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire/20 focus:border-sapphire"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Postal Code *</label>
                    <input 
                      required
                      type="text" 
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire/20 focus:border-sapphire"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Country *</label>
                    <input 
                      required
                      type="text" 
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire/20 focus:border-sapphire"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery Notes <span className="text-slate-300 font-normal">(Optional)</span></label>
                  <textarea 
                    rows={2}
                    placeholder="E.g., Leave package at the front door"
                    value={addressForm.deliveryNotes}
                    onChange={(e) => setAddressForm({...addressForm, deliveryNotes: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sapphire/20 focus:border-sapphire resize-none"
                  />
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                      className="w-4 h-4 rounded text-sapphire focus:ring-sapphire"
                    />
                    <span className="text-sm font-medium text-slate-600">Set as default address</span>
                  </label>
                  
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsAddressModalOpen(false)}
                      className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSavingAddress}
                      className="px-8 py-3 bg-royal text-white font-bold rounded-xl hover:bg-sapphire transition-colors shadow-lg shadow-royal/20 flex items-center gap-2 disabled:opacity-70"
                    >
                      {isSavingAddress ? <Loader2 className="w-4 h-4 animate-spin"/> : null}
                      Save Address
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
