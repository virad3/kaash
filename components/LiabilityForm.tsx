
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Liability, LiabilityCategory } from '../types';
import { LIABILITY_CATEGORIES } from '../constants';
import { calculateEMI } from '../utils'; 
import { PlusIcon } from './icons';

interface LiabilityFormProps {
  onSubmit: (data: Omit<Liability, 'id' | 'amountRepaid' | 'createdAt' | 'name' | 'notes'> & { id?: string; amountRepaid?: number; name?: string; category: string; loanTermInMonths?: number; }) => void;
  onCancel: () => void;
  existingLiability?: Liability | null;
}

export const LiabilityForm: React.FC<LiabilityFormProps> = ({ onSubmit, onCancel, existingLiability }) => {
  const [name, setName] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [category, setCategory] = useState<string>(LIABILITY_CATEGORIES[0]);
  const [emiAmount, setEmiAmount] = useState('');
  const [nextDueDate, setNextDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [interestRate, setInterestRate] = useState('');
  const [loanTermInMonths, setLoanTermInMonths] = useState('');

  const [userDefinedLiabilityCategories, setUserDefinedLiabilityCategories] = useState<string[]>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const allAvailableLiabilityCategories = useMemo(() => {
    return [...LIABILITY_CATEGORIES, ...userDefinedLiabilityCategories];
  }, [userDefinedLiabilityCategories]);

  const autoCalculateEMI = useCallback(() => {
    const p = parseFloat(initialAmount);
    const r = parseFloat(interestRate);
    const t = parseInt(loanTermInMonths, 10);

    if (p > 0 && r >= 0 && t > 0 && !existingLiability) { 
      const calculated = calculateEMI(p, r, t);
      if (calculated > 0) {
        setEmiAmount(calculated.toFixed(2));
      }
    }
  }, [initialAmount, interestRate, loanTermInMonths, existingLiability]);

  useEffect(() => {
    if (existingLiability) {
      setName(existingLiability.name || '');
      setInitialAmount(existingLiability.initialAmount.toString());
      // If existing category is not predefined, add it to user-defined and select it
      if (!LIABILITY_CATEGORIES.includes(existingLiability.category as LiabilityCategory)) {
        if (!userDefinedLiabilityCategories.includes(existingLiability.category)) {
          setUserDefinedLiabilityCategories(prev => [...prev, existingLiability.category]);
        }
      }
      setCategory(existingLiability.category);
      setEmiAmount(existingLiability.emiAmount?.toString() || '');
      setNextDueDate(existingLiability.nextDueDate.split('T')[0]);
      setInterestRate(existingLiability.interestRate?.toString() || '');
      setLoanTermInMonths(existingLiability.loanTermInMonths?.toString() || '');
    } else {
      setName('');
      setInitialAmount('');
      setCategory(LIABILITY_CATEGORIES[0]);
      setEmiAmount('');
      setNextDueDate(new Date().toISOString().split('T')[0]);
      setInterestRate('');
      setLoanTermInMonths('');
      setUserDefinedLiabilityCategories([]); // Reset for new forms
    }
  }, [existingLiability]);

  useEffect(() => {
    if (!existingLiability) {
        autoCalculateEMI();
    }
  }, [initialAmount, interestRate, loanTermInMonths, existingLiability, autoCalculateEMI]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !initialAmount || parseFloat(initialAmount) <= 0 || !nextDueDate) {
      alert('Please fill in Category, Initial Amount, and Next Due Date. Initial Amount must be greater than zero.');
      return;
    }

    onSubmit({
      id: existingLiability?.id,
      name: name.trim() || undefined,
      initialAmount: parseFloat(initialAmount),
      category: category,
      amountRepaid: existingLiability?.amountRepaid || 0,
      emiAmount: emiAmount ? parseFloat(emiAmount) : undefined,
      nextDueDate,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
      loanTermInMonths: loanTermInMonths ? parseInt(loanTermInMonths, 10) : undefined,
    });
  };
  
  const handleAddLiabilityCategory = () => {
    const trimmedNewCategory = newCategoryName.trim();
    if (!trimmedNewCategory) {
      alert("Category name cannot be empty.");
      return;
    }
    if (allAvailableLiabilityCategories.some(cat => cat.toLowerCase() === trimmedNewCategory.toLowerCase())) {
      alert("This category already exists.");
      return;
    }
    setUserDefinedLiabilityCategories(prev => [...prev, trimmedNewCategory]);
    setCategory(trimmedNewCategory);
    setShowAddCategoryModal(false);
    setNewCategoryName('');
  };

  const title = existingLiability ? 'Edit Liability' : 'Add New Liability';

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 p-2 text-gray-100">
        <h2 className="text-2xl font-semibold text-center text-sky-400">{title}</h2>
        
        <div>
          <label htmlFor="liabilityCategory" className="block text-sm font-medium text-gray-300 mb-1">Category*</label>
          <div className="flex items-center space-x-2">
            <select
                id="liabilityCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-grow w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
                required 
            >
                {allAvailableLiabilityCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
            <button 
                type="button" 
                onClick={() => setShowAddCategoryModal(true)}
                className="p-3 bg-sky-500 hover:bg-sky-600 rounded-md text-white transition-colors"
                aria-label="Add new liability category"
                title="Add new liability category"
            >
                <PlusIcon className="w-5 h-5"/>
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="liabilityName" className="block text-sm font-medium text-gray-300 mb-1">Liability Name (Optional)</label>
          <input
            type="text"
            id="liabilityName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
            placeholder="e.g., Home Loan (Optional)"
          />
        </div>

        <div>
          <label htmlFor="initialAmount" className="block text-sm font-medium text-gray-300 mb-1">Initial Amount (₹)*</label>
          <input
            type="number"
            id="initialAmount"
            value={initialAmount}
            onChange={(e) => setInitialAmount(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
            placeholder="10000.00"
            min="0.01"
            step="0.01"
            required
            readOnly={!!existingLiability} 
          />
          {existingLiability && <p className="text-xs text-gray-400 mt-1">Initial amount cannot be edited.</p>}
        </div>
        
        <div>
          <label htmlFor="interestRate" className="block text-sm font-medium text-gray-300 mb-1">Annual Interest Rate (%) (Optional)</label>
          <input
            type="number"
            id="interestRate"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
            placeholder="5.5"
            min="0"
            step="0.01"
          />
        </div>
        
        <div>
          <label htmlFor="loanTermInMonths" className="block text-sm font-medium text-gray-300 mb-1">Loan Term (Months) (Optional)</label>
          <input
            type="number"
            id="loanTermInMonths"
            value={loanTermInMonths}
            onChange={(e) => setLoanTermInMonths(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
            placeholder="e.g., 240 for 20 years"
            min="1"
            step="1"
          />
        </div>

        <div>
          <label htmlFor="emiAmount" className="block text-sm font-medium text-gray-300 mb-1">EMI Amount (₹) (Optional)</label>
          <input
            type="number"
            id="emiAmount"
            value={emiAmount}
            onChange={(e) => setEmiAmount(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
            placeholder="Auto-calculated or Manual Entry"
            min="0.01"
            step="0.01"
          />
          <p className="text-xs text-gray-400 mt-1">Automatically calculated if P, R, T are provided for new liabilities. Can be overridden.</p>
        </div>

        <div>
          <label htmlFor="nextDueDate" className="block text-sm font-medium text-gray-300 mb-1">Next Due Date*</label>
          <input
            type="date"
            id="nextDueDate"
            value={nextDueDate}
            onChange={(e) => setNextDueDate(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
            required
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
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
          >
            {existingLiability ? 'Save Changes' : 'Add Liability'}
          </button>
        </div>
      </form>

      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]"> {/* Higher z-index */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-sm border border-slate-700">
            <h3 className="text-xl font-semibold text-sky-400 mb-4">Add New Liability Category</h3>
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
                onClick={handleAddLiabilityCategory}
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
