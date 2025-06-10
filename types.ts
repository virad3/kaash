export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
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
  SAVINGS_GOAL_CONTRIBUTION = 'Savings Goal Contribution',
  OTHER = 'Other',
}

export interface Transaction {
  id: string; // Firestore document ID
  type: TransactionType;
  description: string;
  amount: number;
  date: string; // ISO string date YYYY-MM-DD for consistency, Firestore might store as Timestamp
  category?: ExpenseCategory | string;
  relatedLiabilityId?: string;
  relatedSavingsGoalId?: string;
  createdAt?: any; // Firestore ServerTimestamp or Date for ordering
  userId?: string; 
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface Liability {
  id: string; // Firestore document ID
  name: string;
  initialAmount: number;
  amountRepaid: number;
  emiAmount?: number;
  nextDueDate: string; // ISO YYYY-MM-DD
  interestRate?: number;
  notes?: string;
  createdAt: any; // Firestore ServerTimestamp or ISO string date
  userId?: string;
}

export interface SavingsGoal {
  id: string; // Firestore document ID
  name: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: any; // Firestore ServerTimestamp or ISO string date
  userId?: string;
}

export interface User {
  uid: string; // Firebase User ID
  email: string | null;
  name?: string | null;
  photoURL?: string | null;
}

// localStorage key generators are no longer needed.
