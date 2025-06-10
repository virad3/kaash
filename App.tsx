
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Transaction, TransactionType, ChatMessage, ExpenseCategory, Liability, SavingsGoal } from './types';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { SummaryDisplay } from './components/SummaryDisplay';
import { Chatbot } from './components/Chatbot';
import { LiabilityForm } from './components/LiabilityForm';
import { LiabilityList } from './components/LiabilityList';
import { RecordLiabilityPaymentForm } from './components/RecordLiabilityPaymentForm';
import { SavingsGoalForm } from './components/SavingsGoalForm';
import { SavingsGoalList } from './components/SavingsGoalList';
import { ContributeToSavingsForm } from './components/ContributeToSavingsForm';
import { WithdrawFromSavingsForm } from './components/WithdrawFromSavingsForm';
import { AuthPage } from './components/AuthPage';
import * as storageService from './services/storageService';
import * as authService from './services/authService';
import { askKaash } from './services/geminiService';
import { KaashLogoIcon, PlusIcon, BellIcon, PiggyBankIcon, UserIcon, LogoutIcon } from './components/icons';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  
  const [showTransactionModal, setShowTransactionModal] = useState<boolean>(false);
  const [currentTransactionType, setCurrentTransactionType] = useState<TransactionType | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const [showLiabilityForm, setShowLiabilityForm] = useState<boolean>(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);
  const [payingLiability, setPayingLiability] = useState<Liability | null>(null);

  const [showSavingsGoalForm, setShowSavingsGoalForm] = useState<boolean>(false);
  const [editingSavingsGoal, setEditingSavingsGoal] = useState<SavingsGoal | null>(null);
  const [contributingToGoal, setContributingToGoal] = useState<SavingsGoal | null>(null);
  const [withdrawingFromGoal, setWithdrawingFromGoal] = useState<SavingsGoal | null>(null);

  const [upcomingPayments, setUpcomingPayments] = useState<Liability[]>([]);

  useEffect(() => {
    const unsubscribeAuth = authService.onAuthUserChanged((user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false);
      if (user) {
        setChatMessages([{ id: Date.now().toString(), text: `Hello ${user.name || user.email}! I'm Kaash, your financial assistant. How can I help?`, sender: 'bot', timestamp: new Date() }]);
      } else {
        setTransactions([]);
        setLiabilities([]);
        setSavingsGoals([]);
        setChatMessages([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);
  
  useEffect(() => {
    let unsubTransactions = () => {};
    let unsubLiabilities = () => {};
    let unsubSavingsGoals = () => {};

    if (currentUser?.uid) {
      unsubTransactions = storageService.subscribeToTransactions(currentUser.uid, setTransactions);
      unsubLiabilities = storageService.subscribeToLiabilities(currentUser.uid, setLiabilities);
      unsubSavingsGoals = storageService.subscribeToSavingsGoals(currentUser.uid, setSavingsGoals);
    }
    return () => {
      unsubTransactions();
      unsubLiabilities();
      unsubSavingsGoals();
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
      const dueDate = new Date(l.nextDueDate + 'T00:00:00Z'); // Ensure UTC for date comparison
      return dueDate >= today && dueDate <= sevenDaysFromNow;
    }).sort((a,b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
    setUpcomingPayments(upcoming);
  }, [liabilities, currentUser]);

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
    setAuthError(null);
    try {
      await authService.logoutUser();
    } catch (error: any) { setAuthError(error.message || "Failed to log out."); }
  };
  const clearAuthError = () => setAuthError(null);

  const handleOpenNewTransactionForm = (type: TransactionType) => { setCurrentTransactionType(type); setEditingTransaction(null); setShowTransactionModal(true); };
  const handleOpenEditTransactionForm = (transaction: Transaction) => { setCurrentTransactionType(transaction.type); setEditingTransaction(transaction); setShowTransactionModal(true); };

  const handleAddOrEditTransaction = useCallback(async (data: { id?: string; type: TransactionType; description: string; amount: number; date: string; category?: ExpenseCategory | string; relatedLiabilityId?: string; relatedSavingsGoalId?: string; }) => {
    if (!currentUser?.uid) return;
    const { id, ...transactionDetails } = data; // Exclude id from details for add
    const payload = {
      ...transactionDetails,
      category: transactionDetails.category || (transactionDetails.type === TransactionType.EXPENSE ? ExpenseCategory.OTHER : undefined),
    };

    try {
      if (id) { 
        await storageService.updateTransaction(currentUser.uid, id, payload);
      } else { 
        await storageService.addTransaction(currentUser.uid, payload as Omit<Transaction, 'id' | 'createdAt' | 'userId'>);
      }
      closeModal();
    } catch (error) { console.error("Error saving transaction:", error); alert("Failed to save transaction."); }
  }, [currentUser]);

  const handleDeleteTransaction = useCallback(async (id: string) => {
    if (!currentUser?.uid) return;
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try { await storageService.deleteTransaction(currentUser.uid, id); } 
      catch (error) { console.error("Error deleting transaction:", error); alert("Failed to delete transaction."); }
    }
  }, [currentUser]);

  const handleAddOrEditLiability = useCallback(async (data: Omit<Liability, 'id' | 'createdAt' | 'userId'> & { id?: string }) => {
    if (!currentUser?.uid) return;
    const { id, ...liabilityDetails } = data;
    const payload = {
        ...liabilityDetails,
        amountRepaid: liabilityDetails.amountRepaid ?? (id ? (liabilities.find(l=>l.id === id)?.amountRepaid ?? 0) : 0), // Preserve or default amountRepaid
    };
    try {
      if (id) {
        await storageService.updateLiability(currentUser.uid, id, payload);
      } else {
        await storageService.addLiability(currentUser.uid, payload as Omit<Liability, 'id' | 'createdAt' | 'userId'>);
      }
      closeModal();
    } catch (error) { console.error("Error saving liability:", error); alert("Failed to save liability."); }
  }, [currentUser, liabilities]);

  const handleDeleteLiability = useCallback(async (id: string) => {
    if (!currentUser?.uid) return;
    if (window.confirm("Are you sure you want to delete this liability?")) {
      try { await storageService.deleteLiability(currentUser.uid, id); }
      catch (error) { console.error("Error deleting liability:", error); alert("Failed to delete liability."); }
    }
  }, [currentUser]);

  const handleRecordLiabilityPayment = useCallback(async (liabilityId: string, paymentAmount: number, paymentDate: string, newNextDueDate: string, expenseNotes?: string) => {
    if (!currentUser?.uid) return;
    const liability = liabilities.find(l => l.id === liabilityId);
    if (!liability) return;

    const updatedLiabilityData = { 
        amountRepaid: Math.min(liability.amountRepaid + paymentAmount, liability.initialAmount), 
        nextDueDate: newNextDueDate 
    };
    try {
        await storageService.updateLiability(currentUser.uid, liabilityId, updatedLiabilityData);
        const expenseTxData = {
            type: TransactionType.EXPENSE,
            description: expenseNotes || `Payment for ${liability.name}`,
            amount: paymentAmount, date: paymentDate,
            category: ExpenseCategory.LIABILITY_PAYMENT, relatedLiabilityId: liabilityId,
        };
        await storageService.addTransaction(currentUser.uid, expenseTxData as Omit<Transaction, 'id' | 'createdAt' | 'userId'>);
        setPayingLiability(null);
    } catch (error) { console.error("Error recording liability payment:", error); alert("Failed to record payment."); }
  }, [liabilities, currentUser]);

  const handleAddOrEditSavingsGoal = useCallback(async (data: Omit<SavingsGoal, 'id' | 'createdAt' | 'userId'> & { id?: string }) => {
    if (!currentUser?.uid) return;
    const { id, ...goalDetails } = data;
    const payload = {
        ...goalDetails,
        currentAmount: goalDetails.currentAmount ?? (id ? (savingsGoals.find(g=>g.id === id)?.currentAmount ?? 0) : 0),
    };
    try {
      if (id) {
        await storageService.updateSavingsGoal(currentUser.uid, id, payload);
      } else {
        await storageService.addSavingsGoal(currentUser.uid, payload as Omit<SavingsGoal, 'id' | 'createdAt' | 'userId'>);
      }
      closeModal();
    } catch (error) { console.error("Error saving savings goal:", error); alert("Failed to save savings goal."); }
  }, [currentUser, savingsGoals]);

  const handleDeleteSavingsGoal = useCallback(async (id: string) => {
    if (!currentUser?.uid) return;
    if (window.confirm("Are you sure you want to delete this savings goal?")) {
      try { await storageService.deleteSavingsGoal(currentUser.uid, id); }
      catch (error) { console.error("Error deleting savings goal:", error); alert("Failed to delete savings goal."); }
    }
  }, [currentUser]);
  
  const handleContributeToSavings = useCallback(async (goalId: string, amount: number, date: string, notes?: string) => {
    if (!currentUser?.uid) return;
    const goal = savingsGoals.find(g => g.id === goalId);
    if (!goal) return;
    const updatedGoalData = { currentAmount: Math.min(goal.currentAmount + amount, goal.targetAmount) };
    try {
        await storageService.updateSavingsGoal(currentUser.uid, goalId, updatedGoalData);
        const expenseTxData = {
            type: TransactionType.EXPENSE, description: notes || `Contribution to ${goal.name}`,
            amount: amount, date: date, category: ExpenseCategory.SAVINGS_GOAL_CONTRIBUTION, relatedSavingsGoalId: goalId,
        };
        await storageService.addTransaction(currentUser.uid, expenseTxData as Omit<Transaction, 'id' | 'createdAt' | 'userId'>);
        setContributingToGoal(null);
    } catch (error) { console.error("Error contributing to savings:", error); alert("Failed to contribute."); }
  }, [savingsGoals, currentUser]);

  const handleWithdrawFromSavings = useCallback(async (goalId: string, amount: number, date: string, notes?: string) => {
    if (!currentUser?.uid) return;
    const goal = savingsGoals.find(g => g.id === goalId);
    if (!goal) return;
    const updatedGoalData = { currentAmount: Math.max(0, goal.currentAmount - amount) };
    try {
        await storageService.updateSavingsGoal(currentUser.uid, goalId, updatedGoalData);
        const incomeTxData = {
            type: TransactionType.INCOME, description: notes || `Withdrawal from ${goal.name}`,
            amount: amount, date: date, relatedSavingsGoalId: goalId,
        };
        await storageService.addTransaction(currentUser.uid, incomeTxData as Omit<Transaction, 'id' | 'createdAt' | 'userId'>);
        setWithdrawingFromGoal(null);
    } catch (error) { console.error("Error withdrawing from savings:", error); alert("Failed to withdraw."); }
  }, [savingsGoals, currentUser]);

  const handleChatSubmit = useCallback(async (userMessage: string) => {
    if (!currentUser?.uid) return;
    const newMessage: ChatMessage = { id: Date.now().toString(), text: userMessage, sender: 'user', timestamp: new Date() };
    setChatMessages(prev => [...prev, newMessage]);
    setIsChatLoading(true);
    try {
      const botResponseText = await askKaash(userMessage, transactions, liabilities, savingsGoals);
      setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: botResponseText, sender: 'bot', timestamp: new Date() }]);
    } catch (error) {
      console.error("Error getting response from Kaash:", error);
      setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: "Sorry, I encountered an error.", sender: 'bot', timestamp: new Date() }]);
    } finally { setIsChatLoading(false); }
  }, [transactions, liabilities, savingsGoals, currentUser]); 

  const incomeTransactions = useMemo(() => transactions.filter(t => t.type === TransactionType.INCOME), [transactions]);
  const expenseTransactions = useMemo(() => transactions.filter(t => t.type === TransactionType.EXPENSE), [transactions]);
  const totalIncome = useMemo(() => incomeTransactions.reduce((sum, t) => sum + t.amount, 0), [incomeTransactions]);
  const totalExpenses = useMemo(() => expenseTransactions.reduce((sum, t) => sum + t.amount, 0), [expenseTransactions]);
  const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);
  
  const closeModal = () => {
    setShowTransactionModal(false); setCurrentTransactionType(null); setEditingTransaction(null);
    setShowLiabilityForm(false); setEditingLiability(null); setPayingLiability(null);
    setShowSavingsGoalForm(false); setEditingSavingsGoal(null); setContributingToGoal(null); setWithdrawingFromGoal(null);
  };
  
  const handleOpenNewLiabilityForm = () => { setEditingLiability(null); setShowLiabilityForm(true); };
  const handleOpenEditLiabilityForm = (liability: Liability) => { setEditingLiability(liability); setShowLiabilityForm(true); };
  const handleOpenRecordPaymentForm = (liability: Liability) => setPayingLiability(liability);
  const handleOpenNewSavingsGoalForm = () => { setEditingSavingsGoal(null); setShowSavingsGoalForm(true); };
  const handleOpenEditSavingsGoalForm = (goal: SavingsGoal) => { setEditingSavingsGoal(goal); setShowSavingsGoalForm(true); };
  const handleOpenContributeForm = (goal: SavingsGoal) => setContributingToGoal(goal);
  const handleOpenWithdrawForm = (goal: SavingsGoal) => setWithdrawingFromGoal(goal);

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex justify-center items-center text-sky-400 text-xl p-4 text-center">Loading Kaash...</div>;
  }

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} onSignup={handleSignup} onGoogleLogin={handleGoogleLogin} error={authError} clearError={clearAuthError} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 flex flex-col items-center p-2 sm:p-4 selection:bg-sky-400 selection:text-sky-900">
      <header className="w-full max-w-7xl mb-4 sm:mb-6 flex justify-between items-center py-3 sm:py-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <KaashLogoIcon className="h-10 w-10 sm:h-12 sm:w-12 text-sky-400" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">
            Kaash
          </h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {currentUser.photoURL && <img src={currentUser.photoURL} alt={currentUser.name || "User"} className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-sky-500" />}
          {!currentUser.photoURL && <UserIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 bg-slate-700 p-1.5 sm:p-2 rounded-full"/>}
          <div className="text-right">
            <p className="text-xs sm:text-sm text-gray-300 truncate max-w-[100px] sm:max-w-[150px]">{currentUser.name || currentUser.email}</p>
            <p className="text-xs text-gray-500 hidden sm:block">Logged In</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center space-x-2 text-gray-400 hover:text-sky-400 p-2 rounded-md hover:bg-slate-700 transition-colors"
            title="Logout"
          >
            <LogoutIcon className="h-5 w-5"/> 
            <span className="text-sm hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {upcomingPayments.length > 0 && (
        <div className="w-full max-w-7xl mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-300 text-xs sm:text-sm">
          <div className="flex items-center font-semibold mb-1">
            <BellIcon className="h-5 w-5 mr-2 text-yellow-400" />
            Upcoming Payments (Next 7 Days):
          </div>
          <ul className="list-disc list-inside ml-2">
            {upcomingPayments.map(p => (
              <li key={p.id}>
                {p.name} - ₹{p.emiAmount ? p.emiAmount.toFixed(2) : (p.initialAmount - p.amountRepaid).toFixed(2)} due on {new Date(p.nextDueDate + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
              </li>
            ))}
          </ul>
        </div>
      )}

      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <SummaryDisplay 
            totalIncome={totalIncome} 
            totalExpenses={totalExpenses} 
            balance={balance} 
            expenseTransactions={expenseTransactions}
            liabilities={liabilities}
            savingsGoals={savingsGoals}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <button onClick={() => handleOpenNewTransactionForm(TransactionType.INCOME)} className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 w-full text-sm sm:text-base">
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" /> Add Income
            </button>
            <button onClick={() => handleOpenNewTransactionForm(TransactionType.EXPENSE)} className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 w-full text-sm sm:text-base">
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" /> Add Expense
            </button>
            <button onClick={handleOpenNewLiabilityForm} className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 w-full text-sm sm:text-base">
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" /> Add Liability
            </button>
            <button onClick={handleOpenNewSavingsGoalForm} className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 w-full text-sm sm:text-base">
              <PiggyBankIcon className="h-4 w-4 sm:h-5 sm:w-5" /> Add Savings
            </button>
          </div>

          {(showTransactionModal || showLiabilityForm || payingLiability || showSavingsGoalForm || contributingToGoal || withdrawingFromGoal) && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm">
              <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-md relative border border-slate-700">
                <button onClick={closeModal} className="absolute top-2 sm:top-3 right-2 sm:right-3 text-gray-400 hover:text-gray-200 transition-colors" aria-label="Close form">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-7 sm:h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                {showTransactionModal && currentTransactionType && <TransactionForm type={currentTransactionType} onSubmit={handleAddOrEditTransaction} onCancel={closeModal} existingTransaction={editingTransaction} />}
                {showLiabilityForm && <LiabilityForm onSubmit={handleAddOrEditLiability} onCancel={closeModal} existingLiability={editingLiability}/>}
                {payingLiability && <RecordLiabilityPaymentForm liability={payingLiability} onSubmit={(paymentAmount, paymentDate, newNextDueDate, notes) => handleRecordLiabilityPayment(payingLiability.id, paymentAmount, paymentDate, newNextDueDate, notes)} onCancel={closeModal}/>}
                {showSavingsGoalForm && <SavingsGoalForm onSubmit={handleAddOrEditSavingsGoal} onCancel={closeModal} existingGoal={editingSavingsGoal} />}
                {contributingToGoal && <ContributeToSavingsForm goal={contributingToGoal} onSubmit={handleContributeToSavings} onCancel={closeModal} />}
                {withdrawingFromGoal && <WithdrawFromSavingsForm goal={withdrawingFromGoal} onSubmit={handleWithdrawFromSavings} onCancel={closeModal} />}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <TransactionList title="Income" transactions={incomeTransactions} type={TransactionType.INCOME} onDelete={handleDeleteTransaction} onEdit={handleOpenEditTransactionForm} />
            <TransactionList title="Expenses" transactions={expenseTransactions} type={TransactionType.EXPENSE} onDelete={handleDeleteTransaction} onEdit={handleOpenEditTransactionForm} />
          </div>
           <div className="mt-4 sm:mt-6"><LiabilityList liabilities={liabilities} onDelete={handleDeleteLiability} onEdit={handleOpenEditLiabilityForm} onRecordPayment={handleOpenRecordPaymentForm}/></div>
           <div className="mt-4 sm:mt-6"><SavingsGoalList savingsGoals={savingsGoals} onDelete={handleDeleteSavingsGoal} onEdit={handleOpenEditSavingsGoalForm} onContribute={handleOpenContributeForm} onWithdraw={handleOpenWithdrawForm} /></div>
        </div>

        <section className="lg:col-span-1 h-full flex flex-col">
           <div className="bg-slate-800 rounded-xl shadow-2xl p-1 flex flex-col h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)] max-h-[60vh] sm:max-h-[700px] lg:max-h-[750px] border border-slate-700">
             <Chatbot messages={chatMessages} onSubmit={handleChatSubmit} isLoading={isChatLoading} />
           </div>
        </section>
      </main>
      <footer className="w-full max-w-7xl mt-6 sm:mt-8 py-3 sm:py-4 text-center text-gray-500 text-xs sm:text-sm">
        <p>&copy; {new Date().getFullYear()} Kaash. Track smarter, live better.</p>
      </footer>
    </div>
  );
};

export default App;
