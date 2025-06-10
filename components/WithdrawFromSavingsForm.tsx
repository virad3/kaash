
import React, { useState } from 'react';
import { SavingsGoal } from '../types';

interface WithdrawFromSavingsFormProps {
  goal: SavingsGoal;
  onSubmit: (goalId: string, amount: number, date: string, notes?: string) => void;
  onCancel: () => void;
}

export const WithdrawFromSavingsForm: React.FC<WithdrawFromSavingsFormProps> = ({ goal, onSubmit, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(`Withdrawal from ${goal.name}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0 || !date) {
      alert('Please enter a valid amount and date. Amount must be greater than zero.');
      return;
    }
    if (parseFloat(amount) > goal.currentAmount) {
      alert(`Cannot withdraw more than the current saved amount of ₹${goal.currentAmount.toFixed(2)}.`);
      return;
    }
    onSubmit(goal.id, parseFloat(amount), date, notes.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2 text-gray-100">
      <h2 className="text-xl font-semibold text-center text-orange-400">Withdraw from: {goal.name}</h2>
      <p className="text-sm text-center text-gray-400">Current: ₹{goal.currentAmount.toFixed(2)} / Target: ₹{goal.targetAmount.toFixed(2)}</p>
      
      <div>
        <label htmlFor="withdrawalAmount" className="block text-sm font-medium text-gray-300 mb-1">Amount to Withdraw (₹)</label>
        <input
          type="number"
          id="withdrawalAmount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-orange-500 focus:border-orange-500 transition"
          placeholder="50.00"
          min="0.01"
          step="0.01"
          max={goal.currentAmount}
          required
        />
      </div>

      <div>
        <label htmlFor="withdrawalDate" className="block text-sm font-medium text-gray-300 mb-1">Date of Withdrawal</label>
        <input
          type="date"
          id="withdrawalDate"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-orange-500 focus:border-orange-500 transition"
          required
        />
      </div>
      
      <div>
        <label htmlFor="withdrawalNotes" className="block text-sm font-medium text-gray-300 mb-1">Notes for Income (Optional)</label>
        <input
          type="text"
          id="withdrawalNotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-orange-500 focus:border-orange-500 transition"
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
          className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75"
        >
          Withdraw
        </button>
      </div>
    </form>
  );
};
