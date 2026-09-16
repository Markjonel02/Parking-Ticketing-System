// server/src/routes/paymentRoutes.js
import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { validatePayment } from '../validators/paymentValidator.js';

export const paymentRoutes = Router();

paymentRoutes.get('/', authenticate, PaymentController.getPayments);
paymentRoutes.get('/:id', authenticate, PaymentController.getPaymentById);
paymentRoutes.get('/:id/receipt', authenticate, PaymentController.getReceipt);
paymentRoutes.post('/', authenticate, validateRequest(validatePayment), PaymentController.processPayment);
