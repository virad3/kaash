
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Liability, LiabilityCategory } from '../types';
import { LIABILITY_CATEGORIES } from '../constants';
import { calculateEMI } from '../utils'; 
import { CustomCategorySelect } from './CustomCategorySelect'; // Import the new component

interface LiabilityFormProps {
  onSubmit: (data: Omit<Liability, 'id' | 'amountRepaid' | 'createdAt' | 'name' | 'notes'> & { id?: string; amountRepaid?: number; name?: string; category: string; loanTermInMonths?: number; }) => void;
  onCancel: () => void;
  existingLiability?: Liability | null;

  predefinedLiabilityCategories: string[];
  currentUserDefinedLiabilityCategories: string[];
  onUserAddLiabilityCategory: (categoryName: string) => Promise<void>;
  onUserEditLiabilityCategory: (oldName: string, newName: string) => Promise<void>;
  onUserDeleteLiabilityCategory: (categoryName: string) => Promise<void>;
}

export const LiabilityForm: React.FC<LiabilityFormProps> = ({ 
  onSubmit, 
  onCancel, 
  existingLiability,
  predefinedLiabilityCategories,
  currentUserDefinedLiabilityCategories,
  onUserAddLiabilityCategory,
  onUserEditLiabilityCategory,
  onUserDeleteLiabilityCategory
}) => {
  const [name, setName] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [emiAmount, setEmiAmount] = useState('');
  const [nextDueDate, setNextDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [interestRate, setInterestRate] = useState('');
  const [loanTermInMonths, setLoanTermInMonths] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [categoryModalName, setCategoryModalName] = useState(''); 
  const [editingCategoryOldName, setEditingCategoryOldName] = useState('');

  const allAvailableMergedCategories = useMemo(() => {
    const combined = [
      ...predefinedLiabilityCategories,
      ...currentUserDefinedLiabilityCategories.filter(udc => !predefinedLiabilityCategories.includes(udc))
    ];
    return combined.filter((value, index, self) => self.indexOf(value) === index).sort((a,b)=>a.localeCompare(b));
  }, [predefinedLiabilityCategories, currentUserDefinedLiabilityCategories]);


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
      setSelectedCategory(existingLiability.category);
      setEmiAmount(existingLiability.emiAmount?.toString() || '');
      setNextDueDate(existingLiability.nextDueDate.split('T')[0]);
      setInterestRate(existingLiability.interestRate?.toString() || '');
      setLoanTermInMonths(existingLiability.loanTermInMonths?.toString() || '');

      if (!allAvailableMergedCategories.includes(existingLiability.category) && allAvailableMergedCategories.length > 0) {
        setSelectedCategory(allAvailableMergedCategories[0]);
      } else if (!allAvailableMergedCategories.includes(existingLiability.category) && allAvailableMergedCategories.length === 0){
         setSelectedCategory('');
      }

    } else {
      setName('');
      setInitialAmount('');
      if (currentUserDefinedLiabilityCategories.length > 0) {
        setSelectedCategory(currentUserDefinedLiabilityCategories[0]);
      } else if (predefinedLiabilityCategories.length > 0) {
        setSelectedCategory(predefinedLiabilityCategories[0]);
      } else {
        setSelectedCategory('');
      }
      setEmiAmount('');
      setNextDueDate(new Date().toISOString().split('T')[0]);
      setInterestRate('');
      setLoanTermInMonths('');
    }
  }, [existingLiability, predefinedLiabilityCategories, currentUserDefinedLiabilityCategories, allAvailableMergedCategories]);

   // Effect to reset selectedCategory if it becomes invalid (e.g., deleted)
   useEffect(() => {
    if (selectedCategory && !allAvailableMergedCategories.includes(selectedCategory)) {
        if (currentUserDefinedLiabilityCategories.length > 0) {
            setSelectedCategory(currentUserDefinedLiabilityCategories[0]);
        } else if (predefinedLiabilityCategories.length > 0) {
            setSelectedCategory(predefinedLiabilityCategories[0]);
        } else if (allAvailableMergedCategories.length > 0) {
            setSelectedCategory(allAvailableMergedCategories[0]);
        } else {
            setSelectedCategory('');
        }
    }
  }, [selectedCategory, allAvailableMergedCategories, currentUserDefinedLiabilityCategories, predefinedLiabilityCategories]);


  useEffect(() => {
    if (!existingLiability) {
        autoCalculateEMI();
    }
  }, [initialAmount, interestRate, loanTermInMonths, existingLiability, autoCalculateEMI]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !initialAmount || parseFloat(initialAmount) <= 0 || !nextDueDate) {
      alert('Please fill in Category, Initial Amount, and Next Due Date. Initial Amount must be greater than zero.');
      return;
    }

    onSubmit({
      id: existingLiability?.id,
      name: name.trim() || undefined,
      initialAmount: parseFloat(initialAmount),
      category: selectedCategory,
      amountRepaid: existingLiability?.amountRepaid || 0,
      emiAmount: emiAmount ? parseFloat(emiAmount) : undefined,
      nextDueDate,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
      loanTermInMonths: loanTermInMonths ? parseInt(loanTermInMonths, 10) : undefined,
    });
  };
  
  const handleOpenAddNewModal = () => {
    setCategoryModalName('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (categoryToEdit: string) => {
    setEditingCategoryOldName(categoryToEdit);
    setCategoryModalName(categoryToEdit);
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (categoryToDelete: string) => {
    setEditingCategoryOldName(categoryToDelete);
    setShowDeleteModal(true);
  };

  const handleConfirmAddCategory = async () => {
    const trimmedName = categoryModalName.trim();
    if (!trimmedName) {
      alert("Category name cannot be empty.");
      return;
    }
    if (allAvailableMergedCategories.some(cat => cat.toLowerCase() === trimmedName.toLowerCase())) {
      alert("This category already exists or is a predefined category.");
      return;
    }
    try {
      await onUserAddLiabilityCategory(trimmedName);
      setSelectedCategory(trimmedName);
      setShowAddModal(false);
      setCategoryModalName('');
    } catch (error) {/* Handled in App */}
  };

  const handleConfirmEditCategory = async () => {
    const trimmedNewName = categoryModalName.trim();
    if (!trimmedNewName || !editingCategoryOldName) return;
    if (trimmedNewName.toLowerCase() !== editingCategoryOldName.toLowerCase() &&
        allAvailableMergedCategories.some(cat => cat.toLowerCase() === trimmedNewName.toLowerCase())) {
      alert("Another category with this name already exists or is a predefined category.");
      return;
    }
    try {
      await onUserEditLiabilityCategory(editingCategoryOldName, trimmedNewName);
      if (selectedCategory === editingCategoryOldName) setSelectedCategory(trimmedNewName);
      setShowEditModal(false);
      setCategoryModalName('');
      setEditingCategoryOldName('');
    } catch (error) {/* Handled in App */}
  };

  const handleConfirmDeleteCategory = async () => {
    if (!editingCategoryOldName) return;
    try {
      await onUserDeleteLiabilityCategory(editingCategoryOldName);
      setShowDeleteModal(false);
      setEditingCategoryOldName('');
    } catch (error) {/* Handled in App */}
  };

  const title = existingLiability ? 'Edit Liability' : 'Add New Liability';
  const todayDateString = new Date().toISOString().split('T')[0];

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 p-2 text-gray-100">
        <h2 className="text-2xl font-semibold text-center text-sky-400">{title}</h2>
        
        <CustomCategorySelect
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          predefinedCategories={predefinedLiabilityCategories}
          userDefinedCategories={currentUserDefinedLiabilityCategories}
          onAddNew={handleOpenAddNewModal}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
          categoryTypeLabel="Liability Category*"
        />

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
            max={!existingLiability ? todayDateString : undefined}
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

      {/* Add/Edit/Delete Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-sm border border-slate-700">
            <h3 className="text-xl font-semibold text-sky-400 mb-4">Add New Liability Category</h3>
            <input type="text" value={categoryModalName} onChange={(e) => setCategoryModalName(e.target.value)} placeholder="Enter new category name" className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md p-3 focus:ring-sky-500 focus:border-sky-500 transition mb-4" autoFocus />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700">Cancel</button>
              <button onClick={handleConfirmAddCategory} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg">Add</button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-sm border border-slate-700">
            <h3 className="text-xl font-semibold text-sky-400 mb-4">Edit Liability Category</h3>
            <p className="text-sm text-gray-400 mb-1">Old name: {editingCategoryOldName}</p>
            <input type="text" value={categoryModalName} onChange={(e) => setCategoryModalName(e.target.value)} placeholder="Enter new category name" className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md p-3 focus:ring-sky-500 focus:border-sky-500 transition mb-4" autoFocus />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700">Cancel</button>
              <button onClick={handleConfirmEditCategory} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-sm border border-slate-700">
            <h3 className="text-xl font-semibold text-red-400 mb-4">Delete Liability Category</h3>
            <p className="text-gray-200 mb-4">Delete category: "{editingCategoryOldName}"?</p>
            <p className="text-xs text-gray-400 mb-4">This will not affect existing liabilities.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700">Cancel</button>
              <button onClick={handleConfirmDeleteCategory} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
