
import React from 'react';
import { Liability } from '../types';
import { LiabilityItem } from './LiabilityItem';

interface LiabilityListProps {
  liabilities: Liability[];
  onDelete: (id: string) => void;
  onEdit: (liability: Liability) => void;
  onRecordPayment: (liability: Liability) => void;
}

export const LiabilityList: React.FC<LiabilityListProps> = ({ liabilities, onDelete, onEdit, onRecordPayment }) => {
  const totalOutstandingLiabilities = liabilities.reduce((sum, l) => sum + (l.initialAmount - l.amountRepaid), 0);

  // Sort by next due date, soonest first
  const sortedLiabilities = [...liabilities].sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  
  return (
    <div className="bg-slate-800 p-3 sm:p-4 md:p-6 rounded-xl shadow-xl border border-slate-700 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 sm:mb-4">
        <h3 className="text-xl sm:text-2xl font-semibold text-sky-400 mb-1 sm:mb-0">Liabilities</h3>
        <div className="flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-0">
          {/* Global "Add EMI / Record" button removed. Per-item action is preferred. */}
          {liabilities.length > 0 && (
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-gray-400">Total Outstanding</p>
              <p className="text-lg sm:text-xl font-bold text-orange-400">₹{totalOutstandingLiabilities.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>
      
      {sortedLiabilities.length === 0 ? (
        <p className="text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base">No liabilities tracked yet. Add one to get started!</p>
      ) : (
        <ul className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[20rem] sm:max-h-[25rem] md:max-h-[30rem] pr-1 sm:pr-2">
          {sortedLiabilities.map(liability => (
            <LiabilityItem 
              key={liability.id} 
              liability={liability} 
              onDelete={onDelete}
              onEdit={onEdit}
              onRecordPayment={onRecordPayment}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
