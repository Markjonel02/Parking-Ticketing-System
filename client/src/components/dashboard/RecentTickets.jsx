// client/src/components/dashboard/RecentTickets.jsx
import React from 'react';
import { TicketStatusBadge } from '../tickets/TicketStatusBadge.jsx';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { formatDate } from '../../utils/formatDate.js';
import { ChevronRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext.jsx';

export function RecentTickets({ tickets = [], onSelectTicket }) {
  const { navigateTo } = useAppContext();

  if (!tickets || tickets.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
        No recent citations recorded in system.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recent Citations</h3>
          <p className="text-xs text-slate-500">Live patrol activity stream</p>
        </div>
        <button
          onClick={() => navigateTo('tickets')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {tickets.slice(0, 5).map((t) => (
          <div
            key={t.id}
            onClick={() => onSelectTicket ? onSelectTicket(t) : navigateTo('tickets', { ticketId: t.id })}
            className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Plate Stamp */}
              <div className="px-2.5 py-1 rounded bg-slate-900 text-white font-mono font-bold text-xs tracking-wider border border-slate-800 shrink-0">
                {t.plateNumber}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                  {t.ticketNumber} · <span className="font-medium text-slate-600">{t.violationTitle}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {t.zoneName || 'Zone'} · Issued {formatDate(t.issuedAt, false)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-2">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 block">
                  {formatCurrency(t.totalDue)}
                </span>
                <span className="text-[10px] text-slate-400">Due {formatDate(t.dueDate, false)}</span>
              </div>
              <TicketStatusBadge status={t.status} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentTickets;
