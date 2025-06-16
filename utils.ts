/**
 * Calculates the Equated Monthly Installment (EMI).
 * @param principal The principal loan amount.
 * @param annualInterestRate The annual interest rate (e.g., 5 for 5%).
 * @param termInMonths The loan term in months.
 * @returns The EMI amount, or 0 if inputs are invalid.
 */
export const calculateEMI = (principal: number, annualInterestRate: number, termInMonths: number): number => {
  if (principal <= 0 || annualInterestRate < 0 || termInMonths <= 0) {
    return 0;
  }

  if (annualInterestRate === 0) {
    return principal / termInMonths;
  }

  const monthlyRate = annualInterestRate / 12 / 100;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, termInMonths) / (Math.pow(1 + monthlyRate, termInMonths) - 1);
  return isNaN(emi) ? 0 : emi;
};

/**
 * Calculates the interest and principal components of a loan payment.
 * @param outstandingPrincipal The current outstanding principal balance of the loan.
 * @param annualInterestRate The annual interest rate (e.g., 5 for 5%).
 * @param paymentAmount The amount of the payment made.
 * @returns An object containing `interestPaid` and `principalPaid`.
 */
export const calculateLoanPaymentDetails = (
  outstandingPrincipal: number,
  annualInterestRate: number,
  paymentAmount: number
): { interestPaid: number; principalPaid: number } => {
  if (outstandingPrincipal <= 0 || annualInterestRate < 0) {
    return { interestPaid: 0, principalPaid: Math.max(0, paymentAmount) };
  }

  const monthlyRate = annualInterestRate / 12 / 100;
  let interestForPeriod = outstandingPrincipal * monthlyRate;

  // Interest should not exceed the payment amount or the outstanding principal
  interestForPeriod = Math.min(interestForPeriod, paymentAmount, outstandingPrincipal);
  
  const principalPaid = paymentAmount - interestForPeriod;

  return {
    interestPaid: Math.max(0, interestForPeriod), 
    principalPaid: Math.max(0, principalPaid),   
  };
};

/**
 * Calculates the remaining loan term in months.
 * @param outstandingPrincipal The current outstanding principal balance.
 * @param annualInterestRate The annual interest rate (e.g., 5 for 5%).
 * @param emiAmount The Equated Monthly Installment amount.
 * @returns The number of remaining months, or null if calculation is not possible (e.g., EMI too low).
 */
export const calculateRemainingLoanTerm = (
  outstandingPrincipal: number,
  annualInterestRate: number, // e.g., 5 for 5%
  emiAmount: number
): number | null => {
  if (outstandingPrincipal <= 0) {
    return 0; // Loan is already paid off
  }
  if (emiAmount <= 0) {
    return null; // Cannot pay off the loan with non-positive EMI
  }

  // If no interest rate, simple division
  if (annualInterestRate === 0) {
    return Math.ceil(outstandingPrincipal / emiAmount);
  }

  const monthlyInterestRate = annualInterestRate / 12 / 100;

  if (emiAmount <= outstandingPrincipal * monthlyInterestRate) {
    return null; 
  }

  const numerator = Math.log(1 - (outstandingPrincipal * monthlyInterestRate) / emiAmount);
  const denominator = Math.log(1 + monthlyInterestRate);

  if (denominator === 0) return null; 

  const remainingMonths = -numerator / denominator;

  if (isNaN(remainingMonths) || !isFinite(remainingMonths) || remainingMonths < 0) {
    return null; 
  }

  return Math.ceil(remainingMonths); 
};


export interface AmortizationResult {
  termInMonths: number;
  totalInterestPaid: number;
  payoffDate: Date;
  monthlyPayments: Array<{
    month: number;
    interestPaid: number;
    principalPaid: number;
    remainingBalance: number;
    additionalPaymentMade: number;
  }>;
}

/**
 * Calculates the loan amortization schedule and summary for a single loan.
 * @param currentPrincipal The current outstanding principal.
 * @param annualInterestRate The annual interest rate (e.g., 5 for 5%).
 * @param emiAmount The regular monthly EMI amount.
 * @param additionalMonthlyPayment Extra amount paid each month (defaults to 0).
 * @param startDate The date from which the calculation should start.
 * @returns AmortizationResult object.
 */
export const calculateLoanAmortization = (
  currentPrincipal: number,
  annualInterestRate: number,
  emiAmount: number,
  additionalMonthlyPayment: number = 0,
  startDate: Date
): AmortizationResult => {
  if (currentPrincipal <= 0) {
    return { termInMonths: 0, totalInterestPaid: 0, payoffDate: new Date(startDate), monthlyPayments: [] };
  }
   const totalMonthlyPayment = emiAmount + additionalMonthlyPayment;
  if (totalMonthlyPayment <= 0) {
     return { termInMonths: Infinity, totalInterestPaid: Infinity, payoffDate: new Date('9999-12-31'), monthlyPayments: [] };
  }
  
  const monthlyInterestRate = annualInterestRate > 0 ? annualInterestRate / 12 / 100 : 0;
  
  if (monthlyInterestRate > 0 && totalMonthlyPayment <= currentPrincipal * monthlyInterestRate && totalMonthlyPayment < currentPrincipal) {
    // EMI doesn't even cover interest for the first month, and it's not the final payment
    return { termInMonths: Infinity, totalInterestPaid: Infinity, payoffDate: new Date('9999-12-31'), monthlyPayments: [] };
  }


  let remainingBalance = currentPrincipal;
  let totalInterestPaid = 0;
  let months = 0;
  const monthlyPayments: AmortizationResult['monthlyPayments'] = [];
  
  while (remainingBalance > 0 && months < 1200) { // Max 100 years
    months++;
    const interestForMonth = monthlyInterestRate > 0 ? remainingBalance * monthlyInterestRate : 0;
    
    let paymentThisMonth = totalMonthlyPayment;
    if (paymentThisMonth >= remainingBalance + interestForMonth) { // Final payment
        paymentThisMonth = remainingBalance + interestForMonth;
    }
    
    let principalPaid = paymentThisMonth - interestForMonth;
    if (principalPaid < 0) principalPaid = 0; // Ensure principal paid isn't negative

    // Ensure principal paid doesn't exceed remaining balance more than a tiny rounding diff
    if (principalPaid > remainingBalance + 0.005) {
        principalPaid = remainingBalance;
    }


    const actualInterestThisMonth = paymentThisMonth - principalPaid;

    totalInterestPaid += actualInterestThisMonth;
    remainingBalance -= principalPaid;
    remainingBalance = Math.max(0, remainingBalance);

    monthlyPayments.push({
      month: months,
      interestPaid: actualInterestThisMonth,
      principalPaid: principalPaid,
      remainingBalance: remainingBalance,
      additionalPaymentMade: additionalMonthlyPayment 
    });

    if (remainingBalance <= 0) break;
  }
  
  const payoffDate = new Date(startDate);
  payoffDate.setMonth(startDate.getMonth() + months);

  return { termInMonths: months, totalInterestPaid, payoffDate, monthlyPayments };
};


/**
 * Formats a total number of months into a string like "X years Y months (Z total months)".
 * @param totalMonths The total number of months.
 * @returns A formatted string.
 */
export const formatMonthsToYearsMonthsString = (totalMonths: number): string => {
  if (totalMonths === Infinity) return "Never (Payment too low)";
  if (totalMonths < 0) return "N/A";
  if (totalMonths === 0) return "0 months";

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  let result = "";
  if (years > 0) {
    result += `${years} year${years > 1 ? 's' : ''}`;
  }
  if (months > 0) {
    if (years > 0) result += " ";
    result += `${months} month${months > 1 ? 's' : ''}`;
  }
  if (!result && totalMonths > 0) result = "0 months"; 
  if (totalMonths === 0 && years === 0 && months === 0) result = "0 months";


  return `${result} (${totalMonths} total months)`;
};

/**
 * Formats a Date object into "Month YYYY" (e.g., "July 2024").
 * @param date The Date object to format.
 * @returns A string representing the month and year.
 */
export const formatDateForDisplay = (date: Date): string => {
  if (!date || isNaN(date.getTime())) return "N/A";
  if (date.getFullYear() > 9000) return "Very far future"; // For Infinity payoff date
  return date.toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' });
};


// For multi-loan early closure calculation results
export interface SimulatedLoanState {
  id: string;
  name: string;
  originalPrincipal: number; // Store for reference
  remainingPrincipal: number;
  annualInterestRate: number;
  originalEmiAmount: number;
  
  // Accumulated results for this loan in the new scenario
  loanNewTotalInterestPaid: number;
  loanNewTermInMonths: number;
  loanNewPayoffDate: Date | null;

  // Temporary per-month calculation fields
  currentMonthInterest: number;
  currentMonthPrincipalFromEmi: number;
  currentMonthAdditionalPrincipal: number;
  isPaidOff: boolean;
  paidOffMonth: number | null;
}
export interface MultiLoanAmortizationResultForUtil {
  overallNewTermInMonths: number;
  overallNewTotalInterestPaid: number;
  overallNewPayoffDate: Date;
  individualLoanResults: SimulatedLoanState[];
}

export const calculateMultiLoanAvalancheAmortization = (
  selectedLoansData: Array<{id: string; name: string; currentPrincipal: number; annualInterestRate: number; emiAmount: number; nextDueDate: string}>,
  totalAdditionalMonthlyPayment: number,
  simulationStartDate: Date // Should be the earliest nextDueDate or current date
): MultiLoanAmortizationResultForUtil => {

  const simulatedLoans: SimulatedLoanState[] = selectedLoansData.map(loan => ({
    id: loan.id,
    name: loan.name,
    originalPrincipal: loan.currentPrincipal,
    remainingPrincipal: loan.currentPrincipal,
    annualInterestRate: loan.annualInterestRate,
    originalEmiAmount: loan.emiAmount,
    loanNewTotalInterestPaid: 0,
    loanNewTermInMonths: 0,
    loanNewPayoffDate: null,
    currentMonthInterest: 0,
    currentMonthPrincipalFromEmi: 0,
    currentMonthAdditionalPrincipal: 0,
    isPaidOff: false,
    paidOffMonth: null,
  }));

  let currentOverallMonth = 0;
  let overallNewTotalInterestPaid = 0;
  const MAX_MONTHS = 1200; // 100 years limit

  while (simulatedLoans.some(loan => !loan.isPaidOff) && currentOverallMonth < MAX_MONTHS) {
    currentOverallMonth++;
    let additionalPaymentPoolForThisMonth = totalAdditionalMonthlyPayment;
    let totalFreedUpEmisThisMonth = 0;

    // Calculate freed-up EMIs from loans already paid off in previous months
    simulatedLoans.forEach(loan => {
      if (loan.isPaidOff) {
        totalFreedUpEmisThisMonth += loan.originalEmiAmount;
      }
    });
    additionalPaymentPoolForThisMonth += totalFreedUpEmisThisMonth;
    
    // Phase 1: Process regular EMIs for all active loans
    for (const simLoan of simulatedLoans) {
      if (simLoan.isPaidOff || simLoan.remainingPrincipal <= 0) continue;

      const monthlyRate = simLoan.annualInterestRate / 12 / 100;
      simLoan.currentMonthInterest = simLoan.remainingPrincipal * monthlyRate;
      
      let paymentTowardsEmi = simLoan.originalEmiAmount;
      if (paymentTowardsEmi >= simLoan.remainingPrincipal + simLoan.currentMonthInterest) { // Final EMI payment for this loan
        paymentTowardsEmi = simLoan.remainingPrincipal + simLoan.currentMonthInterest;
      }
      
      simLoan.currentMonthPrincipalFromEmi = paymentTowardsEmi - simLoan.currentMonthInterest;
      if (simLoan.currentMonthPrincipalFromEmi < 0) simLoan.currentMonthPrincipalFromEmi = 0; // EMI doesn't cover interest
    }

    // Phase 2: Distribute `additionalPaymentPoolForThisMonth` (Avalanche)
    const activeLoansSortedForAvalanche = simulatedLoans
      .filter(loan => !loan.isPaidOff && loan.remainingPrincipal > 0 && (loan.remainingPrincipal - (loan.currentMonthPrincipalFromEmi || 0) > 0.005) ) // Check if principal remains after EMI
      .sort((a, b) => b.annualInterestRate - a.annualInterestRate || b.remainingPrincipal - a.remainingPrincipal); // Highest rate, then highest balance

    for (const simLoan of activeLoansSortedForAvalanche) {
      if (additionalPaymentPoolForThisMonth <= 0.005) break; // Pool exhausted

      const principalRemainingAfterEmi = simLoan.remainingPrincipal - (simLoan.currentMonthPrincipalFromEmi || 0);
      if (principalRemainingAfterEmi <= 0.005) continue; // Already handled by EMI

      const extraPaymentApplied = Math.min(additionalPaymentPoolForThisMonth, principalRemainingAfterEmi);
      
      simLoan.currentMonthAdditionalPrincipal = (simLoan.currentMonthAdditionalPrincipal || 0) + extraPaymentApplied;
      additionalPaymentPoolForThisMonth -= extraPaymentApplied;
    }
    
    // Phase 3: Finalize balances and accumulate totals for the month
    for (const simLoan of simulatedLoans) {
      if (simLoan.isPaidOff || simLoan.remainingPrincipal <= 0) continue;

      const totalPrincipalPaidThisLoanThisMonth = (simLoan.currentMonthPrincipalFromEmi || 0) + (simLoan.currentMonthAdditionalPrincipal || 0);
      
      simLoan.remainingPrincipal -= totalPrincipalPaidThisLoanThisMonth;
      simLoan.loanNewTotalInterestPaid += (simLoan.currentMonthInterest || 0);
      
      // Increment term if loan was active or just paid off
      if (totalPrincipalPaidThisLoanThisMonth > 0 || (simLoan.currentMonthInterest || 0) > 0 || simLoan.remainingPrincipal > 0) {
           simLoan.loanNewTermInMonths++;
      }


      if (simLoan.remainingPrincipal <= 0.005) { // Using a small epsilon for float comparison
        simLoan.remainingPrincipal = 0;
        if (!simLoan.isPaidOff) { // Mark as paid off this month
          simLoan.isPaidOff = true;
          simLoan.paidOffMonth = currentOverallMonth;
          const payoffD = new Date(simulationStartDate);
          payoffD.setMonth(simulationStartDate.getMonth() + currentOverallMonth);
          simLoan.loanNewPayoffDate = payoffD;
        }
      }
      
      // Clear temporary month variables
      simLoan.currentMonthInterest = 0;
      simLoan.currentMonthPrincipalFromEmi = 0;
      simLoan.currentMonthAdditionalPrincipal = 0;
    }
    overallNewTotalInterestPaid = simulatedLoans.reduce((sum, loan) => sum + loan.loanNewTotalInterestPaid, 0);
  }

  const overallPayoffDate = new Date(simulationStartDate);
  overallPayoffDate.setMonth(simulationStartDate.getMonth() + currentOverallMonth);
  if (currentOverallMonth >= MAX_MONTHS && simulatedLoans.some(l => !l.isPaidOff)) {
     // Indicates failure to pay off within reasonable timeframe
     return {
        overallNewTermInMonths: Infinity,
        overallNewTotalInterestPaid: Infinity,
        overallNewPayoffDate: new Date('9999-12-31'),
        individualLoanResults: simulatedLoans.map(sl => ({...sl, loanNewTermInMonths: sl.isPaidOff ? sl.loanNewTermInMonths : Infinity }))
     };
  }


  return {
    overallNewTermInMonths: currentOverallMonth,
    overallNewTotalInterestPaid,
    overallNewPayoffDate: overallPayoffDate,
    individualLoanResults: simulatedLoans,
  };
};