
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, ExpenseCategory } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';

interface TransactionFormProps {
  type: TransactionType;
  onSubmit: (data: { 
    id?: string; 
    type: TransactionType; 
    description: string; 
    amount: number; 
    date: string; 
    category?: ExpenseCategory | string; 
  }) => void;
  onCancel: () => void;
  existingTransaction?: Transaction | null;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ type, onSubmit, onCancel, existingTransaction }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory | string>(type === TransactionType.EXPENSE ? EXPENSE_CATEGORIES[0] : '');
  const [customCategory, setCustomCategory] = useState('');

  useEffect(() => {
    if (existingTransaction) {
      setDescription(existingTransaction.description);
      setAmount(existingTransaction.amount.toString());
      setDate(existingTransaction.date.split('T')[0]); // Assuming date is stored as ISO string
      if (existingTransaction.type === TransactionType.EXPENSE) {
        const predefinedCategory = EXPENSE_CATEGORIES.find(cat => cat === existingTransaction.category);
        if (predefinedCategory) {
          setCategory(predefinedCategory);
          setCustomCategory('');
        } else {
          setCategory(ExpenseCategory.OTHER);
          setCustomCategory(existingTransaction.category || '');
        }
      }
    } else {
      // Reset for new transaction, or if type changes while form is open (though not typical for this setup)
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory(type === TransactionType.EXPENSE ? EXPENSE_CATEGORIES[0] : '');
      setCustomCategory('');
    }
  }, [existingTransaction, type]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || parseFloat(amount) <= 0 || !date) {
        alert(`Please fill in all fields correctly for ${type.toLowerCase()}. Amount must be greater than zero.`);
        return;
    }
    
    let finalCategory = category;
    if (type === TransactionType.EXPENSE && category === ExpenseCategory.OTHER) {
        finalCategory = customCategory.trim() || ExpenseCategory.OTHER;
    }

    onSubmit({
      id: existingTransaction?.id, // Include ID if editing
      type,
      description: description.trim(),
      amount: parseFloat(amount),
      date,
      category: type === TransactionType.EXPENSE ? finalCategory : undefined,
    });
  };

  const isEditing = !!existingTransaction;
  const title = isEditing 
    ? (type === TransactionType.INCOME ? 'Edit Income' : 'Edit Expense')
    : (type === TransactionType.INCOME ? 'Add New Income' : 'Add New Expense');
  const buttonText = isEditing ? 'Save Changes' : (type === TransactionType.INCOME ? 'Add Income' : 'Add Expense');
  const amountLabel = type === TransactionType.INCOME ? 'Income Amount' : 'Expense Amount';
  const buttonColor = type === TransactionType.INCOME ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2 text-gray-100">
      <h2 className="text-2xl font-semibold text-center text-sky-400">{title}</h2>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
          placeholder={type === TransactionType.INCOME ? "e.g., Monthly Salary" : "e.g., Groceries"}
          required
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">{amountLabel}</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
          placeholder="0.00"
          min="0.01"
          step="0.01"
          required
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Date</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
          required
        />
      </div>

      {type === TransactionType.EXPENSE && (
        <>
            <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory | string)}
                className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
            >
                {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
            </div>
            {category === ExpenseCategory.OTHER && (
                 <div>
                    <label htmlFor="customCategory" className="block text-sm font-medium text-gray-300 mb-1">Custom Category</label>
                    <input
                        type="text"
                        id="customCategory"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
                        placeholder="Specify other category"
                    />
                </div>
            )}
        </>
      )}

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-6 py-2.5 ${buttonColor} text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-opacity-75 ${type === TransactionType.INCOME ? 'focus:ring-green-400' : 'focus:ring-red-400'}`}
        >
          {buttonText}
        </button>
      </div>
    </form>
  );
};
