const fs = require('fs');

let content = fs.readFileSync('components/LiabilityItem.tsx', 'utf8');

content = content.replace(
  "case 'Mortgage/Home Loan': return {getCategoryIcon(category)};",
  "case 'Mortgage/Home Loan': return <Home className=\"w-6 h-6 text-indigo-400\" />;"
);

fs.writeFileSync('components/LiabilityItem.tsx', content);
console.log('LiabilityItem switch fixed.');
