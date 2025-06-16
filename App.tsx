
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Transaction, TransactionType, Liability, View, UserDefinedCategories, CategoryTypeIdentifier } from './types'; 
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { SummaryDisplay } from './components/SummaryDisplay';
import { LiabilityForm } from './components/LiabilityForm';
import { LiabilityList } from './components/LiabilityList';
import { RecordLiabilityPaymentForm } from './components/RecordLiabilityPaymentForm';
import { AuthPage } from './components/AuthPage';
import { IncomeDetailsPage } from './components/IncomeDetailsPage';
import { ExpenseDetailsPage } from './components/ExpenseDetailsPage'; 
import { SavingsDetailsPage } from './components/SavingsDetailsPage'; 
import { LiabilityDetailsPage } from './components/LiabilityDetailsPage'; 
import { LiabilityEMIDetailPage } from './components/LiabilityEMIDetailPage'; 
import { SideMenu } from './components/SideMenu'; 
import { EditProfileModal } from './components/EditProfileModal'; 
import { MonthlySummaryChart } from './components/MonthlySummaryChart';
import { EarlyLoanClosurePage } from './components/EarlyLoanClosurePage'; 
import * as storageService from './services/storageService';
import * as authService from './services/authService';
import { KaashLogoIcon, PlusIcon, BellIcon, PiggyBankIcon, UserIcon, LogoutIcon, MenuIcon, EditIcon as ProfileEditIcon } from './components/icons'; 
import { ExpenseCategory, SavingCategory } from './types'; 
import { calculateLoanPaymentDetails } from './utils'; 
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, SAVING_CATEGORIES, LIABILITY_CATEGORIES } from './constants';


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [userDefinedCategories, setUserDefinedCategories] = useState<UserDefinedCategories>({ income: [], expense: [], saving: [], liability: [] });
  
  const [showTransactionModal, setShowTransactionModal] = useState<boolean>(false);
  const [currentTransactionType, setCurrentTransactionType] = useState<TransactionType | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const [showLiabilityForm, setShowLiabilityForm] = useState<boolean>(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);
  const [payingLiability, setPayingLiability] = useState<Liability | null>(null);
  const [selectedLiabilityForEMIs, setSelectedLiabilityForEMIs] = useState<Liability | null>(null); 

  const [upcomingPayments, setUpcomingPayments] = useState<Liability[]>([]);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [forceFormCategoryResetKey, setForceFormCategoryResetKey] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const toggleProfileDropdown = useCallback(() => setIsProfileDropdownOpen(prev => !prev), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    const unsubscribeAuth = authService.onAuthUserChanged((user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false);
      if (user) {
        window.scrollTo(0, 0); 
        setActiveView('dashboard'); 
        setSelectedLiabilityForEMIs(null); 
        setIsMenuOpen(false);
        setIsProfileDropdownOpen(false);
        setShowEditProfileModal(false);
      } else {
        setTransactions([]);
        setLiabilities([]);
        setUserDefinedCategories({ income: [], expense: [], saving: [], liability: [] });
        setActiveView('dashboard');
        setSelectedLiabilityForEMIs(null);
        setIsMenuOpen(false);
        setIsProfileDropdownOpen(false);
        setShowEditProfileModal(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);
  
  useEffect(() => {
    let unsubTransactions = () => {};
    let unsubLiabilities = () => {};
    let unsubUserCategories = () => {};

    if (currentUser?.uid) {
      unsubTransactions = storageService.subscribeToTransactions(currentUser.uid, setTransactions);
      unsubLiabilities = storageService.subscribeToLiabilities(currentUser.uid, setLiabilities);
      unsubUserCategories = storageService.subscribeToUserDefinedCategories(currentUser.uid, setUserDefinedCategories);
    }
    return () => {
      unsubTransactions();
      unsubLiabilities();
      unsubUserCategories();
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setUpcomingPayments([]);
      return;
    }
    const today = new Date();
    today.setHours(0,0,0,0); 
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const upcoming = liabilities.filter(l => {
      const dueDate = new Date(l.nextDueDate + 'T00:00:00Z'); 
      return dueDate >= today && dueDate <= sevenDaysFromNow;
    }).sort((a,b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
    setUpcomingPayments(upcoming);
  }, [liabilities, currentUser]);

  const navigateToDashboard = useCallback(() => { setActiveView('dashboard'); setSelectedLiabilityForEMIs(null); setIsMenuOpen(false); }, []);

  useEffect(() => {
    if (activeView === 'liabilityEMIDetail' && selectedLiabilityForEMIs?.id && currentUser) {
      const currentLiabilityInList = liabilities.find(l => l.id === selectedLiabilityForEMIs.id);
      if (currentLiabilityInList) {
        // Compare stringified versions to detect changes in the liability object's data
        if (JSON.stringify(currentLiabilityInList) !== JSON.stringify(selectedLiabilityForEMIs)) {
           setSelectedLiabilityForEMIs(currentLiabilityInList);
        }
      } else {
        // Liability might have been deleted from the main list, so the selected one is invalid
        navigateToDashboard();
      }
    }
  }, [liabilities, activeView, selectedLiabilityForEMIs, currentUser, navigateToDashboard]);


  const handleLogin = async (email: string, password?: string) => {
    setAuthError(null);
    try {
      await authService.loginUserWithEmail(email, password);
    } catch (error: any) { setAuthError(error.message || "Failed to log in."); }
  };

  const handleSignup = async (name: string, email: string, password?: string) => {
    setAuthError(null);
    try {
      await authService.registerUserWithEmail(name, email, password);
    } catch (error: any) { setAuthError(error.message || "Failed to sign up."); }
  };
  
  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await authService.loginWithGoogle();
    } catch (error: any) {
      console.error("Google login error in App.tsx:", error);
      setAuthError(error.message || "Failed to log in with Google.");
    }
  };

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    setAuthError(null);
    try {
      await authService.logoutUser();
    } catch (error: any) { setAuthError(error.message || "Failed to log out."); }
  };
  const clearAuthError = useCallback(() => setAuthError(null), []);

  const handleOpenEditProfileModal = () => {
    setIsProfileDropdownOpen(false);
    setShowEditProfileModal(true);
  };
  const handleCloseEditProfileModal = useCallback(() => setShowEditProfileModal(false), []);

  const handleProfileUpdate = async (newName: string) => {
    if (!currentUser) return;
    try {
      await authService.updateUserProfileName(newName);
      setCurrentUser(prevUser => prevUser ? { ...prevUser, name: newName } : null);
      setShowEditProfileModal(false);
      alert("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile in App:", error);
      alert(`Failed to update profile: ${error.message || 'Unknown error'}`);
    }
  };


  const handleOpenNewTransactionForm = useCallback((type: TransactionType) => { 
    setCurrentTransactionType(type); 
    setEditingTransaction(null); 
    setShowTransactionModal(true); 
  }, []);

  const handleOpenEditTransactionForm = useCallback((transaction: Transaction) => { 
    setCurrentTransactionType(transaction.type); 
    setEditingTransaction(transaction); 
    setShowTransactionModal(true); 
  }, []);
  
  const handleOpenNewLiabilityForm = useCallback(() => { 
    setEditingLiability(null); 
    setShowLiabilityForm(true); 
  }, []);


  const handleAddOrEditTransaction = useCallback(async (data: { 
    id?: string; 
    type: TransactionType; 
    description?: string; 
    amount: number; 
    date: string; 
    category: string; 
    relatedLiabilityId?: string; 
  }) => {
    if (!currentUser?.uid) {
        console.warn("handleAddOrEditTransaction: No current user, aborting.");
        return;
    }
    
    const { id, ...transactionDetailsFromForm } = data; 
    const finalCategory = transactionDetailsFromForm.category.trim();

    if (!finalCategory) {
        alert("Category cannot be empty. Please select or add a category.");
        return;
    }

    const payload: Omit<Transaction, 'id' | 'createdAt' | 'userId'> & { relatedLiabilityId?: string } = {
      type: transactionDetailsFromForm.type,
      description: transactionDetailsFromForm.description?.trim() || undefined, 
      amount: transactionDetailsFromForm.amount,
      date: transactionDetailsFromForm.date,
      category: finalCategory, 
    };
    if (transactionDetailsFromForm.relatedLiabilityId) {
      payload.relatedLiabilityId = transactionDetailsFromForm.relatedLiabilityId;
    }

    try {
      if (id && editingTransaction && editingTransaction.relatedLiabilityId) {
        const oldAmount = editingTransaction.amount;
        const newAmount = payload.amount;
        const amountDifferenceForLiabilityRepaid = newAmount - oldAmount;
        
        await storageService.updateTransactionAndLiabilityAmountRepaid(
          currentUser.uid,
          id,
          payload as Partial<Omit<Transaction, 'id' | 'createdAt' | 'userId'>>,
          editingTransaction.relatedLiabilityId,
          amountDifferenceForLiabilityRepaid
        );
      } else if (id) { 
        await storageService.updateTransaction(currentUser.uid, id, payload as Partial<Omit<Transaction, 'id' | 'createdAt' | 'userId'>>);
      } else { 
        await storageService.addTransaction(currentUser.uid, payload as Omit<Transaction, 'id' | 'createdAt' | 'userId'>);
      }
      
      if (!id || (editingTransaction && !editingTransaction.relatedLiabilityId) ) { 
        let baseCategoriesForType: readonly string[] = [];
        let currentUserCategoriesForType: string[] = [];
        let categoryTypeIdentifier: CategoryTypeIdentifier = data.type;

        switch (data.type) {
          case TransactionType.INCOME:
            baseCategoriesForType = INCOME_CATEGORIES.map(String);
            currentUserCategoriesForType = userDefinedCategories.income;
            break;
          case TransactionType.EXPENSE:
            baseCategoriesForType = EXPENSE_CATEGORIES.map(String);
            currentUserCategoriesForType = userDefinedCategories.expense;
            break;
          case TransactionType.SAVING:
            baseCategoriesForType = SAVING_CATEGORIES.map(String);
            currentUserCategoriesForType = userDefinedCategories.saving;
            break;
        }

        const isCustomCategory = !baseCategoriesForType.includes(finalCategory);
        const isNewUserDefinedCategory = isCustomCategory && !currentUserCategoriesForType.includes(finalCategory);

        if (isNewUserDefinedCategory) {
          await storageService.addUserDefinedCategory(currentUser.uid, categoryTypeIdentifier, finalCategory);
        }
      }
      
      closeModal();
    } catch (error: any) { 
      const operationDescription = id ? 'update' : 'add';
      console.error(`Error ${operationDescription} transaction (User: ${currentUser.uid}, ID: ${id || 'new'}):`, error);
      alert(`Failed to save transaction. Error: ${error.message || 'Unknown error'}.`);
    }
  }, [currentUser, userDefinedCategories, editingTransaction]);


  const handleEditEMI = useCallback((transaction: Transaction) => {
    handleOpenEditTransactionForm(transaction); 
  }, [handleOpenEditTransactionForm]);

  const handleDeleteEMI = useCallback(async (transactionId: string, relatedLiabilityId: string, emiAmount: number) => {
    if (!currentUser?.uid) return;
    if (window.confirm("Are you sure you want to delete this EMI payment? This will also adjust the principal repaid on the liability.")) {
      try {
        await storageService.deleteTransactionAndUpdateLiability(
          currentUser.uid,
          transactionId,
          relatedLiabilityId,
          emiAmount 
        );
      } catch (error: any) {
        console.error("Error deleting EMI and updating liability:", error);
        alert(`Failed to delete EMI. Error: ${error.message}`);
      }
    }
  }, [currentUser]);

  const handleDeleteTransaction = useCallback(async (id: string) => {
    if (!currentUser?.uid) return;
    // Check if the transaction is an EMI payment before generic delete
    const txToDelete = transactions.find(t => t.id === id);
    if (txToDelete?.relatedLiabilityId && txToDelete.type === TransactionType.EXPENSE) {
        if (window.confirm("This is an EMI payment. Deleting it will adjust the liability's principal. Are you sure? \n(To delete without affecting liability, edit the transaction first to remove its link to the liability.)")) {
            await handleDeleteEMI(id, txToDelete.relatedLiabilityId, txToDelete.amount);
        }
        return;
    }

    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try { 
        await storageService.deleteTransaction(currentUser.uid, id); 
      } 
      catch (error: any) { console.error("Error deleting transaction:", error); alert(`Failed to delete transaction. Error: ${error.message}`); }
    }
  }, [currentUser, transactions, handleDeleteEMI]);

  const handleAddOrEditLiability = useCallback(async (data: Omit<Liability, 'id' | 'createdAt' | 'userId' | 'amountRepaid' | 'name' | 'notes'> & { id?: string; name?: string; category: string; amountRepaid?: number; loanTermInMonths?: number; }) => {
    if (!currentUser?.uid) return;
    const { id, ...liabilityDetails } = data;
    const finalCategory = liabilityDetails.category.trim();

     if (!finalCategory) {
        alert("Category cannot be empty. Please select or add a category.");
        return;
    }

    const payload = {
        name: liabilityDetails.name?.trim() || undefined, 
        category: finalCategory, 
        initialAmount: liabilityDetails.initialAmount,
        emiAmount: liabilityDetails.emiAmount,
        nextDueDate: liabilityDetails.nextDueDate,
        interestRate: liabilityDetails.interestRate,
        loanTermInMonths: liabilityDetails.loanTermInMonths,
        amountRepaid: liabilityDetails.amountRepaid ?? (id ? (liabilities.find(l=>l.id === id)?.amountRepaid ?? 0) : 0), 
    };
    try {
      if (id) {
        await storageService.updateLiability(currentUser.uid, id, payload as Partial<Omit<Liability, 'id' | 'createdAt' | 'userId' | 'notes'>>);
      } else {
        await storageService.addLiability(currentUser.uid, payload as Omit<Liability, 'id' | 'createdAt' | 'userId' | 'notes'>);
      }

      const baseCategoriesForType = LIABILITY_CATEGORIES.map(String);
      const currentUserCategoriesForType = userDefinedCategories.liability;
      const isCustomCategory = !baseCategoriesForType.includes(finalCategory);
      const isNewUserDefinedCategory = isCustomCategory && !currentUserCategoriesForType.includes(finalCategory);

      if (isNewUserDefinedCategory) {
         await storageService.addUserDefinedCategory(currentUser.uid, 'liability', finalCategory);
      }

      closeModal();
    } catch (error: any) { console.error("Error saving liability:", error); alert(`Failed to save liability. Error: ${error.message}`); }
  }, [currentUser, liabilities, userDefinedCategories]);

  const handleDeleteLiability = useCallback(async (id: string) => {
    if (!currentUser?.uid) return;
    if (window.confirm("Are you sure you want to delete this liability? This will NOT delete associated EMI payments from expenses.")) {
      try { await storageService.deleteLiability(currentUser.uid, id); }
      catch (error: any) { console.error("Error deleting liability:", error); alert(`Failed to delete liability. Error: ${error.message}`); }
    }
  }, [currentUser]);

  const handleRecordLiabilityPayment = useCallback(async (liabilityId: string, paymentAmount: number, paymentDate: string, newNextDueDate: string, expenseNotes?: string) => {
    if (!currentUser?.uid) return;
    const liability = liabilities.find(l => l.id === liabilityId);
    if (!liability) {
      alert("Liability not found. Cannot record payment.");
      return;
    }
    
    let principalPaidForThisPayment = paymentAmount; 

    if (typeof liability.interestRate === 'number' && liability.interestRate > 0) {
        const outstandingPrincipalBeforePayment = liability.initialAmount - liability.amountRepaid;
        if (outstandingPrincipalBeforePayment > 0) {
            const paymentDetails = calculateLoanPaymentDetails(
                outstandingPrincipalBeforePayment,
                liability.interestRate,
                paymentAmount
            );
            principalPaidForThisPayment = paymentDetails.principalPaid;
        } else {
             principalPaidForThisPayment = 0; 
        }
    } else {
       const outstandingPrincipalBeforePayment = liability.initialAmount - liability.amountRepaid;
       principalPaidForThisPayment = Math.min(paymentAmount, outstandingPrincipalBeforePayment);
    }
    principalPaidForThisPayment = Math.max(0, principalPaidForThisPayment); 

    const newAmountRepaidTotal = Math.min(liability.amountRepaid + principalPaidForThisPayment, liability.initialAmount);

    const updatedLiabilityData = { 
        amountRepaid: newAmountRepaidTotal, 
        nextDueDate: newNextDueDate 
    };
    
    try {
        await storageService.updateLiability(currentUser.uid, liabilityId, updatedLiabilityData);
        
        const expenseDescription = expenseNotes || `Payment for ${liability.name || liability.category}`;
        const expenseTxData: Omit<Transaction, 'id' | 'createdAt' | 'userId'> = { 
            type: TransactionType.EXPENSE,
            description: expenseDescription,
            amount: paymentAmount, date: paymentDate,
            category: ExpenseCategory.LIABILITY_PAYMENT, 
            relatedLiabilityId: liabilityId,
        };
        await storageService.addTransaction(currentUser.uid, expenseTxData);
        setPayingLiability(null); 
    } catch (error: any) { 
        console.error("Error recording liability payment or expense transaction:", error); 
        alert(`Failed to record payment. Error: ${error.message}`); 
    }
  }, [liabilities, currentUser]);


  const createCategoryHandlers = useCallback((
    categoryType: CategoryTypeIdentifier, 
    predefinedCategoriesConst: readonly string[]
  ) => {
    const handleAdd = async (categoryName: string) => {
      if (!currentUser?.uid || !categoryName.trim()) return;
      if (predefinedCategoriesConst.map(String).includes(categoryName)) {
        alert(`"${categoryName}" is a predefined category and cannot be added again.`);
        return;
      }
      try {
        await storageService.addUserDefinedCategory(currentUser.uid, categoryType, categoryName);
      } catch (error: any) {
        console.error(`Error adding ${categoryType} category:`, error);
        alert(`Failed to add category: ${categoryName}. Error: ${error.message}`);
      }
    };

    const handleEdit = async (oldName: string, newName: string) => {
      if (!currentUser?.uid || !oldName.trim() || !newName.trim() || oldName === newName) return;
      if (predefinedCategoriesConst.map(String).includes(oldName)) {
        alert(`"${oldName}" is a predefined category and cannot be edited.`);
        return;
      }
      try {
        await storageService.updateUserDefinedCategory(currentUser.uid, categoryType, oldName, newName);
      } catch (error: any) {
        console.error(`Error renaming ${categoryType} category "${oldName}" to "${newName}":`, error);
        alert(`Failed to rename category. Error: ${error.message}`);
      }
    };

    const handleDelete = async (categoryName: string) => {
      if (!currentUser?.uid || !categoryName.trim()) return;
      if (predefinedCategoriesConst.map(String).includes(categoryName)) {
        alert(`"${categoryName}" is a predefined category and cannot be deleted.`);
        return;
      }
      if (window.confirm(`Are you sure you want to delete the ${categoryType} category "${categoryName}"? This will not change existing items using this category.`)) {
        try {
          await storageService.deleteUserDefinedCategory(currentUser.uid, categoryType, categoryName);
          setForceFormCategoryResetKey(prev => prev + 1);
        } catch (error: any) {
          console.error(`Error deleting ${categoryType} category "${categoryName}":`, error);
          alert(`Failed to delete category: ${categoryName}. Error: ${error.message}`);
        }
      }
    };
    return { handleAdd, handleEdit, handleDelete };
  }, [currentUser]);

  const incomeCategoryHandlers = useMemo(() => createCategoryHandlers(TransactionType.INCOME, INCOME_CATEGORIES.map(String)), [currentUser, createCategoryHandlers]);
  const expenseCategoryHandlers = useMemo(() => createCategoryHandlers(TransactionType.EXPENSE, EXPENSE_CATEGORIES.map(String)), [currentUser, createCategoryHandlers]);
  const savingCategoryHandlers = useMemo(() => createCategoryHandlers(TransactionType.SAVING, SAVING_CATEGORIES.map(String)), [currentUser, createCategoryHandlers]);
  const liabilityCategoryHandlers = useMemo(() => createCategoryHandlers('liability', LIABILITY_CATEGORIES.map(String)), [currentUser, createCategoryHandlers]);


  const incomeTransactions = useMemo(() => transactions.filter(t => t.type === TransactionType.INCOME), [transactions]);
  const expenseTransactions = useMemo(() => transactions.filter(t => t.type === TransactionType.EXPENSE), [transactions]);
  const savingTransactions = useMemo(() => transactions.filter(t => t.type === TransactionType.SAVING), [transactions]);
  
  const totalIncome = useMemo(() => incomeTransactions.reduce((sum, t) => sum + t.amount, 0), [incomeTransactions]);
  const totalExpenses = useMemo(() => expenseTransactions.reduce((sum, t) => sum + t.amount, 0), [expenseTransactions]);
  const totalSavings = useMemo(() => savingTransactions.reduce((sum, t) => sum + t.amount, 0), [savingTransactions]);
  const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]); 

  const recentTransactions = useMemo(() => {
    const allSortableTransactions = transactions.filter(
      t => t.type === TransactionType.INCOME || t.type === TransactionType.EXPENSE || t.type === TransactionType.SAVING
    );
    allSortableTransactions.sort((a, b) => {
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) return dateComparison;
      if (a.createdAt && b.createdAt) {
        // Handle both Firebase Timestamp and potential string dates during initial load
        const createdAtA = typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate() : new Date(a.createdAt);
        const createdAtB = typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate() : new Date(b.createdAt);
        return createdAtB.getTime() - createdAtA.getTime();
      }
      return 0;
    });
    return allSortableTransactions.slice(0, 15);
  }, [transactions]);

  const monthlySummaryChartData = useMemo(() => {
    const data: { month: string; income: number; expense: number; saving: number }[] = [];
    const now = new Date();

    for (let i = 2; i >= 0; i--) { // Last 3 months, current month first in loop if i=0, but we want past months
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth(); // 0-11
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`; // YYYY-MM
      
      const monthLabel = targetDate.toLocaleString('default', { month: 'short', year: '2-digit' });

      let monthlyIncome = 0;
      let monthlyExpense = 0;
      let monthlySaving = 0;

      transactions.forEach(t => {
        if (t.date.startsWith(monthKey)) {
          if (t.type === TransactionType.INCOME) monthlyIncome += t.amount;
          else if (t.type === TransactionType.EXPENSE) monthlyExpense += t.amount;
          else if (t.type === TransactionType.SAVING) monthlySaving += t.amount;
        }
      });
      data.push({ month: monthLabel, income: monthlyIncome, expense: monthlyExpense, saving: monthlySaving });
    }
    return data;
  }, [transactions]);
  
  const closeModal = useCallback(() => {
    setShowTransactionModal(false); setCurrentTransactionType(null); setEditingTransaction(null);
    setShowLiabilityForm(false); setEditingLiability(null); setPayingLiability(null);
    setShowEditProfileModal(false);
  }, []);
  
  const handleOpenEditLiabilityForm = useCallback((liability: Liability) => { setEditingLiability(liability); setShowLiabilityForm(true); }, []);
  const handleOpenRecordPaymentForm = useCallback((liability: Liability) => setPayingLiability(liability), []);

  
  const navigateToIncomeDetails = useCallback(() => { setActiveView('incomeDetails'); setSelectedLiabilityForEMIs(null); setIsMenuOpen(false); }, []);
  const navigateToExpenseDetails = useCallback(() => { setActiveView('expenseDetails'); setSelectedLiabilityForEMIs(null); setIsMenuOpen(false); }, []);
  const navigateToSavingsDetails = useCallback(() => { setActiveView('savingsDetails'); setSelectedLiabilityForEMIs(null); setIsMenuOpen(false); }, []);
  const navigateToLiabilityDetails = useCallback(() => { setActiveView('liabilityDetails'); setSelectedLiabilityForEMIs(null); setIsMenuOpen(false); }, []);
  const navigateToEarlyLoanClosure = useCallback(() => { setActiveView('earlyLoanClosure'); setSelectedLiabilityForEMIs(null); setIsMenuOpen(false); }, []);
  
  const handleViewEMIs = useCallback((liabilityId: string) => {
    const liability = liabilities.find(l => l.id === liabilityId);
    if (liability) {
      setSelectedLiabilityForEMIs(liability);
      setActiveView('liabilityEMIDetail');
      setIsMenuOpen(false);
    } else {
      console.warn(`Liability with ID ${liabilityId} not found for EMI detail view.`);
      alert("Could not find liability details.");
    }
  }, [liabilities]);
  
  let formPredefinedCategories: string[] = [];
  let formUserDefinedCategories: string[] = [];
  let formAddHandler = async (name: string) => {};
  let formEditHandler = async (oldName: string, newName: string) => {};
  let formDeleteHandler = async (name: string) => {};

  if (currentTransactionType === TransactionType.INCOME) {
    formPredefinedCategories = INCOME_CATEGORIES.map(String);
    formUserDefinedCategories = userDefinedCategories.income;
    formAddHandler = incomeCategoryHandlers.handleAdd;
    formEditHandler = incomeCategoryHandlers.handleEdit;
    formDeleteHandler = incomeCategoryHandlers.handleDelete;
  } else if (currentTransactionType === TransactionType.EXPENSE) {
    formPredefinedCategories = EXPENSE_CATEGORIES.map(String);
    formUserDefinedCategories = userDefinedCategories.expense;
    formAddHandler = expenseCategoryHandlers.handleAdd;
    formEditHandler = expenseCategoryHandlers.handleEdit;
    formDeleteHandler = expenseCategoryHandlers.handleDelete;
  } else if (currentTransactionType === TransactionType.SAVING) {
    formPredefinedCategories = SAVING_CATEGORIES.map(String);
    formUserDefinedCategories = userDefinedCategories.saving;
    formAddHandler = savingCategoryHandlers.handleAdd;
    formEditHandler = savingCategoryHandlers.handleEdit;
    formDeleteHandler = savingCategoryHandlers.handleDelete;
  }

  const renderActiveView = () => {
    if (isLoadingAuth && !currentUser) { 
      return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex justify-center items-center text-sky-400 text-xl p-4 text-center">Loading Kaash...</div>;
    }
  
    if (!currentUser) {
      return <div className="p-2 sm:p-4"><AuthPage onLogin={handleLogin} onSignup={handleSignup} onGoogleLogin={handleGoogleLogin} error={authError} clearError={clearAuthError} /></div>;
    }
    
    switch (activeView) {
      case 'incomeDetails':
        return <IncomeDetailsPage incomeTransactions={incomeTransactions} onBack={navigateToDashboard} onEditTransaction={handleOpenEditTransactionForm} onDeleteTransaction={handleDeleteTransaction} onOpenNewTransactionForm={handleOpenNewTransactionForm} />;
      case 'expenseDetails':
        return <ExpenseDetailsPage expenseTransactions={expenseTransactions} onBack={navigateToDashboard} onEditTransaction={handleOpenEditTransactionForm} onDeleteTransaction={handleDeleteTransaction} onOpenNewTransactionForm={handleOpenNewTransactionForm} />;
      case 'savingsDetails':
        return <SavingsDetailsPage savingTransactions={savingTransactions} onBack={navigateToDashboard} onEditTransaction={handleOpenEditTransactionForm} onDeleteTransaction={handleDeleteTransaction} onOpenNewTransactionForm={handleOpenNewTransactionForm} />;
      case 'liabilityDetails':
        return <LiabilityDetailsPage liabilities={liabilities} allTransactions={transactions} onBack={navigateToDashboard} onEditLiability={handleOpenEditLiabilityForm} onDeleteLiability={handleDeleteLiability} onRecordPayment={handleOpenRecordPaymentForm} onViewEMIs={handleViewEMIs} onOpenNewLiabilityForm={handleOpenNewLiabilityForm} />;
      case 'liabilityEMIDetail':
        if (selectedLiabilityForEMIs) {
          return <LiabilityEMIDetailPage liability={selectedLiabilityForEMIs} allTransactions={transactions} onBack={navigateToDashboard} onEditEMI={handleEditEMI} onDeleteEMI={handleDeleteEMI} />;
        }
        navigateToDashboard(); 
        return null;
      case 'earlyLoanClosure':
        return <EarlyLoanClosurePage onBack={navigateToDashboard} />;
      case 'dashboard':
      default:
        return (
          <div className="w-full p-2 sm:p-4"> 
            <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
               <SummaryDisplay 
                  totalIncome={totalIncome} 
                  totalExpenses={totalExpenses} 
                  balance={balance} 
                  expenseTransactions={expenseTransactions}
                  liabilities={liabilities}
                  totalSavings={totalSavings} 
                  onNavigateToIncomeDetails={navigateToIncomeDetails}
                  onNavigateToExpenseDetails={navigateToExpenseDetails}
                  onNavigateToSavingsDetails={navigateToSavingsDetails}
                  onNavigateToLiabilityDetails={navigateToLiabilityDetails}
                />

              {upcomingPayments.length > 0 && (
                <div className="w-full p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-300 text-xs sm:text-sm">
                  <div className="flex items-center font-semibold mb-1">
                    <BellIcon className="h-5 w-5 mr-2 text-yellow-400" />
                    Upcoming Payments (Next 7 Days):
                  </div>
                  <ul className="list-disc list-inside ml-2">
                    {upcomingPayments.map(p => (
                      <li key={p.id}>
                        {p.name || p.category} - ₹{p.emiAmount ? p.emiAmount.toFixed(2) : (p.initialAmount - p.amountRepaid).toFixed(2)} due on {new Date(p.nextDueDate + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
                
              {monthlySummaryChartData && monthlySummaryChartData.length > 0 && (
                <MonthlySummaryChart data={monthlySummaryChartData} />
              )}

              <TransactionList 
                title="Recent Transactions" 
                transactions={recentTransactions}
                onDelete={handleDeleteTransaction}
                onEdit={handleOpenEditTransactionForm}
              />
              
              {/* Moved LiabilityList here to pass allTransactions */}
              <LiabilityList
                liabilities={liabilities}
                allTransactions={transactions} // Pass all transactions
                onDelete={handleDeleteLiability}
                onEdit={handleOpenEditLiabilityForm}
                onRecordPayment={handleOpenRecordPaymentForm}
                onViewEMIs={handleViewEMIs}
              />


              <footer className="w-full mt-6 sm:mt-8 py-3 sm:py-4 text-center text-gray-500 text-xs sm:text-sm">
                <p>&copy; {new Date().getFullYear()} Kaash. Track smarter, live better.</p>
              </footer>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 flex flex-col items-center selection:bg-sky-400 selection:text-sky-900">
      
      {currentUser && (
        <SideMenu
          isOpen={isMenuOpen}
          onClose={toggleMenu}
          onOpenIncomeForm={() => handleOpenNewTransactionForm(TransactionType.INCOME)}
          onOpenExpenseForm={() => handleOpenNewTransactionForm(TransactionType.EXPENSE)}
          onOpenSavingForm={() => handleOpenNewTransactionForm(TransactionType.SAVING)}
          onOpenLiabilityForm={handleOpenNewLiabilityForm}
          onNavigateToEarlyLoanClosure={navigateToEarlyLoanClosure} 
        />
      )}
      
      {currentUser && activeView === 'dashboard' && (
        <header className="w-full bg-slate-800/80 backdrop-blur-md sticky top-0 z-30 shadow-md border-b border-slate-700">
          <div className="max-w-7xl mx-auto flex justify-between items-center py-3 sm:py-4 px-2 sm:px-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button 
                onClick={toggleMenu} 
                className="p-2 rounded-md text-gray-400 hover:text-sky-400 hover:bg-slate-700 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                <MenuIcon className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
              <KaashLogoIcon className="h-10 w-10 sm:h-12 sm:w-12 text-sky-400" />
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">
                Kaash
              </h1>
            </div>
            <div className="relative flex items-center space-x-2 sm:space-x-4" ref={profileDropdownRef}>
               <p className="text-sm text-gray-300 mr-2 hidden sm:inline-block truncate max-w-[100px] md:max-w-[150px]">
                {currentUser.name || currentUser.email}
              </p>
              <button 
                onClick={toggleProfileDropdown} 
                className="p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                aria-label="User profile options"
                aria-haspopup="true"
                aria-expanded={isProfileDropdownOpen}
              >
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt={currentUser.name || "User"} className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-sky-500 object-cover" />
                ) : (
                  <UserIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 bg-slate-700 p-1.5 sm:p-2 rounded-full"/>
                )}
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-40">
                  <button
                    onClick={handleOpenEditProfileModal}
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-slate-600 hover:text-sky-300 flex items-center"
                  >
                    <ProfileEditIcon className="w-4 h-4 mr-2" /> Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-slate-600 hover:text-red-400 flex items-center"
                  >
                    <LogoutIcon className="w-4 h-4 mr-2" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}
      
      {/* Apply padding-top to content area only if sticky header is visible */}
      <div className={`w-full flex-grow ${currentUser && activeView === 'dashboard' ? 'pt-16 sm:pt-[76px]' : ''}`}> 
         {renderActiveView()}
      </div>

      {showEditProfileModal && currentUser && (
        <EditProfileModal
          user={currentUser}
          onUpdateProfile={handleProfileUpdate}
          onCancel={handleCloseEditProfileModal}
        />
      )}

      {(showTransactionModal || showLiabilityForm || payingLiability) && ( 
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-md relative border border-slate-700 overflow-y-auto max-h-[90vh]">
            <button onClick={closeModal} className="absolute top-2 sm:top-3 right-2 sm:right-3 text-gray-400 hover:text-gray-200 transition-colors z-10" aria-label="Close form">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-7 sm:h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {showTransactionModal && currentTransactionType && 
              <TransactionForm 
                type={currentTransactionType} 
                onSubmit={handleAddOrEditTransaction} 
                onCancel={closeModal} 
                existingTransaction={editingTransaction}
                predefinedCategories={formPredefinedCategories}
                currentUserDefinedCategories={formUserDefinedCategories}
                onUserAddCategory={formAddHandler}
                onUserEditCategory={formEditHandler}
                onUserDeleteCategory={formDeleteHandler}
                key={forceFormCategoryResetKey}
              />
            }
            {showLiabilityForm && 
              <LiabilityForm 
                onSubmit={handleAddOrEditLiability} 
                onCancel={closeModal} 
                existingLiability={editingLiability}
                predefinedLiabilityCategories={LIABILITY_CATEGORIES.map(String)}
                currentUserDefinedLiabilityCategories={userDefinedCategories.liability}
                onUserAddLiabilityCategory={liabilityCategoryHandlers.handleAdd}
                onUserEditLiabilityCategory={liabilityCategoryHandlers.handleEdit}
                onUserDeleteLiabilityCategory={liabilityCategoryHandlers.handleDelete}
                key={`liability-form-${forceFormCategoryResetKey}`}
              />
            }
            {payingLiability && 
              <RecordLiabilityPaymentForm 
                liability={payingLiability} 
                onSubmit={(paymentAmount, paymentDate, newNextDueDate, notes) => {
                  if (payingLiability) { // Check ensures payingLiability is not null
                    handleRecordLiabilityPayment(payingLiability.id, paymentAmount, paymentDate, newNextDueDate, notes);
                  }
                }} 
                onCancel={closeModal}
              />
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
