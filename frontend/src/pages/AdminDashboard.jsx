import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getAdminDashboardStats } from "../services/orderService";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminDashboardStats();

      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error);

      setError(
        error.response?.data?.message || "Failed to load dashboard statistics",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Please Login</h1>
        <p className="text-gray-600 mb-6">
          You need to be logged in to access the admin dashboard.
        </p>
        <Link
          to="/login"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Login
        </Link>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">Admin access only</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <p className="text-3xl font-bold mb-4">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={fetchStats}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      description: "All orders",
    },
    {
      title: "Paid Orders",
      value: stats.paidOrders,
      description: "Successfully paid",
    },
    {
      title: "Pending payments",
      value: stats.pendingPayments,
      description: "Awaiting payment",
    },
    {
      title: "Failed Payments",
      value: stats.failedPayments,
      description: "Payment attempts failed",
    },
    {
      title: "Shipped",
      value: stats.shippedOrders,
      description: "Orders shipped",
    },
    {
      title: "Cancelled",
      value: stats.cancelledOrders,
      description: "Cancelled orders",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

          <p className="text-gray-600 mt-2">
            Overview of your store orders and payments.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100"
        >
          Refresh Dashboard
        </button>
      </div>
      //Sales overview
      <div className="border rounded-xl bg-white shadow-sm p-6 mb-8">
        <p className="text-gray-500 text-sm">Total Sales</p>

        <p className="text-4xl font-bold text-gray-900 mt-2">
          KSh {stats.totalSales.toLocaleString()}
        </p>

        <p className="text-sm text-gray-500 mt-2">
          Based on successfully paid orders
        </p>
      </div>
      //Statistics cards
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="border rounded-xl bg-white shadow-sm p-6"
          >
            <p className="text-gray-500 text-sm">{card.title}</p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {card.value}
            </p>

            <p className="text-sm text-gray-500 mt-2">{card.description}</p>
          </div>
        ))}
      </div>
      {/* Quick actions */}
      <div className="mt-8 border rounded-xl bg-white shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/orders"
            className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
          >
            Manage Orders
          </Link>

          <Link
            to="/products"
            className="border border-gray-300 px-5 py-3 rounded-lg hover:bg-gray-100"
          >
            View Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
