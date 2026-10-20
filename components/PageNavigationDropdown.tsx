import React, { useState, useRef, useEffect } from 'react';
import { View } from '../types';

interface PageNavigationDropdownProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const VIEWS: { id: View; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'incomeDetails', label: 'Income Details' },
  { id: 'expenseDetails', label: 'Expense Details' },
  { id: 'savingsDetails', label: 'Savings Details' },
  { id: 'liabilityDetails', label: 'Liability Details' }
];

export const PageNavigationDropdown: React.FC<PageNavigationDropdownProps> = ({ currentView, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLabel = 'Navigate';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 p-1.5 sm:p-2 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <span className="text-xs sm:text-sm font-medium hidden sm:inline">{currentLabel}</span>
          <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-slate-800 border border-slate-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {VIEWS.map((view) => (
              <button
                key={view.id}
                onClick={() => {
                  onNavigate(view.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${currentView === view.id ? 'bg-slate-700 text-sky-400 font-semibold' : 'text-gray-300 hover:bg-slate-700 hover:text-white'} transition-colors`}
                role="menuitem"
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
