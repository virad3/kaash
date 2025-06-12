
import React from 'react';
import { Transaction, TransactionType } from '../types'; 
import { TrashIcon, EditIcon } from './icons';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void; 
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onDelete, onEdit }) => {
  const { id, type, description, amount, date, category } = transaction;
  
  let itemColor = '';
  let amountPrefix = '';
  let categoryColor = 'bg-slate-600 text-sky-300'; // Default category color

  switch(type) {
    case TransactionType.INCOME:
      itemColor = 'text-green-400';
      amountPrefix = '+';
      categoryColor = 'bg-green-500/20 text-green-300';
      break;
    case TransactionType.EXPENSE:
      itemColor = 'text-red-400';
      amountPrefix = '-';
      categoryColor = 'bg-red-500/20 text-red-300';
      break;
    case TransactionType.SAVING:
      itemColor = 'text-teal-400';
      amountPrefix = ''; 
      categoryColor = 'bg-teal-500/20 text-teal-300';
      break;
    default:
      itemColor = 'text-gray-400';
  }

  const formattedDate = new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const displayDescription = description || category; // Use category as fallback

  return (
    <li className="flex items-center justify-between p-2.5 sm:p-4 bg-slate-700/50 rounded-lg shadow hover:bg-slate-700 transition-colors duration-150">
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-md font-semibold text-gray-100 truncate">{displayDescription}</p>
        <p className="text-xs text-gray-400 mt-0.5 sm:mt-0">
          {formattedDate}
          {/* Display category only if it's different from the main displayDescription (which happens if description was empty) 
              OR if description itself is present (to always show category if description is there) */}
          {(description && category) || (!description && category) ? (
            <span className={`ml-1.5 sm:ml-2 inline-block ${categoryColor} px-1.5 py-0.5 rounded-full text-[0.65rem] sm:text-xs`}>
              {category}
            </span>
          ) : null}
        </p>
      </div>
      <div className="flex items-center ml-2 sm:ml-4 space-x-1 sm:space-x-2">
        <span className={`text-base sm:text-lg font-bold ${itemColor} mr-1 sm:mr-2`}>
          {amountPrefix} ₹{amount.toFixed(2)}
        </span>
        <button
          onClick={() => onEdit(transaction)}
          className="text-gray-500 hover:text-yellow-400 transition-colors p-1 sm:p-1.5 rounded-full hover:bg-yellow-500/10"
          aria-label="Edit transaction"
          title="Edit Transaction"
        >
          <EditIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          onClick={() => onDelete(id)}
          className="text-gray-500 hover:text-red-500 transition-colors p-1 sm:p-1.5 rounded-full hover:bg-red-500/10"
          aria-label="Delete transaction"
          title="Delete Transaction"
        >
          <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </li>
  );
};