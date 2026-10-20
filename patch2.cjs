const fs = require('fs');

function patchFile(file, viewId) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Also clean up any lingering BackIcon imports
  content = content.replace(/BackIcon,?\s*/g, '');
  
  // First, find and replace the button block using aria-label="Back..." or BackIcon
  content = content.replace(
    /<button[^>]*onClick=\{o[a-zA-Z]+\}[^>]*>[\s\S]*?<span[^>]*>Back<\/span>\s*<\/button>/,
    `<PageNavigationDropdown currentView="${viewId}" onNavigate={onNavigate} />`
  );
  
  // also, in components/LiabilityEMIDetailPage.tsx there's an aria-label="Back" without span text maybe?
  // Let's just do a more generic replacement if it fails:
  content = content.replace(
    /<button[^>]*onClick=\{onBack\}[^>]*>[\s\S]*?<\/button>/g,
    `<PageNavigationDropdown currentView="${viewId}" onNavigate={onNavigate} />`
  );
  
  content = content.replace(/onClick=\{onBack\}/g, 'onClick={() => onNavigate("dashboard")}'); // fallback
  
  fs.writeFileSync(file, content);
}

patchFile('components/IncomeDetailsPage.tsx', 'incomeDetails');
patchFile('components/ExpenseDetailsPage.tsx', 'expenseDetails');
patchFile('components/SavingsDetailsPage.tsx', 'savingsDetails');
patchFile('components/LiabilityDetailsPage.tsx', 'liabilityDetails');
patchFile('components/CreditCardsPage.tsx', 'creditCards');
patchFile('components/EarlyLoanClosurePage.tsx', 'earlyLoanClosure');
patchFile('components/LiabilityEMIDetailPage.tsx', 'liabilityEMIDetail');
