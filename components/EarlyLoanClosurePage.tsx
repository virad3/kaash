import React from 'react';
import { BackIcon } from './icons';

interface EarlyLoanClosurePageProps {
  onBack: () => void;
}

export const EarlyLoanClosurePage: React.FC<EarlyLoanClosurePageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 p-2 sm:p-4 md:p-6 selection:bg-sky-400 selection:text-sky-900">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="block">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-sky-400 hover:text-sky-300 transition-colors p-2 rounded-md hover:bg-slate-700 mb-2"
              aria-label="Back"
            >
              <BackIcon className="h-6 w-6" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-sky-400 text-center w-full mt-3">
              Early Loan Closure
            </h1>
          </div>
        </header>

        <main className="bg-slate-800 p-4 sm:p-6 md:p-8 rounded-xl shadow-xl border border-slate-700">
          <p className="text-gray-300 text-center">
            This feature will help you plan and simulate early loan closures. Functionality coming soon!
          </p>
          {/* Placeholder for future content */}
        </main>
      </div>
    </div>
  );
};
