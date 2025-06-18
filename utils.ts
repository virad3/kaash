
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
 * Focuses on displaying an absolute term.
 * @param totalMonths The total number of months.
 * @returns A formatted string for term duration.
 */
export const formatMonthsToYearsMonthsString = (totalMonths: number): string => {
  if (totalMonths === Infinity) return "Never (Payment too low)";
  if (totalMonths < 0) return "N/A (Invalid term)"; // Should not happen for absolute terms
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
  
  // Handles cases where totalMonths is < 12 or exactly 0 after year/month breakdown (e.g. totalMonths = 0)
  if (!result && totalMonths > 0) result = `${totalMonths} month${totalMonths > 1 ? 's' : ''}`;
  if (totalMonths === 0 && years === 0 && months === 0) result = "0 months";


  return `${result} (${totalMonths} total months)`;
};

/**
 * Formats a difference in months into a string like "X years Y months saved" or "X years Y months longer".
 * @param totalMonthsDifference The difference in total months. Positive if time saved, negative if time lost.
 * @returns A formatted string for time difference.
 */
export const formatTimeDifferenceString = (totalMonthsDifference: number): string => {
  if (totalMonthsDifference === 0) return "No change in duration";
  if (totalMonthsDifference === Infinity) return "Infinite time saved (was unpayable)";
  if (totalMonthsDifference === -Infinity) return "Infinitely longer (became unpayable)";


  const absTotalMonths = Math.abs(totalMonthsDifference);
  const years = Math.floor(absTotalMonths / 12);
  const months = absTotalMonths % 12;

  let termString = "";
  if (years > 0) {
    termString += `${years} year${years > 1 ? 's' : ''}`;
  }
  if (months > 0) {
    if (years > 0) termString += " ";
    termString += `${months} month${months > 1 ? 's' : ''}`;
  }
  
  if (!termString && absTotalMonths > 0) { 
      termString = `${absTotalMonths} month${absTotalMonths > 1 ? 's' : ''}`;
  }
  if (!termString && absTotalMonths === 0) { // Should be caught by totalMonthsDifference === 0
      return "No change in duration";
  }


  if (totalMonthsDifference < 0) {
    return `${termString} longer`;
  }
  return `${termString} saved`;
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
  originalPrincipal: number; 
  remainingPrincipal: number;
  annualInterestRate: number;
  originalEmiAmount: number;
  
  loanNewTotalInterestPaid: number;
  loanNewTermInMonths: number;
  loanNewPayoffDate: Date | null;
  
  sumOfDirectSharesFromUserInput: number; 
  monthsReceivingDirectShare: number;   
  avgShareOfUserMonthlyAddtlPayment: number; 

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

export const calculateMultiLoanWeightedPrepaymentAmortization = (
  selectedLoansData: Array<{id: string; name: string; currentPrincipal: number; annualInterestRate: number; emiAmount: number; nextDueDate: string}>,
  userDirectMonthlyAdditionalPayment: number, 
  simulationStartDate: Date,
  enableSnowballEffect: boolean // New parameter
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
    sumOfDirectSharesFromUserInput: 0, 
    monthsReceivingDirectShare: 0,   
    avgShareOfUserMonthlyAddtlPayment: 0,
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
    let totalFreedUpEmisThisMonth = 0;

    if (enableSnowballEffect) { // Apply snowball based on parameter
        simulatedLoans.forEach(loan => {
            if (loan.isPaidOff) {
                totalFreedUpEmisThisMonth += loan.originalEmiAmount;
            }
        });
    }
    
    const actualAdditionalPaymentPoolForPrincipalReduction = userDirectMonthlyAdditionalPayment + totalFreedUpEmisThisMonth;
    
    for (const simLoan of simulatedLoans) {
      if (simLoan.isPaidOff || simLoan.remainingPrincipal <= 0.005) continue;

      const monthlyRate = simLoan.annualInterestRate / 12 / 100;
      simLoan.currentMonthInterest = simLoan.remainingPrincipal * monthlyRate;
      
      let paymentTowardsEmi = simLoan.originalEmiAmount;
      if (paymentTowardsEmi >= simLoan.remainingPrincipal + simLoan.currentMonthInterest) { 
        paymentTowardsEmi = simLoan.remainingPrincipal + simLoan.currentMonthInterest;
      }
      
      simLoan.currentMonthPrincipalFromEmi = paymentTowardsEmi - simLoan.currentMonthInterest;
      if (simLoan.currentMonthPrincipalFromEmi < 0) simLoan.currentMonthPrincipalFromEmi = 0; 
    }

    const activeLoansForWeighting = simulatedLoans.filter(loan => 
        !loan.isPaidOff && 
        loan.remainingPrincipal > 0.005 &&
        (loan.remainingPrincipal - (loan.currentMonthPrincipalFromEmi || 0) > 0.005) 
    );
    
    let totalWeight = 0;
    const loanWeights: Array<{loan: SimulatedLoanState, weight: number, principalRemainingAfterEmi: number}> = [];

    if (activeLoansForWeighting.length > 0) {
        activeLoansForWeighting.forEach(loan => {
            const principalAfterEmiPortion = loan.remainingPrincipal - (loan.currentMonthPrincipalFromEmi || 0);
            const weight = Math.max(0, principalAfterEmiPortion) * (loan.annualInterestRate > 0 ? loan.annualInterestRate : 0.00001); 
            loanWeights.push({ loan, weight, principalRemainingAfterEmi: principalAfterEmiPortion });
            totalWeight += weight;
        });

        let tempAdditionalPool = actualAdditionalPaymentPoolForPrincipalReduction;
        if (totalWeight > 0) {
            for (const { loan, weight, principalRemainingAfterEmi } of loanWeights) {
                if (tempAdditionalPool <= 0.005) break;
                if (principalRemainingAfterEmi <= 0.005) continue;

                const weightedShare = (weight / totalWeight) * tempAdditionalPool;
                const extraPaymentAppliedToLoan = Math.min(weightedShare, principalRemainingAfterEmi, tempAdditionalPool);
                
                loan.currentMonthAdditionalPrincipal = (loan.currentMonthAdditionalPrincipal || 0) + extraPaymentAppliedToLoan;
                tempAdditionalPool -= extraPaymentAppliedToLoan;
            }
        }
        
        if (tempAdditionalPool > 0.005 && activeLoansForWeighting.length > 0) {
           const sortedActiveForRemainder = activeLoansForWeighting
            .filter(lw => (lw.remainingPrincipal - (lw.currentMonthPrincipalFromEmi || 0) - (lw.currentMonthAdditionalPrincipal || 0)) > 0.005) 
            .sort((a,b) => (b.remainingPrincipal - (b.currentMonthPrincipalFromEmi || 0)) - (a.remainingPrincipal - (a.currentMonthPrincipalFromEmi || 0))); 

            for (const loan of sortedActiveForRemainder) {
                if (tempAdditionalPool <= 0.005) break;
                const principalCanTake = loan.remainingPrincipal - (loan.currentMonthPrincipalFromEmi || 0) - (loan.currentMonthAdditionalPrincipal || 0);
                const paymentToApply = Math.min(tempAdditionalPool, principalCanTake);
                loan.currentMonthAdditionalPrincipal = (loan.currentMonthAdditionalPrincipal || 0) + paymentToApply;
                tempAdditionalPool -= paymentToApply;
            }
        }
    }
    
    let totalCurrentMonthAdditionalPrincipalAllLoans = 0;
    for (const simLoan of simulatedLoans) {
        if (!simLoan.isPaidOff && simLoan.currentMonthAdditionalPrincipal > 0.005) {
            totalCurrentMonthAdditionalPrincipalAllLoans += simLoan.currentMonthAdditionalPrincipal;
        }
    }

    if (totalCurrentMonthAdditionalPrincipalAllLoans > 0.005 && userDirectMonthlyAdditionalPayment > 0.005) {
        for (const simLoan of simulatedLoans) {
            if (!simLoan.isPaidOff && simLoan.currentMonthAdditionalPrincipal > 0.005) {
                const proportionOfTotalExtra = simLoan.currentMonthAdditionalPrincipal / totalCurrentMonthAdditionalPrincipalAllLoans;
                const directShareThisMonth = proportionOfTotalExtra * userDirectMonthlyAdditionalPayment;

                simLoan.sumOfDirectSharesFromUserInput += directShareThisMonth;
                simLoan.monthsReceivingDirectShare++;
            }
        }
    }

    for (const simLoan of simulatedLoans) {
      if (simLoan.isPaidOff || simLoan.remainingPrincipal <= 0.005) continue;

      const totalPrincipalPaidThisLoanThisMonth = (simLoan.currentMonthPrincipalFromEmi || 0) + (simLoan.currentMonthAdditionalPrincipal || 0);
      
      simLoan.remainingPrincipal -= totalPrincipalPaidThisLoanThisMonth;
      simLoan.loanNewTotalInterestPaid += (simLoan.currentMonthInterest || 0);
      
      if (totalPrincipalPaidThisLoanThisMonth > 0.005 || (simLoan.currentMonthInterest || 0) > 0.005 ) {
           simLoan.loanNewTermInMonths++;
      }

      if (simLoan.remainingPrincipal <= 0.005) { 
        simLoan.remainingPrincipal = 0;
        if (!simLoan.isPaidOff) { 
          simLoan.isPaidOff = true;
          simLoan.paidOffMonth = currentOverallMonth;
          const payoffD = new Date(simulationStartDate);
          payoffD.setMonth(simulationStartDate.getMonth() + currentOverallMonth);
          simLoan.loanNewPayoffDate = payoffD;
        }
      }
      
      simLoan.currentMonthInterest = 0;
      simLoan.currentMonthPrincipalFromEmi = 0;
      simLoan.currentMonthAdditionalPrincipal = 0;
    }
    overallNewTotalInterestPaid = simulatedLoans.reduce((sum, loan) => sum + loan.loanNewTotalInterestPaid, 0);
  }

  simulatedLoans.forEach(loan => {
    loan.avgShareOfUserMonthlyAddtlPayment = loan.monthsReceivingDirectShare > 0
      ? loan.sumOfDirectSharesFromUserInput / loan.monthsReceivingDirectShare
      : 0;
  });

  const overallPayoffDate = new Date(simulationStartDate);
  if (currentOverallMonth === Infinity || currentOverallMonth >= MAX_MONTHS && simulatedLoans.some(l => !l.isPaidOff)) {
     overallPayoffDate.setFullYear(9999); 
      return {
        overallNewTermInMonths: Infinity,
        overallNewTotalInterestPaid: Infinity,
        overallNewPayoffDate: overallPayoffDate,
        individualLoanResults: simulatedLoans.map(sl => ({...sl, loanNewTermInMonths: sl.isPaidOff ? sl.loanNewTermInMonths : Infinity }))
     };
  } else {
    overallPayoffDate.setMonth(simulationStartDate.getMonth() + currentOverallMonth);
  }


  return {
    overallNewTermInMonths: currentOverallMonth,
    overallNewTotalInterestPaid,
    overallNewPayoffDate: overallPayoffDate,
    individualLoanResults: simulatedLoans,
  };
};
