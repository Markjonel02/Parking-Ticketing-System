// server/src/jobs/overdueTicketsJob.js
import { TicketModel } from '../models/Ticket.js';
import { AuditService } from '../services/auditService.js';
import { logger } from '../utils/logger.js';

export function runOverdueTicketsJob() {
  try {
    const now = new Date();
    const tickets = TicketModel.findAll({ status: 'ISSUED' });
    let updatedCount = 0;

    for (const ticket of tickets) {
      if (ticket.dueDate && new Date(ticket.dueDate) < now) {
        const lateFee = ticket.lateFee || 25;
        const newTotalDue = (ticket.totalDue || ticket.fineAmount) + lateFee;

        TicketModel.update(ticket.id, {
          status: 'OVERDUE',
          totalDue: newTotalDue,
          overdueAssessedAt: now.toISOString()
        });

        AuditService.log({
          user: null,
          action: 'OVERDUE_PENALTY_APPLIED',
          entityType: 'TICKET',
          entityId: ticket.id,
          details: `Ticket ${ticket.ticketNumber} marked OVERDUE. Late penalty of $${lateFee} added. New total: $${newTotalDue}`
        });

        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      logger.info(`OverdueTicketsJob: Processed ${updatedCount} citations to OVERDUE status.`);
    }
  } catch (err) {
    logger.error('Error executing overdue tickets batch job', err);
  }
}

export function startOverdueTicketsScheduler(intervalMs = 60000) {
  // Initial run
  runOverdueTicketsJob();
  const timer = setInterval(runOverdueTicketsJob, intervalMs);
  return timer;
}
