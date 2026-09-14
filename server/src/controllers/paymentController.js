// server/src/controllers/paymentController.js
import { PaymentService } from '../services/paymentService.js';
import { paginate } from '../utils/pagination.js';

export class PaymentController {
  static async getPayments(req, res, next) {
    try {
      const { status, paymentMethod, search, page = 1, limit = 10 } = req.query;
      const allPayments = PaymentService.getAllPayments({ status, paymentMethod, search });
      const result = paginate(allPayments, page, limit);

      return res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  static async getPaymentById(req, res, next) {
    try {
      const payment = PaymentService.getPaymentById(req.params.id) || PaymentService.getPaymentByReference(req.params.id);
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment transaction record not found' });
      }
      return res.json({ success: true, data: payment });
    } catch (err) {
      next(err);
    }
  }

  static async processPayment(req, res, next) {
    try {
      const payment = await PaymentService.processPayment(req.body, req.user, req);
      return res.status(201).json({
        success: true,
        message: `Payment of $${payment.amount.toFixed(2)} processed successfully. Reference: ${payment.referenceNumber}`,
        data: payment
      });
    } catch (err) {
      next(err);
    }
  }

  static async getReceipt(req, res, next) {
    try {
      const payment = PaymentService.getPaymentById(req.params.id) || PaymentService.getPaymentByReference(req.params.id);
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Receipt not found' });
      }

      return res.json({
        success: true,
        data: {
          receiptNumber: payment.referenceNumber,
          transactionDate: payment.transactionDate,
          ticketNumber: payment.ticketNumber,
          plateNumber: payment.plateNumber,
          amountPaid: payment.amount,
          paymentMethod: payment.paymentMethod,
          cardBrand: payment.cardBrand,
          lastFour: payment.lastFour,
          payer: payment.paidBy,
          cashier: payment.cashierName,
          status: 'OFFICIALLY_SETTLED',
          issuingAuthority: 'Metropolitan Parking Authority & Municipal Treasury',
          disclaimer: 'This electronic document certifies that citation liabilities are settled in full.'
        }
      });
    } catch (err) {
      next(err);
    }
  }
}
