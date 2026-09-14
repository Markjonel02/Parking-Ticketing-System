// client/src/components/dashboard/StatCard.jsx
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function StatCard({
  title,
  value,
  change,
  isIncreasePositive = true,
  icon,
  colorScheme = 'blue', // blue, teal, red, amber, purple
  helperText,
  onClick
}) {
  const iconBgs = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100'
  };

  const isPositive = typeof change === 'number' ? change >= 0 : change?.startsWith('+');

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl bg-white border border-slate-200 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-blue-400 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {icon && (
          <div className={`p-2.5 rounded-lg border ${iconBgs[colorScheme] || iconBgs.blue}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
        {change !== undefined && (
          <span
            className={`inline-flex items-center text-xs font-semibold ${
              (isPositive && isIncreasePositive) || (!isPositive && !isIncreasePositive)
                ? 'text-emerald-600'
                : 'text-red-600'
            }`}
          >
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {change}
          </span>
        )}
      </div>

      {helperText && <p className="mt-2 text-xs text-slate-500 font-normal leading-normal">{helperText}</p>}
    </div>
  );
}

export default StatCard;
