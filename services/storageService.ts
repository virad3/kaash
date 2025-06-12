
import { db } from '../firebaseConfig'; 
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  Timestamp, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { Transaction, Liability, TransactionType } from '../types'; 

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
  if (!userId) return () => {}; 
  const transactionsCol = collection(db, 'users', userId, 'transactions');
  const q = query(transactionsCol, orderBy('date', 'desc'), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (querySnapshot) => {
    const transactions: Transaction[] = [];
    querySnapshot.forEach((docSnap) => { 
      const data = docSnap.data();
      
      const transactionItem: Transaction = {
        id: docSnap.id,
        type: data.type as TransactionType, 
        description: data.description as (string | undefined), 
        amount: data.amount as number,
        date: data.date as string, 
        category: data.category as string, 
        relatedLiabilityId: data.relatedLiabilityId as (string | undefined),
        createdAt: data.createdAt, 
        userId: data.userId as (string | undefined) 
      };

      if (!transactionItem.type || 
          (transactionItem.type !== TransactionType.INCOME && transactionItem.type !== TransactionType.EXPENSE && transactionItem.type !== TransactionType.SAVING) ||
          !transactionItem.date || typeof transactionItem.date !== 'string' || 
          (transactionItem.description !== undefined && typeof transactionItem.description !== 'string') || 
          typeof transactionItem.amount !== 'number' ||
          typeof transactionItem.category !== 'string' || !transactionItem.category.trim() 
        ) {
        console.warn(
          `Transaction ${transactionItem.id} from Firestore is missing critical fields (amount, date, category), has an invalid type/date format, or they are undefined. Skipping. Received data:`, 
          JSON.stringify(data)
        );
        return; 
      }
      
      transactions.push(transactionItem);
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
    userId, 
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
    const liabilitiesData: Liability[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const liabilityItem: Liability = {
        id: docSnap.id,
        name: data.name as (string | undefined), 
        initialAmount: data.initialAmount as number,
        amountRepaid: data.amountRepaid as number,
        category: data.category as string, 
        emiAmount: data.emiAmount as number | undefined,
        nextDueDate: data.nextDueDate as string,
        interestRate: data.interestRate as number | undefined,
        loanTermInMonths: data.loanTermInMonths as number | undefined,
        notes: data.notes as string | undefined,
        createdAt: data.createdAt, 
        userId: data.userId as (string | undefined)
      };

      if ((liabilityItem.name !== undefined && typeof liabilityItem.name !== 'string') || 
          typeof liabilityItem.initialAmount !== 'number' ||
          typeof liabilityItem.amountRepaid !== 'number' ||
          typeof liabilityItem.nextDueDate !== 'string' ||
          typeof liabilityItem.category !== 'string' || !liabilityItem.category.trim() || 
          (liabilityItem.loanTermInMonths !== undefined && typeof liabilityItem.loanTermInMonths !== 'number') ||
          !liabilityItem.createdAt) {
           console.warn(
            `Liability ${liabilityItem.id} from Firestore is missing critical fields or has invalid types. Skipping. Received data:`,
            JSON.stringify(data)
           );
           return;
      }
      liabilitiesData.push(liabilityItem);
    });
    callback(liabilitiesData);
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
