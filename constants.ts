import type { CreditCardInfo } from './types';

export const INCOME_CATEGORIES: string[] = [
  'Salary',
  'Freelance Income',
  'Investments',
  'Gifts Received',
  'Rental Income',
  'Business Profit',
  'Other Income',
];

export const EXPENSE_CATEGORIES: string[] = [
  'Food',
  'Transport',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Clothing',
  'Savings (General)',
  'Debt Repayment',
  'Liability Payment',
  'Other',
];

export const SAVING_CATEGORIES: string[] = [
  'Emergency Fund',
  'Vacation/Travel',
  'New Car/Vehicle',
  'House Down Payment',
  'Education Fund',
  'Retirement Fund',
  'Investment Pool',
  'General Savings',
  'Other Savings',
];

export const LIABILITY_CATEGORIES: string[] = [
  'Mortgage/Home Loan',
  'Auto Loan',
  'Student Loan',
  'Personal Loan',
  'Credit Card Debt',
  'Medical Bill',
  'Business Loan',
  'Tax Debt',
  'Other Liability',
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