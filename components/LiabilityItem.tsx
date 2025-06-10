
import React from 'react';
import { Liability } from '../types';
import { TrashIcon, EditIcon, PaymentIcon } from './icons'; // Assuming PaymentIcon exists or create one

interface LiabilityItemProps {
  liability: Liability;
  onDelete: (id: string) => void;
  onEdit: (liability: Liability) => void;
  onRecordPayment: (liability: Liability) => void;
}

export const LiabilityItem: React.FC<LiabilityItemProps> = ({ liability, onDelete, onEdit, onRecordPayment }) => {
  const { id, name, initialAmount, amountRepaid, emiAmount, nextDueDate, interestRate, notes } = liability;
  const remainingAmount = initialAmount - amountRepaid;
  const formattedNextDueDate = new Date(nextDueDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); // Add T00:00:00 to avoid timezone issues with date part only

  const isOverdue = new Date(nextDueDate + 'T00:00:00') < new Date(new Date().toDateString()); // Compare date parts only
  const dueDateColor = isOverdue ? 'text-red-400 font-semibold' : 'text-gray-300';
  
  const progressPercent = initialAmount > 0 ? (amountRepaid / initialAmount) * 100 : 0;

  return (
    <li className="p-3 sm:p-4 bg-slate-700/50 rounded-lg shadow hover:bg-slate-700 transition-colors duration-150 space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-base sm:text-lg font-semibold text-sky-300 truncate">{name}</h4>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => onRecordPayment(liability)}
            className="text-emerald-400 hover:text-emerald-300 p-1 sm:p-1.5 rounded-full hover:bg-emerald-500/20 transition-colors"
            aria-label="Record Payment"
            title="Record Payment"
          >
            <PaymentIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={() => onEdit(liability)}
            className="text-yellow-400 hover:text-yellow-300 p-1 sm:p-1.5 rounded-full hover:bg-yellow-500/20 transition-colors"
            aria-label="Edit liability"
            title="Edit Liability"
          >
            <EditIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="text-gray-500 hover:text-red-500 p-1 sm:p-1.5 rounded-full hover:bg-red-500/20 transition-colors"
            aria-label="Delete liability"
            title="Delete Liability"
          >
            <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
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
        {interestRate && (
           <div>
            <span className="text-gray-400">Interest: </span>
            <span className="text-gray-300">{interestRate.toFixed(2)}%</span>
          </div>
        )}
         <div>
          <span className="text-gray-400">Repaid: </span>
          <span className="text-green-400">₹{amountRepaid.toFixed(2)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      {initialAmount > 0 && (
        <div className="mt-1.5 sm:mt-2">
            <div className="h-2 sm:h-2.5 w-full rounded-full bg-slate-600">
                <div 
                    className="h-2 sm:h-2.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" 
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                ></div>
            </div>
            <p className="text-[0.65rem] sm:text-xs text-gray-400 text-right mt-0.5 sm:mt-1">{progressPercent.toFixed(1)}% repaid</p>
        </div>
      )}

      {notes && <p className="text-[0.65rem] sm:text-xs text-gray-400 mt-1 sm:mt-1 pt-1 border-t border-slate-600/50">Notes: {notes}</p>}
    </li>
  );
};
