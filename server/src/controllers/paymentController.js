// server/src/controllers/paymentController.js
import { PaymentService } from '../services/paymentService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class PaymentController {
  static getPayments = asyncHandler(async (req, res) => {
    const { data, pagination } = await PaymentService.getAllPayments(req.query);
    return res.json({ success: true, data, pagination });
  });

  static getPaymentById = asyncHandler(async (req, res) => {
    const payment = await PaymentService.resolvePayment(req.params.id);
    if (!payment) throw ApiError.notFound('Payment transaction record not found.');
    return res.json({ success: true, data: payment });
  });

  static processPayment = asyncHandler(async (req, res) => {
    const payment = await PaymentService.processPayment(req.body, req.user, req);
    return res.status(201).json({
      success: true,
      message: `Payment of $${payment.amount.toFixed(2)} processed successfully. Reference: ${payment.referenceNumber}`,
      data: payment,
    });
  });

  static getReceipt = asyncHandler(async (req, res) => {
    const payment = await PaymentService.resolvePayment(req.params.id);
    if (!payment) throw ApiError.notFound('Receipt not found.');

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
        status: payment.status,
        issuingAuthority: 'Metropolitan Parking Authority & Municipal Treasury',
      },
    });
  });
}

export default PaymentController;
