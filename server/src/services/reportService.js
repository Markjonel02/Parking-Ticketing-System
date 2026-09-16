// server/src/services/reportService.js
import { Ticket } from '../models/Ticket.js';
import { Payment } from '../models/Payment.js';
import { Violation } from '../models/Violation.js';
import { ParkingZone } from '../models/ParkingZone.js';
import { getPagination } from '../utils/pagination.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export class ReportService {
  static async getDashboardMetrics() {
    const [
      totalTickets,
      paidTickets,
      openTickets,
      overdueTickets,
      disputedTickets,
      revenueAgg,
      outstandingAgg,
      revenueByDay,
      violationBreakdown,
      zoneBreakdown,
    ] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'PAID' }),
      Ticket.countDocuments({ status: { $in: ['ISSUED', 'PENDING'] } }),
      Ticket.countDocuments({ status: 'OVERDUE' }),
      Ticket.countDocuments({ status: 'DISPUTED' }),
      Payment.aggregate([{ $match: { status: 'COMPLETED' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Ticket.aggregate([
        { $match: { status: { $in: ['ISSUED', 'OVERDUE', 'DISPUTED'] } } },
        { $group: { _id: null, total: { $sum: '$totalDue' } } },
      ]),
      this.getRevenueByDay(7),
      this.getViolationBreakdown(),
      this.getZoneBreakdown(),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    const outstandingFines = outstandingAgg[0]?.total || 0;
    const collectionRate = totalTickets > 0 ? Math.round((paidTickets / totalTickets) * 100) : 0;

    return {
      overview: {
        totalTickets,
        paidTickets,
        openTickets,
        overdueTickets,
        disputedTickets,
        totalRevenue,
        outstandingFines,
        collectionRate,
      },
      revenueByDay,
      statusCounts: {
        ISSUED: openTickets,
        PAID: paidTickets,
        OVERDUE: overdueTickets,
        DISPUTED: disputedTickets,
      },
      violationBreakdown,
      zoneBreakdown,
    };
  }

  /** Actual completed-payment totals for each of the last `days` calendar days. */
  static async getRevenueByDay(days = 7) {
    const since = new Date(Date.now() - (days - 1) * DAY_MS);
    since.setHours(0, 0, 0, 0);

    const rows = await Payment.aggregate([
      { $match: { status: 'COMPLETED', transactionDate: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$transactionDate' } },
          revenue: { $sum: '$amount' },
          tickets: { $sum: 1 },
        },
      },
    ]);
    const byDate = new Map(rows.map((r) => [r._id, r]));

    const result = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const date = new Date(since.getTime() + (days - 1 - i) * DAY_MS);
      const key = date.toISOString().slice(0, 10);
      const row = byDate.get(key);
      result.push({
        date: key,
        revenue: row?.revenue || 0,
        tickets: row?.tickets || 0,
      });
    }
    return result;
  }

  static async getViolationBreakdown() {
    const violations = await Violation.find().lean();
    const counts = await Ticket.aggregate([{ $group: { _id: '$violation', count: { $sum: 1 } } }]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    return violations
      .map((v) => {
        const count = countMap.get(String(v._id)) || 0;
        return {
          id: v._id.toString(),
          code: v.code,
          name: v.name,
          count,
          revenue: count * v.baseFine,
        };
      })
      .sort((a, b) => b.count - a.count);
  }

  static async getZoneBreakdown() {
    const zones = await ParkingZone.find().lean();
    const counts = await Ticket.aggregate([{ $group: { _id: '$zone', count: { $sum: 1 } } }]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    return zones.map((z) => ({
      id: z._id.toString(),
      code: z.code,
      name: z.name,
      count: countMap.get(String(z._id)) || 0,
      occupiedSpots: z.occupiedSpots,
      totalSpots: z.totalSpots,
      occupancyRate: z.totalSpots > 0 ? Math.round((z.occupiedSpots / z.totalSpots) * 100) : 0,
    }));
  }

  static async getTicketReports(query = {}) {
    const { page = 1, limit = 20 } = query;
    const filter = {};
    if (query.status) filter.status = query.status;

    const { skip, limit: pageSize, buildMeta } = getPagination(page, limit);

    const [tickets, totalItems, summaryAgg] = await Promise.all([
      Ticket.find(filter).sort({ issuedAt: -1 }).skip(skip).limit(pageSize),
      Ticket.countDocuments(filter),
      Ticket.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            issued: { $sum: { $cond: [{ $eq: ['$status', 'ISSUED'] }, 1, 0] } },
            paid: { $sum: { $cond: [{ $eq: ['$status', 'PAID'] }, 1, 0] } },
            overdue: { $sum: { $cond: [{ $eq: ['$status', 'OVERDUE'] }, 1, 0] } },
            disputed: { $sum: { $cond: [{ $eq: ['$status', 'DISPUTED'] }, 1, 0] } },
            totalFinesAssessed: { $sum: '$baseFine' },
            totalOutstanding: { $sum: '$totalDue' },
          },
        },
      ]),
    ]);

    const { _id, ...summary } = summaryAgg[0] || {
      total: 0,
      issued: 0,
      paid: 0,
      overdue: 0,
      disputed: 0,
      totalFinesAssessed: 0,
      totalOutstanding: 0,
    };

    return { summary, tickets, pagination: buildMeta(totalItems) };
  }

  static async getPaymentReports(query = {}) {
    const { page = 1, limit = 20 } = query;
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;

    const { skip, limit: pageSize, buildMeta } = getPagination(page, limit);

    const [payments, totalItems, totals] = await Promise.all([
      Payment.find(filter).sort({ transactionDate: -1 }).skip(skip).limit(pageSize),
      Payment.countDocuments(filter),
      Payment.aggregate([
        { $match: filter },
        { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$amount' } } },
      ]),
    ]);

    const methodCounts = Object.fromEntries(totals.map((t) => [t._id, t.count]));
    const totalCollected = totals.reduce((sum, t) => sum + t.total, 0);

    return {
      summary: { totalPayments: totalItems, totalCollected, methodCounts },
      payments,
      pagination: buildMeta(totalItems),
    };
  }

  static async getRevenueReports() {
    const zones = await ParkingZone.find().lean();

    const zoneRevenue = await Promise.all(
      zones.map(async (zone) => {
        const ticketsInZone = await Ticket.find({ zone: zone._id }).select('_id').lean();
        const ticketIds = ticketsInZone.map((t) => t._id);
        const agg = await Payment.aggregate([
          { $match: { ticket: { $in: ticketIds }, status: 'COMPLETED' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        return {
          zoneId: zone._id.toString(),
          zoneName: zone.name,
          zoneCode: zone.code,
          ticketsIssued: ticketsInZone.length,
          collectedRevenue: agg[0]?.total || 0,
        };
      }),
    );

    const totalAgg = await Payment.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return {
      totalCollected: totalAgg[0]?.total || 0,
      zoneRevenue,
    };
  }
}

export default ReportService;
