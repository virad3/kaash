
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
 * Calculates the loan amortization schedule and summary.
 * @param currentPrincipal The current outstanding principal.
 * @param annualInterestRate The annual interest rate (e.g., 5 for 5%).
 * @param emiAmount The regular monthly EMI amount.
 * @param additionalMonthlyPayment Extra amount paid each month (defaults to 0).
 * @param startDate The date from which the calculation should start (typically liability's nextDueDate or current date).
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
    return { termInMonths: 0, totalInterestPaid: 0, payoffDate: startDate, monthlyPayments: [] };
  }
  if (emiAmount <= 0 && additionalMonthlyPayment <=0) {
    // This case should ideally be caught before calling, indicates an issue or a loan that won't be paid.
    // For calculation purposes, return a state indicating non-payment or an extremely long term.
     return { termInMonths: Infinity, totalInterestPaid: Infinity, payoffDate: new Date('9999-12-31'), monthlyPayments: [] };
  }


  const monthlyInterestRate = annualInterestRate > 0 ? annualInterestRate / 12 / 100 : 0;
  let remainingBalance = currentPrincipal;
  let totalInterestPaid = 0;
  let months = 0;
  const monthlyPayments: AmortizationResult['monthlyPayments'] = [];
  let currentDate = new Date(startDate);

  while (remainingBalance > 0 && months < 1200) { // Max 100 years to prevent infinite loops
    months++;
    const interestForMonth = monthlyInterestRate > 0 ? remainingBalance * monthlyInterestRate : 0;
    
    // Total available for payment this month (regular EMI + additional)
    const totalPaymentThisMonth = emiAmount + additionalMonthlyPayment;

    // Principal paid from the regular EMI part (cannot be more than EMI itself if interest is high)
    // and also cannot be more than remaining balance + interest.
    let principalFromEmi = Math.max(0, emiAmount - interestForMonth);
    
    // Actual total payment made, capped by remaining balance + interest
    const actualTotalPaymentMade = Math.min(totalPaymentThisMonth, remainingBalance + interestForMonth);

    let actualInterestPaid = interestForMonth;
    let actualPrincipalPaid = actualTotalPaymentMade - actualInterestPaid;
    
    // Ensure principal paid does not make balance negative beyond small rounding errors
    if (actualPrincipalPaid > remainingBalance) {
        actualPrincipalPaid = remainingBalance;
        // Adjust actualInterestPaid if total payment was fixed
        // This scenario means payment covers more than outstanding, common in final payment
        actualInterestPaid = Math.max(0, actualTotalPaymentMade - actualPrincipalPaid); 
    }
    
    // Ensure interest paid does not exceed total payment
    actualInterestPaid = Math.min(actualInterestPaid, actualTotalPaymentMade);


    totalInterestPaid += actualInterestPaid;
    remainingBalance -= actualPrincipalPaid;
    remainingBalance = Math.max(0, remainingBalance); // Ensure balance doesn't go negative

    monthlyPayments.push({
      month: months,
      interestPaid: actualInterestPaid,
      principalPaid: actualPrincipalPaid,
      remainingBalance: remainingBalance,
      additionalPaymentMade: additionalMonthlyPayment // Track the additional part if needed
    });

    if (remainingBalance <= 0) {
      break;
    }
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
  if (totalMonths === Infinity) return "Never (EMI too low)";
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
  if (!result) result = "0 months"; // Should not happen if totalMonths > 0

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
