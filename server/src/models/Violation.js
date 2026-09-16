// server/src/models/Violation.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const violationSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, 'Violation code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: [true, 'Violation name is required'], trim: true },
    description: { type: String, trim: true },
    baseFine: {
      type: Number,
      required: [true, 'Base fine amount is required'],
      min: [0, 'Base fine cannot be negative'],
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true,
    },
    gracePeriodDays: { type: Number, default: 14, min: 0 },
    lateFee: { type: Number, default: 25, min: 0 },
    points: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
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

violationSchema.index({ name: 'text', description: 'text' });

export const Violation = mongoose.models.Violation || mongoose.model('Violation', violationSchema);
export default Violation;
