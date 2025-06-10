
import React from 'react';
import { SavingsGoal } from '../types';
import { TrashIcon, EditIcon, CoinsIcon } from './icons'; // Assuming CoinsIcon is for contribute/withdraw

interface SavingsGoalItemProps {
  goal: SavingsGoal;
  onDelete: (id: string) => void;
  onEdit: (goal: SavingsGoal) => void;
  onContribute: (goal: SavingsGoal) => void;
  onWithdraw: (goal: SavingsGoal) => void;
}

export const SavingsGoalItem: React.FC<SavingsGoalItemProps> = ({ goal, onDelete, onEdit, onContribute, onWithdraw }) => {
  const { id, name, currentAmount, targetAmount } = goal;
  const progressPercent = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const isCompleted = currentAmount >= targetAmount;

  return (
    <li className={`p-3 sm:p-4 bg-slate-700/50 rounded-lg shadow hover:bg-slate-700 transition-colors duration-150 space-y-2 sm:space-y-3 ${isCompleted ? 'border-l-4 border-green-500' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
            <h4 className="text-base sm:text-lg font-semibold text-teal-300 truncate">{name}</h4>
            {isCompleted && <span className="text-xs bg-green-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full ml-2">Completed!</span>}
        </div>
        <div className="flex items-center space-x-0.5 sm:space-x-1 flex-shrink-0">
          <button
            onClick={() => onContribute(goal)}
            className="text-green-400 hover:text-green-300 p-1 sm:p-1.5 rounded-full hover:bg-green-500/20 transition-colors"
            aria-label="Contribute to goal"
            title="Contribute"
            disabled={isCompleted}
          >
            <CoinsIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={() => onWithdraw(goal)}
            className="text-orange-400 hover:text-orange-300 p-1 sm:p-1.5 rounded-full hover:bg-orange-500/20 transition-colors"
            aria-label="Withdraw from goal"
            title="Withdraw"
            disabled={currentAmount === 0}
          >
            {/* Using CoinsIcon, but could be specific withdraw icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 sm:h-5 sm:w-5 transform rotate-180">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0V4.5m0 15V4.5m7.5 7.5H4.5m0 0H20" />
               <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6A2.25 2.25 0 00.75 8.25v7.5A2.25 2.25 0 003 18v.75m0-13.5h.008v.008H3.75v-.008zm0 0h.008v.008H3.75v-.008zm-.375 0h.008v.008h-.008V4.5zM12 12.75h.008v.008H12v-.008zm0 0h.008v.008H12v-.008zm-.375 0h.008v.008h-.008v-.008zm0 0h.008v.008H12v-.008zm2.625-3h.008v.008h-.008v-.008zm0 0h.008v.008h-.008V9.75zm.375 0h.008v.008h-.008V9.75zm0 0h.008v.008H15V9.75z" />
            </svg>
          </button>
          <button
            onClick={() => onEdit(goal)}
            className="text-yellow-400 hover:text-yellow-300 p-1 sm:p-1.5 rounded-full hover:bg-yellow-500/20 transition-colors"
            aria-label="Edit goal"
            title="Edit Goal"
          >
            <EditIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="text-gray-500 hover:text-red-500 p-1 sm:p-1.5 rounded-full hover:bg-red-500/20 transition-colors"
            aria-label="Delete goal"
            title="Delete Goal"
          >
            <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>

      <div className="text-xs sm:text-sm">
        <span className="font-medium text-gray-100">₹{currentAmount.toFixed(2)}</span>
        <span className="text-gray-400"> / ₹{targetAmount.toFixed(2)}</span>
      </div>

      {/* Progress Bar */}
      <div className="mt-1 sm:mt-1">
          <div className="h-2.5 sm:h-3 w-full rounded-full bg-slate-600 overflow-hidden">
              <div 
                  className={`h-2.5 sm:h-3 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-teal-500 to-cyan-400'} transition-all duration-300 ease-in-out`}
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
              ></div>
          </div>
          <p className="text-[0.65rem] sm:text-xs text-gray-400 text-right mt-0.5 sm:mt-1">{progressPercent.toFixed(1)}% {isCompleted ? 'Complete' : 'Funded'}</p>
      </div>
    </li>
  );
};
