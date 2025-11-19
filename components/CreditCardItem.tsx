import React, { useState, useMemo } from 'react';
import { CreditCard, CreditCardBill } from '../types';
import { TrashIcon, EditIcon, PlusIcon } from './icons';

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

// Helper to determine card background gradient based on bank name
const getCardGradient = (bankName: string) => {
  const normalized = bankName.toLowerCase();
  if (normalized.includes('hdfc')) return 'bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900';
  if (normalized.includes('icici')) return 'bg-gradient-to-br from-orange-800 via-red-800 to-red-900';
  if (normalized.includes('sbi')) return 'bg-gradient-to-br from-sky-700 via-blue-600 to-blue-900';
  if (normalized.includes('axis')) return 'bg-gradient-to-br from-fuchsia-900 via-purple-900 to-purple-950';
  if (normalized.includes('american express') || normalized.includes('amex')) return 'bg-gradient-to-br from-slate-500 via-slate-400 to-slate-600';
  if (normalized.includes('kotak')) return 'bg-gradient-to-br from-red-700 to-red-950';
  if (normalized.includes('rbl')) return 'bg-gradient-to-br from-indigo-900 to-black';
  if (normalized.includes('idfc')) return 'bg-gradient-to-br from-rose-900 to-black';
  if (normalized.includes('yes')) return 'bg-gradient-to-br from-blue-600 to-blue-900';
  // Default dark sleek card
  return 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900';
};

export const CreditCardItem: React.FC<CreditCardItemProps> = ({ card, bills, onAddBill, onEditBill, onDeleteBill, onUpdateBillPaidStatus, onEditCard, onDeleteCard }) => {
  // State to track if the card is expanded (showing actions and bills)
  const [isExpanded, setIsExpanded] = useState(false);

  const { annualFeeWaiverSpend, cardAddedDate } = card;

  const { currentYearSpend, isDateValid, monthsRemaining } = useMemo(() => {
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
    <div className={`rounded-2xl transition-all duration-500 ease-in-out ${isExpanded ? 'mb-8' : 'mb-0'}`}>
      {/* Card Visual - Clickable Area */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative w-full aspect-[1.586/1] rounded-2xl shadow-2xl overflow-hidden text-white cursor-pointer z-10 ${getCardGradient(card.bankName)}`}
      >
        
        {/* Glossy Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between z-10">
            
            {/* Top Row: Chip & Bank */}
            <div className="flex justify-between items-start">
                {/* EMV Chip Simulation */}
                <div className="w-10 h-8 sm:w-12 sm:h-9 bg-yellow-200/20 rounded-md border border-yellow-400/30 backdrop-blur-sm relative overflow-hidden shadow-inner">
                     <div className="absolute top-1/2 left-0 w-full h-[1px] bg-yellow-900/20"></div>
                     <div className="absolute top-0 left-1/2 h-full w-[1px] bg-yellow-900/20"></div>
                     <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-yellow-900/20 rounded-sm"></div>
                </div>
                
                <span className="font-bold tracking-widest text-xs sm:text-sm uppercase text-white/80 drop-shadow-sm">{card.bankName}</span>
            </div>

            {/* Middle Row: Card Name */}
            <div className="mt-1">
                <h3 className="text-xl sm:text-2xl font-mono font-bold tracking-wider text-white drop-shadow-md truncate pr-16">{card.cardName}</h3>
                <p className="text-white/50 font-mono text-xs sm:text-sm mt-1 tracking-[0.2em]">**** **** **** 8842</p>
            </div>

            {/* Bottom Row: Tracking Details */}
            <div className="mt-auto">
                <div className="flex justify-between items-end">
                    <div className="flex-1 mr-4">
                        {annualFeeWaiverSpend > 0 ? (
                            isDateValid ? (
                                <div>
                                    <div className="flex justify-between items-end mb-1.5">
                                        <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/70">Fee Waiver</p>
                                        <div className="text-right">
                                             <span className="text-base sm:text-lg font-bold">₹{(currentYearSpend >= 1000 ? (currentYearSpend/1000).toFixed(1) + 'k' : currentYearSpend)}</span>
                                             <span className="text-[10px] sm:text-xs text-white/60 ml-1">/ {(annualFeeWaiverSpend/1000).toFixed(0)}k</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden backdrop-blur-sm">
                                        <div 
                                            className={`h-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-700 ease-out ${progressPercent >= 100 ? 'bg-green-400' : 'bg-sky-400'}`} 
                                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-white/60 mt-1 truncate">
                                        {progressPercent >= 100 ? "Goal met!" : `${monthsRemaining} months left`}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs text-yellow-300">Invalid Date</p>
                            )
                        ) : (
                            <div>
                                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/70 mb-0.5">Total Spend</p>
                                <p className="text-xl sm:text-2xl font-bold tracking-tight">₹{totalSpendSoFar.toLocaleString('en-IN')}</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Card Scheme Logo Simulation */}
                    <div className="flex flex-col items-end opacity-80">
                        <div className="flex -space-x-2.5">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-500/90 mix-blend-screen"></div>
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-yellow-500/90 mix-blend-screen"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Actions (Top Right) - Visible only when expanded */}
            {isExpanded && (
              <div className="absolute top-4 right-4 flex space-x-2 animate-fade-in">
                  <button 
                      onClick={(e) => { e.stopPropagation(); onEditCard(card); }} 
                      className="p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white/90 hover:text-white transition-all backdrop-blur-md"
                      title="Edit Card"
                  >
                      <EditIcon className="w-4 h-4" />
                  </button>
                  <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteCard(card.id); }} 
                      className="p-1.5 bg-black/40 hover:bg-red-900/80 rounded-full text-white/90 hover:text-red-200 transition-all backdrop-blur-md"
                      title="Delete Card"
                  >
                      <TrashIcon className="w-4 h-4" />
                  </button>
              </div>
            )}
        </div>
      </div>

      {/* Expanded Content Container */}
      <div className={`bg-slate-800/50 rounded-b-2xl -mt-4 pt-6 pb-4 px-4 border-x border-b border-slate-700/50 shadow-lg transition-all duration-300 origin-top ${isExpanded ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 overflow-hidden invisible'}`}>
          
          {/* Actions Bar */}
          <div className="flex justify-between items-center mb-4">
              <div className="text-xs text-gray-500">
                 {bills.length > 0 
                    ? <span>Last Bill: <span className="text-gray-300">{bills[0].billDate}</span></span> 
                    : <span>No bills recorded</span>
                 }
              </div>
              
              <div className="flex items-center gap-4">
                 <button 
                    onClick={() => onAddBill(card)} 
                    className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-full transition-colors shadow-md"
                 >
                     <PlusIcon className="w-4 h-4" /> Pay/Add Bill
                 </button>
              </div>
          </div>

          {/* Bills List */}
          <div>
              {bills.length === 0 ? (
                  <div className="p-6 text-center bg-slate-800/50 rounded-xl border border-slate-700/50 border-dashed">
                      <p className="text-sm text-gray-400">No bills recorded yet.</p>
                  </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {bills.map(bill => (
                     <div key={bill.id} className={`relative group bg-slate-900 rounded-xl border ${bill.isPaid ? 'border-green-900/50' : 'border-slate-700'} overflow-hidden shadow-sm hover:border-slate-500 transition-all`}>
                        {/* Month Header */}
                        <div className={`flex flex-col items-center justify-center py-2 ${bill.isPaid ? 'bg-green-900/10' : 'bg-slate-800/50'} border-b border-slate-700/50`}>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${bill.isPaid ? 'text-green-400' : 'text-sky-400'}`}>{getMonthName(bill.billDate)}</span>
                            <span className={`text-xl font-bold leading-none mt-0.5 ${bill.isPaid ? 'text-green-200' : 'text-white'}`}>{getDay(bill.billDate)}</span>
                        </div>
                        
                        {/* Content */}
                        <div className="p-2 text-center">
                            <p className={`text-sm font-bold truncate ${bill.isPaid ? 'text-green-400' : 'text-gray-200'}`} title={`₹${bill.amount.toLocaleString('en-IN')}`}>
                                ₹{bill.amount > 10000 ? (bill.amount/1000).toFixed(1) + 'k' : bill.amount}
                            </p>
                             <div className={`text-[9px] font-bold uppercase mt-1 inline-block px-1.5 py-0.5 rounded ${bill.isPaid ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {bill.isPaid ? 'PAID' : 'UNPAID'}
                            </div>
                        </div>

                        {/* Hover Actions Overlay */}
                        <div className="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 backdrop-blur-[1px]">
                             <div className="flex items-center gap-2 mb-1">
                                <label className="text-[10px] text-gray-300 cursor-pointer flex items-center gap-1">
                                    <input 
                                        type="checkbox" 
                                        checked={bill.isPaid}
                                        onChange={(e) => onUpdateBillPaidStatus(bill, e.target.checked)}
                                        className="rounded bg-slate-700 border-slate-500 text-green-500 focus:ring-0 w-3 h-3"
                                    />
                                    {bill.isPaid ? 'Paid' : 'Pay?'}
                                </label>
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => onEditBill(bill)} className="p-1.5 bg-slate-700 hover:bg-yellow-600/20 text-yellow-400 rounded-full" title="Edit">
                                    <EditIcon className="w-3 h-3" />
                                </button>
                                <button onClick={() => onDeleteBill(bill.id)} className="p-1.5 bg-slate-700 hover:bg-red-600/20 text-red-400 rounded-full" title="Delete">
                                    <TrashIcon className="w-3 h-3" />
                                </button>
                             </div>
                        </div>
                     </div>
                  ))}
                </div>
              )}
          </div>
      </div>
    </div>
  );
};