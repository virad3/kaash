const fs = require('fs');

const content = `import React from 'react';
import { Liability, Transaction, TransactionType } from '../types';
import { TrashIcon, EditIcon, PaymentIcon } from './icons'; 
import { calculateLoanAmortization, formatMonthsToYearsMonthsString, getEffectiveInterestRate } from '../utils';
import { Landmark, ArrowRight, Home } from 'lucide-react';

interface LiabilityItemProps {
  liability: Liability;
  allTransactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (liability: Liability) => void;
  onRecordPayment: (liability: Liability) => void;
  onUpdateRate: (liability: Liability) => void;
  onViewEMIs?: (liabilityId: string) => void; 
}

export const LiabilityItem: React.FC<LiabilityItemProps> = ({ liability, allTransactions, onDelete, onEdit, onRecordPayment, onUpdateRate, onViewEMIs }) => {
  const { id, name, initialAmount, amountRepaid, category, emiAmount, nextDueDate, interestRate, loanTermInMonths, notes } = liability;
  
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
    remainingTermDisplay = \`\${Math.max(0, calculatedRemainingMonths)} mths\`;
  }

  const effectiveRate = getEffectiveInterestRate(liability, new Date().toISOString().split('T')[0]);

  const currentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <li className="bg-[#0b1021] rounded-2xl p-4 sm:p-5 mb-4 shadow-xl border border-slate-800/60 overflow-hidden relative group">
      {/* Clickable Area */}
      <div 
        className={\`\${onViewEMIs ? 'cursor-pointer' : ''}\`}
        onClick={onViewEMIs ? handleItemClick : undefined}
        onKeyDown={onViewEMIs ? (e) => e.key === 'Enter' && handleItemClick() : undefined}
        role={onViewEMIs ? "button" : undefined}
        tabIndex={onViewEMIs ? 0 : undefined}
        aria-label={onViewEMIs ? \`View EMI history for \${displayName}\` : undefined}
      >
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
                 <div className="bg-[#1c2340] p-3 rounded-2xl border border-slate-700/50 shadow-inner">
                     <Home className="w-6 h-6 text-indigo-400" />
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
        <div className="flex gap-8 border-b border-slate-800 mb-5 px-1">
             <div className="pb-2 border-b-2 border-blue-500 text-sm font-semibold text-slate-100">Overview</div>
             <div className="pb-2 text-sm font-semibold text-slate-500">Outstanding</div>
        </div>

        {/* Grid Data */}
        <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-6 px-1">
             <div>
                  <p className="text-[11px] text-slate-500 mb-1">Liability Name</p>
                  <p className="text-sm font-semibold text-slate-200">{displayName}</p>
             </div>
             <div>
                  <p className="text-[11px] text-slate-500 mb-1 text-right sm:text-left">Rate of interest</p>
                  <p className="text-sm font-semibold text-slate-200 text-right sm:text-left">{effectiveRate !== undefined ? \`\${effectiveRate.toFixed(2)}% p.a.\` : 'N/A'}</p>
             </div>
             <div>
                  <p className="text-[11px] text-slate-500 mb-1">Upcoming EMI</p>
                  <p className="text-sm font-semibold text-slate-200">{emiAmount ? \`₹\${emiAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\` : 'N/A'}</p>
             </div>
             <div>
                  <p className="text-[11px] text-slate-500 mb-1 text-right sm:text-left">Due On</p>
                  <p className={\`text-sm font-semibold \${dueDateColor} text-right sm:text-left\`}>{formattedNextDueDate}</p>
             </div>
        </div>
        
        <div className="text-[10px] text-slate-500 bg-[#12182b] border border-slate-800 p-2 rounded-lg text-center mx-1">
             Note: Outstanding Principal & Principal Paid is shown as on {currentDate}
        </div>
      </div>

      {/* Action buttons footer */}
      <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-800/60 px-1">
          <span className="text-xs text-slate-500">Actions</span>
          <div className="flex gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); onRecordPayment(liability); }}
                className="text-emerald-400 hover:text-emerald-300 p-2 rounded-full hover:bg-emerald-500/10 transition-colors flex justify-center items-center"
                aria-label="Record Payment"
                title="Record Payment"
                disabled={remainingAmount <= 0}
              >
                <PaymentIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onUpdateRate(liability); }}
                className="text-blue-400 hover:text-blue-300 p-2 rounded-full hover:bg-blue-500/10 transition-colors flex justify-center items-center"
                aria-label="Update Interest Rate"
                title="Update Interest Rate"
                disabled={remainingAmount <= 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(liability); }}
                className="text-yellow-400 hover:text-yellow-300 p-2 rounded-full hover:bg-yellow-500/10 transition-colors flex justify-center items-center"
                aria-label="Edit liability"
                title="Edit Liability"
              >
                <EditIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                className="text-slate-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors flex justify-center items-center"
                aria-label="Delete liability"
                title="Delete Liability"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
          </div>
      </div>
    </li>
  );
};
`;

fs.writeFileSync('components/LiabilityItem.tsx', content);
console.log('LiabilityItem.tsx rewritten.');
