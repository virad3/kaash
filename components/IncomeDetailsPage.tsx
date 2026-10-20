import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { TransactionList } from './TransactionList';
import { PlusIcon } from './icons';
import { PageNavigationDropdown } from './PageNavigationDropdown'; 
import { FilterDropdown } from './FilterDropdown';



interface IncomeDetailsPageProps {
  incomeTransactions: Transaction[];
  onNavigate: (view: import("../types").View) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenNewTransactionForm: (type: TransactionType) => void; 
}

export const IncomeDetailsPage: React.FC<IncomeDetailsPageProps> = ({ 
  incomeTransactions, 
  onNavigate, 
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 selection:bg-sky-400 selection:text-sky-900">
      <header className="sticky top-0 z-30 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 py-2 sm:py-3">
          <div className="flex items-center justify-between h-full px-2 sm:px-4 lg:px-6">
              <div className="flex-none">
                  <PageNavigationDropdown currentView="incomeDetails" onNavigate={onNavigate} />
              </div>
              <div className="flex-grow text-center px-2">
                  <h1 className="text-lg sm:text-xl font-semibold text-green-400 truncate">
                      Income Details
                  </h1>
              </div>
              <div className="flex-none flex items-center">
                  <button
                    onClick={() => onOpenNewTransactionForm(TransactionType.INCOME)}
                    className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-600 text-sky-400 hover:text-sky-300 px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    title="Add Income"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm font-medium">Add</span>
                  </button>
              </div>
          </div>
      </header>

      <div className="mt-6 p-3 sm:p-4 lg:p-6 space-y-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:space-y-0">
        {/* Left Sidebar: Filters and Summary */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          {/* Filters */}
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <div className="flex flex-row gap-3">
              <FilterDropdown
                label="Month"
                allLabel="All Months"
                selectedValue={selectedMonth}
                onSelect={setSelectedMonth}
                options={uniqueMonths.map(month => ({
                  value: month,
                  label: new Date(month + '-02').toLocaleString('default', { month: 'short', year: 'numeric', timeZone: 'UTC' })
                }))}
              />
              <FilterDropdown
                label="Category"
                allLabel="All Categories"
                selectedValue={selectedCategory}
                onSelect={setSelectedCategory}
                options={uniqueCategories.map(category => ({
                  value: category,
                  label: category
                }))}
              />
            </div>
          </div>

          {/* Summary of Filtered Data */}
          {filteredTransactions.length > 0 && (
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-center">
              <p className="text-sm text-gray-400 uppercase tracking-wider">Income Summary</p>
              <p className="text-3xl font-bold text-green-400">₹{totalFilteredIncome.toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Right Main Content: Chart and List */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {incomeTransactions.length === 0 ? (
              <div className="text-center py-10 bg-slate-800 rounded-lg border border-slate-700">
                  <p className="text-xl text-gray-400">No income recorded yet.</p>
                  <p className="text-gray-500 mt-2 mb-4">Click "Add" in the header to get started.</p>
              </div>
          ) : (
              <>
                  {/* Filtered Transaction List */}
                  <TransactionList
                      title="Recent Transactions"
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
  );
};