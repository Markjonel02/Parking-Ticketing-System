// server/src/services/paymentService.js
import { Payment } from '../models/Payment.js';
import { Ticket } from '../models/Ticket.js';
import { TicketService } from './ticketService.js';
import { generateReferenceNumber } from '../utils/generateReferenceNumber.js';
import { AuditService } from './auditService.js';
import { NotificationService } from './notificationService.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination } from '../utils/pagination.js';
import { TICKET_STATUS } from '../constants/ticketStatus.js';

const POPULATE_FIELDS = [{ path: 'ticket' }, { path: 'cashier', select: 'name role' }];

function buildFilter({ status, paymentMethod, search }) {
  const filter = {};
  if (status) filter.status = status;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (search) filter.$text = { $search: search };
  return filter;
}

async function generateUniqueReference() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateReferenceNumber();
    // eslint-disable-next-line no-await-in-loop
    const exists = await Payment.exists({ referenceNumber: candidate });
    if (!exists) return candidate;
  }
  throw new ApiError(500, 'Failed to generate a unique payment reference, please retry.');
}

export class PaymentService {
  static async getAllPayments(query = {}) {
    const { page = 1, limit = 10 } = query;
    const filter = buildFilter(query);
    const { skip, limit: pageSize, buildMeta } = getPagination(page, limit);

    const [payments, totalItems] = await Promise.all([
      Payment.find(filter).populate(POPULATE_FIELDS).sort({ transactionDate: -1 }).skip(skip).limit(pageSize),
      Payment.countDocuments(filter),
    ]);

    return { data: payments, pagination: buildMeta(totalItems) };
  }

  static async getPaymentById(id) {
    if (!id) return null;
    return Payment.findById(id).populate(POPULATE_FIELDS).catch(() => null);
  }

  static async getPaymentByReference(ref) {
    if (!ref) return null;
    return Payment.findOne({ referenceNumber: ref.trim().toUpperCase() }).populate(POPULATE_FIELDS);
  }

  static async resolvePayment(idOrRef) {
    const byId = await this.getPaymentById(idOrRef);
    if (byId) return byId;
    return this.getPaymentByReference(idOrRef);
  }

  static async processPayment(data, cashierUser, req) {
    const ticket = data.ticketId
      ? await Ticket.findById(data.ticketId).catch(() => null)
      : await Ticket.findOne({ ticketNumber: (data.ticketNumber || '').trim().toUpperCase() });

    if (!ticket) {
      throw ApiError.notFound('Citation not found for payment processing.');
    }
    if (ticket.status === TICKET_STATUS.PAID) {
      throw ApiError.badRequest(`Citation ${ticket.ticketNumber} is already paid in full.`);
    }
    if ([TICKET_STATUS.VOID, TICKET_STATUS.CANCELLED, TICKET_STATUS.DISMISSED].includes(ticket.status)) {
      throw ApiError.badRequest(`Citation ${ticket.ticketNumber} is ${ticket.status} and cannot receive payment.`);
    }

    const payAmount = Number(data.amount ?? ticket.totalDue);
    if (!(payAmount > 0)) {
      throw ApiError.badRequest('Payment amount must be greater than zero.');
    }

    const referenceNumber = await generateUniqueReference();

    const payment = await Payment.create({
      referenceNumber,
      ticket: ticket._id,
      ticketNumber: ticket.ticketNumber,
      plateNumber: ticket.plateNumber,
      amount: payAmount,
      paymentMethod: data.paymentMethod || 'CREDIT_CARD',
      cardBrand: data.paymentMethod === 'CASH' ? undefined : data.cardBrand,
      lastFour: data.paymentMethod === 'CASH' ? undefined : data.lastFour,
      status: 'COMPLETED',
      paidBy: data.paidBy || 'Citizen Payer',
      payerEmail: data.payerEmail,
      cashier: cashierUser?._id,
      cashierName: cashierUser?.name || 'Citizen Online Portal',
      notes: data.notes,
    });

    ticket.status = TICKET_STATUS.PAID;
    ticket.totalDue = 0;
    ticket.paidAt = new Date();
    ticket.payment = payment._id;
    await ticket.save();

    await AuditService.log({
      user: cashierUser,
      action: 'PAYMENT_PROCESSED',
      entityType: 'PAYMENT',
      entityId: payment._id,
      details: `Collected $${payAmount.toFixed(2)} (${payment.paymentMethod}) for citation ${ticket.ticketNumber} [Ref: ${referenceNumber}].`,
      req,
    });

    NotificationService.sendPaymentReceipt(payment);

    return this.getPaymentById(payment._id);
  }
}

export default PaymentService;
