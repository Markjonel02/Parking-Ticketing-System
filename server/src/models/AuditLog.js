// server/src/models/AuditLog.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    userName: { type: String },
    userRole: { type: String },
    action: { type: String, required: true, index: true },
    entityType: { type: String, index: true },
    entityId: { type: Schema.Types.ObjectId, index: true },
    ipAddress: { type: String },
    details: { type: String },
  },
  {
    // Audit entries are immutable and only ever created — no updatedAt needed.
    timestamps: { createdAt: 'timestamp', updatedAt: false },
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

auditLogSchema.index({ action: 'text', userName: 'text', details: 'text' });

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
