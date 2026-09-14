// server/src/routes/parkingRoutes.js
import { Router } from 'express';
import { ParkingZoneModel } from '../models/ParkingZone.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

export const parkingRoutes = Router();

parkingRoutes.get('/zones', authenticate, (req, res) => {
  const zones = ParkingZoneModel.findAll();
  res.json({ success: true, data: zones });
});

parkingRoutes.get('/zones/:id', authenticate, (req, res) => {
  const zone = ParkingZoneModel.findById(req.params.id) || ParkingZoneModel.findByCode(req.params.id);
  if (!zone) {
    return res.status(404).json({ success: false, message: 'Parking zone not found' });
  }
  res.json({ success: true, data: zone });
});

parkingRoutes.post('/zones', authenticate, requireRoles(ROLES.ADMIN), (req, res) => {
  const zone = ParkingZoneModel.create(req.body);
  res.status(201).json({ success: true, message: 'Zone provisioned', data: zone });
});
