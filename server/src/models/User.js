// server/src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ENV } from '../config/environment.js';
import { ROLES } from '../constants/roles.js';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // never returned by default queries
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.OFFICER,
      index: true,
    },
    badgeNumber: { type: String, trim: true },
    phone: { type: String, trim: true },
    department: { type: String, trim: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
      index: true,
    },
    avatar: { type: String },
    lastLoginAt: { type: Date },
    passwordChangedAt: { type: Date },
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockedUntil: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.failedLoginAttempts;
        delete ret.lockedUntil;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

userSchema.index({ name: 'text', email: 'text', badgeNumber: 'text' });

// Hash the password whenever it is set/changed — never store or transmit plaintext.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(ENV.BCRYPT_SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = new Date();
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.isLocked = function isLocked() {
  return Boolean(this.lockedUntil && this.lockedUntil > Date.now());
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
