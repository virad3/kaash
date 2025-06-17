
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { TransactionList } from './TransactionList';
import { BackIcon, PlusIcon } from './icons'; 
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface IncomeDetailsPageProps {
  incomeTransactions: Transaction[];
  onBack: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenNewTransactionForm: (type: TransactionType) => void; 
}

const PIE_COLORS = ['#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC0CB', '#A0522D', '#D2691E', '#FFD700'];

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, ...props }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const thresholdPercent = 0.05;

  if (percent < thresholdPercent) {
    return null;
  }
  
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768; // md breakpoint
  const labelText = `${name.substring(0, isMobile ? 4 : 10)}${name.length > (isMobile ? 4 : 10) && !isMobile ? '...' : ''}: ${(percent * 100).toFixed(0)}%`;


  return (
    <text
      x={isMobile ? (cx + (outerRadius + 10) * Math.cos(-midAngle * RADIAN)) : x} 
      y={isMobile ? (cy + (outerRadius + 10) * Math.sin(-midAngle * RADIAN)) : y}
      fill="white"
      textAnchor={isMobile ? ( ( (midAngle > 90 && midAngle < 270) || (midAngle < -90 && midAngle > -270) ) ? 'end' : 'start') : (x > cx ? 'start' : 'end')} 
      dominantBaseline="central"
      fontSize={isMobile ? 10 : 12}
    >
      {labelText}
    </text>
  );
};


export const IncomeDetailsPage: React.FC<IncomeDetailsPageProps> = ({ 
  incomeTransactions, 
  onBack, 
  onEditTransaction, 
  onDeleteTransaction,
  onOpenNewTransactionForm 
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // e.g., "2024-07"
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const uniqueMonths = useMemo(() => {
    const months = new Set<string>();
    incomeTransactions.forEach(t => {
      const monthYear = t.date.substring(0, 7); // YYYY-MM
      months.add(monthYear);
    });
    return Array.from(months).sort((a,b) => b.localeCompare(a)); // Sort descending
  }, [incomeTransactions]);

  const uniqueCategories = useMemo(() => {
    const categoriesFromTransactions = new Set<string>();
    incomeTransactions.forEach(t => categoriesFromTransactions.add(t.category));
    return Array.from(categoriesFromTransactions).sort();
  }, [incomeTransactions]);

  const filteredTransactions = useMemo(() => {
    return incomeTransactions.filter(t => {
      const monthMatch = selectedMonth === 'all' || t.date.startsWith(selectedMonth);
      const categoryMatch = selectedCategory === 'all' || t.category === selectedCategory;
      return monthMatch && categoryMatch;
    });
  }, [incomeTransactions, selectedMonth, selectedCategory]);

  const totalFilteredIncome = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const incomeChartData = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    filteredTransactions.forEach(transaction => {
      if (transaction.type === TransactionType.INCOME && transaction.category) {
        categoryMap[transaction.category] = (categoryMap[transaction.category] || 0) + transaction.amount;
      }
    });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value })).filter(item => item.value > 0);
  }, [filteredTransactions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 selection:bg-sky-400 selection:text-sky-900">
      <header className="sticky top-0 z-30 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 py-2 sm:py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between h-full px-3 sm:px-4">
              <div className="flex-none">
                  <button
                      onClick={onBack}
                      className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 p-1.5 sm:p-2 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                      aria-label="Back to Dashboard"
                  >
                      <BackIcon className="h-5 w-5" />
                      <span className="text-xs sm:text-sm font-medium hidden sm:inline">Back</span>
                  </button>
              </div>
              <div className="flex-grow text-center px-2">
                  <h1 className="text-lg sm:text-xl font-semibold text-green-400 truncate">
                      Income Details
                  </h1>
              </div>
              <div className="flex-none w-10 sm:w-[70px]"> {/* Adjusted spacer width to better match typical back button width with text */}
                {/* Spacer for centering title, width approx matches back button */}
              </div>
          </div>
      </header>

      <div className="max-w-4xl mx-auto">
        {/* Content now starts with mt-0 relative to this container, padding handled below */}
        <div className="mt-6 p-3 sm:p-4 md:p-6 space-y-6 md:grid md:grid-cols-12 md:gap-x-8 md:space-y-0">
          {/* Left Sidebar: Filters and Summary */}
          <div className="md:col-span-4 xl:col-span-3 space-y-6">
            {/* Filters */}
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 space-y-4">
              <h3 className="text-lg font-semibold text-sky-300 mb-3">Filters</h3>
              <div>
                <label htmlFor="monthFilter" className="block text-sm font-medium text-gray-300 mb-1">Filter by Month:</label>
                <select
                  id="monthFilter"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-2.5 focus:ring-sky-500 focus:border-sky-500 transition"
                >
                  <option value="all">All Months</option>
                  {uniqueMonths.map(month => (
                    <option key={month} value={month}>
                      {new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' })} 
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-300 mb-1">Filter by Category:</label>
                <select
                  id="categoryFilter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-2.5 focus:ring-sky-500 focus:border-sky-500 transition"
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary of Filtered Data */}
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-center">
              <p className="text-sm text-gray-400 uppercase tracking-wider">Income Summary</p>
              <p className="text-3xl font-bold text-green-400">₹{totalFilteredIncome.toFixed(2)}</p>
            </div>
            
            {/* Add Income Button */}
            <button
              onClick={() => onOpenNewTransactionForm(TransactionType.INCOME)}
              className="w-full mt-4 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 flex items-center justify-center gap-2"
              aria-label="Add new income"
            >
              <PlusIcon className="h-5 w-5" /> Add Income
            </button>
          </div>

          {/* Right Main Content: Chart and List */}
          <div className="md:col-span-8 xl:col-span-9 space-y-6">
            {incomeTransactions.length === 0 ? (
                <div className="text-center py-10 bg-slate-800 rounded-lg border border-slate-700">
                    <p className="text-xl text-gray-400">No income recorded yet.</p>
                    <p className="text-gray-500 mt-2 mb-4">Click "Add Income" to get started.</p>
                </div>
            ) : (
                <>
                    {/* Income Chart */}
                    {incomeChartData.length > 0 && (
                        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <h2 className="text-xl font-semibold mb-4 text-center text-sky-300">Income by Category</h2>
                        <div style={{ width: '100%', height: 300, minHeight: '250px' }}>
                            <ResponsiveContainer>
                            <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                                <Pie
                                data={incomeChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius="80%"
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={renderPieLabel}
                                >
                                {incomeChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                                <Legend 
                                layout="horizontal" 
                                verticalAlign="bottom" 
                                align="center"
                                wrapperStyle={{fontSize: "10px", paddingTop: "10px", paddingBottom: "0px", lineHeight: "1.2"}}
                                iconSize={8}
                                payload={
                                    incomeChartData.map(
                                        (entry, index) => ({
                                        value: entry.name.length > 12 ? `${entry.name.substring(0,10)}...` : entry.name, 
                                        type: 'circle',
                                        id: entry.name,
                                        color: PIE_COLORS[index % PIE_COLORS.length]
                                        })
                                    )
                                    }
                                />
                            </PieChart>
                            </ResponsiveContainer>
                        </div>
                        </div>
                    )}
                    {incomeChartData.length === 0 && filteredTransactions.length > 0 && (
                        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                            <p className="text-gray-400 text-center text-sm">No income data with categories for the current filter to display chart.</p>
                        </div>
                    )}

                    {/* Filtered Transaction List */}
                    <TransactionList
                        title="Filtered Income Transactions"
                        transactions={filteredTransactions}
                        type={TransactionType.INCOME}
                        onDelete={onDeleteTransaction}
                        onEdit={onEditTransaction}
                    />
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
