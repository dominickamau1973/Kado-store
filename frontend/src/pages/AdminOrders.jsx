import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllOrders, updateOrderStatus } from "../services/orderService";
import { useAuth } from "../context/AuthContext";

const AdminOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllOrders();

      setOrders(data);
    } catch (error) {
      console.error("Error fetching admin orders:", error);

      setError(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);

      const data = await updateOrderStatus(orderId, status);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId ? data.order : order,
        ),
      );
    } catch (error) {
      console.error("Error updating order status:", error);

      alert(error.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Please Login</h1>

        <p className="text-gray-600 mb-6">
          You need to be logged in to access the admin orders page.
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

        <p className="text-gray-600">
          Only administrators can access order management.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-600">Loading all orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <p className="text-red-600 mb-6">{error}</p>

        <button
          onClick={fetchOrders}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>

          <p className="text-gray-600 mt-2">View and manage customer orders.</p>
        </div>

        <button
          onClick={fetchOrders}
          className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100"
        >
          Refresh Orders
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="border rounded-xl p-10 text-center">
          <p className="text-gray-600">No orders have been placed yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border rounded-xl p-6 bg-white shadow-sm"
            >
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold break-all">
                    Order #{order._id}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : order.paymentStatus === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    Payment: {order.paymentStatus}
                  </span>

                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 capitalize">
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Customer */}
              <div className="border-t pt-5 mb-5">
                <h3 className="font-semibold mb-2">Customer</h3>

                <p className="text-gray-700">
                  {order.user?.name || "Customer"}
                </p>

                {order.user?.email && (
                  <p className="text-sm text-gray-500">{order.user.email}</p>
                )}
              </div>

              {/* Products */}
              <div className="border-t pt-5">
                <h3 className="font-semibold mb-4">Products</h3>

                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center gap-4">
                      {item.product?.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}

                      <div className="flex-1">
                        <p className="font-medium">
                          {item.product?.name || "Product unavailable"}
                        </p>

                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>

                        <p className="text-sm text-gray-500">
                          Unit price: KSh {item.price.toLocaleString()}
                        </p>
                      </div>

                      <p className="font-semibold">
                        KSh {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment details */}
              <div className="border-t mt-5 pt-5">
                <h3 className="font-semibold mb-3">Payment Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p>
                    <span className="text-gray-500">Method:</span>{" "}
                    {order.paymentMethod}
                  </p>

                  <p>
                    <span className="text-gray-500">Total:</span> KSh{" "}
                    {order.totalAmount.toLocaleString()}
                  </p>

                  {order.mpesaReceiptNumber && (
                    <p>
                      <span className="text-gray-500">M-Pesa Receipt:</span>{" "}
                      {order.mpesaReceiptNumber}
                    </p>
                  )}

                  {order.paidAt && (
                    <p>
                      <span className="text-gray-500">Paid At:</span>{" "}
                      {new Date(order.paidAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Order status */}
              <div className="border-t mt-5 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <label
                    htmlFor={`status-${order._id}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Update Order Status
                  </label>

                  <select
                    id={`status-${order._id}`}
                    value={order.status}
                    disabled={updatingOrderId === order._id}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    className="border rounded-lg px-4 py-2 bg-white"
                  >
                    <option value="pending">Pending</option>

                    <option value="processing">Processing</option>

                    <option value="shipped">Shipped</option>

                    <option value="delivered">Delivered</option>

                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {updatingOrderId === order._id && (
                  <p className="text-sm text-gray-500">Updating order...</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
