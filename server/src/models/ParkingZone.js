// server/src/models/ParkingZone.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const parkingZoneSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, 'Zone code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: [true, 'Zone name is required'], trim: true },
    city: { type: String, trim: true },
    hourlyRate: { type: Number, default: 2.5, min: 0 },
    multiplier: { type: Number, default: 1.0, min: 0 },
    totalSpots: { type: Number, default: 100, min: 0 },
    occupiedSpots: { type: Number, default: 0, min: 0 },
    enforcementHours: { type: String, default: '8:00 AM - 8:00 PM' },
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

parkingZoneSchema.index({ name: 'text', city: 'text' });

export const ParkingZone = mongoose.models.ParkingZone || mongoose.model('ParkingZone', parkingZoneSchema);
export default ParkingZone;
