import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, KaashLogoIcon, BackIcon } from './icons'; // Assuming BackIcon can be repurposed or a ChevronDownIcon for submenu
import { TransactionType } from '../types';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenIncomeForm: () => void;
  onOpenExpenseForm: () => void;
  onOpenSavingForm: () => void;
  onOpenLiabilityForm: () => void;
  // Add more props for other menu items if needed in the future
}

export const SideMenu: React.FC<SideMenuProps> = ({ 
  isOpen, 
  onClose,
  onOpenIncomeForm,
  onOpenExpenseForm,
  onOpenSavingForm,
  onOpenLiabilityForm
}) => {
  const [isRecordSubmenuOpen, setIsRecordSubmenuOpen] = useState(true); // Changed initial state to true
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleActionClick = (action: () => void) => {
    action();
    onClose(); // Close the main menu after an action is taken
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Menu Panel */}
      <div
        ref={menuRef}
        className={`fixed inset-y-0 left-0 w-72 sm:w-80 bg-slate-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-title"
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <KaashLogoIcon className="h-8 w-8 text-sky-400" />
            <h2 id="menu-title" className="text-xl font-semibold text-sky-400">Kaash</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-sky-400 rounded-md hover:bg-slate-700 transition-colors"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {/* Record Transaction Section */}
          <div>
            <button
              onClick={() => setIsRecordSubmenuOpen(!isRecordSubmenuOpen)}
              className="w-full flex items-center justify-between p-3 text-left text-gray-200 hover:bg-slate-700 rounded-md transition-colors focus:outline-none focus:bg-slate-700"
              aria-expanded={isRecordSubmenuOpen}
            >
              <span className="font-medium">Record Transaction</span>
              <svg 
                className={`w-5 h-5 transform transition-transform duration-200 ${isRecordSubmenuOpen ? 'rotate-180' : ''}`} 
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {isRecordSubmenuOpen && (
              <div className="pl-4 mt-1 space-y-1 border-l-2 border-slate-700 ml-3">
                <button
                  onClick={() => handleActionClick(onOpenIncomeForm)}
                  className="w-full text-left p-2.5 text-sm text-gray-300 hover:bg-slate-600 hover:text-green-400 rounded-md transition-colors flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2.5 text-green-500" /> Add Income
                </button>
                <button
                  onClick={() => handleActionClick(onOpenExpenseForm)}
                  className="w-full text-left p-2.5 text-sm text-gray-300 hover:bg-slate-600 hover:text-red-400 rounded-md transition-colors flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2.5 text-red-500" /> Add Expense
                </button>
                <button
                  onClick={() => handleActionClick(onOpenSavingForm)}
                  className="w-full text-left p-2.5 text-sm text-gray-300 hover:bg-slate-600 hover:text-teal-400 rounded-md transition-colors flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2.5 text-teal-500" /> Add Saving
                </button>
                <button
                  onClick={() => handleActionClick(onOpenLiabilityForm)}
                  className="w-full text-left p-2.5 text-sm text-gray-300 hover:bg-slate-600 hover:text-orange-400 rounded-md transition-colors flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2.5 text-orange-500" /> Add Liability
                </button>
              </div>
            )}
          </div>

          {/* Other future menu items can go here, e.g.:
          <button className="w-full text-left p-3 text-gray-200 hover:bg-slate-700 rounded-md transition-colors focus:outline-none focus:bg-slate-700 font-medium">
            View Reports
          </button>
          <button className="w-full text-left p-3 text-gray-200 hover:bg-slate-700 rounded-md transition-colors focus:outline-none focus:bg-slate-700 font-medium">
            Settings
          </button>
          */}
        </nav>
        
        {/* Menu Footer */}
        <div className="p-4 border-t border-slate-700 mt-auto"> {/* mt-auto pushes to bottom */}
          <p className="text-xs text-gray-500 text-center">&copy; 2025 Kaash. Track Smarter, Live Better</p>
        </div>
      </div>
    </>
  );
};