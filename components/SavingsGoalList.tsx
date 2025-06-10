
import React from 'react';
import { SavingsGoal } from '../types';
import { SavingsGoalItem } from './SavingsGoalItem';
import { PiggyBankIcon } from './icons';

interface SavingsGoalListProps {
  savingsGoals: SavingsGoal[];
  onDelete: (id: string) => void;
  onEdit: (goal: SavingsGoal) => void;
  onContribute: (goal: SavingsGoal) => void;
  onWithdraw: (goal: SavingsGoal) => void;
}

export const SavingsGoalList: React.FC<SavingsGoalListProps> = ({ savingsGoals, onDelete, onEdit, onContribute, onWithdraw }) => {
  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);

  // Sort by created date, newest first or by progress
   const sortedGoals = [...savingsGoals].sort((a, b) => {
    const progressA = a.targetAmount > 0 ? (a.currentAmount / a.targetAmount) : 0;
    const progressB = b.targetAmount > 0 ? (b.currentAmount / b.targetAmount) : 0;
    if (progressA === 1 && progressB < 1) return 1; // Completed goals at the bottom
    if (progressB === 1 && progressA < 1) return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest first
  });


  return (
    <div className="bg-slate-800 p-3 sm:p-4 md:p-6 rounded-xl shadow-xl border border-slate-700 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 sm:mb-4">
        <div className="flex items-center space-x-1.5 sm:space-x-2 mb-1 sm:mb-0">
            <PiggyBankIcon className="h-6 w-6 sm:h-7 sm:w-7 text-teal-400"/>
            <h3 className="text-xl sm:text-2xl font-semibold text-teal-400">Savings Goals</h3>
        </div>
        {savingsGoals.length > 0 && (
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm text-gray-400">Total Saved</p>
            <p className="text-lg sm:text-xl font-bold text-teal-300">₹{totalSaved.toFixed(2)}</p>
          </div>
        )}
      </div>
      
      {sortedGoals.length === 0 ? (
        <p className="text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base">No savings goals set yet. Start planning for your future!</p>
      ) : (
        <ul className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[20rem] sm:max-h-[25rem] md:max-h-[30rem] pr-1 sm:pr-2"> {/* Adjusted max-h */}
          {sortedGoals.map(goal => (
            <SavingsGoalItem 
              key={goal.id} 
              goal={goal} 
              onDelete={onDelete}
              onEdit={onEdit}
              onContribute={onContribute}
              onWithdraw={onWithdraw}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
