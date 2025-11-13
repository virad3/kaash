
import React, { useState, useMemo } from 'react';
import { CreditCard, CreditCardBill } from '../types';
import { TrashIcon, EditIcon, PaymentIcon } from './icons';

interface CreditCardItemProps {
  card: CreditCard;
  bills: CreditCardBill[];
  onAddBill: (card: CreditCard) => void;
  onEditBill: (bill: CreditCardBill) => void;
  onDeleteBill: (billId: string) => void;
  onUpdateBillPaidStatus: (bill: CreditCardBill, isPaid: boolean) => void;
  onEditCard: (card: CreditCard) => void;
  onDeleteCard: (cardId: string) => void;
}

export const CreditCardItem: React.FC<CreditCardItemProps> = ({ card, bills, onAddBill, onEditBill, onDeleteBill, onUpdateBillPaidStatus, onEditCard, onDeleteCard }) => {
  const [isBillsVisible, setIsBillsVisible] = useState(false);

  const { annualFeeWaiverSpend, annualFee, cardAddedDate } = card;

  const { currentYearSpend, yearStartDate, yearEndDate } = useMemo(() => {
    const cardAdded = new Date(cardAddedDate + 'T00:00:00Z');
    const now = new Date();
    
    let yearsSinceAdded = now.getUTCFullYear() - cardAdded.getUTCFullYear();
    let start = new Date(cardAdded);
    start.setUTCFullYear(cardAdded.getUTCFullYear() + yearsSinceAdded);

    if (now < start) {
      yearsSinceAdded -= 1;
      start.setUTCFullYear(cardAdded.getUTCFullYear() + yearsSinceAdded);
    }
    
    const end = new Date(start);
    end.setUTCFullYear(start.getUTCFullYear() + 1);

    const spend = bills
      .filter(bill => {
        const billDate = new Date(bill.billDate + 'T00:00:00Z');
        return bill.creditCardId === card.id && billDate >= start && billDate < end;
      })
      .reduce((sum, bill) => sum + bill.amount, 0);

    return { currentYearSpend: spend, yearStartDate: start, yearEndDate: end };
  }, [card, bills]);

  const progressPercent = annualFeeWaiverSpend > 0 ? Math.min((currentYearSpend / annualFeeWaiverSpend) * 100, 100) : 0;
  const remainingSpend = Math.max(0, annualFeeWaiverSpend - currentYearSpend);

  return (
    <li className="p-4 bg-slate-700/50 rounded-lg shadow-md space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-sky-300">{card.cardName}</h3>
          <p className="text-sm text-gray-400">{card.bankName}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => onEditCard(card)} className="p-1.5 text-yellow-400 hover:bg-slate-600 rounded-full"><EditIcon className="w-5 h-5" /></button>
          <button onClick={() => onDeleteCard(card.id)} className="p-1.5 text-red-500 hover:bg-slate-600 rounded-full"><TrashIcon className="w-5 h-5" /></button>
        </div>
      </div>

      {annualFeeWaiverSpend > 0 && (
        <div>
          <div className="flex justify-between items-baseline text-xs mb-1">
            <span className="text-gray-300">Annual Fee Waiver Progress</span>
            <span className="font-medium text-gray-200">₹{currentYearSpend.toFixed(0)} / ₹{annualFeeWaiverSpend.toFixed(0)}</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-600">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-xs text-center mt-1.5 text-gray-400">
            {progressPercent >= 100 ? 
              `Goal met! ₹${annualFee} fee should be waived.` :
              `Spend ₹${remainingSpend.toFixed(2)} more to waive ₹${annualFee} fee.`
            }
          </p>
          <p className="text-[10px] text-center text-gray-500">
            Tracking period: {yearStartDate.toLocaleDateString('en-CA')} to {yearEndDate.toLocaleDateString('en-CA')}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-600/50">
        <button onClick={() => setIsBillsVisible(!isBillsVisible)} className="text-sm text-sky-400 hover:underline">
          {isBillsVisible ? 'Hide Bills' : `Show Bills (${bills.length})`}
        </button>
        <button onClick={() => onAddBill(card)} className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white text-xs font-semibold rounded-md hover:bg-sky-700">
          <PaymentIcon className="w-4 h-4" /> Add Bill
        </button>
      </div>

      {isBillsVisible && (
        <div className="pt-3 mt-2 border-t border-slate-600/50 space-y-2">
          {bills.length === 0 ? <p className="text-xs text-gray-400 text-center">No bills recorded for this card yet.</p> : (
            bills.map(bill => (
              <div key={bill.id} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    checked={bill.isPaid}
                    onChange={(e) => onUpdateBillPaidStatus(bill, e.target.checked)}
                    className="h-4 w-4 rounded bg-slate-700 border-slate-500 text-green-500 focus:ring-green-500 accent-green-500"
                    title={bill.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                  />
                  <div>
                    <p className={`text-sm ${bill.isPaid ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                      ₹{bill.amount.toFixed(2)}
                      <span className="text-xs text-gray-400 ml-2">(Due: {new Date(bill.paymentDueDate + 'T00:00:00Z').toLocaleDateString('en-CA')})</span>
                    </p>
                     {bill.notes && <p className="text-xs text-gray-400">{bill.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                   <button onClick={() => onEditBill(bill)} className="p-1 text-yellow-500 hover:bg-slate-700 rounded-full"><EditIcon className="w-4 h-4" /></button>
                   <button onClick={() => onDeleteBill(bill.id)} className="p-1 text-red-500 hover:bg-slate-700 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </li>
  );
};
