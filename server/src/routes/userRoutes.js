// server/src/routes/userRoutes.js
import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { validateUser } from '../validators/userValidator.js';
import { ROLES } from '../constants/roles.js';

export const userRoutes = Router();

userRoutes.get('/', authenticate, UserController.getUsers);
userRoutes.get('/:id', authenticate, UserController.getUserById);
userRoutes.post('/', authenticate, requireRoles(ROLES.ADMIN), validateRequest(validateUser), UserController.createUser);
userRoutes.put('/:id', authenticate, requireRoles(ROLES.ADMIN), UserController.updateUser);
userRoutes.patch('/:id/toggle-status', authenticate, requireRoles(ROLES.ADMIN), UserController.toggleStatus);
