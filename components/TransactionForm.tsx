
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, ExpenseCategory, IncomeCategory, SavingCategory } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, SAVING_CATEGORIES } from '../constants';
import { PlusIcon } from './icons';

interface TransactionFormProps {
  type: TransactionType;
  onSubmit: (data: { 
    id?: string; 
    type: TransactionType; 
    description?: string; 
    amount: number; 
    date: string; 
    category: string; 
  }) => void;
  onCancel: () => void;
  existingTransaction?: Transaction | null;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ type, onSubmit, onCancel, existingTransaction }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>('');
  const [customCategory, setCustomCategory] = useState(''); 
  
  const [userDefinedCategories, setUserDefinedCategories] = useState<string[]>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const baseCategories = useMemo(() => {
    switch (type) {
      case TransactionType.INCOME: return INCOME_CATEGORIES.map(String);
      case TransactionType.EXPENSE: return EXPENSE_CATEGORIES.map(String);
      case TransactionType.SAVING: return SAVING_CATEGORIES.map(String);
      default: return [];
    }
  }, [type]);

  const allAvailableCategories = useMemo(() => {
    return [...baseCategories, ...userDefinedCategories.filter(udc => !baseCategories.includes(udc))];
  }, [baseCategories, userDefinedCategories]);
  
  useEffect(() => {
    if (existingTransaction) {
      setDescription(existingTransaction.description || '');
      setAmount(existingTransaction.amount.toString());
      setDate(existingTransaction.date.split('T')[0]);
      
      let predefinedCategoriesForType: string[];
      switch (existingTransaction.type) {
        case TransactionType.INCOME:
          predefinedCategoriesForType = INCOME_CATEGORIES.map(String);
          break;
        case TransactionType.EXPENSE:
          predefinedCategoriesForType = EXPENSE_CATEGORIES.map(String);
          break;
        case TransactionType.SAVING:
          predefinedCategoriesForType = SAVING_CATEGORIES.map(String);
          break;
        default:
          predefinedCategoriesForType = [];
      }

      const storedCategory = existingTransaction.category;

      if (predefinedCategoriesForType.includes(storedCategory)) {
        setCategory(storedCategory);
        setCustomCategory('');
      } else {
        if (existingTransaction.type === TransactionType.EXPENSE) {
          setCategory(ExpenseCategory.OTHER); 
          setCustomCategory(storedCategory);
        } else {
          setCategory(storedCategory);
          setUserDefinedCategories(prev => {
            if (!prev.includes(storedCategory)) {
              return [...prev, storedCategory];
            }
            return prev;
          });
          setCustomCategory('');
        }
      }
    } else { // New transaction
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory(baseCategories.length > 0 ? baseCategories[0] : '');
      setCustomCategory('');
      setUserDefinedCategories([]); 
    }
  }, [existingTransaction, type, baseCategories]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalCategory = category;
    if (type === TransactionType.EXPENSE && category === ExpenseCategory.OTHER) {
        finalCategory = customCategory.trim() || ExpenseCategory.OTHER;
        if (!customCategory.trim()) {
            alert('Please specify a name for the "Other" expense category, or add a new category using the "+" button.');
            return;
        }
    }

    if (!finalCategory || !amount || parseFloat(amount) <= 0 || !date) {
        alert(`Please fill in Amount, Date, and Category. Amount must be greater than zero.`);
        return;
    }
    
    onSubmit({
      id: existingTransaction?.id,
      type,
      description: description.trim() || undefined,
      amount: parseFloat(amount),
      date,
      category: finalCategory,
    });
  };

  const handleAddCategory = () => {
    const trimmedNewCategory = newCategoryName.trim();
    if (!trimmedNewCategory) {
      alert("Category name cannot be empty.");
      return;
    }
    if (allAvailableCategories.some(cat => cat.toLowerCase() === trimmedNewCategory.toLowerCase())) {
      alert("This category already exists.");
      return;
    }
    setUserDefinedCategories(prev => [...prev, trimmedNewCategory]);
    setCategory(trimmedNewCategory);
    setShowAddCategoryModal(false);
    setNewCategoryName('');
  };

  const isEditing = !!existingTransaction;
  
  let title = '';
  let buttonText = '';
  let amountLabel = '';
  let buttonColor = '';
  let categoryLabel = 'Category*';

  switch(type) {
    case TransactionType.INCOME:
      title = isEditing ? 'Edit Income' : 'Add New Income';
      buttonText = isEditing ? 'Save Changes' : 'Add Income';
      amountLabel = 'Income Amount*';
      buttonColor = 'bg-green-500 hover:bg-green-600 focus:ring-green-400';
      categoryLabel = 'Income Category*';
      break;
    case TransactionType.EXPENSE:
      title = isEditing ? 'Edit Expense' : 'Add New Expense';
      buttonText = isEditing ? 'Save Changes' : 'Add Expense';
      amountLabel = 'Expense Amount*';
      buttonColor = 'bg-red-500 hover:bg-red-600 focus:ring-red-400';
      categoryLabel = 'Expense Category*';
      break;
    case TransactionType.SAVING:
      title = isEditing ? 'Edit Saving' : 'Add New Saving';
      buttonText = isEditing ? 'Save Changes' : 'Add Saving';
      amountLabel = 'Saving Amount*';
      buttonColor = 'bg-teal-500 hover:bg-teal-600 focus:ring-teal-400';
      categoryLabel = 'Saving Category*';
      break;
  }


  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 p-2 text-gray-100">
        <h2 className="text-2xl font-semibold text-center text-sky-400">{title}</h2>
        
        { (type === TransactionType.EXPENSE || type === TransactionType.INCOME || type === TransactionType.SAVING) && baseCategories.length > 0 && (
          <>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">{categoryLabel}</label>
                <div className="flex items-center space-x-2">
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="flex-grow w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
                        required 
                    >
                        {allAvailableCategories.map(cat => (
                           <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <button 
                        type="button" 
                        onClick={() => setShowAddCategoryModal(true)}
                        className="p-3 bg-sky-500 hover:bg-sky-600 rounded-md text-white transition-colors"
                        aria-label="Add new category"
                        title="Add new category"
                    >
                        <PlusIcon className="w-5 h-5"/>
                    </button>
                </div>
              </div>
              {type === TransactionType.EXPENSE && category === ExpenseCategory.OTHER && (
                  <div>
                      <label htmlFor="customCategory" className="block text-sm font-medium text-gray-300 mb-1">Custom Category Name*</label>
                      <input
                          type="text"
                          id="customCategory"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
                          placeholder="Specify other category"
                          required={category === ExpenseCategory.OTHER} 
                      />
                  </div>
              )}
          </>
        )}

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
          <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Date*</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description (Optional)</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
            placeholder={
              type === TransactionType.INCOME ? "e.g., Monthly Salary (Optional)" : 
              type === TransactionType.EXPENSE ? "e.g., Groceries (Optional)" :
              "e.g., Monthly Savings Deposit (Optional)"
            }
          />
        </div>

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
            className={`px-6 py-2.5 ${buttonColor} text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-opacity-75`}
          >
            {buttonText}
          </button>
        </div>
      </form>

      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]"> {/* Higher z-index */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-sm border border-slate-700">
            <h3 className="text-xl font-semibold text-sky-400 mb-4">Add New Category</h3>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter new category name"
              className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md p-3 focus:ring-sky-500 focus:border-sky-500 transition mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => { setShowAddCategoryModal(false); setNewCategoryName(''); }}
                className="px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
