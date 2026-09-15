// server/src/models/Payment.js
import { db, Payment } from '../config/database.js';

export { Payment };

export class PaymentModel {
  static findAll(filter = {}) {
    return db.find('payments', (p) => {
      if (filter.status && p.status !== filter.status) return false;
      if (filter.paymentMethod && p.paymentMethod !== filter.paymentMethod) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        return (
          p.referenceNumber.toLowerCase().includes(q) ||
          p.ticketNumber.toLowerCase().includes(q) ||
          p.plateNumber.toLowerCase().includes(q) ||
          (p.paidBy && p.paidBy.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }

  static findById(id) {
    return db.findById('payments', id);
  }

  static findByReference(referenceNumber) {
    return db.findOne('payments', p => p.referenceNumber.toUpperCase() === referenceNumber.trim().toUpperCase());
  }

  static findByTicketId(ticketId) {
    return db.find('payments', p => p.ticketId === ticketId);
  }

  static create(paymentData) {
    return db.insert('payments', {
      ...paymentData,
      status: paymentData.status || 'COMPLETED',
      transactionDate: paymentData.transactionDate || new Date().toISOString()
    });
  }

  static update(id, updates) {
    return db.update('payments', id, updates);
  }
}
