
import React, { useMemo } from 'react';
import { Liability, Transaction, TransactionType } from '../types';
import { TransactionItem } from './TransactionItem';
import { TrashIcon, EditIcon, PaymentIcon } from './icons';
import { PageNavigationDropdown } from './PageNavigationDropdown';
import { Landmark, Home, Car, GraduationCap, User, CreditCard, Briefcase, Stethoscope, Calendar, Percent, IndianRupee, PieChart, Activity, Info, ArrowLeft } from 'lucide-react';


interface LiabilityEMIDetailPageProps {
  liability: Liability | undefined;
  allTransactions: Transaction[];
  onNavigate: (view: import("../types").View) => void;
  onEditEMI: (transaction: Transaction) => void; 
  onDeleteEMI: (transactionId: string, relatedLiabilityId: string, emiAmount: number) => void;
  onRecordPayment: (liability: Liability) => void;
  onUpdateRate: (liability: Liability) => void;
  onEditLiability: (liability: Liability) => void;
  onDeleteLiability: (id: string) => void;
}

export const LiabilityEMIDetailPage: React.FC<LiabilityEMIDetailPageProps> = ({
  liability,
  allTransactions,
  onNavigate,
  onEditEMI,
  onDeleteEMI,
  onRecordPayment,
  onUpdateRate,
  onEditLiability,
  onDeleteLiability,
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 p-3 sm:p-4 lg:p-6 flex flex-col items-center justify-center">
        <p className="text-xl text-red-400">Liability data not found.</p>
        <PageNavigationDropdown currentView="liabilityEMIDetail" onNavigate={onNavigate} />
      </div>
    );
  }

  const outstandingPrincipal = liability.initialAmount - liability.amountRepaid;

  const getCategoryIcon = (category: string | undefined) => {
    switch (category) {
      case 'Mortgage/Home Loan': return <Home className="w-8 h-8 text-indigo-400" />;
      case 'Auto Loan': return <Car className="w-8 h-8 text-indigo-400" />;
      case 'Student Loan': return <GraduationCap className="w-8 h-8 text-indigo-400" />;
      case 'Personal Loan': return <User className="w-8 h-8 text-indigo-400" />;
      case 'Credit Card Debt': return <CreditCard className="w-8 h-8 text-indigo-400" />;
      case 'Medical Bill': return <Stethoscope className="w-8 h-8 text-indigo-400" />;
      case 'Business Loan': return <Briefcase className="w-8 h-8 text-indigo-400" />;
      case 'Tax Debt': return <Landmark className="w-8 h-8 text-indigo-400" />;
      default: return <Landmark className="w-8 h-8 text-indigo-400" />;
    }
  };

  const progressPercent = liability.initialAmount > 0 ? (liability.amountRepaid / liability.initialAmount) * 100 : 0;

  const totalEMIsPaidAmount = useMemo(() => {
    return emiTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [emiTransactions]);

  const totalInterestPaid = useMemo(() => {
    const interest = totalEMIsPaidAmount - liability.amountRepaid;
    return Math.max(0, interest); 
  }, [totalEMIsPaidAmount, liability.amountRepaid]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 selection:bg-sky-400 selection:text-sky-900">
      <div> 
        <header className="sticky top-0 z-30 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 py-2 sm:py-3">
            <div className="flex items-center justify-between h-full px-2 sm:px-4 lg:px-6">
                 <div className="flex-none flex items-center gap-2">
                    <button 
                        onClick={() => onNavigate('liabilityDetails')}
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                        title="Back to Liabilities"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <PageNavigationDropdown currentView="liabilityEMIDetail" onNavigate={onNavigate} />
                </div>
                <div className="flex-grow text-center px-2">
                    <h1 className="text-lg sm:text-xl font-semibold text-orange-400 truncate">
                        {liability.name || liability.category} Summary
                    </h1>
                </div>
                 <div className="flex-none w-10 sm:w-[70px]"> 
                </div>
            </div>
        </header>
        <div className="mt-6 p-3 sm:p-4 lg:p-6 space-y-6">
            {/* Liability Summary Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
               {/* Outstanding */}
               <div className="bg-[#12182b] p-4 sm:p-5 rounded-2xl border border-slate-700/50 shadow-inner">
                  <p className="text-slate-400 text-xs sm:text-sm mb-1">Outstanding</p>
                  <p className="text-orange-400 font-bold text-xl sm:text-2xl truncate">₹{outstandingPrincipal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
               </div>
               {/* Repaid */}
               <div className="bg-[#12182b] p-4 sm:p-5 rounded-2xl border border-slate-700/50 shadow-inner">
                  <p className="text-slate-400 text-xs sm:text-sm mb-1">Principal Repaid</p>
                  <p className="text-emerald-400 font-bold text-xl sm:text-2xl truncate">₹{liability.amountRepaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
               </div>
               {/* Interest */}
               <div className="bg-[#12182b] p-4 sm:p-5 rounded-2xl border border-slate-700/50 shadow-inner">
                  <p className="text-slate-400 text-xs sm:text-sm mb-1">Interest Paid</p>
                  <p className="text-yellow-400 font-bold text-xl sm:text-2xl truncate">₹{totalInterestPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
               </div>
               {/* Initial */}
               <div className="bg-[#12182b] p-4 sm:p-5 rounded-2xl border border-slate-700/50 shadow-inner">
                  <p className="text-slate-400 text-xs sm:text-sm mb-1">Initial Amount</p>
                  <p className="text-slate-100 font-bold text-xl sm:text-2xl truncate">₹{liability.initialAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
               </div>
            </div>

            {/* Metadata Tags */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 text-sm">
                 <span className="text-slate-400">Next Due:</span>
                 <span className="font-medium text-slate-100">{new Date(liability.nextDueDate + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
               </div>
               {liability.emiAmount && (
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 text-sm">
                   <span className="text-slate-400">Stated EMI:</span>
                   <span className="font-medium text-slate-100">₹{liability.emiAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                 </div>
               )}
               {liability.interestRate !== undefined && (
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 text-sm">
                   <span className="text-slate-400">Rate:</span>
                   <span className="font-medium text-slate-100">{liability.interestRate.toFixed(2)}%</span>
                 </div>
               )}
            </div>
            
            {liability.notes && (
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-sm">
                    <span className="text-slate-400 block mb-1">Notes:</span>
                    <span className="text-slate-300">{liability.notes}</span>
                </div>
            )}
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-700">
                <button
                  onClick={() => onRecordPayment(liability)}
                  className="flex-1 min-w-[140px] text-emerald-400 hover:text-emerald-300 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors flex justify-center items-center gap-2 text-sm font-medium"
                  disabled={outstandingPrincipal <= 0}
                >
                  <PaymentIcon className="h-5 w-5" /> Record Payment
                </button>
                <button
                  onClick={() => onUpdateRate(liability)}
                  className="flex-1 min-w-[140px] text-blue-400 hover:text-blue-300 px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors flex justify-center items-center gap-2 text-sm font-medium"
                  disabled={outstandingPrincipal <= 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  Update Rate
                </button>
                <button
                  onClick={() => onEditLiability(liability)}
                  className="flex-1 min-w-[140px] text-yellow-400 hover:text-yellow-300 px-4 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors flex justify-center items-center gap-2 text-sm font-medium"
                >
                  <EditIcon className="h-5 w-5" /> Edit Liability
                </button>
                <button
                  onClick={() => {
                    onNavigate('liabilityDetails');
                    onDeleteLiability(liability.id);
                  }}
                  className="flex-1 min-w-[140px] text-red-400 hover:text-red-300 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors flex justify-center items-center gap-2 text-sm font-medium"
                >
                  <TrashIcon className="h-5 w-5" /> Delete
                </button>
            </div>

            {/* EMI Transaction List */}
            <div className="bg-slate-800 p-3 sm:p-4 lg:p-6 rounded-xl shadow-xl border border-slate-700">
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
