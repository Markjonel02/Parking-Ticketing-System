// client/src/services/api/authApi.js
import axiosInstance from './axiosInstance.js';

export const authApi = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  getMe: () => axiosInstance.get('/auth/me'),
  logout: () => axiosInstance.post('/auth/logout')
};
