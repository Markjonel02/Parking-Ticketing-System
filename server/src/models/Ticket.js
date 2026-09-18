// server/src/models/Ticket.js
import mongoose from 'mongoose';
import { TICKET_STATUS } from '../constants/ticketStatus.js';

const { Schema } = mongoose;

const disputeSchema = new Schema(
  {
    reason: { type: String, trim: true },
    evidence: [{ type: String }],
    submittedAt: { type: Date },
    status: { type: String, enum: ['PENDING', 'UPHELD_VOID', 'REDUCED_FINE', 'REJECTED'], default: 'PENDING' },
    decision: { type: String },
    resolutionNotes: { type: String, trim: true },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { _id: false },
);

const ticketSchema = new Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
    plateNumber: { type: String, required: true, uppercase: true, trim: true, index: true },
    // Snapshotted from the vehicle's PH address at issue time (see note on
    // baseFine/lateFee/totalDue below re: snapshotting).
    province: { type: String, required: true, trim: true },
    provinceCode: { type: String, trim: true },
    municipality: { type: String, trim: true },
    municipalityCode: { type: String, trim: true },
    barangay: { type: String, trim: true },
    barangayCode: { type: String, trim: true },

    violation: { type: Schema.Types.ObjectId, ref: 'Violation', required: true, index: true },
    violationCode: { type: String, uppercase: true },
    violationTitle: { type: String },
    violationSeverity: { type: String },

    zone: { type: Schema.Types.ObjectId, ref: 'ParkingZone', index: true },
    zoneName: { type: String },
    locationDescription: { type: String, required: [true, 'Citation location is required'], trim: true },
    latitude: { type: Number },
    longitude: { type: Number },

    officer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    officerName: { type: String },
    officerBadge: { type: String },

    // Fine amounts are snapshotted at issue time so later edits to the violation schedule
    // never retroactively change an already-issued citation.
    baseFine: { type: Number, required: true, min: 0 },
    lateFee: { type: Number, default: 0, min: 0 },
    totalDue: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.ISSUED,
      index: true,
    },

    issuedAt: { type: Date, default: Date.now, index: true },
    dueDate: { type: Date, required: true },
    overdueAssessedAt: { type: Date },

    paidAt: { type: Date },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment' },

    voidReason: { type: String, trim: true },
    voidedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    voidedAt: { type: Date },

    notes: { type: String, trim: true },
    evidencePhotos: [{ type: String }],

    dispute: disputeSchema,
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

ticketSchema.index({ plateNumber: 'text', ticketNumber: 'text', locationDescription: 'text' });

export const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
export default Ticket;
