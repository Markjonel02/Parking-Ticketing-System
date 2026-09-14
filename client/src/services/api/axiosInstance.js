// client/src/services/api/axiosInstance.js
import axios from 'axios';
import { tokenStorage } from '../storage/tokenStorage.js';

const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract clean response data or standardized error
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';
    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.errors = error.response?.data?.errors;
    return Promise.reject(customError);
  }
);

export default axiosInstance;
