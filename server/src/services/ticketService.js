// server/src/services/ticketService.js
import { TicketModel } from '../models/Ticket.js';
import { VehicleModel } from '../models/Vehicle.js';
import { ViolationModel } from '../models/Violation.js';
import { ParkingZoneModel } from '../models/ParkingZone.js';
import { generateTicketNumber } from '../utils/generateTicketNumber.js';
import { calculateFine } from '../utils/calculateFine.js';
import { AuditService } from './auditService.js';
import { NotificationService } from './notificationService.js';

export class TicketService {
  static getAllTickets(filter = {}) {
    return TicketModel.findAll(filter);
  }

  static getTicketById(id) {
    return TicketModel.findById(id);
  }

  static getTicketByNumber(ticketNumber) {
    return TicketModel.findByNumber(ticketNumber);
  }

  static async issueTicket(data, issuingUser, req) {
    // 1. Resolve or create vehicle
    const plate = data.plateNumber.trim().toUpperCase();
    const state = (data.state || 'CA').trim().toUpperCase();
    let vehicle = VehicleModel.findByPlate(plate, state);

    if (!vehicle) {
      vehicle = VehicleModel.create({
        plateNumber: plate,
        state,
        make: data.vehicleMake || 'Unknown Make',
        model: data.vehicleModel || 'Unknown Model',
        color: data.vehicleColor || 'Unspecified',
        ownerName: data.ownerName || 'Vehicle Registrant',
        ownerEmail: data.ownerEmail || null,
        ownerPhone: data.ownerPhone || null
      });
    }

    // 2. Resolve violation & zone
    const violation = ViolationModel.findById(data.violationId) || ViolationModel.findByCode(data.violationCode);
    if (!violation) {
      throw new Error(`Invalid violation specified: ${data.violationId || data.violationCode}`);
    }

    const zone = ParkingZoneModel.findById(data.zoneId) || ParkingZoneModel.findAll()[0];

    // 3. Compute fine
    const fineDetails = calculateFine({
      baseFine: violation.baseFine,
      zoneMultiplier: zone?.multiplier || 1.0,
      lateFee: violation.lateFee,
      isOverdue: false,
      points: violation.points || 0
    });

    // 4. Calculate due date (14 days default)
    const issuedAt = new Date();
    const dueDate = new Date(issuedAt.getTime() + (violation.gracePeriodDays || 14) * 24 * 60 * 60 * 1000);

    const ticketNumber = generateTicketNumber();

    const ticket = TicketModel.create({
      ticketNumber,
      plateNumber: plate,
      state,
      vehicleId: vehicle.id,
      violationId: violation.id,
      violationCode: violation.code,
      violationTitle: violation.name,
      zoneId: zone?.id || 'zone-01',
      zoneName: zone?.name || 'Metropolitan Enforcement District',
      locationDescription: data.locationDescription,
      officerId: issuingUser?.id || 'usr-officer-01',
      officerName: issuingUser?.name || 'Elena Rostova',
      officerBadge: issuingUser?.badgeNumber || 'EO-4421',
      fineAmount: fineDetails.baseFine,
      lateFee: fineDetails.lateFee,
      totalDue: fineDetails.baseFine,
      status: 'ISSUED',
      issuedAt: issuedAt.toISOString(),
      dueDate: dueDate.toISOString(),
      notes: data.notes || '',
      evidencePhotos: data.evidencePhotos || [
        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80'
      ]
    });

    // Audit and notify
    await AuditService.log({
      user: issuingUser,
      action: 'TICKET_CREATED',
      entityType: 'TICKET',
      entityId: ticket.id,
      details: `Issued citation ${ticket.ticketNumber} to ${plate} (${state}) for ${violation.name} ($${fineDetails.baseFine})`,
      req
    });

    NotificationService.sendTicketNotice(ticket, vehicle);

    return ticket;
  }

  static async disputeTicket(id, disputeData, user, req) {
    const ticket = TicketModel.findById(id);
    if (!ticket) throw new Error('Ticket citation not found');

    if (ticket.status === 'PAID' || ticket.status === 'VOID') {
      throw new Error(`Cannot dispute citation with status [${ticket.status}]`);
    }

    const updated = TicketModel.update(id, {
      status: 'DISPUTED',
      disputeReason: disputeData.disputeReason,
      disputeDate: new Date().toISOString(),
      disputeEvidence: disputeData.disputeEvidence || []
    });

    await AuditService.log({
      user,
      action: 'DISPUTE_FILED',
      entityType: 'TICKET',
      entityId: id,
      details: `Dispute requested for ${ticket.ticketNumber}: "${disputeData.disputeReason.slice(0, 50)}..."`,
      req
    });

    return updated;
  }

  static async resolveDispute(id, { decision, resolutionNotes }, user, req) {
    const ticket = TicketModel.findById(id);
    if (!ticket) throw new Error('Ticket citation not found');

    let newStatus = 'ISSUED';
    let totalDue = ticket.fineAmount;

    if (decision === 'UPHELD_VOID') {
      newStatus = 'VOID';
      totalDue = 0;
    } else if (decision === 'REDUCED_FINE') {
      totalDue = Math.round(ticket.fineAmount * 0.5 * 100) / 100;
      newStatus = 'ISSUED';
    } else {
      // REJECTED
      newStatus = 'ISSUED';
    }

    const updated = TicketModel.update(id, {
      status: newStatus,
      totalDue,
      disputeResolution: {
        decision,
        notes: resolutionNotes,
        resolvedBy: user?.name,
        resolvedAt: new Date().toISOString()
      }
    });

    await AuditService.log({
      user,
      action: 'DISPUTE_RESOLVED',
      entityType: 'TICKET',
      entityId: id,
      details: `Supervisor resolved dispute on ${ticket.ticketNumber}: ${decision}`,
      req
    });

    NotificationService.sendDisputeUpdate(updated, newStatus, resolutionNotes);
    return updated;
  }

  static async voidTicket(id, reason, user, req) {
    const ticket = TicketModel.findById(id);
    if (!ticket) throw new Error('Ticket not found');

    const updated = TicketModel.update(id, {
      status: 'VOID',
      totalDue: 0,
      voidReason: reason,
      voidedBy: user?.name,
      voidedAt: new Date().toISOString()
    });

    await AuditService.log({
      user,
      action: 'TICKET_VOIDED',
      entityType: 'TICKET',
      entityId: id,
      details: `Voided ticket ${ticket.ticketNumber}. Reason: ${reason}`,
      req
    });

    return updated;
  }
}
