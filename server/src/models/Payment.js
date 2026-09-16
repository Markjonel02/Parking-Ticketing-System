// server/src/models/Payment.js
import mongoose from 'mongoose';
import { PAYMENT_STATUS, PAYMENT_METHODS } from '../constants/paymentStatus.js';

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    ticket: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
    ticketNumber: { type: String, required: true, index: true },
    plateNumber: { type: String, required: true, uppercase: true, trim: true },
    amount: { type: Number, required: true, min: [0.01, 'Payment amount must be greater than zero'] },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      default: PAYMENT_METHODS.CREDIT_CARD,
    },
    cardBrand: { type: String, trim: true },
    lastFour: { type: String, trim: true, maxlength: 4 },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.COMPLETED,
      index: true,
    },
    paidBy: { type: String, trim: true },
    payerEmail: { type: String, trim: true, lowercase: true },
    cashier: { type: Schema.Types.ObjectId, ref: 'User' },
    cashierName: { type: String },
    transactionDate: { type: Date, default: Date.now, index: true },
    receiptUrl: { type: String },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

paymentSchema.index({ referenceNumber: 'text', ticketNumber: 'text', plateNumber: 'text', paidBy: 'text' });

export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export default Payment;
