// server/src/controllers/ticketController.js
import { TicketService } from '../services/ticketService.js';
import { paginate } from '../utils/pagination.js';

export class TicketController {
  static async getTickets(req, res, next) {
    try {
      const { status, zoneId, officerId, plateNumber, search, page = 1, limit = 10 } = req.query;
      const allTickets = TicketService.getAllTickets({ status, zoneId, officerId, plateNumber, search });
      const result = paginate(allTickets, page, limit);

      return res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  static async getTicketById(req, res, next) {
    try {
      const ticket = TicketService.getTicketById(req.params.id) || TicketService.getTicketByNumber(req.params.id);
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket citation not found' });
      }
      return res.json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  }

  static async createTicket(req, res, next) {
    try {
      const ticket = await TicketService.issueTicket(req.body, req.user, req);
      return res.status(201).json({
        success: true,
        message: `Citation ${ticket.ticketNumber} successfully generated.`,
        data: ticket
      });
    } catch (err) {
      next(err);
    }
  }

  static async disputeTicket(req, res, next) {
    try {
      const ticket = await TicketService.disputeTicket(req.params.id, req.body, req.user, req);
      return res.json({
        success: true,
        message: 'Citation dispute has been officially logged for adjudication review.',
        data: ticket
      });
    } catch (err) {
      next(err);
    }
  }

  static async resolveDispute(req, res, next) {
    try {
      const ticket = await TicketService.resolveDispute(req.params.id, req.body, req.user, req);
      return res.json({
        success: true,
        message: `Dispute review concluded with outcome: ${req.body.decision}`,
        data: ticket
      });
    } catch (err) {
      next(err);
    }
  }

  static async voidTicket(req, res, next) {
    try {
      const ticket = await TicketService.voidTicket(req.params.id, req.body.reason, req.user, req);
      return res.json({
        success: true,
        message: `Ticket ${ticket.ticketNumber} has been voided.`,
        data: ticket
      });
    } catch (err) {
      next(err);
    }
  }
}
