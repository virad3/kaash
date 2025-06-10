
import React, { useState } from 'react';
import { SavingsGoal } from '../types';

interface ContributeToSavingsFormProps {
  goal: SavingsGoal;
  onSubmit: (goalId: string, amount: number, date: string, notes?: string) => void;
  onCancel: () => void;
}

export const ContributeToSavingsForm: React.FC<ContributeToSavingsFormProps> = ({ goal, onSubmit, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(`Contribution to ${goal.name}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0 || !date) {
      alert('Please enter a valid amount and date. Amount must be greater than zero.');
      return;
    }
    onSubmit(goal.id, parseFloat(amount), date, notes.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2 text-gray-100">
      <h2 className="text-xl font-semibold text-center text-teal-400">Contribute to: {goal.name}</h2>
      <p className="text-sm text-center text-gray-400">Current: ₹{goal.currentAmount.toFixed(2)} / Target: ₹{goal.targetAmount.toFixed(2)}</p>
      
      <div>
        <label htmlFor="contributionAmount" className="block text-sm font-medium text-gray-300 mb-1">Amount to Contribute (₹)</label>
        <input
          type="number"
          id="contributionAmount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition"
          placeholder="50.00"
          min="0.01"
          step="0.01"
          required
        />
      </div>

      <div>
        <label htmlFor="contributionDate" className="block text-sm font-medium text-gray-300 mb-1">Date of Contribution</label>
        <input
          type="date"
          id="contributionDate"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition"
          required
        />
      </div>
      
      <div>
        <label htmlFor="contributionNotes" className="block text-sm font-medium text-gray-300 mb-1">Notes for Expense (Optional)</label>
        <input
          type="text"
          id="contributionNotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition"
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
          className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
        >
          Contribute
        </button>
      </div>
    </form>
  );
};
