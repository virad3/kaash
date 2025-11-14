import { IncomeCategory, ExpenseCategory, SavingCategory, LiabilityCategory, CreditCardInfo } from './types';

export const INCOME_CATEGORIES: IncomeCategory[] = [
  IncomeCategory.SALARY,
  IncomeCategory.FREELANCE,
  IncomeCategory.INVESTMENTS,
  IncomeCategory.GIFTS,
  IncomeCategory.RENTAL,
  IncomeCategory.BUSINESS,
  IncomeCategory.OTHER,
];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  ExpenseCategory.FOOD,
  ExpenseCategory.TRANSPORT,
  ExpenseCategory.HOUSING,
  ExpenseCategory.UTILITIES,
  ExpenseCategory.ENTERTAINMENT,
  ExpenseCategory.HEALTHCARE,
  ExpenseCategory.EDUCATION,
  ExpenseCategory.CLOTHING,
  ExpenseCategory.SAVINGS,
  ExpenseCategory.DEBT,
  ExpenseCategory.LIABILITY_PAYMENT,
  ExpenseCategory.OTHER,
];

export const SAVING_CATEGORIES: SavingCategory[] = [
  SavingCategory.EMERGENCY_FUND,
  SavingCategory.VACATION,
  SavingCategory.NEW_VEHICLE,
  SavingCategory.HOME_DOWN_PAYMENT,
  SavingCategory.EDUCATION_FUND,
  SavingCategory.RETIREMENT,
  SavingCategory.INVESTMENT_POOL,
  SavingCategory.GENERAL_SAVINGS,
  SavingCategory.OTHER,
];

export const LIABILITY_CATEGORIES: LiabilityCategory[] = [
  LiabilityCategory.MORTGAGE,
  LiabilityCategory.AUTO_LOAN,
  LiabilityCategory.STUDENT_LOAN,
  LiabilityCategory.PERSONAL_LOAN,
  LiabilityCategory.CREDIT_CARD_DEBT,
  LiabilityCategory.MEDICAL_BILL,
  LiabilityCategory.BUSINESS_LOAN,
  LiabilityCategory.TAX_DEBT,
  LiabilityCategory.OTHER,
];

export const BANK_NAMES: string[] = [
  'HDFC Bank',
  'ICICI Bank',
  'SBI Card',
  'Axis Bank',
  'American Express',
  'Kotak Mahindra Bank',
  'RBL Bank',
  'IDFC First Bank',
  'Yes Bank',
  'Federal Bank',
  'Standard Chartered',
  'Citibank',
  'Other',
];

// New data structure for pre-defined credit cards
// The CreditCardInfo interface is now imported from types.ts

export const BANK_CREDIT_CARDS: Record<string, CreditCardInfo[]> = {
  'HDFC Bank': [
    { cardName: 'Millennia', annualFee: 1000, waiverSpend: 100000 },
    { cardName: 'Regalia Gold', annualFee: 2500, waiverSpend: 400000 },
    { cardName: 'Infinia', annualFee: 12500, waiverSpend: 1000000 },
    { cardName: 'Diners Club Black', annualFee: 10000, waiverSpend: 800000 },
    { cardName: 'Tata Neu Plus', annualFee: 499, waiverSpend: 100000 },
    { cardName: 'Tata Neu Infinity', annualFee: 1499, waiverSpend: 300000 },
  ],
  'ICICI Bank': [
    { cardName: 'Amazon Pay', annualFee: 0, waiverSpend: 0 },
    { cardName: 'Sapphiro', annualFee: 6500, waiverSpend: 600000 },
    { cardName: 'Rubyx', annualFee: 3000, waiverSpend: 300000 },
    { cardName: 'Coral', annualFee: 500, waiverSpend: 150000 },
  ],
  'SBI Card': [
    { cardName: 'SimplyCLICK', annualFee: 499, waiverSpend: 100000 },
    { cardName: 'SimplySAVE', annualFee: 499, waiverSpend: 100000 },
    { cardName: 'PRIME', annualFee: 2999, waiverSpend: 300000 },
    { cardName: 'ELITE', annualFee: 4999, waiverSpend: 1000000 },
    { cardName: 'Cashback', annualFee: 999, waiverSpend: 200000 },
    { cardName: 'Octane', annualFee: 1499, waiverSpend: 200000 },
  ],
  'Axis Bank': [
    { cardName: 'Magnus', annualFee: 12500, waiverSpend: 2500000 },
    { cardName: 'Vistara Infinite', annualFee: 10000, waiverSpend: 0 },
    { cardName: 'Flipkart Axis Bank', annualFee: 500, waiverSpend: 350000 },
    { cardName: 'Airtel Axis Bank', annualFee: 500, waiverSpend: 200000 },
    { cardName: 'My Zone', annualFee: 500, waiverSpend: 0 },
    { cardName: 'Atlas', annualFee: 5000, waiverSpend: 0 },
  ],
  'American Express': [
    { cardName: 'Platinum Travel', annualFee: 5000, waiverSpend: 400000 },
    { cardName: 'Membership Rewards', annualFee: 4500, waiverSpend: 250000 },
    { cardName: 'SmartEarn', annualFee: 495, waiverSpend: 40000 },
  ],
  'Kotak Mahindra Bank': [
    { cardName: 'Urbane Gold', annualFee: 199, waiverSpend: 0 },
    { cardName: 'League Platinum', annualFee: 499, waiverSpend: 50000 },
    { cardName: 'Zen Signature', annualFee: 1500, waiverSpend: 150000 },
  ],
  'RBL Bank': [
    { cardName: 'ShopRite', annualFee: 500, waiverSpend: 100000 },
    { cardName: 'Monthly Treats', annualFee: 1000, waiverSpend: 0 },
    { cardName: 'BookMyShow Play', annualFee: 500, waiverSpend: 0 },
    { cardName: 'Indian Oil Xtra', annualFee: 1499, waiverSpend: 275000 },
  ],
  'IDFC First Bank': [
    { cardName: 'Millennia', annualFee: 0, waiverSpend: 0 },
    { cardName: 'Select', annualFee: 0, waiverSpend: 0 },
    { cardName: 'Wealth', annualFee: 0, waiverSpend: 0 },
  ],
  'Yes Bank': [
    { cardName: 'Kiwi', annualFee: 0, waiverSpend: 0 },
  ],
  'Federal Bank': [
    { cardName: 'Scapia', annualFee: 0, waiverSpend: 0 },
  ],
};


export const APP_NAME = "Kaash";