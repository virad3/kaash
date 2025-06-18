
import React, { useState, useMemo } from 'react';
import { BackIcon, CoinsIcon, InfoIcon } from './icons'; 
import { Liability, AmortizationResult as SingleLoanAmortizationResult, MultiLoanAmortizationResult, IndividualLoanAmortizationResult } from '../types';
import { calculateLoanAmortization, formatMonthsToYearsMonthsString, formatDateForDisplay, calculateMultiLoanWeightedPrepaymentAmortization, formatTimeDifferenceString } from '../utils';

interface EarlyLoanClosurePageProps {
  liabilities: Liability[];
  onBack: () => void;
}

// Extended interface for individual results within the DisplayResults
interface FormattedIndividualLoanResult extends IndividualLoanAmortizationResult {
  originalTermString: string;
  originalPayoffDateString: string;
  newTermString: string;
  newPayoffDateString: string;
  timeSavedString: string;
  avgTotalAdditionalPrincipalFromStrategyPerMonth: number; // New field
}

// Results structure for the page state
interface DisplayResults extends MultiLoanAmortizationResult {
  overallOriginalTermString: string;
  overallOriginalPayoffDateString: string;
  overallNewTermString: string;
  overallNewPayoffDateString: string;
  timeSavedOverallString: string;
  individualLoanResultsFormatted: FormattedIndividualLoanResult[]; // Use extended interface
  enableSnowballEffectActive: boolean; // To show in results if snowball was on/off
}


export const EarlyLoanClosurePage: React.FC<EarlyLoanClosurePageProps> = ({ liabilities, onBack }) => {
  const [selectedLiabilityIds, setSelectedLiabilityIds] = useState<string[]>([]);
  const [additionalPayment, setAdditionalPayment] = useState<string>('');
  const [enableSnowball, setEnableSnowball] = useState<boolean>(true); // New state for snowball toggle
  const [results, setResults] = useState<DisplayResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeLiabilities = useMemo(() => {
    return liabilities.filter(l => 
      (l.initialAmount - l.amountRepaid) > 0.005 && 
      l.interestRate !== undefined && l.interestRate >= 0 && 
      l.emiAmount !== undefined && l.emiAmount > 0 
    );
  }, [liabilities]);

  const handleLiabilitySelection = (liabilityId: string) => {
    setSelectedLiabilityIds(prevSelected =>
      prevSelected.includes(liabilityId)
        ? prevSelected.filter(id => id !== liabilityId)
        : [...prevSelected, liabilityId]
    );
    setResults(null);
    setError(null);
  };

  const handleCalculate = () => {
    setError(null);
    setResults(null);

    if (selectedLiabilityIds.length === 0) {
      setError("Please select at least one liability.");
      return;
    }

    const selectedLiabilitiesDetails = liabilities.filter(l => selectedLiabilityIds.includes(l.id));

    if (selectedLiabilitiesDetails.some(l => (l.initialAmount - l.amountRepaid) <= 0.005 || l.interestRate === undefined || l.emiAmount === undefined || l.emiAmount <=0 )) {
         setError("One or more selected liabilities are already paid off or missing required information (interest rate, EMI). Please check and try again.");
        return;
    }
    
    const additionalPayNum = parseFloat(additionalPayment);
    if (isNaN(additionalPayNum) || additionalPayNum < 0) {
      setError("Please enter a valid non-negative additional monthly payment.");
      return;
    }

    try {
      let overallOriginalTotalInterestPaid = 0;
      let maxOriginalTermInMonths = 0;
      let latestOriginalPayoffDate = new Date(0); 
      const individualOriginalResultsBase: Omit<IndividualLoanAmortizationResult, 'newTermInMonths' | 'newTotalInterestPaid' | 'newPayoffDate' | 'interestSaved' | 'timeSavedInMonths' | 'avgShareOfUserMonthlyAddtlPayment' | 'totalAdditionalPrincipalFromStrategy' | 'monthsReceivingBenefitFromStrategy'>[] = [];


      const earliestNextDueDate = selectedLiabilitiesDetails.reduce((earliest, current) => {
          const currentDate = new Date(current.nextDueDate + 'T00:00:00Z');
          return currentDate < earliest ? currentDate : earliest;
      }, new Date(selectedLiabilitiesDetails[0].nextDueDate + 'T00:00:00Z'));


      selectedLiabilitiesDetails.forEach(l => {
        const currentPrincipal = l.initialAmount - l.amountRepaid;
        const originalScenarioSingle: SingleLoanAmortizationResult = calculateLoanAmortization(
          currentPrincipal,
          l.interestRate!,
          l.emiAmount!,
          0,
          new Date(l.nextDueDate + 'T00:00:00Z') 
        );

        if(originalScenarioSingle.termInMonths === Infinity){
            throw new Error(`Loan "${l.name || l.category}" cannot be paid off with its current EMI (too low to cover interest). Cannot proceed with multi-loan calculation.`);
        }

        overallOriginalTotalInterestPaid += originalScenarioSingle.totalInterestPaid;
        if (originalScenarioSingle.termInMonths > maxOriginalTermInMonths) {
          maxOriginalTermInMonths = originalScenarioSingle.termInMonths;
        }
        if (originalScenarioSingle.payoffDate > latestOriginalPayoffDate) {
          latestOriginalPayoffDate = originalScenarioSingle.payoffDate;
        }
        
        individualOriginalResultsBase.push({
            id: l.id,
            name: l.name || l.category,
            originalTermInMonths: originalScenarioSingle.termInMonths,
            originalTotalInterestPaid: originalScenarioSingle.totalInterestPaid,
            originalPayoffDate: originalScenarioSingle.payoffDate,
        });
      });

       const loansForMultiCalc = selectedLiabilitiesDetails.map(l => ({
        id: l.id,
        name: l.name || l.category,
        currentPrincipal: l.initialAmount - l.amountRepaid,
        annualInterestRate: l.interestRate!,
        emiAmount: l.emiAmount!,
        nextDueDate: l.nextDueDate, 
      }));

      const multiLoanNewResult = calculateMultiLoanWeightedPrepaymentAmortization(
        loansForMultiCalc,
        additionalPayNum,
        earliestNextDueDate,
        enableSnowball // Pass the snowball toggle state
      );

      if (multiLoanNewResult.overallNewTermInMonths === Infinity) {
        setError("The selected loans cannot be paid off with the current EMIs and additional payment. The additional payment might be too low to cover overall interest accumulation effectively, or one of the loans is structured in a way it cannot be paid off.");
        return;
      }

      const finalIndividualResultsFormatted: FormattedIndividualLoanResult[] = [];

      multiLoanNewResult.individualLoanResults.forEach(newResLoanState => {
        const originalResBase = individualOriginalResultsBase.find(or => or.id === newResLoanState.id);
        if (originalResBase) {
          const interestSaved = originalResBase.originalTotalInterestPaid - newResLoanState.loanNewTotalInterestPaid;
          const timeSavedInMonths = originalResBase.originalTermInMonths - newResLoanState.loanNewTermInMonths;
          const avgTotalAdditionalPrincipalFromStrategyPerMonth = (newResLoanState.totalAdditionalPrincipalFromStrategyAccumulated && newResLoanState.monthsReceivingBenefitFromStrategyAccumulated > 0)
            ? newResLoanState.totalAdditionalPrincipalFromStrategyAccumulated / newResLoanState.monthsReceivingBenefitFromStrategyAccumulated
            : 0;

          finalIndividualResultsFormatted.push({
            id: newResLoanState.id,
            name: newResLoanState.name,
            originalTermInMonths: originalResBase.originalTermInMonths,
            originalTotalInterestPaid: originalResBase.originalTotalInterestPaid,
            originalPayoffDate: originalResBase.originalPayoffDate,
            newTermInMonths: newResLoanState.loanNewTermInMonths,
            newTotalInterestPaid: newResLoanState.loanNewTotalInterestPaid,
            newPayoffDate: newResLoanState.loanNewPayoffDate || new Date('9999-12-31'),
            interestSaved: interestSaved, 
            timeSavedInMonths: timeSavedInMonths, 
            avgShareOfUserMonthlyAddtlPayment: newResLoanState.avgShareOfUserMonthlyAddtlPayment,
            totalAdditionalPrincipalFromStrategy: newResLoanState.totalAdditionalPrincipalFromStrategyAccumulated,
            monthsReceivingBenefitFromStrategy: newResLoanState.monthsReceivingBenefitFromStrategyAccumulated,
            originalTermString: formatMonthsToYearsMonthsString(originalResBase.originalTermInMonths),
            originalPayoffDateString: formatDateForDisplay(originalResBase.originalPayoffDate),
            newTermString: formatMonthsToYearsMonthsString(newResLoanState.loanNewTermInMonths),
            newPayoffDateString: formatDateForDisplay(newResLoanState.loanNewPayoffDate || new Date('9999-12-31')),
            timeSavedString: formatTimeDifferenceString(timeSavedInMonths),
            avgTotalAdditionalPrincipalFromStrategyPerMonth: avgTotalAdditionalPrincipalFromStrategyPerMonth,
          });
        }
      });
      
      const overallInterestSaved = overallOriginalTotalInterestPaid - multiLoanNewResult.overallNewTotalInterestPaid;
      const overallTimeSavedMonths = maxOriginalTermInMonths - multiLoanNewResult.overallNewTermInMonths;


      setResults({
        overallOriginalTermInMonths: maxOriginalTermInMonths,
        overallOriginalTotalInterestPaid: overallOriginalTotalInterestPaid,
        overallOriginalPayoffDate: latestOriginalPayoffDate,
        overallNewTermInMonths: multiLoanNewResult.overallNewTermInMonths,
        overallNewTotalInterestPaid: multiLoanNewResult.overallNewTotalInterestPaid,
        overallNewPayoffDate: multiLoanNewResult.overallNewPayoffDate,
        interestSavedOverall: overallInterestSaved, 
        timeSavedOverallInMonths: overallTimeSavedMonths, 
        additionalPaymentApplied: additionalPayNum,
        // The individualLoanResults in MultiLoanAmortizationResult now directly takes the formatted ones
        individualLoanResults: finalIndividualResultsFormatted.map(f => ({
            id: f.id,
            name: f.name,
            originalTermInMonths: f.originalTermInMonths,
            originalTotalInterestPaid: f.originalTotalInterestPaid,
            originalPayoffDate: f.originalPayoffDate,
            newTermInMonths: f.newTermInMonths,
            newTotalInterestPaid: f.newTotalInterestPaid,
            newPayoffDate: f.newPayoffDate,
            interestSaved: f.interestSaved,
            timeSavedInMonths: f.timeSavedInMonths,
            avgShareOfUserMonthlyAddtlPayment: f.avgShareOfUserMonthlyAddtlPayment,
            totalAdditionalPrincipalFromStrategy: f.totalAdditionalPrincipalFromStrategy,
            monthsReceivingBenefitFromStrategy: f.monthsReceivingBenefitFromStrategy,
        })),
        overallOriginalTermString: formatMonthsToYearsMonthsString(maxOriginalTermInMonths),
        overallOriginalPayoffDateString: formatDateForDisplay(latestOriginalPayoffDate),
        overallNewTermString: formatMonthsToYearsMonthsString(multiLoanNewResult.overallNewTermInMonths),
        overallNewPayoffDateString: formatDateForDisplay(multiLoanNewResult.overallNewPayoffDate),
        timeSavedOverallString: formatTimeDifferenceString(overallTimeSavedMonths), 
        individualLoanResultsFormatted: finalIndividualResultsFormatted,
        enableSnowballEffectActive: enableSnowball, // Store the setting used
      });

    } catch (e: any) {
        console.error("Calculation error:", e);
        setError(e.message || "An unexpected error occurred during calculation.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 selection:bg-sky-400 selection:text-sky-900">
      <div> 
        <header className="sticky top-0 z-30 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 py-2 sm:py-3">
            <div className="flex items-center justify-between h-full px-2 sm:px-4 lg:px-6">
                <div className="flex-none">
                    <button
                        onClick={onBack}
                        className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 p-1.5 sm:p-2 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                        aria-label="Back to Dashboard"
                    >
                        <BackIcon className="h-5 w-5" />
                        <span className="text-xs sm:text-sm font-medium hidden sm:inline">Back</span>
                    </button>
                </div>
                <div className="flex-grow text-center px-2">
                    <h1 className="text-md sm:text-lg lg:text-xl font-semibold text-sky-400 truncate">
                        Early Loan Closure Calculator
                    </h1>
                </div>
                 <div className="flex-none w-10 sm:w-[70px]"> 
                </div>
            </div>
        </header>
        <main className="mt-6 p-2 sm:p-4 md:p-6 bg-slate-800 rounded-xl shadow-xl border border-slate-700 space-y-6">
          {activeLiabilities.length === 0 ? (
             <p className="text-gray-300 text-center py-5">
              No active liabilities with defined interest rates and EMI amounts available. Add or update liabilities to use this calculator.
            </p>
          ) : (
            <>
              <div>
                <label className="block text-md font-medium text-gray-200 mb-2">Select Liabilities to Include:</label>
                <div className="space-y-2 max-h-60 overflow-y-auto bg-slate-700/30 p-3 rounded-md border border-slate-600">
                  {activeLiabilities.map(l => (
                    <div key={l.id} className="flex items-center p-2 rounded hover:bg-slate-600/50 transition-colors">
                      <input
                        type="checkbox"
                        id={`liability-${l.id}`}
                        checked={selectedLiabilityIds.includes(l.id)}
                        onChange={() => handleLiabilitySelection(l.id)}
                        className="h-5 w-5 text-sky-500 bg-slate-600 border-slate-500 rounded focus:ring-sky-400 focus:ring-offset-slate-700 mr-3 accent-sky-500"
                      />
                      <label htmlFor={`liability-${l.id}`} className="flex-grow text-sm text-gray-200 cursor-pointer">
                        {l.name || l.category} 
                        <span className="text-xs text-gray-400 ml-2">(Outstanding: ₹{(l.initialAmount - l.amountRepaid).toFixed(2)}, Rate: {l.interestRate?.toFixed(2)}%, EMI: ₹{l.emiAmount?.toFixed(2)})</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="additionalPayment" className="block text-sm font-medium text-gray-300 mb-1">Total Additional Monthly Payment (₹)</label>
                <input
                  type="number"
                  id="additionalPayment"
                  value={additionalPayment}
                  onChange={(e) => setAdditionalPayment(e.target.value)}
                  className="w-full md:w-1/2 bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
                  placeholder="e.g., 5000"
                  min="0"
                  step="100"
                />
              </div>

              <div className="mt-3 mb-3 space-y-1">
                <div className="flex items-center space-x-3">
                    <input
                    type="checkbox"
                    id="enableSnowball"
                    checked={enableSnowball}
                    onChange={(e) => {setEnableSnowball(e.target.checked); setResults(null); setError(null);}}
                    className="h-5 w-5 text-sky-500 bg-slate-600 border-slate-500 rounded focus:ring-sky-400 focus:ring-offset-slate-700 accent-sky-500"
                    aria-describedby="snowball-info"
                    />
                    <label htmlFor="enableSnowball" className="text-sm text-gray-300 cursor-pointer">
                    Reallocate freed-up EMIs (Snowball Effect)
                    </label>
                </div>
                <p id="snowball-info" className="text-xs text-gray-400 pl-8">
                    If checked, when a loan is paid off, its EMI will be added to your additional payment to further accelerate other selected loans.
                </p>
                <p className="text-xs text-gray-400 pt-1">Your additional payment {enableSnowball ? "(plus any freed EMIs from paid-off loans in the group)" : ""} will be distributed based on a weight of (Outstanding Principal × Interest Rate) of the remaining loans.</p>
              </div>


              <button
                onClick={handleCalculate}
                disabled={selectedLiabilityIds.length === 0}
                className="w-full sm:w-auto px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Calculate Group Savings
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
              <h2 className="text-xl sm:text-2xl font-semibold text-center text-sky-300 mb-2">
                Combined Results for Selected Liabilities
              </h2>
              <p className="text-xs text-gray-400 text-center -mt-1 mb-4">
                Strategy: Additional Payment ₹{results.additionalPaymentApplied.toFixed(2)}/month 
                {results.enableSnowballEffectActive ? " with Snowball Effect (freed EMIs reallocated)" : " without Snowball Effect"}.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                  <h3 className="text-lg font-semibold text-gray-200 mb-3">Original Combined Scenario</h3>
                  <div className="space-y-1.5 text-sm">
                    <p><span className="text-gray-400">Time to Clear All:</span> {results.overallOriginalTermString}</p>
                    <p><span className="text-gray-400">Total Interest Paid:</span> ₹{results.overallOriginalTotalInterestPaid.toFixed(2)}</p>
                    <p><span className="text-gray-400">Final Payoff Date:</span> {results.overallOriginalPayoffDateString}</p>
                  </div>
                </div>

                <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                  <h3 className="text-lg font-semibold text-gray-200 mb-3">With Accelerated Plan</h3>
                  <div className="space-y-1.5 text-sm">
                    <p><span className="text-gray-400">New Time to Clear All:</span> {results.overallNewTermString}</p>
                    <p><span className="text-gray-400">New Total Interest Paid:</span> ₹{results.overallNewTotalInterestPaid.toFixed(2)}</p>
                    <p><span className="text-gray-400">New Final Payoff Date:</span> {results.overallNewPayoffDateString}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-500/10 p-4 sm:p-6 rounded-lg border border-green-500/30 text-center">
                <CoinsIcon className="h-10 w-10 text-green-400 mx-auto mb-3" />
                <h3 className="text-xl sm:text-2xl font-bold text-green-300 mb-1">Overall Savings!</h3>
                <p className={`text-lg mb-1 ${results.interestSavedOverall >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  Total Interest Saved: <span className="font-semibold">₹{results.interestSavedOverall.toFixed(2)}</span>
                   {results.interestSavedOverall < 0 && " (More interest paid)"}
                </p>
                <p className={`text-md ${results.timeSavedOverallInMonths >=0 ? 'text-gray-200' : 'text-orange-300'}`}>
                  Overall Time Impact: <span className="font-semibold">{results.timeSavedOverallString}</span>
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <h3 className="text-lg sm:text-xl font-semibold text-sky-300 mb-4">Individual Loan Breakdown (Accelerated Plan)</h3>
                <div className="space-y-4">
                  {results.individualLoanResultsFormatted.map(loanRes => (
                    <div key={loanRes.id} className="bg-slate-700/40 p-3 rounded-md border border-slate-600 text-sm">
                      <h4 className="font-semibold text-sky-400 mb-1">{loanRes.name}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                        <p><span className="text-gray-400">New Term:</span> {loanRes.newTermString}</p>
                        <p><span className="text-gray-400">Interest Paid (New):</span> ₹{loanRes.newTotalInterestPaid.toFixed(2)}</p>
                        <p><span className="text-gray-400">Payoff Date (New):</span> {loanRes.newPayoffDateString}</p>
                        <p className={loanRes.interestSaved >= 0 ? 'text-green-400' : 'text-red-400'}><span className="text-gray-400">Interest Saved:</span> ₹{loanRes.interestSaved.toFixed(2)}</p>
                        <p className={`sm:col-span-2 ${loanRes.timeSavedInMonths >= 0 ? '' : 'text-orange-300'}`}><span className="text-gray-400">Time Impact (vs its original):</span> {loanRes.timeSavedString}</p>
                        <p className="sm:col-span-2"><span className="text-gray-400">Avg. Share of Your Direct Addt'l Pmt /mo:</span> <span className="text-cyan-400">₹{loanRes.avgShareOfUserMonthlyAddtlPayment.toFixed(2)}</span></p>
                        <p className="sm:col-span-2"><span className="text-gray-400">Avg. Total Addt'l Principal /mo (incl. Snowball):</span> <span className="text-teal-400 font-semibold">₹{loanRes.avgTotalAdditionalPrincipalFromStrategyPerMonth.toFixed(2)}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

               <button
                  onClick={() => {
                    setResults(null);
                    // Keep selected liabilities and additional payment as is, user might want to toggle snowball and re-calculate
                    // setSelectedLiabilityIds([]); 
                    // setAdditionalPayment('');
                    setError(null);
                  }}
                  className="mt-6 w-full sm:w-auto px-6 py-2 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  Clear Results (Keep Inputs)
                </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};