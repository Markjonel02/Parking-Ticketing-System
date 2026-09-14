// server/src/routes/ticketRoutes.js
import { Router } from 'express';
import { TicketController } from '../controllers/ticketController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { validateCreateTicket, validateDisputeTicket } from '../validators/ticketValidator.js';
import { ROLES } from '../constants/roles.js';

export const ticketRoutes = Router();

// Public / Citizen lookup allowed, staff filtered with auth
ticketRoutes.get('/', authenticate, TicketController.getTickets);
ticketRoutes.get('/:id', authenticate, TicketController.getTicketById);

// Creation by Officers and Admins
ticketRoutes.post(
  '/',
  authenticate,
  requireRoles(ROLES.ADMIN, ROLES.OFFICER, ROLES.SUPERVISOR),
  validateRequest(validateCreateTicket),
  TicketController.createTicket
);

// Disputes can be filed by citizen/public or supervisor
ticketRoutes.post(
  '/:id/dispute',
  authenticate,
  validateRequest(validateDisputeTicket),
  TicketController.disputeTicket
);

// Adjudication resolution by Supervisor or Admin
ticketRoutes.post(
  '/:id/resolve-dispute',
  authenticate,
  requireRoles(ROLES.ADMIN, ROLES.SUPERVISOR),
  TicketController.resolveDispute
);

// Voiding by Supervisor or Admin
ticketRoutes.post(
  '/:id/void',
  authenticate,
  requireRoles(ROLES.ADMIN, ROLES.SUPERVISOR),
  TicketController.voidTicket
);
