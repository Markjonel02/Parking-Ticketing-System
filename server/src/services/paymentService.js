// server/src/services/paymentService.js
import { PaymentModel } from '../models/Payment.js';
import { TicketModel } from '../models/Ticket.js';
import { generateReferenceNumber } from '../utils/generateReferenceNumber.js';
import { AuditService } from './auditService.js';
import { NotificationService } from './notificationService.js';

export class PaymentService {
  static getAllPayments(filter = {}) {
    return PaymentModel.findAll(filter);
  }

  static getPaymentById(id) {
    return PaymentModel.findById(id);
  }

  static getPaymentByReference(ref) {
    return PaymentModel.findByReference(ref);
  }

  static async processPayment(data, cashierUser, req) {
    // 1. Resolve ticket
    const ticket = TicketModel.findById(data.ticketId) || TicketModel.findByNumber(data.ticketNumber);
    if (!ticket) {
      throw new Error(`Citation not found for payment processing.`);
    }

    if (ticket.status === 'PAID') {
      throw new Error(`Citation ${ticket.ticketNumber} is already paid in full.`);
    }

    if (ticket.status === 'VOID' || ticket.status === 'CANCELLED') {
      throw new Error(`Citation ${ticket.ticketNumber} is ${ticket.status} and cannot receive payment.`);
    }

    const payAmount = Number(data.amount || ticket.totalDue);
    const referenceNumber = generateReferenceNumber();

    // 2. Create payment record
    const payment = PaymentModel.create({
      referenceNumber,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      plateNumber: ticket.plateNumber,
      amount: payAmount,
      paymentMethod: data.paymentMethod || 'CREDIT_CARD',
      cardBrand: data.cardBrand || 'Visa',
      lastFour: data.lastFour || '4242',
      status: 'COMPLETED',
      paidBy: data.paidBy || 'Citizen Payer',
      payerEmail: data.payerEmail || null,
      cashierId: cashierUser ? cashierUser.id : null,
      cashierName: cashierUser ? cashierUser.name : 'Citizen Online Portal',
      receiptUrl: `/uploads/receipts/receipt-${referenceNumber}.pdf`,
      notes: data.notes || 'Payment collected and settled successfully.'
    });

    // 3. Mark ticket paid
    TicketModel.update(ticket.id, {
      status: 'PAID',
      totalDue: 0,
      paidAt: new Date().toISOString(),
      paymentId: payment.id,
      paymentReference: referenceNumber
    });

    // 4. Audit & notification
    await AuditService.log({
      user: cashierUser,
      action: 'PAYMENT_PROCESSED',
      entityType: 'PAYMENT',
      entityId: payment.id,
      details: `Collected $${payAmount.toFixed(2)} (${payment.paymentMethod}) for citation ${ticket.ticketNumber} [Ref: ${referenceNumber}]`,
      req
    });

    NotificationService.sendPaymentReceipt(payment, ticket);

    return payment;
  }
}
