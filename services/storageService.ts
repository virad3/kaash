
import { app } from '../firebaseConfig'; 
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
  where,
  runTransaction,
  getFirestore
} from 'firebase/firestore';
import { Transaction, Liability, TransactionType, UserDefinedCategories, CategoryTypeIdentifier, CreditCard, CreditCardBill } from '../types'; 

const db = getFirestore(app);

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
        category: String(data.category || 'Uncategorized'), 
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
          `Transaction ${transactionItem.id} from Firestore is missing critical fields, has an invalid type/date format, or they are undefined. Skipping. Received data:`, 
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
  } catch (error) {
    console.error("Error adding user defined category to Firestore:", error);
    throw error;
  }
};

export const updateUserDefinedCategory = async (userId: string, categoryType: CategoryTypeIdentifier, oldCategoryName: string, newCategoryName: string): Promise<void> => {
  const trimmedOldName = oldCategoryName.trim();
  const trimmedNewName = newCategoryName.trim();

  if (!userId || !trimmedOldName || !trimmedNewName || trimmedOldName === trimmedNewName) {
    return;
  }

  const docName = getCategoryDocName(categoryType);
  const categoryDocRef = doc(db, `users/${userId}/categorySettings`, docName);

  try {
    await updateDoc(categoryDocRef, { names: arrayRemove(trimmedOldName) });
    await updateDoc(categoryDocRef, { names: arrayUnion(trimmedNewName) });
  } catch (error) {
    console.error("Error updating category name in settings:", error);
    throw error;
  }

  const collectionName = categoryType === 'liability' ? 'liabilities' : 'transactions';
  const itemsColRef = collection(db, 'users', userId, collectionName);
  
  let q;
  if (categoryType !== 'liability') { // Transaction Types
    q = query(itemsColRef, where("type", "==", categoryType), where("category", "==", trimmedOldName));
  } else { // Liabilities
    q = query(itemsColRef, where("category", "==", trimmedOldName));
  }
  
  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const batch = writeBatch(db);
      querySnapshot.forEach(itemDoc => {
        batch.update(itemDoc.ref, { category: trimmedNewName });
      });
      await batch.commit();
    }
  } catch (error) {
    console.error(`Error updating items for category change:`, error);
    throw error;
  }
};

export const deleteUserDefinedCategory = async (userId: string, categoryType: CategoryTypeIdentifier, categoryName: string): Promise<void> => {
  const trimmedCategoryName = categoryName.trim();
  if (!userId || !trimmedCategoryName) return;

  const docName = getCategoryDocName(categoryType);
  const categoryDocRef = doc(db, `users/${userId}/categorySettings`, docName);
  try {
    await updateDoc(categoryDocRef, { names: arrayRemove(trimmedCategoryName) });
  } catch (error) {
    console.error("Error deleting user defined category from Firestore:", error);
    throw error;
  }
};

// --- EMI Edit/Delete Specific Functions ---

export const deleteTransactionAndUpdateLiability = async (
  userId: string,
  transactionIdToDelete: string,
  relatedLiabilityId: string,
  amountToDecrementFromLiabilityRepaid: number
): Promise<void> => {
  if (!userId || !transactionIdToDelete || !relatedLiabilityId || amountToDecrementFromLiabilityRepaid < 0) {
    throw new Error("Invalid parameters for deleting transaction and updating liability.");
  }

  const transactionDocRef = doc(db, 'users', userId, 'transactions', transactionIdToDelete);
  const liabilityDocRef = doc(db, 'users', userId, 'liabilities', relatedLiabilityId);

  await runTransaction(db, async (firestoreTransaction) => {
    const liabilityDoc = await firestoreTransaction.get(liabilityDocRef);
    if (!liabilityDoc.exists()) {
      throw new Error(`Liability ${relatedLiabilityId} not found.`);
    }

    const currentAmountRepaid = liabilityDoc.data().amountRepaid as number;
    let newAmountRepaid = currentAmountRepaid - amountToDecrementFromLiabilityRepaid;
    newAmountRepaid = Math.max(0, newAmountRepaid); // Ensure it doesn't go below zero

    firestoreTransaction.update(liabilityDocRef, { amountRepaid: newAmountRepaid });
    firestoreTransaction.delete(transactionDocRef);
  });
};


export const updateTransactionAndLiabilityAmountRepaid = async (
  userId: string,
  transactionIdToUpdate: string,
  newTransactionData: Partial<Omit<Transaction, 'id'|'userId'|'createdAt'>>,
  relatedLiabilityId: string,
  amountDifferenceForLiabilityRepaid: number // positive if new EMI is larger, negative if smaller
): Promise<void> => {
  if (!userId || !transactionIdToUpdate || !relatedLiabilityId) {
    throw new Error("Invalid parameters for updating transaction and liability amount repaid.");
  }

  const transactionDocRef = doc(db, 'users', userId, 'transactions', transactionIdToUpdate);
  const liabilityDocRef = doc(db, 'users', userId, 'liabilities', relatedLiabilityId);

  const sanitizedTransactionData = { ...newTransactionData };
  if (sanitizedTransactionData.category !== undefined) {
    sanitizedTransactionData.category = String(sanitizedTransactionData.category || 'Uncategorized').trim();
    if (!sanitizedTransactionData.category) {
      sanitizedTransactionData.category = 'Uncategorized';
    }
  }


  await runTransaction(db, async (firestoreTransaction) => {
    const liabilityDoc = await firestoreTransaction.get(liabilityDocRef);
    if (!liabilityDoc.exists()) {
      throw new Error(`Liability ${relatedLiabilityId} not found.`);
    }

    const currentAmountRepaid = liabilityDoc.data().amountRepaid as number;
    const initialAmount = liabilityDoc.data().initialAmount as number; // Get initial amount
    let newAmountRepaid = currentAmountRepaid + amountDifferenceForLiabilityRepaid;
    
    // Ensure amountRepaid does not go below zero or exceed initialAmount
    newAmountRepaid = Math.max(0, newAmountRepaid);
    newAmountRepaid = Math.min(newAmountRepaid, initialAmount);


    firestoreTransaction.update(liabilityDocRef, { amountRepaid: newAmountRepaid });
    firestoreTransaction.update(transactionDocRef, sanitizeDataForFirestore(sanitizedTransactionData));
  });
};


// --- Credit Cards ---
export const subscribeToCreditCards = (userId: string, callback: (cards: CreditCard[]) => void): (() => void) => {
  if (!userId) return () => {};
  const cardsCol = collection(db, 'users', userId, 'creditCards');
  const q = query(cardsCol, orderBy('bankName', 'asc'), orderBy('cardName', 'asc'));

  return onSnapshot(q, (querySnapshot) => {
    const cards: CreditCard[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      cards.push({ id: docSnap.id, ...data } as CreditCard);
    });
    callback(cards);
  }, (error) => {
    console.error("Error fetching credit cards:", error);
    callback([]);
  });
};

export const addCreditCard = async (userId: string, cardData: Omit<CreditCard, 'id' | 'createdAt' | 'userId'>): Promise<string> => {
  const cardsCol = collection(db, 'users', userId, 'creditCards');
  const payload = { ...cardData, userId, createdAt: serverTimestamp() };
  const docRef = await addDoc(cardsCol, sanitizeDataForFirestore(payload));
  return docRef.id;
};

export const updateCreditCard = async (userId: string, cardId: string, cardData: Partial<Omit<CreditCard, 'id' | 'createdAt' | 'userId'>>): Promise<void> => {
  const cardDoc = doc(db, 'users', userId, 'creditCards', cardId);
  await updateDoc(cardDoc, sanitizeDataForFirestore(cardData));
};

export const deleteCreditCard = async (userId: string, cardId: string): Promise<void> => {
  if (!userId || !cardId) return;

  const batch = writeBatch(db);

  // Delete the card document
  const cardDocRef = doc(db, 'users', userId, 'creditCards', cardId);
  batch.delete(cardDocRef);

  // Query for and delete all associated bills
  const billsColRef = collection(db, 'users', userId, 'creditCardBills');
  const q = query(billsColRef, where("creditCardId", "==", cardId));
  const billsSnapshot = await getDocs(q);
  billsSnapshot.forEach(billDoc => {
    batch.delete(billDoc.ref);
  });

  await batch.commit();
};


// --- Credit Card Bills ---
export const subscribeToCreditCardBills = (userId: string, callback: (bills: CreditCardBill[]) => void): (() => void) => {
  if (!userId) return () => {};
  const billsCol = collection(db, 'users', userId, 'creditCardBills');
  const q = query(billsCol, orderBy('billDate', 'desc'));

  return onSnapshot(q, (querySnapshot) => {
    const bills: CreditCardBill[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      bills.push({ id: docSnap.id, ...data } as CreditCardBill);
    });
    callback(bills);
  }, (error) => {
    console.error("Error fetching credit card bills:", error);
    callback([]);
  });
};

export const addCreditCardBill = async (userId: string, billData: Omit<CreditCardBill, 'id' | 'createdAt' | 'userId'>): Promise<string> => {
  const billsCol = collection(db, 'users', userId, 'creditCardBills');
  const payload = { ...billData, userId, createdAt: serverTimestamp() };
  const docRef = await addDoc(billsCol, sanitizeDataForFirestore(payload));
  return docRef.id;
};

export const updateCreditCardBill = async (userId: string, billId: string, billData: Partial<Omit<CreditCardBill, 'id' | 'createdAt' | 'userId'>>): Promise<void> => {
  const billDoc = doc(db, 'users', userId, 'creditCardBills', billId);
  await updateDoc(billDoc, sanitizeDataForFirestore(billData));
};

export const deleteCreditCardBill = async (userId: string, billId: string): Promise<void> => {
  const billDoc = doc(db, 'users', userId, 'creditCardBills', billId);
  await deleteDoc(billDoc);
};