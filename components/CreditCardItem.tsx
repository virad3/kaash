
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

  const { currentYearSpend, yearStartDate, yearEndDate, isDateValid, monthsRemaining } = useMemo(() => {
    const cardAdded = new Date(cardAddedDate + 'T00:00:00Z');
    
    if (!cardAddedDate || isNaN(cardAdded.getTime())) {
      return { 
        currentYearSpend: 0, 
        yearStartDate: new Date(), 
        yearEndDate: new Date(), 
        isDateValid: false,
        monthsRemaining: 0
      };
    }

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
      
    let monthsLeft = 0;
    if (now < end) {
        const endYear = end.getUTCFullYear();
        const endMonth = end.getUTCMonth();
        const nowYear = now.getUTCFullYear();
        const nowMonth = now.getUTCMonth();
        monthsLeft = (endYear - nowYear) * 12 + (endMonth - nowMonth);
    }

    return { 
      currentYearSpend: spend, 
      yearStartDate: start, 
      yearEndDate: end, 
      isDateValid: true,
      monthsRemaining: Math.max(0, monthsLeft)
    };
  }, [card, bills]);

  const progressPercent = annualFeeWaiverSpend > 0 ? Math.min((currentYearSpend / annualFeeWaiverSpend) * 100, 100) : 0;
  const remainingSpend = Math.max(0, annualFeeWaiverSpend - currentYearSpend);
  const totalSpendSoFar = useMemo(() => {
    return bills.reduce((sum, bill) => sum + bill.amount, 0);
  }, [bills]);

  // Date Helpers
  const getMonthName = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00Z');
    return date.toLocaleString('default', { month: 'short', timeZone: 'UTC' });
  };

  const getDay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00Z');
    return date.getUTCDate();
  };

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

      {annualFeeWaiverSpend > 0 ? (
        isDateValid ? (
          <div>
            <div className="flex justify-between items-baseline text-xs mb-1">
              <span className="text-gray-300">Annual Fee Waiver Progress</span>
              <span className="font-medium text-gray-200">₹{currentYearSpend.toLocaleString('en-IN')} / ₹{annualFeeWaiverSpend.toLocaleString('en-IN')}</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-600">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-center mt-1.5 text-gray-400">
              {progressPercent >= 100 ? 
                `Goal met! ₹${annualFee.toLocaleString('en-IN')} fee should be waived.` :
                `Spend ₹${remainingSpend.toLocaleString('en-IN')} more to waive the ₹${annualFee.toLocaleString('en-IN')} fee. You have ${monthsRemaining} ${monthsRemaining === 1 ? 'month' : 'months'} left in the tracking period.`
              }
            </p>
            <p className="text-[10px] text-center text-gray-500">
              Tracking period: {yearStartDate.toLocaleDateString('en-IN')} to {yearEndDate.toLocaleDateString('en-IN')}
            </p>
          </div>
        ) : (
          <div className="text-xs text-center text-yellow-400 bg-yellow-500/10 p-2 rounded-md">
            Could not calculate waiver progress due to an invalid 'Start Date' for this card. Please edit the card to fix it.
          </div>
        )
      ) : (
        <div className="text-sm text-center p-2 rounded-md bg-slate-800 border border-slate-600">
          <span className="text-gray-400">Total spend recorded on this card: </span>
          <span className="font-semibold text-gray-200">
              ₹{totalSpendSoFar.toLocaleString('en-IN')}
          </span>
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
        <div className="pt-3 mt-2 border-t border-slate-600/50">
          {bills.length === 0 ? <p className="text-xs text-gray-400 text-center">No bills recorded for this card yet.</p> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {bills.map(bill => (
                 <div key={bill.id} className={`bg-slate-800 rounded-lg border ${bill.isPaid ? 'border-green-900/50' : 'border-slate-600'} flex overflow-hidden shadow-sm hover:border-slate-500 transition-colors relative group`}>
                    <div className={`w-16 flex flex-col items-center justify-center border-r ${bill.isPaid ? 'bg-green-900/20 border-green-900/50' : 'bg-slate-900/60 border-slate-600/60'} p-1.5 flex-shrink-0 transition-colors`}>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${bill.isPaid ? 'text-green-400' : 'text-sky-400'}`}>{getMonthName(bill.billDate)}</span>
                        <span className={`text-lg font-bold leading-none mt-0.5 ${bill.isPaid ? 'text-green-200' : 'text-gray-200'}`}>{getDay(bill.billDate)}</span>
                         <span className={`text-[9px] font-bold uppercase mt-1 px-1 rounded-sm ${bill.isPaid ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {bill.isPaid ? 'PAID' : 'UNPAID'}
                        </span>
                    </div>
                    
                    <div className="flex-1 p-2 flex flex-col justify-between min-w-0">
                        <div className="flex justify-between items-start w-full">
                             <div className="min-w-0 flex-1 mr-1">
                                <p className={`text-sm font-bold truncate ${bill.isPaid ? 'text-green-400' : 'text-gray-100'}`} title={`₹${bill.amount.toLocaleString('en-IN')}`}>
                                    ₹{bill.amount.toLocaleString('en-IN')}
                                </p>
                                {bill.notes && <p className="text-[10px] text-gray-500 truncate">{bill.notes}</p>}
                             </div>
                             <input 
                                type="checkbox" 
                                checked={bill.isPaid}
                                onChange={(e) => onUpdateBillPaidStatus(bill, e.target.checked)}
                                className={`h-4 w-4 rounded border-slate-500 cursor-pointer flex-shrink-0 mt-0.5 focus:ring-offset-slate-800 ${bill.isPaid ? 'text-green-500 focus:ring-green-500 accent-green-500' : 'bg-slate-700'}`}
                                title={bill.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                              />
                        </div>
                        
                        <div className="flex justify-between items-end mt-1">
                             <p className="text-[9px] text-gray-600 truncate max-w-[60%]">Due: {new Date(bill.paymentDueDate).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}</p>
                             <div className="flex space-x-1">
                                <button onClick={() => onEditBill(bill)} className="text-yellow-500 hover:text-yellow-400 p-0.5 rounded hover:bg-slate-700 transition-colors" title="Edit Bill">
                                    <EditIcon className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => onDeleteBill(bill.id)} className="text-red-500 hover:text-red-400 p-0.5 rounded hover:bg-slate-700 transition-colors" title="Delete Bill">
                                    <TrashIcon className="w-3.5 h-3.5" />
                                </button>
                             </div>
                        </div>
                    </div>
                 </div>
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
};
