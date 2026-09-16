// server/src/controllers/ticketController.js
import { TicketService } from '../services/ticketService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class TicketController {
  static getTickets = asyncHandler(async (req, res) => {
    const { data, pagination } = await TicketService.getAllTickets(req.query);
    return res.json({ success: true, data, pagination });
  });

  static getTicketById = asyncHandler(async (req, res) => {
    const ticket = await TicketService.resolveTicket(req.params.id);
    if (!ticket) throw ApiError.notFound('Ticket citation not found.');
    return res.json({ success: true, data: ticket });
  });

  static createTicket = asyncHandler(async (req, res) => {
    const ticket = await TicketService.issueTicket(req.body, req.user, req);
    return res.status(201).json({
      success: true,
      message: `Citation ${ticket.ticketNumber} successfully generated.`,
      data: ticket,
    });
  });

  static disputeTicket = asyncHandler(async (req, res) => {
    const ticket = await TicketService.disputeTicket(req.params.id, req.body, req.user, req);
    return res.json({
      success: true,
      message: 'Citation dispute has been officially logged for adjudication review.',
      data: ticket,
    });
  });

  static resolveDispute = asyncHandler(async (req, res) => {
    const ticket = await TicketService.resolveDispute(req.params.id, req.body, req.user, req);
    return res.json({
      success: true,
      message: `Dispute review concluded with outcome: ${req.body.decision}`,
      data: ticket,
    });
  });

  static voidTicket = asyncHandler(async (req, res) => {
    const ticket = await TicketService.voidTicket(req.params.id, req.body.reason, req.user, req);
    return res.json({
      success: true,
      message: `Ticket ${ticket.ticketNumber} has been voided.`,
      data: ticket,
    });
  });
}

export default TicketController;
