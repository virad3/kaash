import React from 'react';
import { Liability, Transaction, TransactionType } from '../types'; // Added Transaction, TransactionType
import { TrashIcon, EditIcon, PaymentIcon } from './icons'; 
// calculateRemainingLoanTerm is no longer used here for display
// import { calculateRemainingLoanTerm } from '../utils'; 

interface LiabilityItemProps {
  liability: Liability;
  allTransactions: Transaction[]; // New prop
  onDelete: (id: string) => void;
  onEdit: (liability: Liability) => void;
  onRecordPayment: (liability: Liability) => void;
  onViewEMIs?: (liabilityId: string) => void; 
}

export const LiabilityItem: React.FC<LiabilityItemProps> = ({ liability, allTransactions, onDelete, onEdit, onRecordPayment, onViewEMIs }) => {
  const { id, name, initialAmount, amountRepaid, category, emiAmount, nextDueDate, interestRate, loanTermInMonths, notes } = liability;
  const remainingAmount = initialAmount - amountRepaid; 
  const formattedNextDueDate = new Date(nextDueDate + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

  const isOverdue = new Date(nextDueDate + 'T00:00:00Z') < new Date(new Date().toISOString().split('T')[0] + 'T00:00:00Z'); 
  const dueDateColor = isOverdue && remainingAmount > 0 ? 'text-red-400 font-semibold' : 'text-gray-300';
  
  const progressPercent = initialAmount > 0 ? (amountRepaid / initialAmount) * 100 : 0;
  const displayName = name || category;

  const handleItemClick = () => {
    if (onViewEMIs) {
      onViewEMIs(id);
    }
  };

  // New Remaining Term Calculation
  let remainingTermDisplay: string = "N/A";
  if (typeof liability.loanTermInMonths === 'number') {
    const numberOfEMIsPaid = allTransactions.filter(
      t => t.type === TransactionType.EXPENSE && t.relatedLiabilityId === liability.id
    ).length;
    const calculatedRemainingMonths = liability.loanTermInMonths - numberOfEMIsPaid;
    remainingTermDisplay = `${Math.max(0, calculatedRemainingMonths)} mths`;
  }


  return (
    <li className="p-3 sm:p-4 bg-slate-700/50 rounded-lg shadow hover:bg-slate-700 transition-colors duration-150 group">
      <div className="flex items-start justify-between">
        {/* Make this div clickable */}
        <div 
          className={`flex-grow ${onViewEMIs ? 'cursor-pointer' : ''} space-y-2 sm:space-y-3 mr-2`}
          onClick={onViewEMIs ? handleItemClick : undefined}
          onKeyDown={onViewEMIs ? (e) => e.key === 'Enter' && handleItemClick() : undefined}
          role={onViewEMIs ? "button" : undefined}
          tabIndex={onViewEMIs ? 0 : undefined}
          aria-label={onViewEMIs ? `View EMI history for ${displayName}` : undefined}
        >
          <div className="flex items-start justify-between">
            <div>
                <h4 className="text-base sm:text-lg font-semibold text-sky-300 truncate group-hover:underline">{displayName}</h4>
                {(name && category) ? (
                    <span className="text-[0.65rem] sm:text-xs bg-sky-500/20 text-sky-200 px-1.5 py-0.5 rounded-full mt-0.5 inline-block">
                        {category}
                    </span>
                ) : null }
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-1 sm:gap-y-2 text-xs sm:text-sm">
            <div>
              <span className="text-gray-400">Remaining: </span>
              <span className="font-medium text-orange-400">₹{remainingAmount.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400">Initial: </span>
              <span className="text-gray-300">₹{initialAmount.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400">Next Due: </span>
              <span className={dueDateColor}>{formattedNextDueDate}</span>
            </div>
            {emiAmount && (
              <div>
                <span className="text-gray-400">EMI: </span>
                <span className="text-gray-300">₹{emiAmount.toFixed(2)}</span>
              </div>
            )}
            {interestRate !== undefined && ( 
               <div>
                <span className="text-gray-400">Interest: </span>
                <span className="text-gray-300">{interestRate.toFixed(2)}%</span>
              </div>
            )}
             <div>
              <span className="text-gray-400">Principal Repaid: </span>
              <span className="text-green-400">₹{amountRepaid.toFixed(2)}</span>
            </div>
            {loanTermInMonths !== undefined && (
              <div>
                <span className="text-gray-400">Original Term: </span>
                <span className="text-gray-300">{loanTermInMonths} months</span>
              </div>
            )}
            {remainingAmount > 0 && ( // Only show remaining term if there's an outstanding amount
              <div>
                <span className="text-gray-400">Remaining Term: </span>
                <span className="text-gray-300">{remainingTermDisplay}</span>
              </div>
            )}
          </div>

          {initialAmount > 0 && remainingAmount > 0 && (
            <div className="mt-1.5 sm:mt-2">
                <div className="h-2 sm:h-2.5 w-full rounded-full bg-slate-600">
                    <div 
                        className="h-2 sm:h-2.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300 ease-out" 
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    ></div>
                </div>
                <p className="text-[0.65rem] sm:text-xs text-gray-400 text-right mt-0.5 sm:mt-1">{progressPercent.toFixed(1)}% principal repaid</p>
            </div>
          )}
           {remainingAmount <= 0 && initialAmount > 0 && (
             <p className="text-sm text-green-400 font-semibold text-center mt-2">Liability Cleared!</p>
           )}

          {notes && <p className="text-[0.65rem] sm:text-xs text-gray-400 mt-1 sm:mt-1 pt-1 border-t border-slate-600/50">Notes: {notes}</p>}
        </div>
        
        {/* Action buttons remain separate */}
        <div className="flex flex-col items-center space-y-1 sm:space-y-2 flex-shrink-0">
          <button
            onClick={() => onRecordPayment(liability)}
            className="text-emerald-400 hover:text-emerald-300 p-1.5 sm:p-2 rounded-full hover:bg-emerald-500/20 transition-colors w-full flex justify-center items-center"
            aria-label="Record Payment"
            title="Record Payment"
            disabled={remainingAmount <= 0}
          >
            <PaymentIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onEdit(liability)}
            className="text-yellow-400 hover:text-yellow-300 p-1.5 sm:p-2 rounded-full hover:bg-yellow-500/20 transition-colors w-full flex justify-center items-center"
            aria-label="Edit liability"
            title="Edit Liability"
          >
            <EditIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="text-gray-500 hover:text-red-500 p-1.5 sm:p-2 rounded-full hover:bg-red-500/20 transition-colors w-full flex justify-center items-center"
            aria-label="Delete liability"
            title="Delete Liability"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </li>
  );
};