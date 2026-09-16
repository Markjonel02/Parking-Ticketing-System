// server/src/jobs/overdueTicketsJob.js
import { Ticket } from '../models/Ticket.js';
import { AuditService } from '../services/auditService.js';
import { logger } from '../utils/logger.js';

export async function runOverdueTicketsJob() {
  try {
    const now = new Date();
    const overdueDue = await Ticket.find({ status: 'ISSUED', dueDate: { $lt: now } });

    for (const ticket of overdueDue) {
      const lateFee = ticket.lateFee || 25;
      // eslint-disable-next-line no-await-in-loop
      ticket.status = 'OVERDUE';
      ticket.lateFee = lateFee;
      ticket.totalDue = (ticket.totalDue || ticket.baseFine) + lateFee;
      ticket.overdueAssessedAt = now;
      // eslint-disable-next-line no-await-in-loop
      await ticket.save();

      // eslint-disable-next-line no-await-in-loop
      await AuditService.log({
        user: null,
        action: 'OVERDUE_PENALTY_APPLIED',
        entityType: 'TICKET',
        entityId: ticket._id,
        details: `Ticket ${ticket.ticketNumber} marked OVERDUE. Late penalty of $${lateFee} added. New total: $${ticket.totalDue}.`,
      });
    }

    if (overdueDue.length > 0) {
      logger.info(`OverdueTicketsJob: processed ${overdueDue.length} citation(s) to OVERDUE status.`);
    }
  } catch (err) {
    logger.error('Error executing overdue tickets batch job', err);
  }
}

export function startOverdueTicketsScheduler(intervalMs = 120000) {
  runOverdueTicketsJob();
  return setInterval(runOverdueTicketsJob, intervalMs);
}
