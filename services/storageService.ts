import { db } from '../firebaseConfig'; // Corrected path
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  Timestamp, // Import Timestamp if you expect to handle it explicitly
  orderBy,
  serverTimestamp // For setting server-side timestamps
} from 'firebase/firestore';
import { Transaction, Liability, SavingsGoal } from '../types';

// Helper to remove undefined fields, as Firestore doesn't allow them
const sanitizeDataForFirestore = (data: any) => {
  const sanitized: any = {};
  for (const key in data) {
    if (data[key] !== undefined) {
      sanitized[key] = data[key];
    }
  }
  return sanitized;
};

// --- Transactions ---
export const subscribeToTransactions = (userId: string, callback: (transactions: Transaction[]) => void): (() => void) => {
  if (!userId) return () => {}; // Return a no-op unsubscribe function if no userId
  const transactionsCol = collection(db, 'users', userId, 'transactions');
  // Order by 'date' (which should be YYYY-MM-DD string) and then 'createdAt' for tie-breaking if needed
  const q = query(transactionsCol, orderBy('date', 'desc'), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (querySnapshot) => {
    const transactions: Transaction[] = [];
    querySnapshot.forEach((docSnap) => { // Renamed to docSnap to avoid conflict with doc function
      const data = docSnap.data();
      transactions.push({ 
        id: docSnap.id, 
        ...data,
        date: data.date, // Assuming date is stored as YYYY-MM-DD string
        createdAt: data.createdAt, // Keep as is, could be Timestamp or null
      } as Transaction);
    });
    callback(transactions);
  }, (error) => {
    console.error("Error fetching transactions:", error);
    callback([]);
  });
};

export const addTransaction = async (userId: string, transactionData: Omit<Transaction, 'id' | 'createdAt' | 'userId'>): Promise<string> => {
  const transactionsCol = collection(db, 'users', userId, 'transactions');
  const docRef = await addDoc(transactionsCol, sanitizeDataForFirestore({
    ...transactionData,
    userId, // Explicitly add userId
    createdAt: serverTimestamp() 
  }));
  return docRef.id;
};

export const updateTransaction = async (userId: string, transactionId: string, transactionData: Partial<Omit<Transaction, 'id'|'userId'|'createdAt'>>): Promise<void> => {
  const transactionDoc = doc(db, 'users', userId, 'transactions', transactionId);
  await updateDoc(transactionDoc, sanitizeDataForFirestore(transactionData));
};

export const deleteTransaction = async (userId: string, transactionId: string): Promise<void> => {
  const transactionDoc = doc(db, 'users', userId, 'transactions', transactionId);
  await deleteDoc(transactionDoc);
};


// --- Liabilities ---
export const subscribeToLiabilities = (userId: string, callback: (liabilities: Liability[]) => void): (() => void) => {
  if (!userId) return () => {};
  const liabilitiesCol = collection(db, 'users', userId, 'liabilities');
  const q = query(liabilitiesCol, orderBy('nextDueDate', 'asc'));

  return onSnapshot(q, (querySnapshot) => {
    const liabilities: Liability[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      liabilities.push({ 
        id: docSnap.id, 
        ...data,
        createdAt: data.createdAt,
      } as Liability);
    });
    callback(liabilities);
  }, (error) => {
    console.error("Error fetching liabilities:", error);
    callback([]);
  });
};

export const addLiability = async (userId: string, liabilityData: Omit<Liability, 'id'| 'createdAt' | 'userId'>): Promise<string> => {
  const liabilitiesCol = collection(db, 'users', userId, 'liabilities');
  const docRef = await addDoc(liabilitiesCol, sanitizeDataForFirestore({
    ...liabilityData,
    userId,
    createdAt: serverTimestamp()
  }));
  return docRef.id;
};

export const updateLiability = async (userId: string, liabilityId: string, liabilityData: Partial<Omit<Liability, 'id'|'userId'|'createdAt'>>): Promise<void> => {
  const liabilityDoc = doc(db, 'users', userId, 'liabilities', liabilityId);
  await updateDoc(liabilityDoc, sanitizeDataForFirestore(liabilityData));
};

export const deleteLiability = async (userId: string, liabilityId: string): Promise<void> => {
  const liabilityDoc = doc(db, 'users', userId, 'liabilities', liabilityId);
  await deleteDoc(liabilityDoc);
};

// --- Savings Goals ---
export const subscribeToSavingsGoals = (userId: string, callback: (savingsGoals: SavingsGoal[]) => void): (() => void) => {
  if (!userId) return () => {};
  const savingsGoalsCol = collection(db, 'users', userId, 'savingsGoals');
  const q = query(savingsGoalsCol, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (querySnapshot) => {
    const savingsGoals: SavingsGoal[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      savingsGoals.push({ 
        id: docSnap.id, 
        ...data,
        createdAt: data.createdAt,
      } as SavingsGoal);
    });
    callback(savingsGoals);
  }, (error) => {
    console.error("Error fetching savings goals:", error);
    callback([]);
  });
};

export const addSavingsGoal = async (userId: string, goalData: Omit<SavingsGoal, 'id'| 'createdAt' | 'userId'>): Promise<string> => {
  const savingsGoalsCol = collection(db, 'users', userId, 'savingsGoals');
  const docRef = await addDoc(savingsGoalsCol, sanitizeDataForFirestore({
    ...goalData,
    userId,
    createdAt: serverTimestamp()
  }));
  return docRef.id;
};

export const updateSavingsGoal = async (userId: string, goalId: string, goalData: Partial<Omit<SavingsGoal, 'id'|'userId'|'createdAt'>>): Promise<void> => {
  const goalDoc = doc(db, 'users', userId, 'savingsGoals', goalId);
  await updateDoc(goalDoc, sanitizeDataForFirestore(goalData));
};

export const deleteSavingsGoal = async (userId: string, goalId: string): Promise<void> => {
  const goalDoc = doc(db, 'users', userId, 'savingsGoals', goalId);
  await deleteDoc(goalDoc);
};
