// server/src/controllers/vehicleController.js
import { Vehicle } from '../models/Vehicle.js';
import { Ticket } from '../models/Ticket.js';
import { getPagination } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function buildFilter({ search, state }) {
  const filter = {};
  if (state) filter.state = state.toUpperCase();
  if (search) filter.$text = { $search: search };
  return filter;
}

async function enrichVehicle(vehicle) {
  const tickets = await Ticket.find({ plateNumber: vehicle.plateNumber }).select('status totalDue');
  const openTickets = tickets.filter((t) => !['PAID', 'VOID'].includes(t.status));
  const outstandingBalance = openTickets.reduce((sum, t) => sum + (t.totalDue || 0), 0);

  return {
    ...vehicle.toJSON(),
    ticketCount: tickets.length,
    openTicketCount: openTickets.length,
    outstandingBalance,
    isBootEligible: openTickets.length >= 3 || outstandingBalance > 300,
  };
}

export class VehicleController {
  static getVehicles = asyncHandler(async (req, res) => {
    const { search, state, page = 1, limit = 10 } = req.query;
    const filter = buildFilter({ search, state });
    const { skip, limit: pageSize, buildMeta } = getPagination(page, limit);

    const [vehicles, totalItems] = await Promise.all([
      Vehicle.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      Vehicle.countDocuments(filter),
    ]);

    const enriched = await Promise.all(vehicles.map(enrichVehicle));

    return res.json({ success: true, data: enriched, pagination: buildMeta(totalItems) });
  });

  static getVehicleByPlate = asyncHandler(async (req, res) => {
    const plate = req.params.plate.toUpperCase();
    const vehicle = await Vehicle.findOne({ plateNumber: plate });
    const tickets = await Ticket.find({ plateNumber: plate }).sort({ issuedAt: -1 });
    const openTickets = tickets.filter((t) => !['PAID', 'VOID'].includes(t.status));
    const outstandingBalance = openTickets.reduce((sum, t) => sum + (t.totalDue || 0), 0);

    return res.json({
      success: true,
      data: {
        vehicle: vehicle ? vehicle.toJSON() : { plateNumber: plate, status: 'UNREGISTERED' },
        tickets,
        stats: {
          totalTickets: tickets.length,
          openTickets: openTickets.length,
          outstandingBalance,
          isBootEligible: openTickets.length >= 3 || outstandingBalance > 300,
        },
      },
    });
  });

  static registerVehicle = asyncHandler(async (req, res) => {
    const plate = req.body.plateNumber.trim().toUpperCase();
    const state = req.body.state.trim().toUpperCase();

    const existing = await Vehicle.findOne({ plateNumber: plate, state });
    if (existing) {
      throw ApiError.conflict(`Vehicle with plate ${plate} (${state}) is already registered.`);
    }

    const vehicle = await Vehicle.create({ ...req.body, plateNumber: plate, state });

    return res.status(201).json({
      success: true,
      message: 'Vehicle registration record created.',
      data: vehicle,
    });
  });
}

export default VehicleController;
