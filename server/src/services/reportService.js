// server/src/services/reportService.js
import { TicketModel } from '../models/Ticket.js';
import { PaymentModel } from '../models/Payment.js';
import { ViolationModel } from '../models/Violation.js';
import { ParkingZoneModel } from '../models/ParkingZone.js';
import { UserModel } from '../models/User.js';

export class ReportService {
  static getDashboardMetrics() {
    const tickets = TicketModel.findAll();
    const payments = PaymentModel.findAll();

    const totalTickets = tickets.length;
    const paidTickets = tickets.filter(t => t.status === 'PAID').length;
    const openTickets = tickets.filter(t => t.status === 'ISSUED' || t.status === 'PENDING').length;
    const overdueTickets = tickets.filter(t => t.status === 'OVERDUE').length;
    const disputedTickets = tickets.filter(t => t.status === 'DISPUTED').length;

    const totalRevenue = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const outstandingFines = tickets
      .filter(t => t.status === 'ISSUED' || t.status === 'OVERDUE' || t.status === 'DISPUTED')
      .reduce((acc, t) => acc + (Number(t.totalDue) || 0), 0);

    const collectionRate = totalTickets > 0 ? Math.round((paidTickets / totalTickets) * 100) : 0;

    // Revenue history (last 7 days or sample days)
    const revenueByDay = [
      { date: 'Mon', revenue: 420, tickets: 6 },
      { date: 'Tue', revenue: 780, tickets: 9 },
      { date: 'Wed', revenue: 540, tickets: 7 },
      { date: 'Thu', revenue: 920, tickets: 12 },
      { date: 'Fri', revenue: 1250, tickets: 16 },
      { date: 'Sat', revenue: 890, tickets: 11 },
      { date: 'Sun', revenue: 350, tickets: 4 }
    ];

    // Status breakdown
    const statusCounts = {
      ISSUED: openTickets,
      PAID: paidTickets,
      OVERDUE: overdueTickets,
      DISPUTED: disputedTickets
    };

    // Top violations
    const violations = ViolationModel.findAll();
    const violationBreakdown = violations.map(v => {
      const count = tickets.filter(t => t.violationId === v.id || t.violationCode === v.code).length;
      return {
        id: v.id,
        code: v.code,
        name: v.name,
        count,
        revenue: count * v.baseFine
      };
    }).sort((a, b) => b.count - a.count);

    // Zone breakdown
    const zones = ParkingZoneModel.findAll();
    const zoneBreakdown = zones.map(z => {
      const count = tickets.filter(t => t.zoneId === z.id).length;
      return {
        id: z.id,
        code: z.code,
        name: z.name,
        count,
        occupiedSpots: z.occupiedSpots,
        totalSpots: z.totalSpots,
        occupancyRate: Math.round((z.occupiedSpots / z.totalSpots) * 100)
      };
    });

    return {
      overview: {
        totalTickets,
        paidTickets,
        openTickets,
        overdueTickets,
        disputedTickets,
        totalRevenue,
        outstandingFines,
        collectionRate
      },
      revenueByDay,
      statusCounts,
      violationBreakdown,
      zoneBreakdown
    };
  }

  static getTicketReports(filter = {}) {
    const tickets = TicketModel.findAll(filter);
    const summary = {
      total: tickets.length,
      issued: tickets.filter(t => t.status === 'ISSUED').length,
      paid: tickets.filter(t => t.status === 'PAID').length,
      overdue: tickets.filter(t => t.status === 'OVERDUE').length,
      disputed: tickets.filter(t => t.status === 'DISPUTED').length,
      totalFinesAssessed: tickets.reduce((s, t) => s + (t.fineAmount || 0), 0),
      totalOutstanding: tickets.reduce((s, t) => s + (t.totalDue || 0), 0)
    };
    return { summary, tickets };
  }

  static getPaymentReports(filter = {}) {
    const payments = PaymentModel.findAll(filter);
    const totalCollected = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const methodCounts = payments.reduce((acc, p) => {
      acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + 1;
      return acc;
    }, {});

    return {
      summary: {
        totalPayments: payments.length,
        totalCollected,
        methodCounts
      },
      payments
    };
  }

  static getRevenueReports() {
    const payments = PaymentModel.findAll();
    const zones = ParkingZoneModel.findAll();

    const zoneRevenue = zones.map(zone => {
      const ticketsInZone = TicketModel.findAll({ zoneId: zone.id });
      const ticketIds = new Set(ticketsInZone.map(t => t.id));
      const zonePayments = payments.filter(p => ticketIds.has(p.ticketId));
      const collected = zonePayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

      return {
        zoneId: zone.id,
        zoneName: zone.name,
        zoneCode: zone.code,
        ticketsIssued: ticketsInZone.length,
        collectedRevenue: collected
      };
    });

    const totalCollected = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    return {
      totalCollected,
      zoneRevenue,
      monthlyProjection: Math.round(totalCollected * 4.2)
    };
  }
}
