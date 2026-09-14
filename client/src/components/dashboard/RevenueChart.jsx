// client/src/components/dashboard/RevenueChart.jsx
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency.js';

export function RevenueChart({ data = [] }) {
  const defaultData = [
    { label: 'Mon', revenue: 1450, citations: 18 },
    { label: 'Tue', revenue: 2100, citations: 26 },
    { label: 'Wed', revenue: 1890, citations: 22 },
    { label: 'Thu', revenue: 2840, citations: 34 },
    { label: 'Fri', revenue: 3400, citations: 41 },
    { label: 'Sat', revenue: 2950, citations: 37 },
    { label: 'Sun', revenue: 1680, citations: 19 }
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Revenue Collections</h3>
          <p className="text-xs text-slate-500">Weekly citation settlement volume</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          ● Live Stream
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value), 'Collections']}
              contentStyle={{
                backgroundColor: '#0F172A',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px'
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2563EB"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RevenueChart;
