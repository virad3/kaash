
import React, { useState, useEffect } from 'react';
import { Liability } from '../types';

interface LiabilityFormProps {
  onSubmit: (data: Omit<Liability, 'id' | 'amountRepaid' | 'createdAt'> & { id?: string; amountRepaid?: number }) => void;
  onCancel: () => void;
  existingLiability?: Liability | null;
}

export const LiabilityForm: React.FC<LiabilityFormProps> = ({ onSubmit, onCancel, existingLiability }) => {
  const [name, setName] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [emiAmount, setEmiAmount] = useState('');
  const [nextDueDate, setNextDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [interestRate, setInterestRate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (existingLiability) {
      setName(existingLiability.name);
      setInitialAmount(existingLiability.initialAmount.toString());
      setEmiAmount(existingLiability.emiAmount?.toString() || '');
      setNextDueDate(existingLiability.nextDueDate.split('T')[0]);
      setInterestRate(existingLiability.interestRate?.toString() || '');
      setNotes(existingLiability.notes || '');
    } else {
      // Reset form for new liability
      setName('');
      setInitialAmount('');
      setEmiAmount('');
      setNextDueDate(new Date().toISOString().split('T')[0]);
      setInterestRate('');
      setNotes('');
    }
  }, [existingLiability]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !initialAmount || parseFloat(initialAmount) <= 0 || !nextDueDate) {
      alert('Please fill in Name, Initial Amount, and Next Due Date. Initial Amount must be greater than zero.');
      return;
    }

    onSubmit({
      id: existingLiability?.id,
      name: name.trim(),
      initialAmount: parseFloat(initialAmount),
      amountRepaid: existingLiability?.amountRepaid || 0,
      emiAmount: emiAmount ? parseFloat(emiAmount) : undefined,
      nextDueDate,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
      notes: notes.trim() || undefined,
    });
  };

  const title = existingLiability ? 'Edit Liability' : 'Add New Liability';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2 text-gray-100">
      <h2 className="text-2xl font-semibold text-center text-sky-400">{title}</h2>
      
      <div>
        <label htmlFor="liabilityName" className="block text-sm font-medium text-gray-300 mb-1">Liability Name*</label>
        <input
          type="text"
          id="liabilityName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
          placeholder="e.g., Home Loan, Car EMI"
          required
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
          readOnly={!!existingLiability} // Initial amount shouldn't change after creation
        />
         {existingLiability && <p className="text-xs text-gray-400 mt-1">Initial amount cannot be edited.</p>}
      </div>

      <div>
        <label htmlFor="emiAmount" className="block text-sm font-medium text-gray-300 mb-1">EMI Amount (₹) (Optional)</label>
        <input
          type="number"
          id="emiAmount"
          value={emiAmount}
          onChange={(e) => setEmiAmount(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
          placeholder="500.00"
          min="0.01"
          step="0.01"
        />
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
        <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">Notes (Optional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
          placeholder="e.g., Account number, loan term"
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
  );
};
