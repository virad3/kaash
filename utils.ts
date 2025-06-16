
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

  // Principal paid cannot make outstanding principal negative.
  // The actual principal reduction is capped by the outstanding amount.
  // If paymentAmount is less than interest, principalPaid could be negative,
  // meaning the loan balance might even increase if not handled (though typically payments cover interest).
  // For simplicity here, we assume payments aim to reduce principal.
  // A more advanced scenario would handle negative amortization if payment < interest.

  return {
    interestPaid: Math.max(0, interestForPeriod), // Interest cannot be negative
    principalPaid: Math.max(0, principalPaid),   // Principal paid cannot be negative for this calculation's purpose
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

  // Check if EMI is sufficient to cover interest
  if (emiAmount <= outstandingPrincipal * monthlyInterestRate) {
    return null; // EMI is less than or equal to the interest, loan will never be paid off
  }

  // N = -log(1 - (P * r) / EMI) / log(1 + r)
  // where P = outstandingPrincipal, r = monthlyInterestRate, EMI = emiAmount
  const numerator = Math.log(1 - (outstandingPrincipal * monthlyInterestRate) / emiAmount);
  const denominator = Math.log(1 + monthlyInterestRate);

  if (denominator === 0) return null; // Avoid division by zero if monthlyInterestRate is -1 (not practical)

  const remainingMonths = -numerator / denominator;

  if (isNaN(remainingMonths) || !isFinite(remainingMonths) || remainingMonths < 0) {
    return null; // Invalid result from formula
  }

  return Math.ceil(remainingMonths); // Round up to ensure full payoff
};
