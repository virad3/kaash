
import React, { useMemo } from 'react';
import { Transaction, Liability } from '../types';
import { IncomeSummaryIcon, ExpenseSummaryIcon, PiggyBankIcon, LiabilitySummaryIcon } from './icons'; // Updated imports

interface SummaryDisplayProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  expenseTransactions: Transaction[]; 
  liabilities: Liability[];
  totalSavings: number;
  onNavigateToIncomeDetails: () => void;
  onNavigateToExpenseDetails: () => void; 
  onNavigateToSavingsDetails: () => void; 
  onNavigateToLiabilityDetails: () => void; 
}

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ 
    totalIncome, totalExpenses, balance, expenseTransactions, liabilities, totalSavings, 
    onNavigateToIncomeDetails, onNavigateToExpenseDetails, onNavigateToSavingsDetails, onNavigateToLiabilityDetails 
}) => {

  const totalOutstandingLiabilities = useMemo(() => {
    return liabilities.reduce((sum, l) => sum + (l.initialAmount - l.amountRepaid), 0);
  }, [liabilities]);

  const balanceColor = balance >= 0 ? 'text-green-400' : 'text-red-400';
  const iconSize = "h-5 w-5 sm:h-6 sm:w-6 mr-2";

  return (
    <div className="bg-slate-800 p-3 sm:p-6 rounded-xl shadow-xl border border-slate-700">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-sky-400 text-center">Financial Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <button 
          onClick={onNavigateToIncomeDetails} 
          className="bg-slate-700/50 p-3 sm:p-4 lg:p-5 rounded-lg shadow-md text-center hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 w-full flex flex-col items-center justify-center"
          aria-label="View income details"
        >
          <div className="flex items-center justify-center mb-1 sm:mb-1.5">
            <IncomeSummaryIcon className={`${iconSize} text-green-400`} />
            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Total Income</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-green-400">₹{totalIncome.toFixed(2)}</p>
        </button>
        <button 
          onClick={onNavigateToExpenseDetails}
          className="bg-slate-700/50 p-3 sm:p-4 lg:p-5 rounded-lg shadow-md text-center hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 w-full flex flex-col items-center justify-center"
          aria-label="View expense details"
        >
          <div className="flex items-center justify-center mb-1 sm:mb-1.5">
            <ExpenseSummaryIcon className={`${iconSize} text-red-400`} />
            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Total Expenses</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-red-400">₹{totalExpenses.toFixed(2)}</p>
        </button>
         <button 
            onClick={onNavigateToSavingsDetails}
            className="bg-slate-700/50 p-3 sm:p-4 lg:p-5 rounded-lg shadow-md text-center hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 w-full flex flex-col items-center justify-center"
            aria-label="View savings details"
          >
          <div className="flex items-center justify-center mb-1 sm:mb-1.5">
            <PiggyBankIcon className={`${iconSize} text-teal-400`} />
            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Total Savings</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-teal-400">₹{totalSavings.toFixed(2)}</p>
        </button>
        <button 
            onClick={onNavigateToLiabilityDetails}
            className="bg-slate-700/50 p-3 sm:p-4 lg:p-5 rounded-lg shadow-md text-center hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 w-full flex flex-col items-center justify-center"
            aria-label="View liability details"
        >
          <div className="flex items-center justify-center mb-1 sm:mb-1.5">
            <LiabilitySummaryIcon className={`${iconSize} text-orange-400`} />
            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Outstanding Liabilities</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-orange-400">₹{totalOutstandingLiabilities.toFixed(2)}</p>
        </button>
        <div className="bg-slate-700/50 p-3 sm:p-4 lg:p-6 rounded-lg shadow-md text-center sm:col-span-2 lg:col-span-4 flex flex-col items-center justify-center">
          {/* Net Balance doesn't have a specific icon usually */}
          <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mb-1 sm:mb-1.5">Net Balance</p>
          <p className={`text-2xl sm:text-3xl font-bold ${balanceColor}`}>₹{balance.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};
