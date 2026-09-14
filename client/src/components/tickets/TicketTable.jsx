// client/src/components/tickets/TicketTable.jsx
import React from 'react';
import { DataTable } from '../common/DataTable.jsx';
import { TicketStatusBadge } from './TicketStatusBadge.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { Eye, CreditCard, ChevronRight } from 'lucide-react';
import { Button } from '../common/Button.jsx';

export function TicketTable({
  tickets = [],
  isLoading = false,
  onSelectTicket,
  onQuickPay,
  onDispute
}) {
  const columns = [
    {
      header: 'Plate & Vehicle',
      key: 'plateNumber',
      render: (t) => (
        <div className="flex items-center gap-2.5">
          <div className="px-2.5 py-1 rounded bg-slate-900 text-white font-mono font-bold text-xs tracking-wider border border-slate-800 shrink-0">
            {t.plateNumber}
          </div>
          <span className="text-xs text-slate-500">{t.state || 'CA'}</span>
        </div>
      )
    },
    {
      header: 'Citation #',
      key: 'ticketNumber',
      render: (t) => (
        <div>
          <span className="font-mono font-semibold text-xs text-blue-700 block">
            {t.ticketNumber}
          </span>
          <span className="text-[11px] text-slate-400">Issued {formatDate(t.issuedAt, false)}</span>
        </div>
      )
    },
    {
      header: 'Infraction & Zone',
      key: 'violationTitle',
      render: (t) => (
        <div>
          <p className="font-medium text-xs text-slate-800">{t.violationTitle}</p>
          <p className="text-[11px] text-slate-500">{t.zoneName} · Code {t.violationCode}</p>
        </div>
      )
    },
    {
      header: 'Enforcement Officer',
      key: 'officerName',
      render: (t) => (
        <div className="text-xs">
          <span className="text-slate-800 font-medium block">{t.officerName}</span>
          <span className="text-[10px] text-slate-400">Badge #{t.officerBadge}</span>
        </div>
      )
    },
    {
      header: 'Amount Due',
      key: 'totalDue',
      align: 'right',
      render: (t) => (
        <div className="text-right">
          <span className="font-bold text-xs text-slate-900 block">{formatCurrency(t.totalDue)}</span>
          {t.lateFee > 0 && (
            <span className="text-[10px] text-red-600 font-medium">+{formatCurrency(t.lateFee)} late</span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      align: 'center',
      render: (t) => <TicketStatusBadge status={t.status} size="sm" />
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (t) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onSelectTicket?.(t)}
            title="View Details"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          {t.status !== 'PAID' && t.status !== 'VOID' && onQuickPay && (
            <Button
              size="xs"
              colorScheme="teal"
              variant="solid"
              onClick={() => onQuickPay?.(t)}
              leftIcon={<CreditCard className="w-3 h-3" />}
            >
              Pay
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={tickets}
      isLoading={isLoading}
      onRowClick={onSelectTicket}
      emptyTitle="No Citations Found"
      emptyDescription="No tickets match the selected filters or search parameters."
    />
  );
}

export default TicketTable;
