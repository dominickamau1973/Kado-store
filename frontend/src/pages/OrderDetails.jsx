import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getOrderById } from "../services/orderService";
import { useAuth } from "../context/AuthContext";

const OrderDetails = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getOrderById(orderId);

        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);

        setError(
          error.response?.data?.message || "Failed to load order details.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (user && orderId) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [user, orderId]);

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
        <h1 className="text-3xl font-bold mb-4">Please login</h1>

        <p className="text-gray-600 mb-6">
          You need to be logged in to view this order
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
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <p className="text-red-600 mb-6">{error}</p>

        <button
          onClick={() => navigate("/orders")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>

          <p className="text-gray-500 mt-2 break-all">Order #{order._id}</p>
        </div>

        <Link
          to="/orders"
          className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100"
        >
          Back to My Orders
        </Link>
      </div>

      {/* Order status */}
      <div className="border rounded-xl p-6 bg-white shadow-sm mb-6">
        <div className="flex flex-wrap gap-3 mb-5">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusClass(
              order.status,
            )}`}
          >
            Order: {order.status}
          </span>

          <span
            className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getPaymentStatusClass(
              order.paymentStatus,
            )}`}
          >
            Payment: {order.paymentStatus}
          </span>
        </div>

        <p className="text-sm text-gray-600">
          Placed on:{" "}
          <span className="font-medium text-gray-900">
            {new Date(order.createdAt).toLocaleString()}
          </span>
        </p>
      </div>

      {/* Products */}
      <div className="border rounded-xl p-6 bg-white shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-5">Products</h2>

        <div className="space-y-5">
          {order.items.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-4 border-b pb-5 last:border-b-0 last:pb-0"
            >
              {item.product?.image && (
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}

              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {item.product?.name || "Product unavailable"}
                </h3>

                <p className="text-sm text-gray-600 mt-1">
                  Quantity: {item.quantity}
                </p>

                <p className="text-sm text-gray-600">
                  Unit Price: KSh {item.price.toLocaleString()}
                </p>
              </div>

              <p className="font-semibold">
                KSh {(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t mt-6 pt-5 flex justify-between">
          <span className="text-lg font-medium">Total</span>

          <span className="text-2xl font-bold">
            KSh {order.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Payment information */}
      <div className="border rounded-xl p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-5">Payment Information</h2>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-gray-600">Payment Method</span>

            <span className="font-medium uppercase">{order.paymentMethod}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-gray-600">Payment Status</span>

            <span className="font-medium capitalize">
              {order.paymentStatus}
            </span>
          </div>

          {order.mpesaReceiptNumber && (
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-600">M-Pesa Receipt</span>

              <span className="font-medium">{order.mpesaReceiptNumber}</span>
            </div>
          )}

          {order.transactionDate && (
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-600">Transaction Date</span>

              <span className="font-medium">{order.transactionDate}</span>
            </div>
          )}

          {order.paidAt && (
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-600">Paid At</span>

              <span className="font-medium">
                {new Date(order.paidAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
