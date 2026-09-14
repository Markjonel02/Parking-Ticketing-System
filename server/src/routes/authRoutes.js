// server/src/routes/authRoutes.js
import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { validateLogin } from '../validators/authValidator.js';

export const authRoutes = Router();

authRoutes.post('/login', validateRequest(validateLogin), AuthController.login);
authRoutes.post('/forgot-password', AuthController.forgotPassword);
authRoutes.get('/me', authenticate, AuthController.getCurrentUser);
authRoutes.post('/logout', authenticate, AuthController.logout);
