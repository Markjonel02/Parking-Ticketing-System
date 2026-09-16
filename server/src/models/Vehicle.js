// server/src/models/Vehicle.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const vehicleSchema = new Schema(
  {
    plateNumber: {
      type: String,
      required: [true, 'License plate number is required'],
      uppercase: true,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: [true, 'Registration state/jurisdiction is required'],
      uppercase: true,
      trim: true,
      index: true,
    },
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    year: { type: Number, min: 1900, max: 2100 },
    color: { type: String, trim: true },
    vin: { type: String, trim: true, uppercase: true },
    ownerName: { type: String, trim: true },
    ownerEmail: { type: String, trim: true, lowercase: true },
    ownerPhone: { type: String, trim: true },
    registeredCity: { type: String, trim: true },
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

// A plate is unique per issuing state, not globally.
vehicleSchema.index({ plateNumber: 1, state: 1 }, { unique: true });
vehicleSchema.index({ ownerName: 'text', vin: 'text', make: 'text', model: 'text' });

export const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
