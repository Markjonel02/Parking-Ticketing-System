// server/src/routes/parkingRoutes.js
import { Router } from 'express';
import { ParkingZone } from '../models/ParkingZone.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';

export const parkingRoutes = Router();

parkingRoutes.get(
  '/zones',
  authenticate,
  asyncHandler(async (req, res) => {
    const zones = await ParkingZone.find().sort({ name: 1 });
    res.json({ success: true, data: zones });
  }),
);

parkingRoutes.get(
  '/zones/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const zone =
      (await ParkingZone.findById(req.params.id).catch(() => null)) ||
      (await ParkingZone.findOne({ code: req.params.id.toUpperCase() }));
    if (!zone) throw ApiError.notFound('Parking zone not found.');
    res.json({ success: true, data: zone });
  }),
);

parkingRoutes.post(
  '/zones',
  authenticate,
  requireRoles(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const zone = await ParkingZone.create(req.body);
    res.status(201).json({ success: true, message: 'Zone provisioned.', data: zone });
  }),
);
