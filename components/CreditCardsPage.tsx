
import React, { useState, useMemo, useEffect, useRef, useLayoutEffect } from 'react';
import { CreditCard, CreditCardBill } from '../types';
import { BackIcon, PlusIcon } from './icons';
import { CreditCardItem } from './CreditCardItem';
import { AddCreditCardForm } from './AddCreditCardForm';
import { AddCreditCardBillForm } from './AddCreditCardBillForm';

interface CreditCardsPageProps {
  creditCards: CreditCard[];
  creditCardBills: CreditCardBill[];
  onAddOrEditCard: (data: Omit<CreditCard, 'id' | 'createdAt' | 'userId'> & { id?: string }) => Promise<void>;
  onDeleteCard: (id: string) => void;
  onAddOrEditBill: (data: Omit<CreditCardBill, 'id' | 'createdAt' | 'userId'> & { id?: string }) => Promise<void>;
  onDeleteBill: (id: string) => void;
  onUpdateBillPaidStatus: (bill: CreditCardBill, isPaid: boolean) => void;
  onBack: () => void;
}

export const CreditCardsPage: React.FC<CreditCardsPageProps> = ({
  creditCards,
  creditCardBills,
  onAddOrEditCard,
  onDeleteCard,
  onAddOrEditBill,
  onDeleteBill,
  onUpdateBillPaidStatus,
  onBack
}) => {
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  const [showBillForm, setShowBillForm] = useState(false);
  const [editingBill, setEditingBill] = useState<CreditCardBill | null>(null);
  const [activeCardForBill, setActiveCardForBill] = useState<CreditCard | null>(null);

  const [focusedCardId, setFocusedCardId] = useState<string | null>(null);
  const scrollPositionRef = useRef<number>(0);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('');

  // Handle scroll restoration and top alignment for detail view
  useLayoutEffect(() => {
    if (focusedCardId) {
      // Entering detail view: Scroll to top so full card is visible
      window.scrollTo(0, 0);
    } else {
      // Returning to list view: Restore previous scroll position
      window.scrollTo(0, scrollPositionRef.current);
    }
  }, [focusedCardId]);

  // If the focused card is deleted, reset the view to the list
  useEffect(() => {
    if (focusedCardId && !creditCards.find(c => c.id === focusedCardId)) {
      setFocusedCardId(null);
    }
  }, [creditCards, focusedCardId]);

  const handleBack = () => {
    if (focusedCardId) {
      setFocusedCardId(null);
    } else {
      onBack();
    }
  };

  const handleOpenNewCardForm = () => {
    setEditingCard(null);
    setShowCardForm(true);
  };

  const handleOpenEditCardForm = (card: CreditCard) => {
    setEditingCard(card);
    setShowCardForm(true);
  };

  const handleOpenNewBillForm = (card: CreditCard) => {
    setActiveCardForBill(card);
    setEditingBill(null);
    setShowBillForm(true);
  };

  const handleOpenEditBillForm = (bill: CreditCardBill) => {
    const card = creditCards.find(c => c.id === bill.creditCardId);
    if (card) {
      setActiveCardForBill(card);
      setEditingBill(bill);
      setShowBillForm(true);
    }
  };

  const handleCardSubmit = async (data: Omit<CreditCard, 'id' | 'createdAt' | 'userId'> & { id?: string }) => {
    try {
      await onAddOrEditCard(data);
      setShowCardForm(false);
    } catch (error) {
      console.log("Card submission failed. Modal remains open.");
    }
  };

  const handleBillSubmit = async (data: Omit<CreditCardBill, 'id' | 'createdAt' | 'userId'> & { id?: string }) => {
    try {
      await onAddOrEditBill(data);
      setShowBillForm(false);
    } catch (error) {
      console.log("Bill submission failed. Modal remains open.");
    }
  };

  const billsByCardId = useMemo(() => {
    return creditCardBills.reduce((acc, bill) => {
      (acc[bill.creditCardId] = acc[bill.creditCardId] || []).push(bill);
      return acc;
    }, {} as Record<string, CreditCardBill[]>);
  }, [creditCardBills]);

  const monthlySummaries = useMemo(() => {
    const totals: Record<string, number> = {};
    creditCardBills.forEach(bill => {
      const date = new Date(bill.billDate);
      // Format YYYY-MM for sorting key
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      totals[key] = (totals[key] || 0) + bill.amount;
    });

    return Object.entries(totals)
      .map(([key, total]) => {
        const [year, month] = key.split('-').map(Number);
        // Construct date for display name
        const date = new Date(year, month - 1);
        return {
          key,
          displayName: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
          total
        };
      })
      .sort((a, b) => b.key.localeCompare(a.key)); // Descending by date
  }, [creditCardBills]);

  const activeSummary = useMemo(() => {
    if (monthlySummaries.length === 0) return null;
    return monthlySummaries.find(s => s.key === selectedMonthKey) || monthlySummaries[0];
  }, [monthlySummaries, selectedMonthKey]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 flex flex-col">
      <header className="sticky top-0 z-30 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 py-2 sm:py-3">
        <div className="flex items-center justify-between h-full px-2 sm:px-4 lg:px-6">
          <div className="flex-none">
            <button onClick={handleBack} className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 p-2 rounded-md hover:bg-slate-700">
              <BackIcon className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:inline">Back</span>
            </button>
          </div>
          <h1 className="text-lg sm:text-xl font-semibold text-indigo-400 truncate">
            {focusedCardId ? 'Card Details' : 'My Credit Cards'}
          </h1>
          <div className="flex-none">
            {!focusedCardId && (
              <button onClick={handleOpenNewCardForm} className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 text-sm">
                <PlusIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Add Card</span>
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-grow p-3 sm:p-4 lg:p-6 relative">
        {creditCards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-400">No credit cards added yet.</p>
            <p className="text-sm text-gray-500 mt-2">Click "Add Card" to get started.</p>
          </div>
        ) : (
          focusedCardId ? (
            // Single Focused Card View
            <div className="max-w-md sm:max-w-lg mx-auto pb-32">
              {(() => {
                const card = creditCards.find(c => c.id === focusedCardId);
                if (!card) return null;
                return (
                  <CreditCardItem
                    key={card.id}
                    card={card}
                    bills={(billsByCardId[card.id] || []).sort((a,b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime())}
                    onAddBill={handleOpenNewBillForm}
                    onEditBill={handleOpenEditBillForm}
                    onDeleteBill={onDeleteBill}
                    onUpdateBillPaidStatus={onUpdateBillPaidStatus}
                    onEditCard={handleOpenEditCardForm}
                    onDeleteCard={onDeleteCard}
                    isExpanded={true}
                    onCardClick={() => setFocusedCardId(null)}
                  />
                );
              })()}
            </div>
          ) : (
            // Stack View
            <div className="max-w-md sm:max-w-lg mx-auto pb-32 min-h-[50vh]">
              
              {/* Monthly Summary Section */}
              {activeSummary && (
                <div className="mb-8 bg-slate-800/50 rounded-xl border border-slate-700 p-5 shadow-lg backdrop-blur-sm flex flex-col items-center justify-center transition-all">
                   <div className="flex items-center gap-3 mb-1">
                      <span className="text-gray-400 text-sm font-medium">Total Bills for</span>
                      <div className="relative">
                        <select
                          value={activeSummary.key}
                          onChange={(e) => setSelectedMonthKey(e.target.value)}
                          className="appearance-none bg-slate-900/80 hover:bg-slate-900 border border-slate-600 hover:border-sky-500 text-sky-400 text-sm font-bold rounded-lg py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-colors cursor-pointer"
                        >
                          {monthlySummaries.map(summary => (
                            <option key={summary.key} value={summary.key}>{summary.displayName}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-sky-400">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                   </div>
                   <p className="text-3xl sm:text-4xl font-bold text-white mt-2 tracking-tight drop-shadow-sm">
                     ₹{activeSummary.total.toLocaleString('en-IN')}
                   </p>
                </div>
              )}

              {creditCards.map((card, index) => (
                <div 
                  key={card.id} 
                  className="sticky transition-all duration-300"
                  style={{ 
                    top: `${80 + index * 60}px`, 
                    zIndex: index + 1,
                    marginBottom: '20px',
                    cursor: 'pointer'
                  }}
                >
                  <CreditCardItem
                    card={card}
                    bills={(billsByCardId[card.id] || []).sort((a,b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime())}
                    onAddBill={handleOpenNewBillForm}
                    onEditBill={handleOpenEditBillForm}
                    onDeleteBill={onDeleteBill}
                    onUpdateBillPaidStatus={onUpdateBillPaidStatus}
                    onEditCard={handleOpenEditCardForm}
                    onDeleteCard={onDeleteCard}
                    isExpanded={false}
                    onCardClick={() => {
                      scrollPositionRef.current = window.scrollY;
                      setFocusedCardId(card.id);
                    }}
                  />
                </div>
              ))}
            </div>
          )
        )}
      </main>

      {showCardForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg border border-slate-700">
            <AddCreditCardForm
              onSubmit={handleCardSubmit}
              onCancel={() => setShowCardForm(false)}
              existingCard={editingCard}
            />
          </div>
        </div>
      )}

      {showBillForm && activeCardForBill && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg border border-slate-700">
            <AddCreditCardBillForm
              creditCardId={activeCardForBill.id}
              onSubmit={handleBillSubmit}
              onCancel={() => setShowBillForm(false)}
              existingBill={editingBill}
            />
          </div>
        </div>
      )}
    </div>
  );
};
