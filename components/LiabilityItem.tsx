import React, { useState } from 'react';
import { Liability, Transaction, TransactionType } from '../types';
import { TrashIcon, EditIcon, PaymentIcon } from './icons'; 
import { calculateLoanAmortization, formatMonthsToYearsMonthsString, getEffectiveInterestRate } from '../utils';
import { Landmark, ArrowRight, Home, Car, GraduationCap, User, CreditCard, Briefcase, Stethoscope } from 'lucide-react';

interface LiabilityItemProps {
  liability: Liability;
  allTransactions: Transaction[];
  onViewEMIs?: (liabilityId: string) => void; 
}

export const LiabilityItem: React.FC<LiabilityItemProps> = ({ liability, allTransactions, onViewEMIs }) => {
  const { id, name, initialAmount, amountRepaid, category, emiAmount, nextDueDate, interestRate, loanTermInMonths, notes } = liability;
  
  const [activeTab, setActiveTab] = useState<'overview' | 'outstanding'>('overview');

  const remainingAmount = initialAmount - amountRepaid; 
  const formattedNextDueDate = new Date(nextDueDate + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const isOverdue = new Date(nextDueDate + 'T00:00:00Z') < new Date(new Date().toISOString().split('T')[0] + 'T00:00:00Z'); 
  const dueDateColor = isOverdue && remainingAmount > 0 ? 'text-red-400 font-semibold' : 'text-pink-300';  

  const progressPercent = initialAmount > 0 ? (amountRepaid / initialAmount) * 100 : 0;
  const displayName = name || category;

  const handleItemClick = () => {
    if (onViewEMIs) {
      onViewEMIs(id);
    }
  };

  let remainingTermDisplay: string = "N/A";
  if (typeof liability.loanTermInMonths === 'number') {
    const numberOfEMIsPaid = allTransactions.filter(
      t => t.type === TransactionType.EXPENSE && t.relatedLiabilityId === liability.id
    ).length;
    const calculatedRemainingMonths = liability.loanTermInMonths - numberOfEMIsPaid;
    remainingTermDisplay = `${Math.max(0, calculatedRemainingMonths)} mths`;
  }

  const effectiveRate = getEffectiveInterestRate(liability, new Date().toISOString().split('T')[0]);

  const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });


  const getCategoryIcon = (category: string | undefined) => {
    switch (category) {
      case 'Mortgage/Home Loan': return <Home className="w-6 h-6 text-indigo-400" />;
      case 'Auto Loan': return <Car className="w-6 h-6 text-indigo-400" />;
      case 'Student Loan': return <GraduationCap className="w-6 h-6 text-indigo-400" />;
      case 'Personal Loan': return <User className="w-6 h-6 text-indigo-400" />;
      case 'Credit Card Debt': return <CreditCard className="w-6 h-6 text-indigo-400" />;
      case 'Medical Bill': return <Stethoscope className="w-6 h-6 text-indigo-400" />;
      case 'Business Loan': return <Briefcase className="w-6 h-6 text-indigo-400" />;
      case 'Tax Debt': return <Landmark className="w-6 h-6 text-indigo-400" />;
      default: return <Landmark className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (

    <li className="bg-[#0b1021] rounded-2xl p-4 sm:p-5 mb-4 shadow-xl border border-slate-800/60 overflow-hidden relative group">
      {/* Clickable Area */}
      <div 
        className={`${onViewEMIs ? 'cursor-pointer' : ''}`}
        onClick={onViewEMIs ? handleItemClick : undefined}
        onKeyDown={onViewEMIs ? (e) => e.key === 'Enter' && handleItemClick() : undefined}
        role={onViewEMIs ? "button" : undefined}
        tabIndex={onViewEMIs ? 0 : undefined}
        aria-label={onViewEMIs ? `View EMI history for ${displayName}` : undefined}
      >
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
                 <div className="bg-[#1c2340] p-3 rounded-2xl border border-slate-700/50 shadow-inner">
                     {getCategoryIcon(category)}
                 </div>
                 <div>
                     <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-0.5">{category || 'LOAN'}</p>
                     <h3 className="text-2xl font-bold text-slate-100 tracking-tight">₹{remainingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                     {remainingTermDisplay !== "N/A" && (
                        <p className="text-xs text-slate-500 mt-1">Remaining term: {remainingTermDisplay}</p>
                     )}
                 </div>
            </div>
            {onViewEMIs && (
                 <div className="text-slate-400 group-hover:text-white transition-colors pt-2">
                      <ArrowRight className="w-5 h-5" />
                 </div>
            )}
        </div>

        {/* Tabs visual */}
        <div className="flex gap-8 border-b border-slate-800 mb-5 px-1 relative z-10">
             <div 
                className={`pb-2 text-sm font-semibold cursor-pointer transition-colors ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}
                onClick={(e) => { e.stopPropagation(); setActiveTab('overview'); }}
             >
                Overview
             </div>
             <div 
                className={`pb-2 text-sm font-semibold cursor-pointer transition-colors ${activeTab === 'outstanding' ? 'border-b-2 border-blue-500 text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}
                onClick={(e) => { e.stopPropagation(); setActiveTab('outstanding'); }}
             >
                Outstanding
             </div>
        </div>

        {activeTab === 'overview' ? (
            <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-6 px-1">
                <div>
                    <p className="text-[11px] text-slate-500 mb-1">Liability Name</p>
                    <p className="text-sm font-semibold text-slate-200">{displayName}</p>
                </div>
                <div>
                    <p className="text-[11px] text-slate-500 mb-1 text-right sm:text-left">Rate of interest</p>
                    <p className="text-sm font-semibold text-slate-200 text-right sm:text-left">{effectiveRate !== undefined ? `${effectiveRate.toFixed(2)}% p.a.` : 'N/A'}</p>
                </div>
                <div>
                    <p className="text-[11px] text-slate-500 mb-1">Upcoming EMI</p>
                    <p className="text-sm font-semibold text-slate-200">{emiAmount ? `₹${emiAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'N/A'}</p>
                </div>
                <div>
                    <p className="text-[11px] text-slate-500 mb-1 text-right sm:text-left">Due On</p>
                    <p className={`text-sm font-semibold ${dueDateColor} text-right sm:text-left`}>{formattedNextDueDate}</p>
                </div>
            </div>
        ) : (
            <div className="flex flex-col gap-y-5 mb-6 px-1">
                <div>
                    <p className="text-[11px] text-slate-500 mb-1">Outstanding Principal</p>
                    <p className="text-sm font-semibold text-slate-200">₹{remainingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                    <p className="text-[11px] text-slate-500 mb-1">Principal Paid</p>
                    <p className="text-sm font-semibold text-slate-200">₹{amountRepaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ₹{initialAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    
                    {initialAmount > 0 && (
                        <div className="mt-2 w-full sm:w-2/3 lg:w-1/2">
                            <div className="h-1.5 w-full rounded-full bg-slate-700/50 overflow-hidden">
                                <div 
                                    className="h-1.5 rounded-full bg-emerald-400 transition-all duration-500 ease-out" 
                                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
        
        <div className="text-[10px] text-slate-500 bg-[#12182b] border border-slate-800 p-2 rounded-lg text-center mx-1">
             Note: Outstanding Principal & Principal Paid is shown as on {currentDate}
        </div>
      </div>

      </li>
  );
};
