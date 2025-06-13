import { IncomeCategory, ExpenseCategory, SavingCategory, LiabilityCategory } from './types';

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


export const APP_NAME = "Kaash";