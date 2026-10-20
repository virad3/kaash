import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, PiggyBankIcon, AddLiabilityIcon, EllipsisHorizontalIcon, MagicIcon, CreditCardIcon, EarlyLoanClosureIcon } from './icons';

interface BottomNavProps {
  onNavigateToDashboard: () => void;
  onNavigateToCreditCards: () => void;
  onNavigateToEarlyLoanClosure: () => void;
  onOpenIncomeForm: () => void;
  onOpenExpenseForm: () => void;
  onOpenSavingForm: () => void;
  onOpenLiabilityForm: () => void;
  onOpenReceiptScanner: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  onNavigateToDashboard,
  onNavigateToCreditCards,
  onNavigateToEarlyLoanClosure,
  onOpenIncomeForm,
  onOpenExpenseForm,
  onOpenSavingForm,
  onOpenLiabilityForm,
  onOpenReceiptScanner,
}) => {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setIsAddMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleAddMenu = () => {
    setIsAddMenuOpen(!isAddMenuOpen);
    setIsMoreMenuOpen(false);
  };

  const toggleMoreMenu = () => {
    setIsMoreMenuOpen(!isMoreMenuOpen);
    setIsAddMenuOpen(false);
  };

  const handleAction = (action: () => void) => {
    setIsAddMenuOpen(false);
    setIsMoreMenuOpen(false);
    action();
  };

  return (
    <>
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 z-40 pb-safe">
        <div className="flex justify-around items-center h-16">
          <button onClick={onNavigateToDashboard} className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-sky-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-[10px]">Home</span>
          </button>
          
          <div className="relative w-full h-full flex justify-center items-center" ref={addMenuRef}>
            <button 
              onClick={toggleAddMenu} 
              className="flex items-center justify-center bg-sky-500 text-white rounded-full h-12 w-12 shadow-lg -mt-6 hover:bg-sky-400 transition-colors z-50 focus:outline-none"
            >
              <PlusIcon className="w-6 h-6" />
            </button>
            
            {isAddMenuOpen && (
              <div className="absolute bottom-16 mb-2 left-1/2 transform -translate-x-1/2 bg-slate-700 rounded-xl shadow-2xl border border-slate-600 p-2 w-48 z-50">
                <div className="space-y-1">
                  <button onClick={() => handleAction(onOpenSavingForm)} className="w-full text-left p-2.5 text-sm text-gray-300 hover:bg-slate-600 hover:text-teal-400 rounded-md transition-colors flex items-center">
                    <PiggyBankIcon className="w-4 h-4 mr-2.5 text-teal-500" /> Saving
                  </button>
                  <button onClick={() => handleAction(onOpenLiabilityForm)} className="w-full text-left p-2.5 text-sm text-gray-300 hover:bg-slate-600 hover:text-orange-400 rounded-md transition-colors flex items-center">
                    <AddLiabilityIcon className="w-4 h-4 mr-2.5 text-orange-500" /> Liability
                  </button>
                  <button onClick={() => handleAction(onOpenReceiptScanner)} className="w-full text-left p-2.5 text-sm text-indigo-300 hover:bg-slate-600 hover:text-indigo-400 rounded-md transition-colors flex items-center">
                    <MagicIcon className="w-4 h-4 mr-2.5 text-indigo-400" /> Scan Receipt
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative w-full h-full flex justify-center items-center" ref={moreMenuRef}>
            <button onClick={toggleMoreMenu} className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-sky-400 transition-colors focus:outline-none">
              <EllipsisHorizontalIcon className="w-6 h-6 mb-1" />
              <span className="text-[10px]">More</span>
            </button>
            
            {isMoreMenuOpen && (
              <div className="absolute bottom-16 mb-2 right-4 transform bg-slate-700 rounded-xl shadow-2xl border border-slate-600 p-2 w-48 z-50">
                <div className="space-y-1">
                  <button onClick={() => handleAction(onNavigateToCreditCards)} className="w-full text-left p-2.5 text-sm text-gray-300 hover:bg-slate-600 hover:text-sky-400 rounded-md transition-colors flex items-center">
                    <CreditCardIcon className="w-4 h-4 mr-2.5 text-sky-500" /> Credit Cards
                  </button>
                  <button onClick={() => handleAction(onNavigateToEarlyLoanClosure)} className="w-full text-left p-2.5 text-sm text-gray-300 hover:bg-slate-600 hover:text-sky-400 rounded-md transition-colors flex items-center">
                    <EarlyLoanClosureIcon className="w-4 h-4 mr-2.5 text-sky-500" /> Early Loan Closure
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Spacer to prevent content from being hidden behind the bottom nav */}
      <div className="h-16 sm:hidden w-full pb-safe"></div>
    </>
  );
};

