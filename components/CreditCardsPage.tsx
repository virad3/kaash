import React, { useState, useMemo } from 'react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100">
      <header className="sticky top-0 z-30 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 py-2 sm:py-3">
        <div className="flex items-center justify-between h-full px-2 sm:px-4 lg:px-6">
          <div className="flex-none">
            <button onClick={onBack} className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 p-2 rounded-md hover:bg-slate-700">
              <BackIcon className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:inline">Back</span>
            </button>
          </div>
          <h1 className="text-lg sm:text-xl font-semibold text-indigo-400 truncate">My Credit Cards</h1>
          <div className="flex-none">
            <button onClick={handleOpenNewCardForm} className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 text-sm">
              <PlusIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Add Card</span>
            </button>
          </div>
        </div>
      </header>
      
      <main className="p-3 sm:p-4 lg:p-6">
        {creditCards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-400">No credit cards added yet.</p>
            <p className="text-sm text-gray-500 mt-2">Click "Add Card" to get started.</p>
          </div>
        ) : (
          <ul className="space-y-4 max-w-4xl mx-auto">
            {creditCards.map(card => (
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
              />
            ))}
          </ul>
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