// client/src/services/api/vehicleApi.js
import axiosInstance from './axiosInstance.js';

export const vehicleApi = {
  getVehicles: (params = {}) => axiosInstance.get('/vehicles', { params }),
  getVehicleByPlate: (plate) => axiosInstance.get(`/vehicles/${plate}`),
  registerVehicle: (data) => axiosInstance.post('/vehicles', data)
};
