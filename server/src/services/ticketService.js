// server/src/services/ticketService.js
import { Ticket } from '../models/Ticket.js';
import { Vehicle } from '../models/Vehicle.js';
import { ParkingZone } from '../models/ParkingZone.js';
import { ViolationService } from './violationService.js';
import { generateTicketNumber } from '../utils/generateTicketNumber.js';
import { calculateFine } from '../utils/calculateFine.js';
import { AuditService } from './auditService.js';
import { NotificationService } from './notificationService.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination } from '../utils/pagination.js';
import { TICKET_STATUS } from '../constants/ticketStatus.js';

const POPULATE_FIELDS = [
  { path: 'vehicle' },
  { path: 'violation' },
  { path: 'zone' },
  { path: 'officer', select: 'name badgeNumber role' },
];

function buildFilter({ status, zoneId, officerId, plateNumber, search }) {
  const filter = {};
  if (status) filter.status = status;
  if (zoneId) filter.zone = zoneId;
  if (officerId) filter.officer = officerId;
  if (plateNumber) filter.plateNumber = plateNumber.trim().toUpperCase();
  if (search) filter.$text = { $search: search };
  return filter;
}

async function resolveVehicle({
  plateNumber,
  province,
  provinceCode,
  municipality,
  municipalityCode,
  barangay,
  barangayCode,
  vehicleMake,
  vehicleModel,
  vehicleColor,
  ownerName,
  ownerEmail,
  ownerPhone
}) {
  const plate = plateNumber.trim().toUpperCase();
  const registrationProvince = (province || 'Metro Manila').trim();

  let vehicle = await Vehicle.findOne({ plateNumber: plate, province: registrationProvince });
  if (!vehicle) {
    vehicle = await Vehicle.create({
      plateNumber: plate,
      province: registrationProvince,
      provinceCode,
      municipality,
      municipalityCode,
      barangay,
      barangayCode,
      make: vehicleMake || 'Unknown Make',
      model: vehicleModel || 'Unknown Model',
      color: vehicleColor || 'Unspecified',
      ownerName: ownerName || 'Vehicle Registrant',
      ownerEmail: ownerEmail || undefined,
      ownerPhone: ownerPhone || undefined,
    });
  }
  return vehicle;
}

async function generateUniqueTicketNumber() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateTicketNumber();
    // eslint-disable-next-line no-await-in-loop
    const exists = await Ticket.exists({ ticketNumber: candidate });
    if (!exists) return candidate;
  }
  throw new ApiError(500, 'Failed to generate a unique ticket number, please retry.');
}

export class TicketService {
  static async getAllTickets(query = {}) {
    const { page = 1, limit = 10 } = query;
    const filter = buildFilter(query);
    const { skip, limit: pageSize, buildMeta } = getPagination(page, limit);

    const [tickets, totalItems] = await Promise.all([
      Ticket.find(filter).populate(POPULATE_FIELDS).sort({ issuedAt: -1 }).skip(skip).limit(pageSize),
      Ticket.countDocuments(filter),
    ]);

    return { data: tickets, pagination: buildMeta(totalItems) };
  }

  static async getTicketById(id) {
    if (!id) return null;
    return Ticket.findById(id).populate(POPULATE_FIELDS).catch(() => null);
  }

  static async getTicketByNumber(ticketNumber) {
    if (!ticketNumber) return null;
    return Ticket.findOne({ ticketNumber: ticketNumber.trim().toUpperCase() }).populate(POPULATE_FIELDS);
  }

  static async resolveTicket(idOrNumber) {
    const byId = await this.getTicketById(idOrNumber);
    if (byId) return byId;
    return this.getTicketByNumber(idOrNumber);
  }

  static async issueTicket(data, issuingUser, req) {
    const vehicle = await resolveVehicle(data);

    const violation = await ViolationService.resolveViolation(data.violationId || data.violationCode);
    if (!violation) {
      throw ApiError.badRequest(`Invalid violation specified: ${data.violationId || data.violationCode}`);
    }
    if (!violation.isActive) {
      throw ApiError.badRequest(`Violation code ${violation.code} is retired and can no longer be cited.`);
    }

    let zone = null;
    if (data.zoneId) {
      zone = await ParkingZone.findById(data.zoneId).catch(() => null);
    }
    if (!zone) {
      throw ApiError.badRequest('A valid parking zone must be specified.');
    }

    const fineDetails = calculateFine({
      baseFine: violation.baseFine,
      zoneMultiplier: zone.multiplier,
      lateFee: violation.lateFee,
      isOverdue: false,
    });

    const issuedAt = new Date();
    const dueDate = new Date(issuedAt.getTime() + (violation.gracePeriodDays || 14) * 24 * 60 * 60 * 1000);
    const ticketNumber = await generateUniqueTicketNumber();

    const ticket = await Ticket.create({
      ticketNumber,
      vehicle: vehicle._id,
      plateNumber: vehicle.plateNumber,
      province: vehicle.province,
      provinceCode: vehicle.provinceCode,
      municipality: vehicle.municipality,
      municipalityCode: vehicle.municipalityCode,
      barangay: vehicle.barangay,
      barangayCode: vehicle.barangayCode,
      violation: violation._id,
      violationCode: violation.code,
      violationTitle: violation.name,
      violationSeverity: violation.severity,
      zone: zone._id,
      zoneName: zone.name,
      locationDescription: data.locationDescription,
      latitude: data.latitude,
      longitude: data.longitude,
      officer: issuingUser._id,
      officerName: issuingUser.name,
      officerBadge: issuingUser.badgeNumber,
      baseFine: fineDetails.baseFine,
      lateFee: 0,
      totalDue: fineDetails.baseFine,
      status: TICKET_STATUS.ISSUED,
      issuedAt,
      dueDate,
      notes: data.notes || '',
      evidencePhotos: data.evidencePhotos || [],
    });

    await AuditService.log({
      user: issuingUser,
      action: 'TICKET_CREATED',
      entityType: 'TICKET',
      entityId: ticket._id,
      details: `Issued citation ${ticket.ticketNumber} to ${vehicle.plateNumber} (${vehicle.province}) for ${violation.name} ($${fineDetails.baseFine}).`,
      req,
    });

    NotificationService.sendTicketNotice(ticket, vehicle);

    return this.getTicketById(ticket._id);
  }

  static async disputeTicket(id, { disputeReason, evidence }, user, req) {
    const ticket = await Ticket.findById(id);
    if (!ticket) throw ApiError.notFound('Ticket citation not found.');

    if ([TICKET_STATUS.PAID, TICKET_STATUS.VOID].includes(ticket.status)) {
      throw ApiError.badRequest(`Cannot dispute a citation with status [${ticket.status}].`);
    }

    ticket.status = TICKET_STATUS.DISPUTED;
    ticket.dispute = {
      reason: disputeReason,
      evidence: evidence || [],
      submittedAt: new Date(),
      status: 'PENDING',
    };
    await ticket.save();

    await AuditService.log({
      user,
      action: 'DISPUTE_FILED',
      entityType: 'TICKET',
      entityId: ticket._id,
      details: `Dispute filed for ${ticket.ticketNumber}: "${disputeReason.slice(0, 80)}"`,
      req,
    });

    return this.getTicketById(ticket._id);
  }

  static async resolveDispute(id, { decision, resolutionNotes }, user, req) {
    const ticket = await Ticket.findById(id);
    if (!ticket) throw ApiError.notFound('Ticket citation not found.');
    if (ticket.status !== TICKET_STATUS.DISPUTED) {
      throw ApiError.badRequest('This citation does not have an active dispute to resolve.');
    }

    if (decision === 'UPHELD_VOID') {
      ticket.status = TICKET_STATUS.VOID;
      ticket.totalDue = 0;
    } else if (decision === 'REDUCED_FINE') {
      ticket.totalDue = Math.round(ticket.baseFine * 0.5 * 100) / 100;
      ticket.status = TICKET_STATUS.ISSUED;
    } else {
      // REJECTED — dispute denied, original fine stands.
      ticket.totalDue = ticket.baseFine + (ticket.lateFee || 0);
      ticket.status = TICKET_STATUS.ISSUED;
    }

    ticket.dispute.status = decision;
    ticket.dispute.decision = decision;
    ticket.dispute.resolutionNotes = resolutionNotes;
    ticket.dispute.resolvedBy = user._id;
    ticket.dispute.resolvedAt = new Date();
    await ticket.save();

    await AuditService.log({
      user,
      action: 'DISPUTE_RESOLVED',
      entityType: 'TICKET',
      entityId: ticket._id,
      details: `Dispute on ${ticket.ticketNumber} resolved: ${decision}.`,
      req,
    });

    NotificationService.sendDisputeUpdate(ticket, decision);

    return this.getTicketById(ticket._id);
  }

  static async voidTicket(id, reason, user, req) {
    const ticket = await Ticket.findById(id);
    if (!ticket) throw ApiError.notFound('Ticket not found.');
    if (ticket.status === TICKET_STATUS.PAID) {
      throw ApiError.badRequest('A paid citation cannot be voided; process a refund instead.');
    }

    ticket.status = TICKET_STATUS.VOID;
    ticket.totalDue = 0;
    ticket.voidReason = reason;
    ticket.voidedBy = user._id;
    ticket.voidedAt = new Date();
    await ticket.save();

    await AuditService.log({
      user,
      action: 'TICKET_VOIDED',
      entityType: 'TICKET',
      entityId: ticket._id,
      details: `Voided ticket ${ticket.ticketNumber}. Reason: ${reason}`,
      req,
    });

    return this.getTicketById(ticket._id);
  }
}

export default TicketService;
