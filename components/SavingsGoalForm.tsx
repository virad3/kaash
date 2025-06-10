
import React, { useState, useEffect } from 'react';
import { SavingsGoal } from '../types';

interface SavingsGoalFormProps {
  onSubmit: (data: Omit<SavingsGoal, 'id' | 'currentAmount' | 'createdAt'> & { id?: string; currentAmount?: number }) => void;
  onCancel: () => void;
  existingGoal?: SavingsGoal | null;
}

export const SavingsGoalForm: React.FC<SavingsGoalFormProps> = ({ onSubmit, onCancel, existingGoal }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  useEffect(() => {
    if (existingGoal) {
      setName(existingGoal.name);
      setTargetAmount(existingGoal.targetAmount.toString());
    } else {
      setName('');
      setTargetAmount('');
    }
  }, [existingGoal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0) {
      alert('Please fill in Goal Name and Target Amount. Target Amount must be greater than zero.');
      return;
    }

    onSubmit({
      id: existingGoal?.id,
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: existingGoal?.currentAmount || 0, // Preserve current amount if editing
    });
  };

  const title = existingGoal ? 'Edit Savings Goal' : 'Add New Savings Goal';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2 text-gray-100">
      <h2 className="text-2xl font-semibold text-center text-teal-400">{title}</h2>
      
      <div>
        <label htmlFor="goalName" className="block text-sm font-medium text-gray-300 mb-1">Goal Name*</label>
        <input
          type="text"
          id="goalName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition"
          placeholder="e.g., Vacation Fund, New Laptop"
          required
        />
      </div>

      <div>
        <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-300 mb-1">Target Amount (₹)*</label>
        <input
          type="number"
          id="targetAmount"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition"
          placeholder="1000.00"
          min="0.01"
          step="0.01"
          required
        />
      </div>
      
      {existingGoal && (
        <p className="text-sm text-gray-400">Current Amount Saved: ₹{existingGoal.currentAmount.toFixed(2)}</p>
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
          className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75"
        >
          {existingGoal ? 'Save Changes' : 'Add Goal'}
        </button>
      </div>
    </form>
  );
};
