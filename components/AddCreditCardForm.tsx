import React, { useState, useEffect } from 'react';
import { CreditCard } from '../types';
import { BANK_NAMES, BANK_CREDIT_CARDS, CreditCardInfo } from '../constants';

interface AddCreditCardFormProps {
  onSubmit: (data: Omit<CreditCard, 'id' | 'createdAt' | 'userId'> & { id?: string }) => void;
  onCancel: () => void;
  existingCard?: CreditCard | null;
}

const PREDEFINED_CARD_OTHER_VALUE = 'other';

export const AddCreditCardForm: React.FC<AddCreditCardFormProps> = ({ onSubmit, onCancel, existingCard }) => {
  const [bankName, setBankName] = useState(BANK_NAMES[0]);
  const [cardName, setCardName] = useState('');
  const [annualFee, setAnnualFee] = useState('');
  const [annualFeeWaiverSpend, setAnnualFeeWaiverSpend] = useState('');
  const [billingCycleDate, setBillingCycleDate] = useState('15');
  const [cardAddedDate, setCardAddedDate] = useState(new Date().toISOString().split('T')[0]);

  const [availableCards, setAvailableCards] = useState<CreditCardInfo[]>([]);
  const [selectedPredefinedCard, setSelectedPredefinedCard] = useState('');

  // Effect to update available cards when bank changes
  useEffect(() => {
    setAvailableCards(BANK_CREDIT_CARDS[bankName] || []);
    // Reset selections when bank changes, unless we are editing
    if (!existingCard) {
      setSelectedPredefinedCard('');
      setCardName('');
      setAnnualFee('');
      setAnnualFeeWaiverSpend('');
    }
  }, [bankName, existingCard]);
  
  // Effect to populate form when editing an existing card
  useEffect(() => {
    if (existingCard) {
      setBankName(existingCard.bankName);
      setCardName(existingCard.cardName);
      setAnnualFee(existingCard.annualFee.toString());
      setAnnualFeeWaiverSpend(existingCard.annualFeeWaiverSpend.toString());
      setBillingCycleDate(existingCard.billingCycleDate.toString());
      setCardAddedDate(existingCard.cardAddedDate);

      // Check if the existing card matches a predefined one to set the dropdown correctly
      const matchingPredefined = (BANK_CREDIT_CARDS[existingCard.bankName] || []).find(c => c.cardName === existingCard.cardName);
      if (matchingPredefined) {
        setSelectedPredefinedCard(existingCard.cardName);
      } else {
        setSelectedPredefinedCard(PREDEFINED_CARD_OTHER_VALUE);
      }
    }
  }, [existingCard]);

  const handlePredefinedCardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCardName = e.target.value;
    setSelectedPredefinedCard(selectedCardName);

    if (selectedCardName === PREDEFINED_CARD_OTHER_VALUE) {
      setCardName('');
      setAnnualFee('');
      setAnnualFeeWaiverSpend('');
    } else {
      const cardInfo = availableCards.find(c => c.cardName === selectedCardName);
      if (cardInfo) {
        setCardName(cardInfo.cardName);
        setAnnualFee(cardInfo.annualFee.toString());
        setAnnualFeeWaiverSpend(cardInfo.waiverSpend.toString());
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim() || !annualFee || parseFloat(annualFee) < 0 || !annualFeeWaiverSpend || parseFloat(annualFeeWaiverSpend) < 0 || !billingCycleDate) {
      alert('Please fill in all required fields with valid numbers.');
      return;
    }
    onSubmit({
      id: existingCard?.id,
      bankName,
      cardName: cardName.trim(),
      annualFee: parseFloat(annualFee),
      annualFeeWaiverSpend: parseFloat(annualFeeWaiverSpend),
      billingCycleDate: parseInt(billingCycleDate, 10),
      cardAddedDate,
    });
    // The onCancel call is removed from here. The parent component will handle closing the modal.
  };
  
  const title = existingCard ? 'Edit Credit Card' : 'Add New Credit Card';
  const isManualEntry = selectedPredefinedCard === PREDEFINED_CARD_OTHER_VALUE;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-2 text-gray-100 max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold text-center text-sky-400">{title}</h2>
      
      <div>
        <label htmlFor="bankName" className="block text-sm font-medium text-gray-300 mb-1">Bank Name*</label>
        <select
          id="bankName"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
        >
          {BANK_NAMES.map(bank => <option key={bank} value={bank}>{bank}</option>)}
        </select>
      </div>

      {availableCards.length > 0 && (
        <div>
          <label htmlFor="predefinedCard" className="block text-sm font-medium text-gray-300 mb-1">Card*</label>
          <select
            id="predefinedCard"
            value={selectedPredefinedCard}
            onChange={handlePredefinedCardChange}
            className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
          >
            <option value="">-- Select a Card --</option>
            {availableCards.map(card => <option key={card.cardName} value={card.cardName}>{card.cardName}</option>)}
            <option value={PREDEFINED_CARD_OTHER_VALUE}>Other (Enter Manually)</option>
          </select>
        </div>
      )}

      {(isManualEntry || availableCards.length === 0) && (
        <div>
          <label htmlFor="cardName" className="block text-sm font-medium text-gray-300 mb-1">Card Name*</label>
          <input
            type="text"
            id="cardName"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
            placeholder="e.g., Millennia, Amazon Pay ICICI"
            required
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="annualFee" className="block text-sm font-medium text-gray-300 mb-1">Annual Fee (₹)*</label>
          <input
            type="number"
            id="annualFee"
            value={annualFee}
            onChange={(e) => setAnnualFee(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3"
            placeholder="e.g., 499"
            min="0"
            step="1"
            required
            readOnly={!isManualEntry && availableCards.length > 0}
          />
        </div>
        <div>
          <label htmlFor="waiverSpend" className="block text-sm font-medium text-gray-300 mb-1">Waiver Spend (₹)*</label>
          <input
            type="number"
            id="waiverSpend"
            value={annualFeeWaiverSpend}
            onChange={(e) => setAnnualFeeWaiverSpend(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3"
            placeholder="e.g., 100000"
            min="0"
            step="1000"
            required
            readOnly={!isManualEntry && availableCards.length > 0}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="billingCycleDate" className="block text-sm font-medium text-gray-300 mb-1">Bill Day of Month*</label>
          <input
            type="number"
            id="billingCycleDate"
            value={billingCycleDate}
            onChange={(e) => setBillingCycleDate(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3"
            min="1"
            max="31"
            step="1"
            required
          />
        </div>
        <div>
          <label htmlFor="cardAddedDate" className="block text-sm font-medium text-gray-300 mb-1">Start Date*</label>
          <input
            type="date"
            id="cardAddedDate"
            value={cardAddedDate}
            onChange={(e) => setCardAddedDate(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3"
            required
          />
           <p className="text-xs text-gray-400 mt-1">Date you got the card. Used to track annual waiver period.</p>
        </div>
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
          {existingCard ? 'Save Changes' : 'Add Card'}
        </button>
      </div>
    </form>
  );
};