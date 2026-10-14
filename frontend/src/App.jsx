import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import AdminOrders from "./pages/AdminOrders";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Single-page Kado homepage */}
        <Route path="/" element={<Home />} />

        {/* Redirect old page URLs to homepage sections */}
        <Route path="/products" element={<Products />} />

        <Route path="/about" element={<Navigate to="/#about" replace />} />

        <Route path="/contact" element={<Navigate to="/#contact" replace />} />

        {/* Customer pages remain separate */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />

        {/* Admin pages remain separate */}
        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/admin/orders" element={<AdminOrders />} />

        <Route path="/admin/products" element={<AdminProducts />} />

        {/* Redirect unknown URLs to the homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
