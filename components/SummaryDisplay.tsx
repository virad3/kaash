
import React, { useMemo } from 'react';
import { Transaction, ExpenseCategory, TransactionType, Liability } from '../types'; // Removed SavingsGoal
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SummaryDisplayProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  expenseTransactions: Transaction[];
  liabilities: Liability[];
  totalSavings: number; // Added totalSavings from SAVING type transactions
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC0CB', '#A0522D', '#D2691E', '#FFD700', '#4CAF50', '#FF9800'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, x, y, ...props }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const labelX = cx + radius * Math.cos(-midAngle * RADIAN);
  const labelY = cy + radius * Math.sin(-midAngle * RADIAN);
  const thresholdPercent = 0.05; 

  if (percent < thresholdPercent) {
    return null; 
  }
  
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <text 
      x={isMobile ? (cx + (outerRadius + 10) * Math.cos(-midAngle * RADIAN)) : labelX} 
      y={isMobile ? (cy + (outerRadius + 10) * Math.sin(-midAngle * RADIAN)) : labelY}
      fill="white" 
      textAnchor={isMobile ? ( ( (midAngle > 90 && midAngle < 270) || (midAngle < -90 && midAngle > -270) ) ? 'end' : 'start') : (x > cx ? 'start' : 'end')} 
      dominantBaseline="central"
      fontSize={isMobile ? 10 : 12}
    >
      {`${name.substring(0, isMobile ? 3 : 10)}${name.length > (isMobile ? 3 : 10) && !isMobile ? '...' : ''}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ totalIncome, totalExpenses, balance, expenseTransactions, liabilities, totalSavings }) => {
  const expenseDataByCategory = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    expenseTransactions.forEach(transaction => {
      if (transaction.type === TransactionType.EXPENSE && transaction.category) {
        const categoryKey = transaction.category as ExpenseCategory | string;
        categoryMap[categoryKey] = (categoryMap[categoryKey] || 0) + transaction.amount;
      }
    });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [expenseTransactions]);

  const totalOutstandingLiabilities = useMemo(() => {
    return liabilities.reduce((sum, l) => sum + (l.initialAmount - l.amountRepaid), 0);
  }, [liabilities]);

  // totalCurrentSavings from savingsGoals is removed, totalSavings prop is used directly.

  const balanceColor = balance >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-slate-800 p-3 sm:p-6 rounded-xl shadow-xl border border-slate-700">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-sky-400 text-center">Financial Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <div className="bg-slate-700/50 p-3 sm:p-4 lg:p-6 rounded-lg shadow-md text-center">
          <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Total Income</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-400">₹{totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-slate-700/50 p-3 sm:p-4 lg:p-6 rounded-lg shadow-md text-center">
          <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Total Expenses</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-400">₹{totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-slate-700/50 p-3 sm:p-4 lg:p-6 rounded-lg shadow-md text-center">
          <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Net Balance</p>
          <p className={`text-2xl sm:text-3xl font-bold ${balanceColor}`}>₹{balance.toFixed(2)}</p>
        </div>
         <div className="bg-slate-700/50 p-3 sm:p-4 lg:p-6 rounded-lg shadow-md text-center">
          <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Total Savings</p>
          <p className="text-2xl sm:text-3xl font-bold text-teal-400">₹{totalSavings.toFixed(2)}</p>
        </div>
        <div className="bg-slate-700/50 p-3 sm:p-4 lg:p-6 rounded-lg shadow-md text-center sm:col-span-2 lg:col-span-1 xl:col-span-2">
          <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Outstanding Liabilities</p>
          <p className="text-2xl sm:text-3xl font-bold text-orange-400">₹{totalOutstandingLiabilities.toFixed(2)}</p>
        </div>
      </div>

      {expenseDataByCategory.length > 0 && (
         <div className="mt-6 sm:mt-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center text-sky-300">Expense Breakdown</h3>
            <div style={{ width: '100%', height: 300, minHeight: '250px' }}> 
                <ResponsiveContainer>
                    <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                        <Pie
                            data={expenseDataByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius="80%" 
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={renderCustomizedLabel}
                        >
                        {expenseDataByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                            expenseDataByCategory.map(
                              (entry, index) => ({
                                value: entry.name.length > 12 ? `${entry.name.substring(0,10)}...` : entry.name, 
                                type: 'circle',
                                id: entry.name,
                                color: COLORS[index % COLORS.length]
                              })
                            )
                          }
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      )}
       {expenseDataByCategory.length === 0 && expenseTransactions.length > 0 && (
         <p className="text-gray-400 text-center mt-4 text-sm">Add categories to your expenses to see a breakdown chart.</p>
       )}
    </div>
  );
};