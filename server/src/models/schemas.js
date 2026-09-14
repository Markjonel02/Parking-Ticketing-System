// server/src/models/schemas.js
import mongoose from 'mongoose';

// 1. User Schema
export const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, default: 'password123' },
  role: { 
    type: String, 
    enum: ['ADMIN', 'SUPERVISOR', 'OFFICER', 'CASHIER'], 
    default: 'OFFICER',
    index: true 
  },
  badgeNumber: { type: String, trim: true },
  phone: { type: String, trim: true },
  department: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], 
    default: 'ACTIVE',
    index: true 
  },
  avatar: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

// 2. Vehicle Schema
export const VehicleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  plateNumber: { type: String, required: true, uppercase: true, trim: true, index: true },
  state: { type: String, required: true, uppercase: true, trim: true, default: 'CA', index: true },
  make: { type: String, default: 'Unknown Make', trim: true },
  model: { type: String, default: 'Unknown Model', trim: true },
  year: { type: Number },
  color: { type: String, default: 'Unspecified', trim: true },
  vin: { type: String, trim: true, uppercase: true },
  ownerName: { type: String, default: 'Vehicle Registrant', trim: true },
  ownerEmail: { type: String, trim: true, lowercase: true },
  ownerPhone: { type: String, trim: true },
  registeredCity: { type: String, default: 'Metropolis', trim: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

// 3. Violation Schema
export const ViolationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  baseFine: { type: Number, required: true },
  severity: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], 
    default: 'MEDIUM',
    index: true 
  },
  gracePeriodDays: { type: Number, default: 14 },
  lateFee: { type: Number, default: 25 },
  points: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true, index: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

// 4. Ticket Schema
export const TicketSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  ticketNumber: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  plateNumber: { type: String, required: true, uppercase: true, trim: true, index: true },
  state: { type: String, default: 'CA', uppercase: true, trim: true },
  vehicleId: { type: String, index: true },
  vehicleMake: { type: String },
  vehicleModel: { type: String },
  vehicleColor: { type: String },
  violationId: { type: String, index: true },
  violationCode: { type: String, uppercase: true },
  violationTitle: { type: String },
  violationSeverity: { type: String },
  baseFine: { type: Number, default: 0 },
  lateFee: { type: Number, default: 0 },
  totalDue: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  zoneId: { type: String, index: true },
  zoneName: { type: String },
  locationDescription: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  officerId: { type: String, index: true },
  officerName: { type: String },
  officerBadge: { type: String },
  status: { 
    type: String, 
    enum: ['ISSUED', 'PAID', 'DISPUTED', 'DISMISSED', 'VOID', 'OVERDUE'], 
    default: 'ISSUED', 
    index: true 
  },
  issuedAt: { type: String, default: () => new Date().toISOString() },
  dueDate: { type: String },
  notes: { type: String },
  evidencePhotos: [{ type: String }],
  disputeReason: { type: String },
  disputeNotes: { type: String },
  disputeSubmittedAt: { type: String },
  disputeStatus: { type: String },
  disputeResolvedAt: { type: String },
  disputeDecision: { type: String },
  disputeReviewerNotes: { type: String },
  disputeReviewedBy: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

// 5. Payment Schema
export const PaymentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  referenceNumber: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  ticketId: { type: String, required: true, index: true },
  ticketNumber: { type: String, required: true, index: true },
  plateNumber: { type: String, required: true, uppercase: true, trim: true },
  amount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'ONLINE_PORTAL', 'CHECK'], 
    default: 'CREDIT_CARD' 
  },
  cardBrand: { type: String },
  lastFour: { type: String },
  status: { 
    type: String, 
    enum: ['COMPLETED', 'PENDING', 'FAILED', 'REFUNDED'], 
    default: 'COMPLETED',
    index: true 
  },
  paidBy: { type: String, trim: true },
  payerEmail: { type: String, trim: true, lowercase: true },
  cashierId: { type: String },
  cashierName: { type: String },
  transactionDate: { type: String, default: () => new Date().toISOString() },
  receiptUrl: { type: String },
  notes: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

// 6. ParkingZone Schema
export const ParkingZoneSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  name: { type: String, required: true, trim: true },
  city: { type: String, default: 'Metropolis', trim: true },
  hourlyRate: { type: Number, default: 2.5 },
  multiplier: { type: Number, default: 1.0 },
  totalSpots: { type: Number, default: 100 },
  occupiedSpots: { type: Number, default: 0 },
  enforcementHours: { type: String, default: '8:00 AM - 8:00 PM' },
  isActive: { type: Boolean, default: true, index: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

// 7. AuditLog Schema
export const AuditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  timestamp: { type: String, default: () => new Date().toISOString() },
  userId: { type: String, index: true },
  userName: { type: String },
  userRole: { type: String },
  action: { type: String, required: true, index: true },
  entityType: { type: String, index: true },
  entityId: { type: String, index: true },
  ipAddress: { type: String },
  details: { type: String }
}, { timestamps: true });

// Safe Mongoose Model getters (avoids OverwriteModelError)
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);
export const Violation = mongoose.models.Violation || mongoose.model('Violation', ViolationSchema);
export const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
export const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
export const ParkingZone = mongoose.models.ParkingZone || mongoose.model('ParkingZone', ParkingZoneSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
