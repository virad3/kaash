import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlySummaryDataPoint {
  month: string;
  income: number;
  expense: number;
  saving: number;
}

interface MonthlySummaryChartProps {
  data: MonthlySummaryDataPoint[];
}

export const MonthlySummaryChart: React.FC<MonthlySummaryChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-xl border border-slate-700 text-center">
        <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-sky-400">Monthly Summary</h3>
        <p className="text-gray-400">Not enough data for the monthly summary chart yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-3 sm:p-4 md:p-6 rounded-xl shadow-xl border border-slate-700">
      <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-sky-400 text-center">Last 3 Months Summary</h3>
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <BarChart 
            data={data} 
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }} // Adjusted left margin for YAxis labels
            barCategoryGap="20%" // Space between groups of bars
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" /> {/* slate-600 */}
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#94a3b8', fontSize: 12 }} // slate-400
              axisLine={{ stroke: '#64748b' }} // slate-500
              tickLine={{ stroke: '#64748b' }}
            />
            <YAxis 
              tick={{ fill: '#94a3b8', fontSize: 12 }} // slate-400
              axisLine={{ stroke: '#64748b' }} // slate-500
              tickLine={{ stroke: '#64748b' }}
              tickFormatter={(value) => `₹${value / 1000}k`} // Format as thousands
              width={50} // Give YAxis some space
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid #475569', borderRadius: '0.5rem', color: '#e2e8f0' }} // slate-800 bg, slate-600 border, slate-200 text
              labelStyle={{ color: '#0ea5e9', fontWeight: 'bold' }} // sky-500 label
              formatter={(value: number, name: string) => [`₹${value.toFixed(2)}`, name.charAt(0).toUpperCase() + name.slice(1)]}
            />
            <Legend 
              wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              formatter={(value) => <span style={{ color: '#cbd5e1' }}>{value.charAt(0).toUpperCase() + value.slice(1)}</span>} // slate-300
            />
            <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} /> {/* green-500 */}
            <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} /> {/* red-500 */}
            <Bar dataKey="saving" fill="#14b8a6" name="Saving" radius={[4, 4, 0, 0]} /> {/* teal-500 */}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};