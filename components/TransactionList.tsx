
import React from 'react';
import { Transaction, TransactionType } from '../types';
import { TransactionItem } from './TransactionItem';

interface TransactionListProps {
  title: string;
  transactions: Transaction[];
  type?: TransactionType; // Made type optional
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void; 
}

export const TransactionList: React.FC<TransactionListProps> = ({ title, transactions, type, onDelete, onEdit }) => {
  let titleColor = 'text-sky-400'; // Default title color for mixed lists
  if (type) {
    switch(type) {
      case TransactionType.INCOME:
        titleColor = 'text-green-400';
        break;
      case TransactionType.EXPENSE:
        titleColor = 'text-red-400';
        break;
      case TransactionType.SAVING:
        titleColor = 'text-teal-400';
        break;
    }
  }

  return (
    <div className="bg-slate-800 p-3 sm:p-4 md:p-6 rounded-xl shadow-xl border border-slate-700 flex flex-col"> {/* Removed h-full */}
      <h3 className={`text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 ${titleColor}`}>{title}</h3>
      {transactions.length === 0 ? (
        <p className="text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base">No {title.toLowerCase()} recorded yet.</p>
      ) : (
        <ul className="space-y-2 sm:space-y-3 overflow-y-auto max-h-[20rem] sm:max-h-[25rem] md:max-h-[30rem] pr-1 sm:pr-2">
          {/* Sorting is now done in App.tsx for recentTransactions, 
              but keeping it here for dedicated lists if this component is reused elsewhere with unsorted data.
              For recentTransactions, it will be already sorted. */}
          {transactions.map(transaction => (
            <TransactionItem 
              key={transaction.id} 
              transaction={transaction} 
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
