import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import ProductCatalog from "./components/ProductCatalog";
import Cart from "./components/Cart";
import AdminDashboard from "./components/AdminDashboard";
import OrderHistory from "./components/OrderHistory";
import Checkout from "./components/Checkout";

export default function App() {
  const [currentView, setCurrentView] = useState<"products" | "cart" | "orders" | "admin" | "checkout">("products");
  const adminStatus = useQuery(api.admin.checkAdminStatus);
  const cartItems = useQuery(api.cart.list);
  const setupSuperAdmin = useMutation(api.admin.setupSuperAdmin);
  const loggedInUser = useQuery(api.auth.loggedInUser);

  const cartItemCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Setup super admin if needed
  useEffect(() => {
    if (loggedInUser?.email === "exploretutorialsofficial@gmail.com") {
      setupSuperAdmin().catch(() => {
        // Ignore errors - admin might already be set up
      });
    }
  }, [loggedInUser, setupSuperAdmin]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-gray-900">🍎 Apple Store</h1>
            <Authenticated>
              <nav className="flex gap-6">
                <button
                  onClick={() => setCurrentView("products")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === "products" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Products
                </button>
                <button
                  onClick={() => setCurrentView("cart")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                    currentView === "cart" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Cart
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setCurrentView("orders")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === "orders" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Orders
                </button>
                {adminStatus?.isAdmin && (
                  <button
                    onClick={() => setCurrentView("admin")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === "admin" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Admin
                  </button>
                )}
              </nav>
            </Authenticated>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1">
        <Unauthenticated>
          <div className="max-w-md mx-auto mt-16 p-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Apple Store</h2>
              <p className="text-gray-600">Sign in to start shopping</p>
            </div>
            <SignInForm />
          </div>
        </Unauthenticated>

        <Authenticated>
          <div className="max-w-7xl mx-auto px-4 py-8">
            {currentView === "products" && <ProductCatalog />}
            {currentView === "cart" && <Cart onCheckout={() => setCurrentView("checkout")} />}
            {currentView === "orders" && <OrderHistory />}
            {currentView === "checkout" && <Checkout onSuccess={() => setCurrentView("orders")} />}
            {currentView === "admin" && adminStatus?.isAdmin && <AdminDashboard />}
          </div>
        </Authenticated>
      </main>

      <Toaster />
    </div>
  );
}
