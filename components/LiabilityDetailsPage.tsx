
import React, { useState, useMemo } from 'react';
import { Liability, LiabilityCategory, Transaction, TransactionType } from '../types'; // Added TransactionType
import { LiabilityList } from './LiabilityList'; 
import { BackIcon, PlusIcon } from './icons'; 
import { LIABILITY_CATEGORIES } from '../constants';

interface LiabilityDetailsPageProps {
  liabilities: Liability[];
  allTransactions: Transaction[]; 
  onBack: () => void;
  onEditLiability: (liability: Liability) => void;
  onDeleteLiability: (id: string) => void;
  onRecordPayment: (liability: Liability) => void;
  onViewEMIs?: (liabilityId: string) => void; 
  onOpenNewLiabilityForm: () => void;
}

export const LiabilityDetailsPage: React.FC<LiabilityDetailsPageProps> = ({ 
  liabilities, 
  allTransactions, 
  onBack, 
  onEditLiability, 
  onDeleteLiability, 
  onRecordPayment, 
  onViewEMIs,
  onOpenNewLiabilityForm
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const uniqueCategories = useMemo(() => {
    const categoriesFromLiabilities = new Set<string>();
    liabilities.forEach(l => categoriesFromLiabilities.add(l.category));
    const allUnique = new Set([...LIABILITY_CATEGORIES, ...Array.from(categoriesFromLiabilities)]);
    return Array.from(allUnique).sort();
  }, [liabilities]);

  const filteredLiabilities = useMemo(() => {
    return liabilities.filter(l => {
      const categoryMatch = selectedCategory === 'all' || l.category === selectedCategory;
      return categoryMatch;
    });
  }, [liabilities, selectedCategory]);

  const summaryFigures = useMemo(() => {
    const totalInitialAmount = filteredLiabilities.reduce((sum, l) => sum + l.initialAmount, 0);
    const totalPrincipalRepaid = filteredLiabilities.reduce((sum, l) => sum + l.amountRepaid, 0);
    const totalOutstanding = totalInitialAmount - totalPrincipalRepaid;

    const filteredLiabilityIds = new Set(filteredLiabilities.map(l => l.id));
    const totalEMIsPaid = allTransactions.reduce((sum, t) => {
      if (
        t.type === TransactionType.EXPENSE &&
        t.relatedLiabilityId &&
        filteredLiabilityIds.has(t.relatedLiabilityId)
      ) {
        return sum + t.amount;
      }
      return sum;
    }, 0);

    const totalInterestPaid = Math.max(0, totalEMIsPaid - totalPrincipalRepaid);

    return {
      totalInitialAmount,
      totalPrincipalRepaid,
      totalEMIsPaid,
      totalInterestPaid,
      totalOutstanding,
    };
  }, [filteredLiabilities, allTransactions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 selection:bg-sky-400 selection:text-sky-900">
      <div>
        <header className="sticky top-0 z-30 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 py-2 sm:py-3">
            <div className="flex items-center justify-between h-full px-2 sm:px-4 lg:px-6">
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
                    <h1 className="text-lg sm:text-xl font-semibold text-orange-400 truncate">
                        Liability Details
                    </h1>
                </div>
                 <div className="flex-none w-10 sm:w-[70px]"> 
                </div>
            </div>
        </header>
        <div className="mt-6 p-3 sm:p-4 lg:p-6 space-y-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:space-y-0">
         <p className="text-center text-gray-400 text-sm -mt-2 mb-6 lg:col-span-12">Track and manage your liabilities easily.</p>
          {/* Left Sidebar: Filters and Summary */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-700 space-y-4">
              <h3 className="text-xl font-semibold text-gray-100 mb-4">Filter Options</h3>
              <div>
                <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-200 mb-1.5">Filter by Category:</label>
                <select
                  id="categoryFilter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-700 text-left space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-100 mb-1 sm:mb-2">Liabilities Summary</h3>
              <div>
                <span className="text-xs text-gray-400 block">Total Initial Amount:</span>
                <p className="text-xl sm:text-2xl font-semibold text-gray-200">₹{summaryFigures.totalInitialAmount.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Total Principal Repaid:</span>
                <p className="text-xl sm:text-2xl font-semibold text-green-400">₹{summaryFigures.totalPrincipalRepaid.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Total Interest Paid:</span>
                <p className="text-xl sm:text-2xl font-semibold text-yellow-400">₹{summaryFigures.totalInterestPaid.toFixed(2)}</p>
              </div>
              <div className="pt-1 mt-1 border-t border-slate-700">
                <span className="text-xs text-gray-400 block">Total Outstanding:</span>
                <p className="text-2xl sm:text-3xl font-bold text-orange-400">₹{summaryFigures.totalOutstanding.toFixed(2)}</p>
              </div>
            </div>

            <button
              onClick={onOpenNewLiabilityForm}
              className="w-full px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 flex items-center justify-center gap-2"
              aria-label="Add new liability"
            >
              <PlusIcon className="h-5 w-5" /> Add Liability
            </button>
          </div>

          {/* Right Main Content: Liability List */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {liabilities.length === 0 && filteredLiabilities.length === 0 ? (
                <div className="text-center py-10 bg-slate-800 rounded-lg border border-slate-700">
                    <p className="text-xl text-gray-400">No liabilities recorded yet.</p>
                    <p className="text-gray-500 mt-2 mb-4">Click "Add Liability" in the sidebar to get started.</p>
                </div>
            ) : (
                <LiabilityList
                  liabilities={filteredLiabilities}
                  allTransactions={allTransactions} 
                  onDelete={onDeleteLiability}
                  onEdit={onEditLiability}
                  onRecordPayment={onRecordPayment}
                  onViewEMIs={onViewEMIs}
                />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};