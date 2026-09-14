// client/src/services/api/ticketApi.js
import axiosInstance from './axiosInstance.js';

export const ticketApi = {
  getTickets: (params = {}) => axiosInstance.get('/tickets', { params }),
  getTicketById: (id) => axiosInstance.get(`/tickets/${id}`),
  createTicket: (ticketData) => axiosInstance.post('/tickets', ticketData),
  disputeTicket: (id, disputeData) => axiosInstance.post(`/tickets/${id}/dispute`, disputeData),
  resolveDispute: (id, resolutionData) => axiosInstance.post(`/tickets/${id}/resolve-dispute`, resolutionData),
  voidTicket: (id, reason) => axiosInstance.post(`/tickets/${id}/void`, { reason })
};
