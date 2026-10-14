import api from "./api";

export const createOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);

  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get("/orders/my-orders");

  return response.data;
};

export const getAllOrders = async () => {
  const response = await api.get("/orders/admin/all");
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/orders/admin/${orderId}/status`, {
    status,
  });
  return response.data;
};

export const getAdminDashboardStats = async () => {
  const response = await api.get("/orders/admin/stats");

  return response.data;
};

export const initiateMpesaPayment = async (orderId, phoneNumber) => {
  const response = await api.post("/mpesa/stkpush", {
    orderId,
    phoneNumber,
  });

  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);

  return response.data;
};
