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
    // Philippine address of registration: Province -> Municipality/City ->
    // Barangay, backed by the official PSGC dataset on the client. The
    // *Code fields hold the PSGC code (10-digit) when the value was chosen
    // from the cascading select, so the record can be re-resolved later.
    province: {
      type: String,
      required: [true, 'Province is required'],
      trim: true,
      index: true,
    },
    provinceCode: { type: String, trim: true },
    municipality: { type: String, trim: true },
    municipalityCode: { type: String, trim: true },
    barangay: { type: String, trim: true },
    barangayCode: { type: String, trim: true },
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

// A plate is unique per registering province, not globally.
vehicleSchema.index({ plateNumber: 1, province: 1 }, { unique: true });
vehicleSchema.index({ ownerName: 'text', vin: 'text', make: 'text', model: 'text' });

export const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
