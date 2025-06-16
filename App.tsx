
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
import { KaashLogoIcon, PlusIcon, BellIcon, PiggyBankIcon, UserIcon, LogoutIcon, MenuIcon, EditIcon as ProfileEditIcon, AddIncomeIcon, AddExpenseIcon, AddLiabilityIcon } from './components/icons'; 
import { ExpenseCategory, SavingCategory } from './types'; 
import { calculateLoanPaymentDetails } from './utils'; 
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, SAVING_CATEGORIES, LIABILITY_CATEGORIES, APP_NAME } from './constants';
import { LoadingSpinner } from './components/LoadingSpinner';


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

  const [upcomingPaymentsDashboard, setUpcomingPaymentsDashboard] = useState<Liability[]>([]); 
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
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Check if the click was on the menu button itself, if so, toggleMenu already handled it
        const menuButton = document.getElementById('main-menu-button');
        if (menuButton && menuButton.contains(event.target as Node)) {
          return;
        }
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const menuRef = useRef<HTMLDivElement>(null);


  const closeModal = useCallback(() => {
    setShowTransactionModal(false); setCurrentTransactionType(null); setEditingTransaction(null);
    setShowLiabilityForm(false); setEditingLiability(null); setPayingLiability(null);
    setShowEditProfileModal(false);
    //setIsNotificationDropdownOpen(false); // Notification dropdown is handled by its own toggle and click-outside
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
      if ((l.initialAmount - l.amountRepaid) <= 0.005) return false; 
      const dueDate = new Date(l.nextDueDate + 'T00:00:00Z'); 
      return dueDate >= today && dueDate <= sevenDaysFromNow;
    }).sort((a,b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
    setUpcomingPaymentsDashboard(upcoming);
  }, [liabilities, currentUser]);


  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }

    const newNotificationsList: AppNotification[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    liabilities.forEach(l => {
      if ((l.initialAmount - l.amountRepaid) <= 0.005) return; 

      const dueDate = new Date(l.nextDueDate + 'T00:00:00Z'); 
      if (dueDate >= today && dueDate <= sevenDaysFromNow) {
        newNotificationsList.push({
          id: `emi-${l.id}-${l.nextDueDate}`, 
          type: 'emi_due',
          title: `EMI Due: ${l.name || l.category}`,
          message: `₹${l.emiAmount?.toFixed(2) || (l.initialAmount - l.amountRepaid).toFixed(2)} due on ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}.`,
          date: l.nextDueDate,
          amount: l.emiAmount,
          isRead: false,
        });
      }
    });

    if (today.getDate() <= 7) {
      const currentMonth = today.getMonth(); 
      const currentYear = today.getFullYear();
      
      const prevMonthDate = new Date(currentYear, currentMonth -1, 1); 
      const prevMonthYear = prevMonthDate.getFullYear();
      const prevMonth = prevMonthDate.getMonth();

      const savingsLastMonth = transactions.filter(t => {
        const txDate = new Date(t.date); 
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
            id: `saving-${category}-${currentYear}-${currentMonth + 1}`, 
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
      if (a.type === 'saving_reminder' && b.type === 'saving_reminder') return (a.category || "").localeCompare(b.category || ""); 
      return 0;
    });

    setNotifications(newNotificationsList);
  }, [currentUser, liabilities, transactions]);


  const navigateToDashboard = useCallback(() => { setActiveView('dashboard'); setSelectedLiabilityForEMIs(null); setIsMenuOpen(false); setIsNotificationDropdownOpen(false); closeModal();}, [closeModal]);
  const navigateToIncomeDetails = useCallback(() => { setActiveView('incomeDetails'); setIsMenuOpen(false); setIsNotificationDropdownOpen(false); closeModal(); }, [closeModal]);
  const navigateToExpenseDetails = useCallback(() => { setActiveView('expenseDetails'); setIsMenuOpen(false); setIsNotificationDropdownOpen(false); closeModal(); }, [closeModal]);
  const navigateToSavingsDetails = useCallback(() => { setActiveView('savingsDetails'); setIsMenuOpen(false); setIsNotificationDropdownOpen(false); closeModal(); }, [closeModal]);
  const navigateToLiabilityDetails = useCallback(() => { setActiveView('liabilityDetails'); setSelectedLiabilityForEMIs(null); setIsMenuOpen(false); setIsNotificationDropdownOpen(false); closeModal(); }, [closeModal]);
  const navigateToLiabilityEMIDetail = useCallback((liability: Liability) => { setSelectedLiabilityForEMIs(liability); setActiveView('liabilityEMIDetail'); setIsMenuOpen(false); setIsNotificationDropdownOpen(false); closeModal();}, [closeModal]);
  const navigateToEarlyLoanClosure = useCallback(() => { setActiveView('earlyLoanClosure'); setIsMenuOpen(false); setIsNotificationDropdownOpen(false); closeModal(); }, [closeModal]);

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
        let categoryTypeIdentifier: CategoryTypeIdentifier | null = data.type as CategoryTypeIdentifier;

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
                categoryTypeIdentifier = null; 
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
  
  const totalIncome = useMemo(() => incomeTransactions.reduce((sum, t) => sum + t.amount, 0), [incomeTransactions]);
  const totalExpenses = useMemo(() => expenseTransactions.reduce((sum, t) => sum + t.amount, 0), [expenseTransactions]);
  const totalSavings = useMemo(() => savingTransactions.reduce((sum, t) => sum + t.amount, 0), [savingTransactions]);
  const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
        .sort((a,b) => {
            const dateComp = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateComp !== 0) return dateComp;
            if (a.createdAt && b.createdAt) {
                const tsA = typeof a.createdAt.toDate === 'function' ? a.createdAt.toDate() : new Date(a.createdAt);
                const tsB = typeof b.createdAt.toDate === 'function' ? b.createdAt.toDate() : new Date(b.createdAt);
                return tsB.getTime() - tsA.getTime();
            }
            return 0;
        })
        .slice(0, 10);
  }, [transactions]);
  
  const monthlySummaryData = useMemo(() => {
    const summary: { [month: string]: { income: number; expense: number; saving: number } } = {};
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 2); 
    threeMonthsAgo.setDate(1); 
    threeMonthsAgo.setHours(0,0,0,0);

    transactions.forEach(t => {
      const transactionDate = new Date(t.date);
      if (transactionDate >= threeMonthsAgo) {
        const monthYear = `${transactionDate.toLocaleString('default', { month: 'short' })} '${transactionDate.getFullYear().toString().slice(-2)}`;
        if (!summary[monthYear]) {
          summary[monthYear] = { income: 0, expense: 0, saving: 0 };
        }
        if (t.type === TransactionType.INCOME) summary[monthYear].income += t.amount;
        else if (t.type === TransactionType.EXPENSE) summary[monthYear].expense += t.amount;
        else if (t.type === TransactionType.SAVING) summary[monthYear].saving += t.amount;
      }
    });
    
    // Sort months chronologically for the chart
    return Object.entries(summary)
      .map(([month, data]) => {
        const [monthName, yearSuffix] = month.split(" '");
        const year = parseInt(`20${yearSuffix}`, 10);
        // A bit of a hack to get month index, better to store full date in summary key
        const monthIndex = new Date(Date.parse(monthName +" 1, " + year)).getMonth();
        return { month, ...data, sortKey: new Date(year, monthIndex, 1).getTime() };
      })
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({month, income, expense, saving}) => ({month, income, expense, saving})); // Remove sortKey

  }, [transactions]);


  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-6 p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3">
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
              </div>
            </div>
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <MonthlySummaryChart data={monthlySummaryData} />
              </div>
              <div className="xl:col-span-1">
                 <TransactionList 
                  title="Recent Transactions" 
                  transactions={recentTransactions} 
                  onDelete={handleDeleteTransaction}
                  onEdit={handleOpenEditTransactionForm}
                />
              </div>
            </div>
            
             {/* Quick Add Buttons - visually enhanced */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 p-4 bg-slate-800 rounded-xl border border-slate-700 shadow-lg">
                <button
                    onClick={() => handleOpenNewTransactionForm(TransactionType.INCOME)}
                    className="flex flex-col items-center justify-center p-3 sm:p-4 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label="Add new income"
                >
                    <AddIncomeIcon className="h-6 w-6 sm:h-7 sm:w-7 mb-1" />
                    <span className="text-xs sm:text-sm font-medium">Add Income</span>
                </button>
                <button
                    onClick={() => handleOpenNewTransactionForm(TransactionType.EXPENSE)}
                    className="flex flex-col items-center justify-center p-3 sm:p-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label="Add new expense"
                >
                    <AddExpenseIcon className="h-6 w-6 sm:h-7 sm:w-7 mb-1" />
                    <span className="text-xs sm:text-sm font-medium">Add Expense</span>
                </button>
                <button
                    onClick={() => handleOpenNewTransactionForm(TransactionType.SAVING)}
                    className="flex flex-col items-center justify-center p-3 sm:p-4 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    aria-label="Add new saving"
                >
                    <PiggyBankIcon className="h-6 w-6 sm:h-7 sm:w-7 mb-1" />
                    <span className="text-xs sm:text-sm font-medium">Add Saving</span>
                </button>
                <button
                    onClick={handleOpenNewLiabilityForm}
                    className="flex flex-col items-center justify-center p-3 sm:p-4 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    aria-label="Add new liability"
                >
                    <AddLiabilityIcon className="h-6 w-6 sm:h-7 sm:w-7 mb-1" />
                    <span className="text-xs sm:text-sm font-medium">Add Liability</span>
                </button>
            </div>
          </div>
        );
      case 'incomeDetails':
        return <IncomeDetailsPage 
                  incomeTransactions={incomeTransactions} 
                  onBack={navigateToDashboard}
                  onEditTransaction={handleOpenEditTransactionForm}
                  onDeleteTransaction={handleDeleteTransaction}
                  onOpenNewTransactionForm={handleOpenNewTransactionForm}
               />;
      case 'expenseDetails':
        return <ExpenseDetailsPage 
                  expenseTransactions={expenseTransactions} 
                  onBack={navigateToDashboard}
                  onEditTransaction={handleOpenEditTransactionForm}
                  onDeleteTransaction={handleDeleteTransaction}
                  onOpenNewTransactionForm={handleOpenNewTransactionForm}
                />;
      case 'savingsDetails':
        return <SavingsDetailsPage 
                  savingTransactions={savingTransactions} 
                  onBack={navigateToDashboard}
                  onEditTransaction={handleOpenEditTransactionForm}
                  onDeleteTransaction={handleDeleteTransaction}
                  onOpenNewTransactionForm={handleOpenNewTransactionForm}
               />;
      case 'liabilityDetails':
        return <LiabilityDetailsPage 
                  liabilities={liabilities} 
                  allTransactions={transactions}
                  onBack={navigateToDashboard}
                  onEditLiability={setEditingLiability}
                  onDeleteLiability={handleDeleteLiability}
                  onRecordPayment={setPayingLiability}
                  onViewEMIs={(liabilityId) => {
                    const l = liabilities.find(lib => lib.id === liabilityId);
                    if (l) navigateToLiabilityEMIDetail(l);
                  }}
                  onOpenNewLiabilityForm={handleOpenNewLiabilityForm}
               />;
      case 'liabilityEMIDetail':
        if (selectedLiabilityForEMIs) {
          return <LiabilityEMIDetailPage 
                    liability={selectedLiabilityForEMIs} 
                    allTransactions={transactions}
                    onBack={navigateToLiabilityDetails}
                    onEditEMI={handleEditEMI}
                    onDeleteEMI={handleDeleteEMI}
                  />;
        }
        navigateToDashboard(); // Fallback if no liability selected
        return null;
      case 'earlyLoanClosure':
        return <EarlyLoanClosurePage liabilities={liabilities} onBack={navigateToDashboard} />;
      default:
        return <p>Unknown view</p>;
    }
  };


  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col justify-center items-center text-gray-100">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-lg">Loading {APP_NAME}...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage 
              onLogin={handleLogin} 
              onSignup={handleSignup} 
              onGoogleLogin={handleGoogleLogin} 
              error={authError} 
              clearError={clearAuthError} 
           />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 selection:bg-sky-400 selection:text-sky-900">
      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-slate-800/80 backdrop-blur-md shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left side: Menu button and Logo */}
            <div className="flex items-center">
              <button
                id="main-menu-button"
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 mr-2"
                aria-label="Open side menu"
                aria-expanded={isMenuOpen}
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              <div 
                onClick={navigateToDashboard} 
                className="flex-shrink-0 flex items-center space-x-2 cursor-pointer group"
                aria-label="Go to dashboard"
              >
                <KaashLogoIcon className="h-8 w-auto text-sky-400 group-hover:opacity-80 transition-opacity" />
                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 hidden sm:block group-hover:opacity-80 transition-opacity">{APP_NAME}</span>
              </div>
            </div>

            {/* Right side: Notifications and Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Notification Bell */}
              <div className="relative" ref={notificationDropdownRef}>
                <button
                  onClick={toggleNotificationDropdown}
                  className="p-2 rounded-full text-gray-400 hover:text-sky-400 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 relative"
                  aria-label="View notifications"
                  aria-haspopup="true"
                  aria-expanded={isNotificationDropdownOpen}
                >
                  <BellIcon className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-slate-800"></span>
                  )}
                </button>
                {isNotificationDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-72 sm:w-80 rounded-md shadow-lg bg-slate-700 border border-slate-600 ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-50 max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className="px-3 py-2.5 border-b border-slate-600 last:border-b-0 hover:bg-slate-600/70 transition-colors">
                          <p className={`font-semibold text-sm ${n.type === 'emi_due' ? 'text-orange-300' : 'text-teal-300'}`}>{n.title}</p>
                          <p className="text-xs text-gray-300">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="px-3 py-3 text-sm text-gray-400 text-center">No new notifications.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
                  aria-label="Open user menu"
                  aria-haspopup="true"
                  aria-expanded={isProfileDropdownOpen}
                >
                  {currentUser.photoURL ? (
                    <img className="h-8 w-8 rounded-full object-cover" src={currentUser.photoURL} alt="User profile" />
                  ) : (
                    <UserIcon className="h-8 w-8 rounded-full text-gray-400 bg-slate-700 p-1" />
                  )}
                </button>
                {isProfileDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-xl bg-slate-700 border border-slate-600 ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-50">
                    <div className="px-3 py-3 border-b border-slate-600">
                      <div className="flex items-center space-x-3">
                        {currentUser.photoURL ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={currentUser.photoURL} alt="User profile" />
                        ) : (
                          <UserIcon className="h-10 w-10 rounded-full text-gray-300 bg-slate-600 p-1.5" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-100 truncate" title={currentUser.name || currentUser.email || undefined}>
                            {currentUser.name || currentUser.email}
                          </p>
                          {(currentUser.name && currentUser.email) && 
                            <p className="text-xs text-gray-400 truncate" title={currentUser.email}>{currentUser.email}</p>
                          }
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleOpenEditProfileModal}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-slate-600 hover:text-sky-300 transition-colors flex items-center"
                      role="menuitem"
                    >
                       <ProfileEditIcon className="w-4 h-4 mr-2.5 text-gray-400" /> Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-slate-600 hover:text-red-400 transition-colors flex items-center"
                      role="menuitem"
                    >
                      <LogoutIcon className="w-4 h-4 mr-2.5 text-gray-400" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={toggleMenu} 
        onOpenIncomeForm={() => { handleOpenNewTransactionForm(TransactionType.INCOME); setIsMenuOpen(false);}}
        onOpenExpenseForm={() => { handleOpenNewTransactionForm(TransactionType.EXPENSE); setIsMenuOpen(false);}}
        onOpenSavingForm={() => { handleOpenNewTransactionForm(TransactionType.SAVING); setIsMenuOpen(false);}}
        onOpenLiabilityForm={() => { handleOpenNewLiabilityForm(); setIsMenuOpen(false);}}
        onNavigateToEarlyLoanClosure={() => { navigateToEarlyLoanClosure(); setIsMenuOpen(false); }}
      />
      
      <main className="pt-2 sm:pt-4"> {/* Padding top for content below sticky header */}
        {renderActiveView()}
      </main>

      {/* Modals */}
      {showTransactionModal && currentTransactionType && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700">
            <TransactionForm
              key={forceFormCategoryResetKey + (editingTransaction?.id || 'new')} // Reset form when category lists change
              type={currentTransactionType}
              onSubmit={handleAddOrEditTransaction}
              onCancel={closeModal}
              existingTransaction={editingTransaction}
              predefinedCategories={
                currentTransactionType === TransactionType.INCOME ? INCOME_CATEGORIES.map(String) :
                currentTransactionType === TransactionType.EXPENSE ? EXPENSE_CATEGORIES.map(String) :
                SAVING_CATEGORIES.map(String)
              }
              currentUserDefinedCategories={
                currentTransactionType === TransactionType.INCOME ? userDefinedCategories.income :
                currentTransactionType === TransactionType.EXPENSE ? userDefinedCategories.expense :
                userDefinedCategories.saving
              }
              onUserAddCategory={
                currentTransactionType === TransactionType.INCOME ? incomeCategoryHandlers.handleAdd :
                currentTransactionType === TransactionType.EXPENSE ? expenseCategoryHandlers.handleAdd :
                savingCategoryHandlers.handleAdd
              }
              onUserEditCategory={
                currentTransactionType === TransactionType.INCOME ? incomeCategoryHandlers.handleEdit :
                currentTransactionType === TransactionType.EXPENSE ? expenseCategoryHandlers.handleEdit :
                savingCategoryHandlers.handleEdit
              }
              onUserDeleteCategory={
                currentTransactionType === TransactionType.INCOME ? incomeCategoryHandlers.handleDelete :
                currentTransactionType === TransactionType.EXPENSE ? expenseCategoryHandlers.handleDelete :
                savingCategoryHandlers.handleDelete
              }
            />
          </div>
        </div>
      )}

      {showLiabilityForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700">
            <LiabilityForm
              key={forceFormCategoryResetKey + (editingLiability?.id || 'new-liability')}
              onSubmit={handleAddOrEditLiability}
              onCancel={closeModal}
              existingLiability={editingLiability}
              predefinedLiabilityCategories={LIABILITY_CATEGORIES.map(String)}
              currentUserDefinedLiabilityCategories={userDefinedCategories.liability}
              onUserAddLiabilityCategory={liabilityCategoryHandlers.handleAdd}
              onUserEditLiabilityCategory={liabilityCategoryHandlers.handleEdit}
              onUserDeleteLiabilityCategory={liabilityCategoryHandlers.handleDelete}
            />
          </div>
        </div>
      )}

      {payingLiability && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700">
            <RecordLiabilityPaymentForm
              liability={payingLiability}
              onSubmit={(paymentAmount, paymentDate, newNextDueDate, notes) => 
                handleRecordLiabilityPayment(payingLiability.id, paymentAmount, paymentDate, newNextDueDate, notes)
              }
              onCancel={closeModal}
            />
          </div>
        </div>
      )}
       {showEditProfileModal && currentUser && (
        <EditProfileModal 
          user={currentUser}
          onUpdateProfile={handleProfileUpdate}
          onCancel={handleCloseEditProfileModal}
        />
      )}
    </div>
  );
}; 

export default App;
