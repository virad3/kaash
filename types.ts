export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  SAVING = 'SAVING', 
}

export enum IncomeCategory {
  SALARY = 'Salary',
  FREELANCE = 'Freelance Income',
  INVESTMENTS = 'Investments',
  GIFTS = 'Gifts Received',
  RENTAL = 'Rental Income',
  BUSINESS = 'Business Profit',
  OTHER = 'Other Income',
}

export enum ExpenseCategory {
  FOOD = 'Food',
  TRANSPORT = 'Transport',
  HOUSING = 'Housing',
  UTILITIES = 'Utilities',
  ENTERTAINMENT = 'Entertainment',
  HEALTHCARE = 'Healthcare',
  EDUCATION = 'Education',
  CLOTHING = 'Clothing',
  SAVINGS = 'Savings (General)',
  DEBT = 'Debt Repayment',
  LIABILITY_PAYMENT = 'Liability Payment',
  OTHER = 'Other',
}

export enum SavingCategory {
  EMERGENCY_FUND = 'Emergency Fund',
  VACATION = 'Vacation/Travel',
  NEW_VEHICLE = 'New Car/Vehicle',
  HOME_DOWN_PAYMENT = 'House Down Payment',
  EDUCATION_FUND = 'Education Fund',
  RETIREMENT = 'Retirement Fund',
  INVESTMENT_POOL = 'Investment Pool',
  GENERAL_SAVINGS = 'General Savings',
  OTHER = 'Other Savings',
}

export enum LiabilityCategory {
  MORTGAGE = 'Mortgage/Home Loan',
  AUTO_LOAN = 'Auto Loan',
  STUDENT_LOAN = 'Student Loan',
  PERSONAL_LOAN = 'Personal Loan',
  CREDIT_CARD_DEBT = 'Credit Card Debt',
  MEDICAL_BILL = 'Medical Bill',
  BUSINESS_LOAN = 'Business Loan',
  TAX_DEBT = 'Tax Debt',
  OTHER = 'Other Liability',
}

export interface Transaction {
  id: string; 
  type: TransactionType;
  description?: string; // Made optional
  amount: number;
  date: string; 
  category: string; // Made mandatory
  relatedLiabilityId?: string;
  createdAt?: any; 
  userId?: string; 
}

export interface Liability {
  id: string; 
  name?: string; // Made optional
  initialAmount: number;
  amountRepaid: number; // This will now track total PRINCIPAL repaid
  category: string; // Made mandatory
  emiAmount?: number;
  nextDueDate: string; 
  interestRate?: number; // Annual interest rate percentage
  loanTermInMonths?: number; // Optional: total loan term
  notes?: string;
  createdAt: any; 
  userId?: string;
}

export interface User {
  uid: string; 
  email: string | null;
  name?: string | null;
  photoURL?: string | null;
}

export type View = 'dashboard' | 'incomeDetails' | 'expenseDetails' | 'savingsDetails' | 'liabilityDetails' | 'liabilityEMIDetail' | 'earlyLoanClosure';

export type CategoryTypeIdentifier = TransactionType | 'liability';

export interface UserDefinedCategories {
  income: string[];
  expense: string[];
  saving: string[];
  liability: string[];
}

// For single loan amortization result in utils.ts
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

// For multi-loan early closure calculation results
export interface IndividualLoanAmortizationResult {
  id: string;
  name: string;
  originalTermInMonths: number;
  originalTotalInterestPaid: number;
  originalPayoffDate: Date;
  newTermInMonths: number;
  newTotalInterestPaid: number;
  newPayoffDate: Date;
  interestSaved: number;
  timeSavedInMonths: number;
}

export interface MultiLoanAmortizationResult {
  overallOriginalTermInMonths: number; // Longest term among selected loans originally
  overallOriginalTotalInterestPaid: number; // Sum of original interests
  overallOriginalPayoffDate: Date; // Latest payoff date among selected loans originally
  
  overallNewTermInMonths: number; // Term to pay off ALL selected loans with additional payment
  overallNewTotalInterestPaid: number; // Sum of new interests for all selected loans
  overallNewPayoffDate: Date; // Date when the LAST of the selected loans is paid off

  interestSavedOverall: number;
  timeSavedOverallInMonths: number;
  
  individualLoanResults: IndividualLoanAmortizationResult[];
  additionalPaymentApplied: number;
}