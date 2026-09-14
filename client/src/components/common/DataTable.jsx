// client/src/components/common/DataTable.jsx
import React from 'react';
import { Loading } from './Loading.jsx';
import { EmptyState } from './EmptyState.jsx';

export function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items matching the selected criteria.',
  onRowClick,
  keyExtractor = (item, idx) => item.id || idx,
  className = ''
}) {
  if (isLoading) {
    return <Loading label="Loading table records..." />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={`w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold tracking-wide uppercase text-[11px]">
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  scope="col"
                  className={`px-4 py-3.5 whitespace-nowrap ${col.className || ''} ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {data.map((row, rowIdx) => (
              <tr
                key={keyExtractor(row, rowIdx)}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-150 ${
                  onRowClick ? 'cursor-pointer hover:bg-blue-50/40' : 'hover:bg-slate-50/50'
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    className={`px-4 py-3.5 align-middle ${col.className || ''} ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {col.render ? col.render(row, rowIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
