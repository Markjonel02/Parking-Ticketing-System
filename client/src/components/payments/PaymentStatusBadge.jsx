// client/src/components/payments/PaymentStatusBadge.jsx
import React from 'react';
import { getBadgeClasses } from '../../theme/index.js';

export function PaymentStatusBadge({ status = 'COMPLETED', size = 'md' }) {
  const schemeMap = {
    COMPLETED: 'teal',
    PENDING: 'yellow',
    FAILED: 'red',
    REFUNDED: 'purple'
  };

  const colorScheme = schemeMap[status] || 'gray';
  const classes = getBadgeClasses({ colorScheme, variant: 'subtle', size });

  return <span className={classes}>{status}</span>;
}

export default PaymentStatusBadge;
