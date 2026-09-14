// client/src/services/api/reportApi.js
import axiosInstance from './axiosInstance.js';

export const reportApi = {
  getDashboardStats: () => axiosInstance.get('/reports/dashboard'),
  getTicketReports: (params = {}) => axiosInstance.get('/reports/tickets', { params }),
  getPaymentReports: (params = {}) => axiosInstance.get('/reports/payments', { params }),
  getRevenueReports: () => axiosInstance.get('/reports/revenue')
};
