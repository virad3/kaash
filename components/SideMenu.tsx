
import React, { useEffect, useRef } from 'react';
import { KaashLogoIcon, EarlyLoanClosureIcon, CreditCardIcon } from './icons'; 

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToEarlyLoanClosure: () => void;
  onNavigateToCreditCards: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ 
  isOpen, 
  onClose,
  onNavigateToEarlyLoanClosure,
  onNavigateToCreditCards
}) => {
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
    onClose(); 
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
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {/* Main Menu Items */}
          <button
            onClick={() => handleActionClick(onNavigateToCreditCards)}
            className="w-full flex items-center p-3 text-left text-gray-200 hover:bg-slate-700 rounded-md transition-colors focus:outline-none focus:bg-slate-700"
          >
            <CreditCardIcon className="w-5 h-5 mr-3 text-indigo-400" />
            <span className="font-medium">Credit Cards</span>
          </button>
          
          <button
            onClick={() => handleActionClick(onNavigateToEarlyLoanClosure)}
            className="w-full flex items-center p-3 text-left text-gray-200 hover:bg-slate-700 rounded-md transition-colors focus:outline-none focus:bg-slate-700"
          >
            <EarlyLoanClosureIcon className="w-5 h-5 mr-3 text-sky-400" />
            <span className="font-medium">Early Loan Closure</span>
          </button>
        </nav>
        
        {/* Menu Footer */}
        <div className="p-4 border-t border-slate-700 mt-auto">
          <p className="text-xs text-gray-500 text-center">&copy; 2025 Kaash. Track Smarter, Live Better</p>
        </div>
      </div>
    </>
  );
};
