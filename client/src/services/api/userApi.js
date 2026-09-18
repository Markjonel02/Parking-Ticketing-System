// client/src/services/api/userApi.js
import axiosInstance from './axiosInstance.js';

export const userApi = {
  getUsers: (params = {}) => axiosInstance.get('/users', { params }),
  getUserById: (id) => axiosInstance.get(`/users/${id}`),
  previewNextBadge: (role) => axiosInstance.get('/users/next-badge', { params: { role } }),
  createUser: (userData) => axiosInstance.post('/users', userData),
  updateUser: (id, userData) => axiosInstance.put(`/users/${id}`, userData),
  toggleStatus: (id) => axiosInstance.patch(`/users/${id}/toggle-status`)
};
