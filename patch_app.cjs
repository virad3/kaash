const fs = require('fs');

let content = fs.readFileSync('App.tsx', 'utf8');
const lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes('const navigateToDashboard = useCallback'));
const endIdx = lines.findIndex(l => l.includes('const navigateToCreditCards = useCallback'));

if (startIdx !== -1 && endIdx !== -1) {
  const newBlock = `  const handleNavigate = useCallback((view: View) => {
    setActiveView(view);
    setIsNotificationDropdownOpen(false);
    closeModal();
    if (view !== 'liabilityEMIDetail') {
      setSelectedLiabilityForEMIs(null);
    }
  }, [closeModal]);
  
  const navigateToDashboard = () => handleNavigate('dashboard');
  const navigateToLiabilityDetails = () => handleNavigate('liabilityDetails');
  const navigateToLiabilityEMIDetail = (liability: Liability) => { setSelectedLiabilityForEMIs(liability); handleNavigate('liabilityEMIDetail'); };
  const navigateToIncomeDetails = () => handleNavigate('incomeDetails');
  const navigateToExpenseDetails = () => handleNavigate('expenseDetails');
  const navigateToSavingsDetails = () => handleNavigate('savingsDetails');
  const navigateToEarlyLoanClosure = () => handleNavigate('earlyLoanClosure');
  const navigateToCreditCards = () => handleNavigate('creditCards');`;

  lines.splice(startIdx, endIdx - startIdx + 1, newBlock);
}

content = lines.join('\n');
content = content.replace(/onNavigate=\{setActiveView\}/g, 'onNavigate={handleNavigate}');

fs.writeFileSync('App.tsx', content);
