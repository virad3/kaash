const fs = require('fs');

let content = fs.readFileSync('components/CreditCardsPage.tsx', 'utf8');

content = content.replace(
  /<button onClick=\{handleBack\}[\s\S]*?<\/button>/,
  '<PageNavigationDropdown currentView="creditCards" onNavigate={onNavigate} />'
);

fs.writeFileSync('components/CreditCardsPage.tsx', content);
