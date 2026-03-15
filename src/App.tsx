import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { Navbar, MobileBottomNav } from "./components/layout/Navigation";
import { Home } from "./pages/Home";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Wishlist } from "./pages/Wishlist";
import { Profile } from "./pages/Profile";
import { Admin } from "./pages/Admin";
import { AuthSyncManager } from "./components/AuthSyncManager";
import { Footer } from "./components/layout/Footer";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import ScrollToTop from "./components/ScrollToTop";

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-cream selection:bg-gold/30">
      {!isAdminRoute && <Navbar />}
      <main className={!isAdminRoute ? "pt-16" : ""}>
        <AuthSyncManager>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/category/:category" element={<Products />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </AuthSyncManager>
      </main>
      {!isAdminRoute && <MobileBottomNav />}
      {!isAdminRoute && <Footer />}
      <Toaster position="top-right" richColors />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
};

export default App;
