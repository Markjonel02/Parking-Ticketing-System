// server/src/routes/violationRoutes.js
import { Router } from 'express';
import { ViolationController } from '../controllers/violationController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

export const violationRoutes = Router();

violationRoutes.get('/', authenticate, ViolationController.getViolations);
violationRoutes.get('/:id', authenticate, ViolationController.getViolationById);
violationRoutes.post('/', authenticate, requireRoles(ROLES.ADMIN, ROLES.SUPERVISOR), ViolationController.createViolation);
violationRoutes.put('/:id', authenticate, requireRoles(ROLES.ADMIN, ROLES.SUPERVISOR), ViolationController.updateViolation);
