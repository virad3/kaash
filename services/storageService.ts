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
  serverTimestamp,
  setDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  writeBatch,
  where
} from 'firebase/firestore';
import { Transaction, Liability, TransactionType, UserDefinedCategories, CategoryTypeIdentifier } from '../types'; 

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
        category: String(data.category || 'Uncategorized'), // Ensure category is a string
        relatedLiabilityId: data.relatedLiabilityId as (string | undefined),
        createdAt: data.createdAt, 
        userId: data.userId as (string | undefined) 
      };

      if (!transactionItem.type || 
          (transactionItem.type !== TransactionType.INCOME && transactionItem.type !== TransactionType.EXPENSE && transactionItem.type !== TransactionType.SAVING) ||
          !transactionItem.date || typeof transactionItem.date !== 'string' || 
          (transactionItem.description !== undefined && typeof transactionItem.description !== 'string') || 
          typeof transactionItem.amount !== 'number' ||
          !transactionItem.category.trim() 
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
  const payload = {
    ...transactionData,
    category: String(transactionData.category || 'Uncategorized').trim(), 
    userId, 
    createdAt: serverTimestamp() 
  };
  if (!payload.category) { 
    payload.category = 'Uncategorized';
  }
  const docRef = await addDoc(transactionsCol, sanitizeDataForFirestore(payload));
  return docRef.id;
};

export const updateTransaction = async (userId: string, transactionId: string, transactionData: Partial<Omit<Transaction, 'id'|'userId'|'createdAt'>>): Promise<void> => {
  const transactionDoc = doc(db, 'users', userId, 'transactions', transactionId);
  const payload = { ...transactionData };
  if (payload.category !== undefined) {
    payload.category = String(payload.category || 'Uncategorized').trim();
    if (!payload.category) {
      payload.category = 'Uncategorized';
    }
  }
  await updateDoc(transactionDoc, sanitizeDataForFirestore(payload));
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
        category: String(data.category || 'Other Liability'), 
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
          !liabilityItem.category.trim() || 
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
  const payload = {
    ...liabilityData,
    category: String(liabilityData.category || 'Other Liability').trim(),
    userId,
    createdAt: serverTimestamp()
  };
  if (!payload.category) {
    payload.category = 'Other Liability';
  }
  const docRef = await addDoc(liabilitiesCol, sanitizeDataForFirestore(payload));
  return docRef.id;
};

export const updateLiability = async (userId: string, liabilityId: string, liabilityData: Partial<Omit<Liability, 'id'|'userId'|'createdAt'>>): Promise<void> => {
  const liabilityDoc = doc(db, 'users', userId, 'liabilities', liabilityId);
  const payload = { ...liabilityData };
  if (payload.category !== undefined) {
    payload.category = String(payload.category || 'Other Liability').trim();
    if (!payload.category) {
      payload.category = 'Other Liability';
    }
  }
  await updateDoc(liabilityDoc, sanitizeDataForFirestore(payload));
};

export const deleteLiability = async (userId: string, liabilityId: string): Promise<void> => {
  const liabilityDoc = doc(db, 'users', userId, 'liabilities', liabilityId);
  await deleteDoc(liabilityDoc);
};

// --- User Defined Categories ---
const getCategoryDocName = (categoryType: CategoryTypeIdentifier): string => {
  switch (categoryType) {
    case TransactionType.INCOME: return 'incomeCategories';
    case TransactionType.EXPENSE: return 'expenseCategories';
    case TransactionType.SAVING: return 'savingCategories';
    case 'liability': return 'liabilityCategories';
    default: 
      // Exhaustive check for TransactionType
      const exhaustiveCheck: never = categoryType;
      throw new Error(`Invalid category type: ${exhaustiveCheck}`);
  }
};

export const subscribeToUserDefinedCategories = (userId: string, callback: (categories: UserDefinedCategories) => void): (() => void) => {
  if (!userId) return () => {};
  const categorySettingsPath = `users/${userId}/categorySettings`;
  
  const initialCategories: UserDefinedCategories = { income: [], expense: [], saving: [], liability: [] };
  let fetchedCategories = { ...initialCategories };

  const createSubscription = (type: CategoryTypeIdentifier, categoryKey: keyof UserDefinedCategories) => {
    return onSnapshot(doc(db, categorySettingsPath, getCategoryDocName(type)), (docSnap) => {
      fetchedCategories[categoryKey] = docSnap.exists() && Array.isArray(docSnap.data().names) ? docSnap.data().names.map(String) : [];
      callback({ ...fetchedCategories });
    }, (error) => console.error(`Error fetching ${categoryKey} categories:`, error));
  };

  const unsubIncome = createSubscription(TransactionType.INCOME, 'income');
  const unsubExpense = createSubscription(TransactionType.EXPENSE, 'expense');
  const unsubSaving = createSubscription(TransactionType.SAVING, 'saving');
  const unsubLiability = createSubscription('liability', 'liability');
  
  return () => {
    unsubIncome();
    unsubExpense();
    unsubSaving();
    unsubLiability();
  };
};

export const addUserDefinedCategory = async (userId: string, categoryType: CategoryTypeIdentifier, categoryName: string): Promise<void> => {
  const trimmedCategoryName = categoryName.trim();
  if (!userId || !trimmedCategoryName) return;

  const docName = getCategoryDocName(categoryType);
  const categoryDocRef = doc(db, `users/${userId}/categorySettings`, docName);
  try {
    await setDoc(categoryDocRef, { names: arrayUnion(trimmedCategoryName) }, { merge: true });
    console.log(`Category "${trimmedCategoryName}" added/updated for ${categoryType} for user ${userId}`);
  } catch (error) {
    console.error("Error adding user defined category to Firestore:", error);
    throw error;
  }
};

export const updateUserDefinedCategory = async (userId: string, categoryType: CategoryTypeIdentifier, oldCategoryName: string, newCategoryName: string): Promise<void> => {
  const trimmedOldName = oldCategoryName.trim();
  const trimmedNewName = newCategoryName.trim();

  if (!userId || !trimmedOldName || !trimmedNewName || trimmedOldName === trimmedNewName) {
    console.warn("Update category: Invalid parameters or names are the same.");
    return;
  }

  const docName = getCategoryDocName(categoryType);
  const categoryDocRef = doc(db, `users/${userId}/categorySettings`, docName);

  try {
    await updateDoc(categoryDocRef, { names: arrayRemove(trimmedOldName) });
    await updateDoc(categoryDocRef, { names: arrayUnion(trimmedNewName) });
    console.log(`Category name updated from "${trimmedOldName}" to "${trimmedNewName}" in settings for user ${userId}, type ${categoryType}.`);
  } catch (error) {
    console.error("Error updating category name in settings:", error);
    throw error;
  }

  // Update existing transactions or liabilities
  if (categoryType !== 'liability') { // For Transaction Types
    const transactionsColRef = collection(db, 'users', userId, 'transactions');
    const q = query(transactionsColRef, where("type", "==", categoryType), where("category", "==", trimmedOldName));
    
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const batch = writeBatch(db);
        querySnapshot.forEach(transactionDoc => {
          batch.update(transactionDoc.ref, { category: trimmedNewName });
        });
        await batch.commit();
        console.log(`Updated ${querySnapshot.size} transactions from category "${trimmedOldName}" to "${trimmedNewName}".`);
      } else {
        console.log(`No transactions found with category "${trimmedOldName}" of type "${categoryType}" to update.`);
      }
    } catch (error) {
      console.error(`Error updating transactions for category change:`, error);
      throw error;
    }
  } else { // For Liabilities
    const liabilitiesColRef = collection(db, 'users', userId, 'liabilities');
    const q = query(liabilitiesColRef, where("category", "==", trimmedOldName));
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const batch = writeBatch(db);
        querySnapshot.forEach(liabilityDoc => {
          batch.update(liabilityDoc.ref, { category: trimmedNewName });
        });
        await batch.commit();
        console.log(`Updated ${querySnapshot.size} liabilities from category "${trimmedOldName}" to "${trimmedNewName}".`);
      } else {
        console.log(`No liabilities found with category "${trimmedOldName}" to update.`);
      }
    } catch (error) {
      console.error(`Error updating liabilities for category change:`, error);
      throw error;
    }
  }
};

export const deleteUserDefinedCategory = async (userId: string, categoryType: CategoryTypeIdentifier, categoryName: string): Promise<void> => {
  const trimmedCategoryName = categoryName.trim();
  if (!userId || !trimmedCategoryName) return;

  const docName = getCategoryDocName(categoryType);
  const categoryDocRef = doc(db, `users/${userId}/categorySettings`, docName);
  try {
    await updateDoc(categoryDocRef, { names: arrayRemove(trimmedCategoryName) });
    console.log(`Category "${trimmedCategoryName}" deleted from ${categoryType} list for user ${userId}.`);
  } catch (error) {
    console.error("Error deleting user defined category from Firestore:", error);
    throw error;
  }
};