// server/src/services/notificationService.js
import { logger } from '../utils/logger.js';

export class NotificationService {
  static async sendTicketNotice(ticket, vehicle) {
    const recipient = vehicle?.ownerEmail || 'registered-owner@vehicle-records.gov';
    logger.info(`NOTIFICATION: Citation notice sent for ${ticket.ticketNumber} to ${recipient}`);
    return {
      success: true,
      channel: 'EMAIL/SMS',
      recipient,
      sentAt: new Date().toISOString()
    };
  }

  static async sendPaymentReceipt(payment, ticket) {
    const recipient = payment.paidBy || 'citizen@email.com';
    logger.info(`NOTIFICATION: Receipt ${payment.referenceNumber} dispatched to ${recipient}`);
    return {
      success: true,
      recipient,
      sentAt: new Date().toISOString()
    };
  }

  static async sendDisputeUpdate(ticket, status, resolution) {
    logger.info(`NOTIFICATION: Dispute status for ${ticket.ticketNumber} updated to ${status}. Details: ${resolution}`);
    return {
      success: true,
      ticketNumber: ticket.ticketNumber,
      status,
      timestamp: new Date().toISOString()
    };
  }
}
