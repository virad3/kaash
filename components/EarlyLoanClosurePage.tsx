
import React, { useState, useMemo } from 'react';
import { BackIcon, PlusIcon,CoinsIcon } from './icons'; // Assuming CoinsIcon is for savings
import { Liability } from '../types';
import { calculateLoanAmortization, formatMonthsToYearsMonthsString, formatDateForDisplay, AmortizationResult } from '../utils';

interface EarlyLoanClosurePageProps {
  liabilities: Liability[];
  onBack: () => void;
}

interface CalculationResults {
  original: AmortizationResult & { payoffDateString: string; termString: string };
  new: AmortizationResult & { payoffDateString: string; termString: string };
  interestSaved: number;
  timeSavedMonths: number;
  timeSavedString: string;
  additionalPayment: number;
  selectedLiabilityName: string;
}

export const EarlyLoanClosurePage: React.FC<EarlyLoanClosurePageProps> = ({ liabilities, onBack }) => {
  const [selectedLiabilityId, setSelectedLiabilityId] = useState<string>('');
  const [additionalPayment, setAdditionalPayment] = useState<string>('');
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeLiabilities = useMemo(() => {
    return liabilities.filter(l => l.initialAmount - l.amountRepaid > 0 && l.interestRate !== undefined && l.emiAmount !== undefined && l.emiAmount > 0);
  }, [liabilities]);

  const handleCalculate = () => {
    setError(null);
    setResults(null);

    const liability = liabilities.find(l => l.id === selectedLiabilityId);
    if (!liability) {
      setError("Please select a liability.");
      return;
    }

    if (liability.initialAmount - liability.amountRepaid <=0) {
      setError("This liability is already paid off.");
      return;
    }
    
    if (liability.interestRate === undefined || liability.interestRate === null) {
      setError("Selected liability does not have an interest rate defined. Cannot perform calculation.");
      return;
    }
    if (liability.emiAmount === undefined || liability.emiAmount === null || liability.emiAmount <=0) {
      setError("Selected liability does not have a valid EMI amount defined. Cannot perform calculation.");
      return;
    }

    const additionalPayNum = parseFloat(additionalPayment);
    if (isNaN(additionalPayNum) || additionalPayNum < 0) {
      setError("Please enter a valid non-negative additional monthly payment.");
      return;
    }
    
    const currentPrincipal = liability.initialAmount - liability.amountRepaid;
    // Use liability.nextDueDate as the starting point for amortization simulation
    const calculationStartDate = new Date(liability.nextDueDate + 'T00:00:00Z'); // Ensure UTC context for date

    try {
      const originalScenario = calculateLoanAmortization(
        currentPrincipal,
        liability.interestRate,
        liability.emiAmount,
        0, // No additional payment for original
        calculationStartDate
      );

      const newScenario = calculateLoanAmortization(
        currentPrincipal,
        liability.interestRate,
        liability.emiAmount,
        additionalPayNum,
        calculationStartDate
      );
      
      if (originalScenario.termInMonths === Infinity || newScenario.termInMonths === Infinity) {
        setError("The loan cannot be paid off with the current EMI and/or additional payment (EMI might be too low to cover interest).");
        return;
      }

      const interestSaved = originalScenario.totalInterestPaid - newScenario.totalInterestPaid;
      const timeSavedMonths = originalScenario.termInMonths - newScenario.termInMonths;

      setResults({
        original: {
          ...originalScenario,
          payoffDateString: formatDateForDisplay(originalScenario.payoffDate),
          termString: formatMonthsToYearsMonthsString(originalScenario.termInMonths),
        },
        new: {
          ...newScenario,
          payoffDateString: formatDateForDisplay(newScenario.payoffDate),
          termString: formatMonthsToYearsMonthsString(newScenario.termInMonths),
        },
        interestSaved: Math.max(0, interestSaved), // Interest saved cannot be negative
        timeSavedMonths: Math.max(0, timeSavedMonths),
        timeSavedString: formatMonthsToYearsMonthsString(Math.max(0, timeSavedMonths)),
        additionalPayment: additionalPayNum,
        selectedLiabilityName: liability.name || liability.category,
      });

    } catch (e: any) {
        console.error("Calculation error:", e);
        setError(e.message || "An unexpected error occurred during calculation.");
    }
  };

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
              Early Loan Closure Calculator
            </h1>
          </div>
        </header>

        <main className="bg-slate-800 p-4 sm:p-6 md:p-8 rounded-xl shadow-xl border border-slate-700 space-y-6">
          {activeLiabilities.length === 0 ? (
             <p className="text-gray-300 text-center py-5">
              No active liabilities with defined interest rates and EMI amounts available for calculation. Please add or update liabilities.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-end">
                <div>
                  <label htmlFor="liabilitySelect" className="block text-sm font-medium text-gray-300 mb-1">Select Liability</label>
                  <select
                    id="liabilitySelect"
                    value={selectedLiabilityId}
                    onChange={(e) => {
                      setSelectedLiabilityId(e.target.value);
                      setResults(null); // Clear previous results when liability changes
                      setError(null);
                    }}
                    className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
                  >
                    <option value="">-- Select a Liability --</option>
                    {activeLiabilities.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.name || l.category} (Outstanding: ₹{(l.initialAmount - l.amountRepaid).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="additionalPayment" className="block text-sm font-medium text-gray-300 mb-1">Additional Monthly Payment (₹)</label>
                  <input
                    type="number"
                    id="additionalPayment"
                    value={additionalPayment}
                    onChange={(e) => setAdditionalPayment(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
                    placeholder="e.g., 1000"
                    min="0"
                    step="100"
                  />
                </div>
              </div>
              <button
                onClick={handleCalculate}
                disabled={!selectedLiabilityId}
                className="w-full sm:w-auto px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Calculate Savings
              </button>
            </>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          {results && (
            <div className="mt-6 pt-6 border-t border-slate-700 space-y-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-center text-sky-300 mb-4">
                Results for: <span className="text-sky-400">{results.selectedLiabilityName}</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Scenario */}
                <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                  <h3 className="text-lg font-semibold text-gray-200 mb-3">Original Loan Scenario</h3>
                  <div className="space-y-1.5 text-sm">
                    <p><span className="text-gray-400">Loan Term:</span> {results.original.termString}</p>
                    <p><span className="text-gray-400">Total Interest Paid:</span> ₹{results.original.totalInterestPaid.toFixed(2)}</p>
                    <p><span className="text-gray-400">Estimated Payoff Date:</span> {results.original.payoffDateString}</p>
                  </div>
                </div>

                {/* New Scenario */}
                <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                  <h3 className="text-lg font-semibold text-gray-200 mb-3">With Additional ₹{results.additionalPayment.toFixed(2)}/month</h3>
                  <div className="space-y-1.5 text-sm">
                    <p><span className="text-gray-400">New Loan Term:</span> {results.new.termString}</p>
                    <p><span className="text-gray-400">New Total Interest Paid:</span> ₹{results.new.totalInterestPaid.toFixed(2)}</p>
                    <p><span className="text-gray-400">New Estimated Payoff Date:</span> {results.new.payoffDateString}</p>
                  </div>
                </div>
              </div>
              
              {/* Savings Summary */}
              <div className="bg-green-500/10 p-4 sm:p-6 rounded-lg border border-green-500/30 text-center">
                <CoinsIcon className="h-10 w-10 text-green-400 mx-auto mb-3" />
                <h3 className="text-xl sm:text-2xl font-bold text-green-300 mb-1">Total Savings!</h3>
                <p className="text-lg text-green-400 mb-1">
                  Interest Saved: <span className="font-semibold">₹{results.interestSaved.toFixed(2)}</span>
                </p>
                <p className="text-md text-gray-200">
                  Time Saved: <span className="font-semibold">{results.timeSavedString}</span>
                </p>
              </div>
               <button
                  onClick={() => {
                    setResults(null);
                    setSelectedLiabilityId('');
                    setAdditionalPayment('');
                    setError(null);
                  }}
                  className="mt-6 w-full sm:w-auto px-6 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  Clear & Reset Calculator
                </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
