import React, { useState } from 'react';
import { Liability } from '../types';

interface UpdateInterestRateFormProps {
  liability: Liability;
  onSubmit: (newRate: number, effectiveDate: string) => void;
  onCancel: () => void;
}

export const UpdateInterestRateForm: React.FC<UpdateInterestRateFormProps> = ({ liability, onSubmit, onCancel }) => {
  const [newRate, setNewRate] = useState(liability.interestRate?.toString() || '');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRate || parseFloat(newRate) < 0 || !effectiveDate) {
      alert('Please enter a valid interest rate and date.');
      return;
    }
    onSubmit(parseFloat(newRate), effectiveDate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2 text-gray-100">
      <h2 className="text-xl font-semibold text-center text-sky-400">Update Interest Rate for {liability.name || liability.category}</h2>
      
      <div>
        <label htmlFor="newRate" className="block text-sm font-medium text-gray-300 mb-1">New Annual Interest Rate (%)</label>
        <input
          type="number"
          id="newRate"
          value={newRate}
          onChange={(e) => setNewRate(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
          placeholder="e.g. 5.5"
          min="0"
          step="0.01"
          required
        />
      </div>

      <div>
        <label htmlFor="effectiveDate" className="block text-sm font-medium text-gray-300 mb-1">Effective Date</label>
        <input
          type="date"
          id="effectiveDate"
          value={effectiveDate}
          onChange={(e) => setEffectiveDate(e.target.value)}
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
          className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
        >
          Update Rate
        </button>
      </div>
    </form>
  );
};
