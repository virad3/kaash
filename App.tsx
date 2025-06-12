
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Transaction, TransactionType, ChatMessage, Liability } from './types'; 
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { SummaryDisplay } from './components/SummaryDisplay';
import { Chatbot } from './components/Chatbot';
import { LiabilityForm } from './components/LiabilityForm';
import { LiabilityList } from './components/LiabilityList';
import { RecordLiabilityPaymentForm } from './components/RecordLiabilityPaymentForm';
import { AuthPage } from './components/AuthPage';
import * as storageService from './services/storageService';
import * as authService from './services/authService';
import { askKaash } from './services/geminiService';
import { KaashLogoIcon, PlusIcon, BellIcon, PiggyBankIcon, UserIcon, LogoutIcon, BotIcon, PaymentIcon } from './components/icons';
import { ExpenseCategory } from './types'; 
import { calculateLoanPaymentDetails } from './utils'; // Import the new utility

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  
  const [showTransactionModal, setShowTransactionModal] = useState<boolean>(false);
  const [currentTransactionType, setCurrentTransactionType] = useState<TransactionType | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const [showLiabilityForm, setShowLiabilityForm] = useState<boolean>(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);
  const [payingLiability, setPayingLiability] = useState<Liability | null>(null);

  const [upcomingPayments, setUpcomingPayments] = useState<Liability[]>([]);
  const [showChatbotOverlay, setShowChatbotOverlay] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribeAuth = authService.onAuthUserChanged((user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false);
      if (user) {
        setChatMessages([{ id: Date.now().toString(), text: `Hello ${user.name || user.email}! I'm Kaash, your financial assistant. How can I help?`, sender: 'bot', timestamp: new Date() }]);
        window.scrollTo(0, 0); 
      } else {
        setTransactions([]);
        setLiabilities([]);
        setChatMessages([]);
        setShowChatbotOverlay(false); // Close chatbot if user logs out
      }
    });
    return () => unsubscribeAuth();
  }, []);
  
  useEffect(() => {
    let unsubTransactions = () => {};
    let unsubLiabilities = () => {};

    if (currentUser?.uid) {
      unsubTransactions = storageService.subscribeToTransactions(currentUser.uid, setTransactions);
      unsubLiabilities = storageService.subscribeToLiabilities(currentUser.uid, setLiabilities);
    }
    return () => {
      unsubTransactions();
      unsubLiabilities();
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

    const payload: Omit<Transaction, 'id' | 'createdAt' | 'userId' | 'relatedLiabilityId'> | Partial<Omit<Transaction, 'id' | 'createdAt' | 'userId' | 'relatedLiabilityId'>> = {
      type: transactionDetailsFromForm.type,
      description: transactionDetailsFromForm.description?.trim() || undefined, 
      amount: transactionDetailsFromForm.amount,
      date: transactionDetailsFromForm.date,
      category: transactionDetailsFromForm.category, 
    };

    const operationDescription = id ? 'update' : 'add';
    console.log(`Attempting to ${operationDescription} transaction (User: ${currentUser.uid}, ID: ${id || 'new'}) with payload:`, JSON.parse(JSON.stringify(payload)));

    try {
      if (id) { 
        await storageService.updateTransaction(currentUser.uid, id, payload as Partial<Omit<Transaction, 'id' | 'createdAt' | 'userId'>>);
      } else { 
        await storageService.addTransaction(currentUser.uid, payload as Omit<Transaction, 'id' | 'createdAt' | 'userId'>);
      }
      console.log(`Transaction ${id ? `updated (ID: ${id})` : 'added'} successfully for user ${currentUser.uid}.`);
      closeModal();
    } catch (error: any) { 
      console.error(`Error ${operationDescription} transaction (User: ${currentUser.uid}, ID: ${id || 'new'}):`, error);
      const operationType = id ? "updating" : "adding new";
      const transactionIdInfo = id ? `ID: ${id}` : "new transaction";
      const dataAttempted = JSON.stringify(payload);
      alert(`Failed to save transaction.
Error: ${error.message || 'Unknown error'}.
Details: Failed ${operationType} transaction (${transactionIdInfo}).
Data Attempted: ${dataAttempted}.
Please check the console for more information.`);
    }
  }, [currentUser]);

  const handleDeleteTransaction = useCallback(async (id: string) => {
    if (!currentUser?.uid) return;
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try { await storageService.deleteTransaction(currentUser.uid, id); } 
      catch (error) { console.error("Error deleting transaction:", error); alert("Failed to delete transaction."); }
    }
  }, [currentUser]);

  const handleAddOrEditLiability = useCallback(async (data: Omit<Liability, 'id' | 'createdAt' | 'userId' | 'amountRepaid' | 'name' | 'notes'> & { id?: string; name?: string; category: string; amountRepaid?: number; loanTermInMonths?: number; }) => {
    if (!currentUser?.uid) return;
    const { id, ...liabilityDetails } = data;
    const payload = {
        name: liabilityDetails.name?.trim() || undefined, 
        category: liabilityDetails.category, 
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
    if (!liability) {
      alert("Liability not found. Cannot record payment.");
      return;
    }
    if (typeof liability.interestRate !== 'number') {
        alert("Interest rate is not set for this liability. Cannot accurately calculate principal and interest. Payment will reduce total owed directly.");
        // Fallback to simpler reduction if interest rate is missing
        const updatedLiabilitySimpleData = { 
            amountRepaid: Math.min(liability.amountRepaid + paymentAmount, liability.initialAmount), 
            nextDueDate: newNextDueDate 
        };
        try {
            await storageService.updateLiability(currentUser.uid, liabilityId, updatedLiabilitySimpleData);
        } catch (error) {
            console.error("Error updating liability (simple):", error);
            alert("Failed to update liability details.");
            return;
        }
    } else {
        const outstandingPrincipal = liability.initialAmount - liability.amountRepaid;
        if (outstandingPrincipal <= 0) {
            alert("This liability seems to be fully paid. No further payment recorded as principal reduction.");
            // Optionally, still record an expense if needed, or prevent further action.
            // For now, we will prevent updating liability's amountRepaid but still record expense.
        }

        const { interestPaid, principalPaid } = calculateLoanPaymentDetails(
            outstandingPrincipal,
            liability.interestRate, // Annual interest rate
            paymentAmount
        );
        
        let newAmountRepaid = liability.amountRepaid + principalPaid;
        // Ensure amountRepaid does not exceed initialAmount
        newAmountRepaid = Math.min(newAmountRepaid, liability.initialAmount);

        const updatedLiabilityData = { 
            amountRepaid: newAmountRepaid, 
            nextDueDate: newNextDueDate 
        };

        try {
            if (outstandingPrincipal > 0) { // Only update if there's principal to pay
              await storageService.updateLiability(currentUser.uid, liabilityId, updatedLiabilityData);
            }
        } catch (error) {
            console.error("Error updating liability (with interest calc):", error);
            alert("Failed to update liability details after interest calculation.");
            return; // Stop if liability update fails
        }
    }
    
    // Always record the expense transaction for the full payment amount
    try {
        const expenseDescription = expenseNotes || `Payment for ${liability.name || liability.category}`;
        const expenseTxData: Omit<Transaction, 'id' | 'createdAt' | 'userId'> = { 
            type: TransactionType.EXPENSE,
            description: expenseDescription,
            amount: paymentAmount, date: paymentDate,
            category: ExpenseCategory.LIABILITY_PAYMENT, 
            relatedLiabilityId: liabilityId,
        };
        await storageService.addTransaction(currentUser.uid, expenseTxData);
        setPayingLiability(null); // Close the payment form
    } catch (error) { 
        console.error("Error recording expense transaction for liability payment:", error); 
        alert("Failed to record expense transaction for the payment. Liability details might have been updated."); 
    }
  }, [liabilities, currentUser]);


  const handleChatSubmit = useCallback(async (userMessage: string) => {
    if (!currentUser?.uid) return;
    const newMessage: ChatMessage = { id: Date.now().toString(), text: userMessage, sender: 'user', timestamp: new Date() };
    setChatMessages(prev => [...prev, newMessage]);
    setIsChatLoading(true);
    try {
      const botResponseText = await askKaash(userMessage, transactions, liabilities); 
      setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: botResponseText, sender: 'bot', timestamp: new Date() }]);
    } catch (error) {
      console.error("Error getting response from Kaash:", error);
      setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: "Sorry, I encountered an error.", sender: 'bot', timestamp: new Date() }]);
    } finally { setIsChatLoading(false); }
  }, [transactions, liabilities, currentUser]); 

  const incomeTransactions = useMemo(() => transactions.filter(t => t.type === TransactionType.INCOME), [transactions]);
  const expenseTransactions = useMemo(() => transactions.filter(t => t.type === TransactionType.EXPENSE), [transactions]);
  const savingTransactions = useMemo(() => transactions.filter(t => t.type === TransactionType.SAVING), [transactions]);
  
  const totalIncome = useMemo(() => incomeTransactions.reduce((sum, t) => sum + t.amount, 0), [incomeTransactions]);
  const totalExpenses = useMemo(() => expenseTransactions.reduce((sum, t) => sum + t.amount, 0), [expenseTransactions]);
  const totalSavings = useMemo(() => savingTransactions.reduce((sum, t) => sum + t.amount, 0), [savingTransactions]);
  const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]); 
  
  const closeModal = () => {
    setShowTransactionModal(false); setCurrentTransactionType(null); setEditingTransaction(null);
    setShowLiabilityForm(false); setEditingLiability(null); setPayingLiability(null);
  };
  
  const handleOpenNewLiabilityForm = () => { setEditingLiability(null); setShowLiabilityForm(true); };
  const handleOpenEditLiabilityForm = (liability: Liability) => { setEditingLiability(liability); setShowLiabilityForm(true); };
  const handleOpenRecordPaymentForm = (liability: Liability) => setPayingLiability(liability);
  
  // Removed handleOpenAddEmiForm as the button is being removed.


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
                {p.name || p.category} - ₹{p.emiAmount ? p.emiAmount.toFixed(2) : (p.initialAmount - p.amountRepaid).toFixed(2)} due on {new Date(p.nextDueDate + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
              </li>
            ))}
          </ul>
        </div>
      )}

      <main className="w-full max-w-7xl">
        <div className="space-y-4 sm:space-y-6"> 
          <SummaryDisplay 
            totalIncome={totalIncome} 
            totalExpenses={totalExpenses} 
            balance={balance} 
            expenseTransactions={expenseTransactions}
            liabilities={liabilities}
            totalSavings={totalSavings} 
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6"> {/* Adjusted to lg:grid-cols-4 */}
            <button onClick={() => handleOpenNewTransactionForm(TransactionType.INCOME)} className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 w-full text-sm sm:text-base">
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" /> Add Income
            </button>
            <button onClick={() => handleOpenNewTransactionForm(TransactionType.EXPENSE)} className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 w-full text-sm sm:text-base">
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" /> Add Expense
            </button>
             <button onClick={() => handleOpenNewTransactionForm(TransactionType.SAVING)} className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 w-full text-sm sm:text-base">
              <PiggyBankIcon className="h-4 w-4 sm:h-5 sm:w-5" /> Add Saving
            </button>
            <button onClick={handleOpenNewLiabilityForm} className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 w-full text-sm sm:text-base">
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" /> Add Liability
            </button>
            {/* "Add EMI" button removed from here */}
          </div>

          {(showTransactionModal || showLiabilityForm || payingLiability) && ( 
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm">
              <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-md relative border border-slate-700 overflow-y-auto max-h-[90vh]">
                <button onClick={closeModal} className="absolute top-2 sm:top-3 right-2 sm:right-3 text-gray-400 hover:text-gray-200 transition-colors z-10" aria-label="Close form">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-7 sm:h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                {showTransactionModal && currentTransactionType && <TransactionForm type={currentTransactionType} onSubmit={handleAddOrEditTransaction} onCancel={closeModal} existingTransaction={editingTransaction} />}
                {showLiabilityForm && <LiabilityForm onSubmit={handleAddOrEditLiability} onCancel={closeModal} existingLiability={editingLiability}/>}
                {payingLiability && <RecordLiabilityPaymentForm liability={payingLiability} onSubmit={(paymentAmount, paymentDate, newNextDueDate, notes) => handleRecordLiabilityPayment(payingLiability.id, paymentAmount, paymentDate, newNextDueDate, notes)} onCancel={closeModal}/>}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <TransactionList title="Income" transactions={incomeTransactions} type={TransactionType.INCOME} onDelete={handleDeleteTransaction} onEdit={handleOpenEditTransactionForm} />
            <TransactionList title="Expenses" transactions={expenseTransactions} type={TransactionType.EXPENSE} onDelete={handleDeleteTransaction} onEdit={handleOpenEditTransactionForm} />
          </div>
          <div className="mt-4 sm:mt-6"><TransactionList title="Savings" transactions={savingTransactions} type={TransactionType.SAVING} onDelete={handleDeleteTransaction} onEdit={handleOpenEditTransactionForm} /></div>
          <div className="mt-4 sm:mt-6"><LiabilityList liabilities={liabilities} onDelete={handleDeleteLiability} onEdit={handleOpenEditLiabilityForm} onRecordPayment={handleOpenRecordPaymentForm}/></div>
        </div>
      </main>

      {currentUser && (
        <>
          <button
            onClick={() => setShowChatbotOverlay(true)}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-sky-500 hover:bg-sky-600 text-white p-3 sm:p-4 rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 z-40"
            title="Open Kaash AI Assistant"
            aria-label="Open Kaash AI Assistant"
          >
            <BotIcon className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>

          {showChatbotOverlay && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-end justify-end p-0 sm:p-4 z-50"
              onClick={() => setShowChatbotOverlay(false)}
            >
              <div 
                className="bg-slate-800 rounded-t-xl sm:rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md h-[75vh] sm:h-[calc(100vh-8rem)] max-h-[650px] sm:max-h-[700px] border border-slate-700 flex flex-col"
                onClick={(e) => e.stopPropagation()} 
              >
                <Chatbot 
                  messages={chatMessages} 
                  onSubmit={handleChatSubmit} 
                  isLoading={isChatLoading} 
                  onClose={() => setShowChatbotOverlay(false)} 
                />
              </div>
            </div>
          )}
        </>
      )}

      <footer className="w-full max-w-7xl mt-6 sm:mt-8 py-3 sm:py-4 text-center text-gray-500 text-xs sm:text-sm">
        <p>&copy; {new Date().getFullYear()} Kaash. Track smarter, live better.</p>
      </footer>
    </div>
  );
};

export default App;
