
import React, { useState, useEffect } from 'react';
import { CreditCardBill } from '../types';

interface AddCreditCardBillFormProps {
  creditCardId: string;
  onSubmit: (data: Omit<CreditCardBill, 'id' | 'createdAt' | 'userId'> & { id?: string }) => void;
  onCancel: () => void;
  existingBill?: CreditCardBill | null;
}

export const AddCreditCardBillForm: React.FC<AddCreditCardBillFormProps> = ({ creditCardId, onSubmit, onCancel, existingBill }) => {
  const [amount, setAmount] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentDueDate, setPaymentDueDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (existingBill) {
      setAmount(existingBill.amount.toString());
      setBillDate(existingBill.billDate);
      setPaymentDueDate(existingBill.paymentDueDate);
      setNotes(existingBill.notes || '');
    } else {
      const today = new Date();
      setBillDate(today.toISOString().split('T')[0]);

      // Default due date to 20 days from today
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + 20);
      setPaymentDueDate(dueDate.toISOString().split('T')[0]);
    }
  }, [existingBill]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0 || !billDate || !paymentDueDate) {
      alert('Please fill in all required fields. Amount must be greater than zero.');
      return;
    }
    onSubmit({
      id: existingBill?.id,
      creditCardId: creditCardId,
      amount: parseFloat(amount),
      billDate,
      paymentDueDate,
      isPaid: existingBill?.isPaid || false,
      notes: notes.trim() || undefined,
    });
    onCancel();
  };

  const title = existingBill ? 'Edit Bill' : 'Add New Bill';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-2 text-gray-100">
      <h2 className="text-2xl font-semibold text-center text-sky-400">{title}</h2>
      
      <div>
        <label htmlFor="billAmount" className="block text-sm font-medium text-gray-300 mb-1">Bill Amount (₹)*</label>
        <input
          type="number"
          id="billAmount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
          placeholder="0.00"
          min="0.01"
          step="0.01"
          required
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="billDate" className="block text-sm font-medium text-gray-300 mb-1">Bill Date*</label>
        <input
          type="date"
          id="billDate"
          value={billDate}
          onChange={(e) => setBillDate(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
          required
        />
      </div>

      <div>
        <label htmlFor="paymentDueDate" className="block text-sm font-medium text-gray-300 mb-1">Payment Due Date*</label>
        <input
          type="date"
          id="paymentDueDate"
          value={paymentDueDate}
          onChange={(e) => setPaymentDueDate(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
          required
        />
      </div>

      <div>
        <label htmlFor="billNotes" className="block text-sm font-medium text-gray-300 mb-1">Notes (Optional)</label>
        <input
          type="text"
          id="billNotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
          placeholder="e.g., Diwali shopping"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md"
        >
          {existingBill ? 'Save Changes' : 'Add Bill'}
        </button>
      </div>
    </form>
  );
};
