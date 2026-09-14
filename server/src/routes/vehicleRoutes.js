// server/src/routes/vehicleRoutes.js
import { Router } from 'express';
import { VehicleController } from '../controllers/vehicleController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { validateVehicle } from '../validators/vehicleValidator.js';

export const vehicleRoutes = Router();

vehicleRoutes.get('/', authenticate, VehicleController.getVehicles);
vehicleRoutes.get('/:plate', authenticate, VehicleController.getVehicleByPlate);
vehicleRoutes.post('/', authenticate, validateRequest(validateVehicle), VehicleController.registerVehicle);
