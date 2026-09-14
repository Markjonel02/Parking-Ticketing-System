// client/src/components/payments/PaymentTable.jsx
import React from 'react';
import { DataTable } from '../common/DataTable.jsx';
import { PaymentStatusBadge } from './PaymentStatusBadge.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { Receipt, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button.jsx';

export function PaymentTable({
  payments = [],
  isLoading = false,
  onViewReceipt,
  onSelectPayment
}) {
  const methodIcons = {
    CREDIT_CARD: <CreditCard className="w-3.5 h-3.5 text-blue-600" />,
    DEBIT_CARD: <CreditCard className="w-3.5 h-3.5 text-teal-600" />,
    CASH: <Banknote className="w-3.5 h-3.5 text-emerald-600" />,
    ONLINE_PORTAL: <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
  };

  const columns = [
    {
      header: 'Reference #',
      key: 'referenceNumber',
      render: (p) => (
        <div>
          <span className="font-mono font-bold text-xs text-slate-900 block">{p.referenceNumber}</span>
          <span className="text-[11px] text-slate-400">{formatDate(p.transactionDate)}</span>
        </div>
      )
    },
    {
      header: 'Citation & Plate',
      key: 'ticketNumber',
      render: (p) => (
        <div>
          <span className="font-mono font-semibold text-xs text-blue-700 block">{p.ticketNumber}</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="font-mono text-[10px] bg-slate-900 text-white px-1.5 py-0.2 rounded">
              {p.plateNumber}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Tender Method',
      key: 'paymentMethod',
      render: (p) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          {methodIcons[p.paymentMethod] || <CreditCard className="w-3.5 h-3.5 text-slate-500" />}
          <span>{p.paymentMethod.replace('_', ' ')}</span>
          {p.lastFour && <span className="font-mono text-slate-400">(··{p.lastFour})</span>}
        </div>
      )
    },
    {
      header: 'Settled Amount',
      key: 'amount',
      align: 'right',
      render: (p) => (
        <span className="font-bold text-xs text-emerald-700">
          {formatCurrency(p.amount)}
        </span>
      )
    },
    {
      header: 'Payer / Cashier',
      key: 'paidBy',
      render: (p) => (
        <div className="text-xs">
          <span className="text-slate-800 font-medium block">{p.paidBy || 'Citizen'}</span>
          <span className="text-[10px] text-slate-400">
            {p.cashierName ? `Staff: ${p.cashierName}` : 'Self-service Web Portal'}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      align: 'center',
      render: (p) => <PaymentStatusBadge status={p.status} size="sm" />
    },
    {
      header: 'Receipt',
      key: 'actions',
      align: 'right',
      render: (p) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            size="xs"
            variant="outline"
            colorScheme="gray"
            onClick={() => onViewReceipt?.(p)}
            leftIcon={<Receipt className="w-3 h-3" />}
          >
            Receipt
          </Button>
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={payments}
      isLoading={isLoading}
      onRowClick={onSelectPayment}
      emptyTitle="No Payment Transactions"
      emptyDescription="No payment records match your filters."
    />
  );
}

export default PaymentTable;
