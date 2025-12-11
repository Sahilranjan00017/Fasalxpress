import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Lazy load all pages for better code splitting
const Index = lazy(() => import("./pages/Index"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Orders = lazy(() => import("./pages/Orders"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminCreateProduct = lazy(() => import("./pages/AdminCreateProduct"));
const AdminCreateProductNew = lazy(() => import("./pages/AdminCreateProductNew"));
const AdminEditProduct = lazy(() => import("./pages/AdminEditProduct"));
const AdminVendors = lazy(() => import("./pages/AdminVendors"));
const AdminPurchaseOrders = lazy(() => import("./pages/AdminPurchaseOrders"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OrderViewPage = lazy(() => import("./pages/OrderViewPage"));
const Profile = lazy(() => import("./pages/Profile"));

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/order/view/:id" element={<OrderViewPage />} />
            <Route path="/orders/:id" element={<OrderViewPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/create" element={<AdminCreateProductNew />} />
            <Route path="/admin/products/edit/:id" element={<AdminCreateProductNew />} />
            <Route path="/admin/products/create-old" element={<AdminCreateProduct />} />
            <Route path="/admin/products/edit-old/:id" element={<AdminEditProduct />} />
            <Route path="/admin/vendors" element={<AdminVendors />} />
            <Route path="/admin/purchase-orders" element={<AdminPurchaseOrders />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);
