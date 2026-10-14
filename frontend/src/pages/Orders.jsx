import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyOrders } from "../services/orderService";
import { useAuth } from "../context/AuthContext";

const Orders = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const data = await getMyOrders();

        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);

        setError(error.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getStatusClass = (status) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-700";

      case "shipped":
        return "bg-purple-100 text-purple-700";

      case "delivered":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getPaymentStatusClass = (paymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-green-100 text-green-700";

      case "failed":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Please Login</h1>

        <p className="text-gray-600 mb-6">
          You need to be logged in to view your orders.
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet.
          </p>

          <Link
            to="/products"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border rounded-xl p-6 shadow-sm bg-white"
            >
              {/* Order Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <Link
                    to={`/orders/${order._id}`}
                    className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Order #{order._id}
                  </Link>

                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusClass(
                      order.paymentStatus,
                    )}`}
                  >
                    Payment: {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Products */}
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 border-t pt-4"
                  >
                    {item.product?.image && (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}

                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {item.product?.name || "Product unavailable"}
                      </h3>

                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>

                      <p className="text-sm text-gray-600">
                        Price: KSh {item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Information */}
              <div className="border-t mt-6 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>

                  <span className="text-xl font-bold">
                    KSh {order.totalAmount.toLocaleString()}
                  </span>
                </div>

                {order.mpesaReceiptNumber && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">M-Pesa Receipt:</span>{" "}
                    {order.mpesaReceiptNumber}
                  </p>
                )}

                {order.transactionDate && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Transaction Date:</span>{" "}
                    {order.transactionDate}
                  </p>
                )}

                {order.paidAt && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Paid At:</span>{" "}
                    {new Date(order.paidAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="mt-6">
                <Link
                  to={`/orders/${order._id}`}
                  className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                >
                  View Order Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
