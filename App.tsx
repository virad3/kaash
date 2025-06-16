
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Transaction, TransactionType, Liability, View, UserDefinedCategories, CategoryTypeIdentifier, AppNotification } from './types'; 
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { SummaryDisplay } from './components/SummaryDisplay';
import { LiabilityForm } from './components/LiabilityForm';
// LiabilityList component is no longer directly used in dashboard's renderActiveView
// import { LiabilityList } from './components/LiabilityList'; 
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

  const [upcomingPaymentsDashboard, setUpcomingPaymentsDashboard] = useState<Liability[]>([]); // Renamed for clarity, used for dashboard specific display
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [forceFormCategoryResetKey, setForceFormCategoryResetKey] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);


  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const toggleProfileDropdown = useCallback(() => setIsProfileDropdownOpen(prev => !prev), []);
  const toggleNotificationDropdown = useCallback(() => setIsNotificationDropdownOpen(prev => !prev), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setIsNotificationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeModal = useCallback(() => {
    setShowTransactionModal(false); setCurrentTransactionType(null); setEditingTransaction(null);
    setShowLiabilityForm(false); setEditingLiability(null); setPayingLiability(null);
    setShowEditProfileModal(false);
    setIsNotificationDropdownOpen(false); // Close notification dropdown as well
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
        setIsNotificationDropdownOpen(false);
        setShowEditProfileModal(false);
      } else {
        setTransactions([]);
        setLiabilities([]);
        setUserDefinedCategories({ income: [], expense: [], saving: [], liability: [] });
        setActiveView('dashboard');
        setSelectedLiabilityForEMIs(null);
        setIsMenuOpen(false);
        setIsProfileDropdownOpen(false);
        setIsNotificationDropdownOpen(false);
        setShowEditProfileModal(false);
        setNotifications([]);
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

  // Effect for Dashboard Upcoming Payments (original logic for dashboard display)
  useEffect(() => {
    if (!currentUser) {
      setUpcomingPaymentsDashboard([]);
      return;
    }
    const today = new Date();
    today.setHours(0,0,0,0); 
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const upcoming = liabilities.filter(l => {
      if ((l.initialAmount - l.amountRepaid) <= 0.005) return false; // Skip paid off
      const dueDate = new Date(l.nextDueDate + 'T00:00:00Z'); 
      return dueDate >= today && dueDate <= sevenDaysFromNow;
    }).sort((a,b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
    setUpcomingPaymentsDashboard(upcoming);
  }, [liabilities, currentUser]);


  // Effect for Global Notifications (Bell Icon)
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }

    const newNotificationsList: AppNotification[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    // 1. Upcoming EMIs (next 7 days)
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    liabilities.forEach(l => {
      if ((l.initialAmount - l.amountRepaid) <= 0.005) return; // Skip paid off liabilities

      const dueDate = new Date(l.nextDueDate + 'T00:00:00Z'); // Assuming nextDueDate is YYYY-MM-DD
      if (dueDate >= today && dueDate <= sevenDaysFromNow) {
        newNotificationsList.push({
          id: `emi-${l.id}-${l.nextDueDate}`, // Add date to ID for uniqueness if due date changes
          type: 'emi_due',
          title: `EMI Due: ${l.name || l.category}`,
          message: `₹${l.emiAmount?.toFixed(2) || (l.initialAmount - l.amountRepaid).toFixed(2)} due on ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}.`,
          date: l.nextDueDate,
          amount: l.emiAmount,
          isRead: false,
        });
      }
    });

    // 2. Recurring Savings Reminders (Simplified: check in first 7 days of month)
    if (today.getDate() <= 7) {
      const currentMonth = today.getMonth(); // 0-indexed
      const currentYear = today.getFullYear();
      
      const prevMonthDate = new Date(currentYear, currentMonth -1, 1); // Corrected: currentMonth - 1 for previous
      const prevMonthYear = prevMonthDate.getFullYear();
      const prevMonth = prevMonthDate.getMonth();

      const savingsLastMonth = transactions.filter(t => {
        const txDate = new Date(t.date); // Assuming t.date is YYYY-MM-DD
        return t.type === TransactionType.SAVING && txDate.getFullYear() === prevMonthYear && txDate.getMonth() === prevMonth;
      });

      const savingsThisMonth = transactions.filter(t => {
        const txDate = new Date(t.date);
        return t.type === TransactionType.SAVING && txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
      });

      const categoriesSavedLastMonth = new Set(savingsLastMonth.map(s => s.category));
      const categoriesSavedThisMonth = new Set(savingsThisMonth.map(s => s.category));

      categoriesSavedLastMonth.forEach(category => {
        if (!categoriesSavedThisMonth.has(category)) {
          newNotificationsList.push({
            id: `saving-${category}-${currentYear}-${currentMonth + 1}`, // Use currentMonth + 1 for display consistency
            type: 'saving_reminder',
            title: `Saving Reminder: ${category}`,
            message: `Consider making your saving for '${category}'. You saved for this category last month.`,
            category: category,
            isRead: false,
          });
        }
      });
    }

    newNotificationsList.sort((a, b) => {
      if (a.type === 'emi_due' && b.type !== 'emi_due') return -1;
      if (a.type !== 'emi_due' && b.type === 'emi_due') return 1;
      if (a.date && b.date) return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (a.type === 'saving_reminder' && b.type === 'saving_reminder') return (a.category || "").localeCompare(b.category || ""); // Sort saving reminders by category
      return 0;
    });

    setNotifications(newNotificationsList);
  }, [currentUser, liabilities, transactions]);


  const navigateToDashboard = useCallback(() => { setActiveView('dashboard'); setSelectedLiabilityForEMIs(null); setIsMenuOpen(false); setIsNotificationDropdownOpen(false); }, []);

  useEffect(() => {
    if (activeView === 'liabilityEMIDetail' && selectedLiabilityForEMIs?.id && currentUser) {
      const currentLiabilityInList = liabilities.find(l => l.id === selectedLiabilityForEMIs.id);
      if (currentLiabilityInList) {
        if (JSON.stringify(currentLiabilityInList) !== JSON.stringify(selectedLiabilityForEMIs)) {
           setSelectedLiabilityForEMIs(currentLiabilityInList);
        }
      } else {
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
    setIsNotificationDropdownOpen(false);
    setAuthError(null);
    try {
      await authService.logoutUser();
    } catch (error: any) { setAuthError(error.message || "Failed to log out."); }
  };
  const clearAuthError = useCallback(() => setAuthError(null), []);

  const handleOpenEditProfileModal = () => {
    setIsProfileDropdownOpen(false);
    setIsNotificationDropdownOpen(false);
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
    setIsNotificationDropdownOpen(false);
  }, []);

  const handleOpenEditTransactionForm = useCallback((transaction: Transaction) => { 
    setCurrentTransactionType(transaction.type); 
    setEditingTransaction(transaction); 
    setShowTransactionModal(true); 
    setIsNotificationDropdownOpen(false);
  }, []);
  
  const handleOpenNewLiabilityForm = useCallback(() => { 
    setEditingLiability(null); 
    setShowLiabilityForm(true); 
    setIsNotificationDropdownOpen(false);
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
      if (id && editingTransaction && editingTransaction.relatedLiabilityId && editingTransaction.type === TransactionType.EXPENSE) {
        const oldEmiAmount = editingTransaction.amount;
        const newEmiAmount = payload.amount;
        const liability = liabilities.find(l => l.id === editingTransaction.relatedLiabilityId);

        if (!liability) {
            throw new Error("Related liability not found for EMI edit.");
        }
        
        const emiTransactionsForLiability = transactions
          .filter(t => t.relatedLiabilityId === liability.id && t.type === TransactionType.EXPENSE)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || (a.createdAt && b.createdAt ? (typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate() : new Date(a.createdAt)).getTime() - (typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate() : new Date(b.createdAt)).getTime() : 0) );

        let outstandingPrincipalBeforeOldEmi = liability.initialAmount;
        let oldEmiPrincipalComponent = oldEmiAmount; 

        if (typeof liability.interestRate === 'number' && liability.interestRate > 0) {
            for (const tx of emiTransactionsForLiability) {
                if (tx.id === editingTransaction.id) { 
                    const paymentDetails = calculateLoanPaymentDetails(outstandingPrincipalBeforeOldEmi, liability.interestRate, oldEmiAmount);
                    oldEmiPrincipalComponent = paymentDetails.principalPaid;
                    break;
                }
                const paymentDetails = calculateLoanPaymentDetails(outstandingPrincipalBeforeOldEmi, liability.interestRate, tx.amount);
                outstandingPrincipalBeforeOldEmi -= paymentDetails.principalPaid;
                outstandingPrincipalBeforeOldEmi = Math.max(0, outstandingPrincipalBeforeOldEmi);
            }
        } else { 
            oldEmiPrincipalComponent = oldEmiAmount;
        }

        let newEmiPrincipalComponent = newEmiAmount;
        if (typeof liability.interestRate === 'number' && liability.interestRate > 0) {
            const paymentDetailsNew = calculateLoanPaymentDetails(outstandingPrincipalBeforeOldEmi, liability.interestRate, newEmiAmount);
            newEmiPrincipalComponent = paymentDetailsNew.principalPaid;
        } else {
             newEmiPrincipalComponent = newEmiAmount;
        }
        
        const amountDifferenceForLiabilityRepaid = newEmiPrincipalComponent - oldEmiPrincipalComponent;
        
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
      
      if (!payload.relatedLiabilityId || (payload.relatedLiabilityId && !id) ) { 
        let baseCategoriesForType: readonly string[] = [];
        let currentUserCategoriesForType: string[] = [];
        let categoryTypeIdentifier: CategoryTypeIdentifier = data.type;

        switch (data.type) {
          case TransactionType.INCOME:
            baseCategoriesForType = INCOME_CATEGORIES.map(String);
            currentUserCategoriesForType = userDefinedCategories.income;
            break;
          case TransactionType.EXPENSE:
            if (payload.category !== ExpenseCategory.LIABILITY_PAYMENT) {
                baseCategoriesForType = EXPENSE_CATEGORIES.map(String);
                currentUserCategoriesForType = userDefinedCategories.expense;
            } else { 
                categoryTypeIdentifier = null as any; 
            }
            break;
          case TransactionType.SAVING:
            baseCategoriesForType = SAVING_CATEGORIES.map(String);
            currentUserCategoriesForType = userDefinedCategories.saving;
            break;
        }

        if (categoryTypeIdentifier) { 
            const isCustomCategory = !baseCategoriesForType.includes(finalCategory);
            const isNewUserDefinedCategory = isCustomCategory && !currentUserCategoriesForType.includes(finalCategory);

            if (isNewUserDefinedCategory) {
              await storageService.addUserDefinedCategory(currentUser.uid, categoryTypeIdentifier, finalCategory);
            }
        }
      }
      
      closeModal();
    } catch (error: any) { 
      const operationDescription = id ? 'update' : 'add';
      console.error(`Error ${operationDescription} transaction (User: ${currentUser.uid}, ID: ${id || 'new'}):`, error);
      alert(`Failed to save transaction. Error: ${error.message || 'Unknown error'}.`);
    }
  }, [currentUser, userDefinedCategories, editingTransaction, closeModal, liabilities, transactions]);


  const handleEditEMI = useCallback((transaction: Transaction) => {
    handleOpenEditTransactionForm(transaction); 
  }, [handleOpenEditTransactionForm]);

  const handleDeleteEMI = useCallback(async (transactionId: string, relatedLiabilityId: string, emiAmount: number) => {
    if (!currentUser?.uid) return;

    const transactionToDelete = transactions.find(t => t.id === transactionId);
    const liability = liabilities.find(l => l.id === relatedLiabilityId);

    if (!transactionToDelete || !liability) {
      alert("Could not find the transaction or liability to delete.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this EMI payment? This will also adjust the principal repaid on the liability.")) {
      try {
        let principalComponentOfDeletedEMI = emiAmount; 

        if (typeof liability.interestRate === 'number' && liability.interestRate > 0) {
          const emiTransactionsForLiability = transactions
            .filter(t => t.relatedLiabilityId === liability.id && t.type === TransactionType.EXPENSE)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || (a.createdAt && b.createdAt ? (typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate() : new Date(a.createdAt)).getTime() - (typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate() : new Date(b.createdAt)).getTime() : 0) );
          
          let outstandingPrincipalBeforeTx = liability.initialAmount;
          for (const tx of emiTransactionsForLiability) {
            if (tx.id === transactionToDelete.id) { 
              const paymentDetails = calculateLoanPaymentDetails(outstandingPrincipalBeforeTx, liability.interestRate, tx.amount);
              principalComponentOfDeletedEMI = paymentDetails.principalPaid;
              break; 
            }
            const paymentDetails = calculateLoanPaymentDetails(outstandingPrincipalBeforeTx, liability.interestRate, tx.amount);
            outstandingPrincipalBeforeTx -= paymentDetails.principalPaid;
            outstandingPrincipalBeforeTx = Math.max(0, outstandingPrincipalBeforeTx); 
          }
        } else { 
            principalComponentOfDeletedEMI = emiAmount;
        }
        
        await storageService.deleteTransactionAndUpdateLiability(
          currentUser.uid,
          transactionId,
          relatedLiabilityId,
          principalComponentOfDeletedEMI 
        );
      } catch (error: any) {
        console.error("Error deleting EMI and updating liability:", error);
        alert(`Failed to delete EMI. Error: ${error.message}`);
      }
    }
  }, [currentUser, transactions, liabilities]);

  const handleDeleteTransaction = useCallback(async (id: string) => {
    if (!currentUser?.uid) return;
    const txToDelete = transactions.find(t => t.id === id);
    if (txToDelete?.relatedLiabilityId && txToDelete.type === TransactionType.EXPENSE) {
        await handleDeleteEMI(id, txToDelete.relatedLiabilityId, txToDelete.amount);
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
  }, [currentUser, liabilities, userDefinedCategories, closeModal]);

  const handleDeleteLiability = useCallback(async (id: string) => {
    if (!currentUser?.uid) return;
    if (window.confirm("Are you sure you want to delete this liability? This will NOT delete associated EMI payments from expenses. You may need to manually reclassify or delete those expense entries if desired.")) {
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
  const totalIncome = useMemo(() => incomeTransactions.reduce((sum, t) => sum + t.amount, 0), [incomeTransactions]); // Completed line

  // Placeholder for the actual app UI, as the original file seems truncated
  // The actual UI rendering (isLoadingAuth, !currentUser, main app layout) would normally follow here.
  // Since the file is truncated, this placeholder fulfills the React.FC contract.
  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', color: '#ccc', backgroundColor: '#333', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <KaashLogoIcon className="h-20 w-20 text-sky-400 mb-4" />
      <h1 style={{ fontSize: '2em', color: '#67e8f9', marginBottom: '0.5em' }}>Kaash Finance Tracker</h1>
      <p style={{ fontSize: '1.2em', marginBottom: '1em' }}>Loading your financial dashboard...</p>
      {isLoadingAuth && <p>Checking authentication status...</p>}
      {!currentUser && !isLoadingAuth && <p>Please log in to continue.</p>}
      {currentUser && <p>Welcome, {currentUser.name || currentUser.email}!</p>}
      <p style={{ marginTop: '2em', fontSize: '0.9em', color: '#888' }}>
        Note: The full application UI is not rendered because the App.tsx file content provided appears to be incomplete.
        This is a placeholder view.
      </p>
    </div>
  );
}; // Closes the App component function

export default App;
