// server/src/controllers/vehicleController.js
import { VehicleModel } from '../models/Vehicle.js';
import { TicketModel } from '../models/Ticket.js';
import { paginate } from '../utils/pagination.js';

export class VehicleController {
  static async getVehicles(req, res, next) {
    try {
      const { search, state, page = 1, limit = 10 } = req.query;
      const vehicles = VehicleModel.findAll({ search, state });

      // Enrich with citation count and outstanding fines
      const enriched = vehicles.map(v => {
        const vehicleTickets = TicketModel.findByPlate(v.plateNumber);
        const openTickets = vehicleTickets.filter(t => t.status !== 'PAID' && t.status !== 'VOID');
        const outstandingBalance = openTickets.reduce((s, t) => s + (t.totalDue || 0), 0);
        return {
          ...v,
          ticketCount: vehicleTickets.length,
          openTicketCount: openTickets.length,
          outstandingBalance,
          isBootEligible: openTickets.length >= 3 || outstandingBalance > 300
        };
      });

      const result = paginate(enriched, page, limit);
      return res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  static async getVehicleByPlate(req, res, next) {
    try {
      const plate = req.params.plate.toUpperCase();
      const vehicle = VehicleModel.findByPlate(plate);
      const tickets = TicketModel.findByPlate(plate);
      const openTickets = tickets.filter(t => t.status !== 'PAID' && t.status !== 'VOID');
      const outstandingBalance = openTickets.reduce((s, t) => s + (t.totalDue || 0), 0);

      return res.json({
        success: true,
        data: {
          vehicle: vehicle || { plateNumber: plate, state: 'CA', status: 'UNREGISTERED' },
          tickets,
          stats: {
            totalTickets: tickets.length,
            openTickets: openTickets.length,
            outstandingBalance,
            isBootEligible: openTickets.length >= 3 || outstandingBalance > 300
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async registerVehicle(req, res, next) {
    try {
      const existing = VehicleModel.findByPlate(req.body.plateNumber, req.body.state);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Vehicle with plate ${req.body.plateNumber} (${req.body.state}) already registered in system.`
        });
      }
      const vehicle = VehicleModel.create(req.body);
      return res.status(201).json({
        success: true,
        message: 'Vehicle registration record created',
        data: vehicle
      });
    } catch (err) {
      next(err);
    }
  }
}
