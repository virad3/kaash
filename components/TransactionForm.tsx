
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, IncomeCategory, ExpenseCategory, SavingCategory } from '../types';
import { CustomCategorySelect } from './CustomCategorySelect'; // Import the new component
// PlusIcon is used internally by CustomCategorySelect, no longer needed directly here for category button

interface TransactionFormProps {
  type: TransactionType;
  onSubmit: (data: { 
    id?: string; 
    type: TransactionType; 
    description?: string; 
    amount: number; 
    date: string; 
    category: string; 
    relatedLiabilityId?: string;
  }) => void;
  onCancel: () => void;
  existingTransaction?: Transaction | null;
  amountFromScan?: number | null;
  
  predefinedCategories: string[]; // Generic predefined categories for the current type
  currentUserDefinedCategories: string[]; // User-defined categories for the current type
  
  // Generic handlers, App.tsx will map these to type-specific functions
  onUserAddCategory: (categoryName: string) => Promise<void>; 
  onUserEditCategory: (oldName: string, newName: string) => Promise<void>; 
  onUserDeleteCategory: (categoryName: string) => Promise<void>; 
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ 
  type, 
  onSubmit, 
  onCancel, 
  existingTransaction, 
  amountFromScan,
  predefinedCategories,
  currentUserDefinedCategories,
  onUserAddCategory, 
  onUserEditCategory, 
  onUserDeleteCategory 
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [categoryModalName, setCategoryModalName] = useState(''); // For new category or new name in edit
  const [editingCategoryOldName, setEditingCategoryOldName] = useState(''); // For edit/delete target

  const allAvailableMergedCategories = useMemo(() => {
    const combined = [
      ...predefinedCategories,
      ...currentUserDefinedCategories.filter(udc => !predefinedCategories.includes(udc))
    ];
    return combined.filter((value, index, self) => self.indexOf(value) === index).sort((a,b)=>a.localeCompare(b));
  }, [predefinedCategories, currentUserDefinedCategories]);

  
  useEffect(() => {
    if (existingTransaction) {
      setDescription(existingTransaction.description || '');
      setAmount(existingTransaction.amount.toString());
      setDate(existingTransaction.date.split('T')[0]);
      setSelectedCategory(existingTransaction.category);

      // If existing category is not in the combined list (e.g. old data or bad state),
      // try to set a default. This is less likely now with robust category fetching.
      if (!allAvailableMergedCategories.includes(existingTransaction.category) && allAvailableMergedCategories.length > 0) {
        setSelectedCategory(allAvailableMergedCategories[0]);
      } else if (!allAvailableMergedCategories.includes(existingTransaction.category) && allAvailableMergedCategories.length === 0) {
        setSelectedCategory(''); // No categories available
      }

    } else { // New transaction
      setDescription('');
      setAmount(amountFromScan ? amountFromScan.toString() : '');
      setDate(new Date().toISOString().split('T')[0]);
      // Set initial category: try first user-defined, then first predefined, else first available, or empty
      if (currentUserDefinedCategories.length > 0) {
        setSelectedCategory(currentUserDefinedCategories[0]);
      } else if (predefinedCategories.length > 0) {
        setSelectedCategory(predefinedCategories[0]);
      } else if (allAvailableMergedCategories.length > 0) {
        setSelectedCategory(allAvailableMergedCategories[0]);
      } else {
        setSelectedCategory('');
      }
    }
  }, [existingTransaction, type, predefinedCategories, currentUserDefinedCategories, allAvailableMergedCategories, amountFromScan]);

  // Effect to reset selectedCategory if it becomes invalid (e.g., deleted)
   useEffect(() => {
    if (selectedCategory && !allAvailableMergedCategories.includes(selectedCategory)) {
        if (currentUserDefinedCategories.length > 0) {
            setSelectedCategory(currentUserDefinedCategories[0]);
        } else if (predefinedCategories.length > 0) {
            setSelectedCategory(predefinedCategories[0]);
        } else if (allAvailableMergedCategories.length > 0) {
            setSelectedCategory(allAvailableMergedCategories[0]);
        } else {
            setSelectedCategory('');
        }
    }
  }, [selectedCategory, allAvailableMergedCategories, currentUserDefinedCategories, predefinedCategories]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !amount || parseFloat(amount) <= 0 || !date) {
        alert(`Please fill in Amount, Date, and select a Category. Amount must be greater than zero.`);
        return;
    }
    
    onSubmit({
      id: existingTransaction?.id,
      type,
      description: description.trim() || undefined,
      amount: parseFloat(amount),
      date,
      category: selectedCategory,
      relatedLiabilityId: existingTransaction?.relatedLiabilityId 
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
      await onUserAddCategory(trimmedName);
      setSelectedCategory(trimmedName); // Select the newly added category
      setShowAddModal(false);
      setCategoryModalName('');
    } catch (error) {
      // Error alert is handled in App.tsx typically
    }
  };

  const handleConfirmEditCategory = async () => {
    const trimmedNewName = categoryModalName.trim();
    if (!trimmedNewName || !editingCategoryOldName) {
      alert("Category names cannot be empty.");
      return;
    }
    if (trimmedNewName.toLowerCase() !== editingCategoryOldName.toLowerCase() && 
        allAvailableMergedCategories.some(cat => cat.toLowerCase() === trimmedNewName.toLowerCase())) {
      alert("Another category with this name already exists or is a predefined category.");
      return;
    }
    try {
      await onUserEditCategory(editingCategoryOldName, trimmedNewName);
      if (selectedCategory === editingCategoryOldName) {
         setSelectedCategory(trimmedNewName); // Update selection if the edited one was selected
      }
      setShowEditModal(false);
      setCategoryModalName('');
      setEditingCategoryOldName('');
    } catch (error) {
       // Error alert is handled in App.tsx typically
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!editingCategoryOldName) return;
    try {
      await onUserDeleteCategory(editingCategoryOldName);
      // selectedCategory will be reset by useEffect if it was the one deleted
      setShowDeleteModal(false);
      setEditingCategoryOldName('');
    } catch (error) {
      // Error alert is handled in App.tsx typically
    }
  };


  const isEditing = !!existingTransaction;
  const todayDateString = new Date().toISOString().split('T')[0];
  
  let title = '';
  let buttonText = '';
  let amountLabel = '';
  let buttonColor = '';
  let categoryTypeUiLabel = 'Category*';

  switch(type) {
    case TransactionType.INCOME:
      title = isEditing ? 'Edit Income' : 'Add New Income';
      buttonText = isEditing ? 'Save Changes' : 'Add Income';
      amountLabel = 'Income Amount*';
      buttonColor = 'bg-green-500 hover:bg-green-600 focus:ring-green-400';
      categoryTypeUiLabel = 'Income Category*';
      break;
    case TransactionType.EXPENSE:
      title = isEditing ? 'Edit Expense' : 'Add New Expense';
      buttonText = isEditing ? 'Save Changes' : 'Add Expense';
      amountLabel = 'Expense Amount*';
      buttonColor = 'bg-red-500 hover:bg-red-600 focus:ring-red-400';
      categoryTypeUiLabel = 'Expense Category*';
      break;
    case TransactionType.SAVING:
      title = isEditing ? 'Edit Saving' : 'Add New Saving';
      buttonText = isEditing ? 'Save Changes' : 'Add Saving';
      amountLabel = 'Saving Amount*';
      buttonColor = 'bg-teal-500 hover:bg-teal-600 focus:ring-teal-400';
      categoryTypeUiLabel = 'Saving Category*';
      break;
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 p-2 text-gray-100">
        <h2 className="text-2xl font-semibold text-center text-sky-400">{title}</h2>
        
        <CustomCategorySelect
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          predefinedCategories={predefinedCategories}
          userDefinedCategories={currentUserDefinedCategories}
          onAddNew={handleOpenAddNewModal}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
          categoryTypeLabel={categoryTypeUiLabel}
        />
        
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
            autoFocus={!!amountFromScan}
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
            max={!isEditing ? todayDateString : undefined}
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
              type === TransactionType.INCOME ? "e.g., Monthly Salary" : 
              type === TransactionType.EXPENSE ? "e.g., Groceries" :
              "e.g., Monthly Savings Deposit"
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

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-sm border border-slate-700">
            <h3 className="text-xl font-semibold text-sky-400 mb-4">Add New {type.toLowerCase()} Category</h3>
            <input
              type="text"
              value={categoryModalName}
              onChange={(e) => setCategoryModalName(e.target.value)}
              placeholder="Enter new category name"
              className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md p-3 focus:ring-sky-500 focus:border-sky-500 transition mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700">Cancel</button>
              <button onClick={handleConfirmAddCategory} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-sm border border-slate-700">
            <h3 className="text-xl font-semibold text-sky-400 mb-4">Edit {type.toLowerCase()} Category</h3>
            <p className="text-sm text-gray-400 mb-1">Old name: {editingCategoryOldName}</p>
            <input
              type="text"
              value={categoryModalName}
              onChange={(e) => setCategoryModalName(e.target.value)}
              placeholder="Enter new category name"
              className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md p-3 focus:ring-sky-500 focus:border-sky-500 transition mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700">Cancel</button>
              <button onClick={handleConfirmEditCategory} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-sm border border-slate-700">
            <h3 className="text-xl font-semibold text-red-400 mb-4">Delete Category</h3>
            <p className="text-gray-200 mb-4">Are you sure you want to delete the category: "{editingCategoryOldName}"?</p>
            <p className="text-xs text-gray-400 mb-4">This will not affect existing transactions using this category name.</p>
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