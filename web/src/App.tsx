import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";
import { ProductProvider } from "./context/ProductContext";
import { AboutPage } from "./pages/AboutPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { HelpPage } from "./pages/HelpPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { OwnerDashboard } from "./pages/OwnerDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AccountantDashboard } from "./pages/AccountantDashboard";
import { ProductPage } from "./pages/ProductPage";
import { SearchPage } from "./pages/SearchPage";
import { ShippingManagerDashboard } from "./pages/ShippingManagerDashboard";
import { DeliveryDriverDashboard } from "./pages/DeliveryDriverDashboard";
import { SellerDashboard } from "./pages/SellerDashboard";
import { ShopPage } from "./pages/ShopPage";
import { UserAccountPage, UserOrdersPage } from "./pages/UserAccountPage";
import "./styles/global.css";
import "./styles/components.css";
import "./styles/checkout.css";

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ProductProvider>
          <OrderProvider>
          <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="shop" element={<ShopPage />} />
                <Route path="shop/:category" element={<ShopPage />} />
                <Route path="product/:id" element={<ProductPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="help" element={<HelpPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="account/orders" element={<UserOrdersPage />} />
                </Route>

                <Route element={<ProtectedRoute role="user" />}>
                  <Route path="account" element={<UserAccountPage />} />
                </Route>

                <Route element={<ProtectedRoute role={["owner", "shipping_manager"]} />}>
                  <Route path="owner" element={<OwnerDashboard />} />
                </Route>

                <Route element={<ProtectedRoute role="admin" />}>
                  <Route path="admin" element={<AdminDashboard />} />
                </Route>

                <Route element={<ProtectedRoute role="accountant" />}>
                  <Route path="accountant" element={<AccountantDashboard />} />
                </Route>

                <Route element={<ProtectedRoute role="seller" />}>
                  <Route path="seller" element={<SellerDashboard />} />
                </Route>

                <Route element={<ProtectedRoute role="shipping_manager" />}>
                  <Route path="shipping" element={<ShippingManagerDashboard />} />
                </Route>

                <Route element={<ProtectedRoute role="delivery_driver" />}>
                  <Route path="driver" element={<DeliveryDriverDashboard />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
          </OrderProvider>
      </ProductProvider>
    </LanguageProvider>
    </AuthProvider>
  );
}
