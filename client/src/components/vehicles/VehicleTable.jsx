// client/src/components/vehicles/VehicleTable.jsx
import React from 'react';
import { DataTable } from '../common/DataTable.jsx';
import { AlertCircle, Eye, ShieldAlert, Car } from 'lucide-react';
import { Button } from '../common/Button.jsx';

export function VehicleTable({
  vehicles = [],
  isLoading = false,
  onSelectVehicle,
  onIssueCitation
}) {
  const columns = [
    {
      header: 'License Plate',
      key: 'plateNumber',
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded bg-slate-900 text-white font-mono font-bold text-xs tracking-wider border border-slate-800 shrink-0">
            {v.plateNumber}
          </div>
          <span className="text-xs text-slate-500 font-semibold">{v.state || 'CA'}</span>
        </div>
      )
    },
    {
      header: 'Make & Model',
      key: 'make',
      render: (v) => (
        <div>
          <span className="font-semibold text-xs text-slate-800 block">
            {v.year ? `${v.year} ` : ''}{v.make} {v.model}
          </span>
          <span className="text-[11px] text-slate-400">Color: {v.color || 'Unspecified'}</span>
        </div>
      )
    },
    {
      header: 'Registered Owner',
      key: 'ownerName',
      render: (v) => (
        <div>
          <span className="text-xs text-slate-800 font-medium block">{v.ownerName || 'State Registry'}</span>
          <span className="text-[11px] text-slate-400">{v.registeredCity || 'Metropolitan Area'}</span>
        </div>
      )
    },
    {
      header: 'VIN / Registry #',
      key: 'vin',
      render: (v) => (
        <span className="font-mono text-xs text-slate-600">
          {v.vin || 'VIN-ON-FILE'}
        </span>
      )
    },
    {
      header: 'Citation History',
      key: 'ticketCount',
      align: 'center',
      render: (v) => {
        const count = v.tickets?.length || v.ticketCount || 0;
        const hasUnpaid = v.unpaidCount > 0 || count >= 3;
        return (
          <div className="flex items-center justify-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                count === 0
                  ? 'bg-slate-100 text-slate-600'
                  : hasUnpaid
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {count} Citations
            </span>
            {hasUnpaid && (
              <span title="Immobilization / Boot Risk: 3+ Violations">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (v) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onSelectVehicle?.(v)}
            title="View Details"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          {onIssueCitation && (
            <Button
              size="xs"
              variant="outline"
              colorScheme="brand"
              onClick={() => onIssueCitation?.(v)}
            >
              Cite Vehicle
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={vehicles}
      isLoading={isLoading}
      onRowClick={onSelectVehicle}
      emptyTitle="No Vehicles Registered"
      emptyDescription="No vehicles match your query. You may register vehicles or cite unlisted plates."
    />
  );
}

export default VehicleTable;
