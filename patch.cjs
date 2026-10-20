const fs = require('fs');

function patchFile(file, viewId) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import \{ BackIcon, /g, 'import { ');
  content = content.replace(/import \{ BackIcon \} from '.\/icons';/g, '');
  content = content.replace(/onBack: \(\) => void;/g, 'onNavigate: (view: import("../types").View) => void;');
  content = content.replace(/onBack,/g, 'onNavigate,');
  
  // Need to replace the back button with the dropdown component
  // First, let's find the button block
  content = content.replace(
    /<button[\s\S]*?onClick=\{onNavigate\}[\s\S]*?<\/button>/,
    `<PageNavigationDropdown currentView="${viewId}" onNavigate={onNavigate} />`
  );
  
  // also add PageNavigationDropdown import if not present
  if (!content.includes('PageNavigationDropdown')) {
    content = content.replace(
      /import \{ FilterDropdown \} from '\.\/FilterDropdown';/,
      `import { FilterDropdown } from './FilterDropdown';\nimport { PageNavigationDropdown } from './PageNavigationDropdown';`
    );
  }
  
  // EarlyLoanClosurePage has no FilterDropdown, let's handle imports specially
  if (file === 'components/EarlyLoanClosurePage.tsx') {
    content = content.replace(
      /import \{ CoinsIcon, InfoIcon \} from '\.\/icons';/,
      `import { CoinsIcon, InfoIcon } from './icons';\nimport { PageNavigationDropdown } from './PageNavigationDropdown';`
    );
  } else if (file === 'components/CreditCardsPage.tsx') {
    content = content.replace(
      /import \{ PlusIcon, MagicIcon \} from '\.\/icons';/,
      `import { PlusIcon, MagicIcon } from './icons';\nimport { PageNavigationDropdown } from './PageNavigationDropdown';`
    );
  } else if (file === 'components/LiabilityEMIDetailPage.tsx') {
    content = content.replace(
      /import React, \{ useState, useMemo \} from 'react';/,
      `import React, { useState, useMemo } from 'react';\nimport { PageNavigationDropdown } from './PageNavigationDropdown';`
    );
  }
  
  fs.writeFileSync(file, content);
}

patchFile('components/IncomeDetailsPage.tsx', 'incomeDetails');
patchFile('components/ExpenseDetailsPage.tsx', 'expenseDetails');
patchFile('components/SavingsDetailsPage.tsx', 'savingsDetails');
patchFile('components/LiabilityDetailsPage.tsx', 'liabilityDetails');
patchFile('components/CreditCardsPage.tsx', 'creditCards');
patchFile('components/EarlyLoanClosurePage.tsx', 'earlyLoanClosure');
patchFile('components/LiabilityEMIDetailPage.tsx', 'liabilityEMIDetail');

