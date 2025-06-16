
import React, { useState, useEffect } from 'react';
import { Liability } from '../types';

interface RecordLiabilityPaymentFormProps {
  liability: Liability;
  onSubmit: (paymentAmount: number, paymentDate: string, newNextDueDate: string, notes?: string) => void;
  onCancel: () => void;
}

export const RecordLiabilityPaymentForm: React.FC<RecordLiabilityPaymentFormProps> = ({ liability, onSubmit, onCancel }) => {
  const [paymentAmount, setPaymentAmount] = useState(liability.emiAmount?.toString() || '');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  
  const calculateNextMonthDate = (isoDate: string): string => {
    const currentDate = new Date(isoDate + 'T00:00:00Z'); // Ensure parsing as UTC then local adjustments
    currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
    return currentDate.toISOString().split('T')[0];
  };

  const [newNextDueDate, setNewNextDueDate] = useState(calculateNextMonthDate(liability.nextDueDate));
  const [notes, setNotes] = useState(`Payment for ${liability.name || liability.category}`); // Use category if name is missing

  useEffect(() => {
    // Re-calculate if the liability prop changes (e.g., if the modal is reused without remounting)
    setPaymentAmount(liability.emiAmount?.toString() || '');
    setNewNextDueDate(calculateNextMonthDate(liability.nextDueDate));
    setNotes(`Payment for ${liability.name || liability.category}`);
  }, [liability]);

  const todayDateString = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || parseFloat(paymentAmount) <= 0 || !paymentDate || !newNextDueDate) {
      alert('Please fill in all payment details correctly. Amount must be greater than zero.');
      return;
    }
    onSubmit(parseFloat(paymentAmount), paymentDate, newNextDueDate, notes.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2 text-gray-100">
      <h2 className="text-xl font-semibold text-center text-sky-400">Record Payment for {liability.name || liability.category}</h2>
      
      <div>
        <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-300 mb-1">Payment Amount (₹)</label>
        <input
          type="number"
          id="paymentAmount"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
          placeholder="0.00"
          min="0.01"
          step="0.01"
          required
        />
      </div>

      <div>
        <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-300 mb-1">Payment Date</label>
        <input
          type="date"
          id="paymentDate"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
          max={todayDateString}
          required
        />
      </div>

      <div>
        <label htmlFor="newNextDueDate" className="block text-sm font-medium text-gray-300 mb-1">New Next Due Date</label>
        <input
          type="date"
          id="newNextDueDate"
          value={newNextDueDate}
          onChange={(e) => setNewNextDueDate(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
          required
        />
      </div>
      
      <div>
        <label htmlFor="paymentNotes" className="block text-sm font-medium text-gray-300 mb-1">Notes for Expense (Optional)</label>
        <input
          type="text"
          id="paymentNotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
          placeholder={`Payment for ${liability.name || liability.category}`}
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
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75"
        >
          Record Payment
        </button>
      </div>
    </form>
  );
};
