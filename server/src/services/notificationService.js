// server/src/services/notificationService.js
import { logger } from '../utils/logger.js';

/**
 * No email/SMS provider is wired into this deployment yet (no
 * SendGrid/Twilio/etc. credentials configured). Rather than pretending to
 * dispatch a message, this service logs the notification that *would* be
 * sent and returns delivered: false so callers and audit trails reflect
 * reality. Swap the body of these methods for real provider calls once
 * credentials are available — the call sites do not need to change.
 */
export class NotificationService {
  static async sendTicketNotice(ticket, vehicle) {
    const recipient = vehicle?.ownerEmail || null;
    logger.info(
      `NOTIFICATION (not sent — no provider configured): citation notice for ${ticket.ticketNumber} would go to ${recipient || 'unknown recipient'}`,
    );
    return { delivered: false, channel: null, recipient, reason: 'No notification provider configured.' };
  }

  static async sendPaymentReceipt(payment) {
    const recipient = payment.payerEmail || payment.paidBy || null;
    logger.info(
      `NOTIFICATION (not sent — no provider configured): receipt ${payment.referenceNumber} would go to ${recipient || 'unknown recipient'}`,
    );
    return { delivered: false, recipient, reason: 'No notification provider configured.' };
  }

  static async sendDisputeUpdate(ticket, status) {
    logger.info(
      `NOTIFICATION (not sent — no provider configured): dispute status for ${ticket.ticketNumber} changed to ${status}`,
    );
    return { delivered: false, reason: 'No notification provider configured.' };
  }
}

export default NotificationService;
