
import React, { useMemo } from 'react';
import { Liability, Transaction, TransactionType } from '../types';
import { TransactionItem } from './TransactionItem';
import { BackIcon } from './icons';

interface LiabilityEMIDetailPageProps {
  liability: Liability | undefined;
  allTransactions: Transaction[];
  onBack: () => void; // This will now point to navigateToLiabilityDetails
  onEditEMI: (transaction: Transaction) => void; 
  onDeleteEMI: (transactionId: string, relatedLiabilityId: string, emiAmount: number) => void; 
}

export const LiabilityEMIDetailPage: React.FC<LiabilityEMIDetailPageProps> = ({
  liability,
  allTransactions,
  onBack,
  onEditEMI,
  onDeleteEMI,
}) => {
  const emiTransactions = useMemo(() => {
    if (!liability) return [];
    return allTransactions
      .filter(t => t.type === TransactionType.EXPENSE && t.relatedLiabilityId === liability.id)
      .sort((a, b) => {
        // Primary sort by date (descending)
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        // Secondary sort by createdAt timestamp (descending) for transactions on the same date
        if (a.createdAt && b.createdAt) {
          const createdAtA = typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate() : new Date(a.createdAt);
          const createdAtB = typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate() : new Date(b.createdAt);
          return createdAtB.getTime() - createdAtA.getTime();
        }
        return 0; // Should not happen if createdAt is always present
      });
  }, [allTransactions, liability]);

  if (!liability) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 p-6 flex flex-col items-center justify-center">
        <p className="text-xl text-red-400">Liability data not found.</p>
        <button
          onClick={onBack} 
          className="mt-4 flex items-center space-x-2 text-sky-400 hover:text-sky-300 transition-colors p-2 rounded-md hover:bg-slate-700"
          aria-label="Back"
        >
          <BackIcon className="h-6 w-6" />
          <span className="text-sm sm:text-base">Back</span>
        </button>
      </div>
    );
  }

  const outstandingPrincipal = liability.initialAmount - liability.amountRepaid;
  const totalEMIsPaidAmount = useMemo(() => {
    return emiTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [emiTransactions]);

  const totalInterestPaid = useMemo(() => {
    const interest = totalEMIsPaidAmount - liability.amountRepaid;
    return Math.max(0, interest); 
  }, [totalEMIsPaidAmount, liability.amountRepaid]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 p-2 sm:p-0 md:p-0 selection:bg-sky-400 selection:text-sky-900">
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-30 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 py-2 sm:py-3">
            <div className="flex items-center justify-between h-full px-3 sm:px-4">
                 <div className="flex-none">
                    <button
                        onClick={onBack}
                        className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 p-1.5 sm:p-2 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                        aria-label="Back to Liability Details"
                    >
                        <BackIcon className="h-5 w-5" />
                        <span className="text-xs sm:text-sm font-medium hidden sm:inline">Back</span>
                    </button>
                </div>
                <div className="flex-grow text-center px-2">
                    <h1 className="text-lg sm:text-xl font-semibold text-orange-400 truncate">
                        EMI History: {liability.name || liability.category}
                    </h1>
                </div>
                 <div className="flex-none w-10 sm:w-[70px]"> {/* Adjusted spacer width */}
                </div>
            </div>
        </header>

        <div className="mt-6 p-2 sm:p-4 md:p-6 space-y-6">
            {/* Liability Summary Card */}
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
            <h2 className="text-xl font-semibold text-sky-300 mb-3">Liability Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <p><span className="text-gray-400">Initial Amount:</span> <span className="text-gray-100 font-medium">₹{liability.initialAmount.toFixed(2)}</span></p>
                <p><span className="text-gray-400">Total Principal Repaid:</span> <span className="text-green-400 font-medium">₹{liability.amountRepaid.toFixed(2)}</span></p>
                <p><span className="text-gray-400">Outstanding Principal:</span> <span className="text-orange-400 font-medium">₹{outstandingPrincipal.toFixed(2)}</span></p>
                <p><span className="text-gray-400">Total EMI Payments Made:</span> <span className="text-gray-100 font-medium">₹{totalEMIsPaidAmount.toFixed(2)}</span></p>
                <p><span className="text-gray-400">Total Interest Paid:</span> <span className="text-yellow-400 font-medium">₹{totalInterestPaid.toFixed(2)}</span></p>
                <p><span className="text-gray-400">Category:</span> <span className="text-gray-300">{liability.category}</span></p>
                {liability.emiAmount && <p><span className="text-gray-400">Stated EMI:</span> <span className="text-gray-300">₹{liability.emiAmount.toFixed(2)}</span></p>}
                <p><span className="text-gray-400">Next Due Date:</span> <span className="text-gray-300">{new Date(liability.nextDueDate + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</span></p>
                {liability.interestRate !== undefined && <p><span className="text-gray-400">Interest Rate:</span> <span className="text-gray-300">{liability.interestRate.toFixed(2)}%</span></p>}
            </div>
            {liability.notes && <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-slate-700">Notes: {liability.notes}</p>}
            </div>

            {/* EMI Transaction List */}
            <div className="bg-slate-800 p-3 sm:p-4 md:p-6 rounded-xl shadow-xl border border-slate-700">
            <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-sky-400">Recorded EMI Payments ({emiTransactions.length})</h3>
            {emiTransactions.length === 0 ? (
                <p className="text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base">
                No EMI payments recorded for this liability yet.
                </p>
            ) : (
                <ul className="space-y-2 sm:space-y-3">
                {emiTransactions.map(transaction => (
                    <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={() => onEditEMI(transaction)} 
                    onDelete={() => {
                        onDeleteEMI(transaction.id, liability.id, transaction.amount);
                    }}
                    />
                ))}
                </ul>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};
