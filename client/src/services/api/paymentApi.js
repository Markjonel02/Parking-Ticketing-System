// client/src/services/api/paymentApi.js
import axiosInstance from './axiosInstance.js';

export const paymentApi = {
  getPayments: (params = {}) => axiosInstance.get('/payments', { params }),
  getPaymentById: (id) => axiosInstance.get(`/payments/${id}`),
  getReceipt: (id) => axiosInstance.get(`/payments/${id}/receipt`),
  processPayment: (paymentData) => axiosInstance.post('/payments', paymentData)
};
