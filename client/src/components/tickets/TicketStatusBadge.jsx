// client/src/components/tickets/TicketStatusBadge.jsx
import React from 'react';
import { getBadgeClasses } from '../../theme/index.js';
import { TICKET_STATUS_COLORS } from '../../utils/constants.js';

export function TicketStatusBadge({ status = 'ISSUED', size = 'md' }) {
  const colorScheme = TICKET_STATUS_COLORS[status] || 'gray';
  const classes = getBadgeClasses({ colorScheme, variant: 'subtle', size });

  const labels = {
    ISSUED: 'Active Citation',
    PAID: 'Paid in Full',
    PENDING: 'Pending Processing',
    OVERDUE: 'Late / Overdue',
    DISPUTED: 'Dispute in Review',
    CANCELLED: 'Dismissed',
    VOID: 'Voided'
  };

  return (
    <span className={classes}>
      {labels[status] || status}
    </span>
  );
}

export default TicketStatusBadge;
