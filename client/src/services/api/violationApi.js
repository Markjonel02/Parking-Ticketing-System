// client/src/services/api/violationApi.js
import axiosInstance from './axiosInstance.js';

export const violationApi = {
  getViolations: (params = {}) => axiosInstance.get('/violations', { params }),
  getViolationById: (id) => axiosInstance.get(`/violations/${id}`),
  createViolation: (data) => axiosInstance.post('/violations', data),
  updateViolation: (id, data) => axiosInstance.put(`/violations/${id}`, data)
};
