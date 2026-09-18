// client/src/services/api/userApi.js
import axiosInstance from './axiosInstance.js';

export const userApi = {
  getUsers: (params = {}) => axiosInstance.get('/users', { params }),

  // The server caps `limit` at 100 per request (server/src/utils/pagination.js),
  // so any screen that needs the *complete* roster (counts, role breakdowns,
  // last-admin checks) must page through every result rather than trusting a
  // single call. Shared here so AdminDashboard and the Users management page
  // don't duplicate the loop.
  getAllUsers: async (params = {}) => {
    const PAGE_SIZE = 100;
    const MAX_PAGES = 50; // safety cap: 5,000 users, well beyond realistic staff counts
    let page = 1;
    let all = [];
    let totalItems = 0;

    while (page <= MAX_PAGES) {
      const res = await axiosInstance.get('/users', { params: { ...params, page, limit: PAGE_SIZE } });
      if (!res.success) break;

      all = all.concat(res.data || []);
      totalItems = res.pagination?.totalItems ?? all.length;

      if (!res.pagination?.hasNextPage) break;
      page += 1;
    }

    return { success: true, data: all, pagination: { totalItems } };
  },

  getUserById: (id) => axiosInstance.get(`/users/${id}`),
  createUser: (userData) => axiosInstance.post('/users', userData),
  updateUser: (id, userData) => axiosInstance.put(`/users/${id}`, userData),
  toggleStatus: (id) => axiosInstance.patch(`/users/${id}/toggle-status`)
};
