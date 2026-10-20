const fs = require('fs');

const content = fs.readFileSync('components/LiabilityItem.tsx', 'utf8');

// Replace imports
let newContent = content.replace(
  "import { Landmark, ArrowRight, Home } from 'lucide-react';",
  "import { Landmark, ArrowRight, Home, Car, GraduationCap, User, CreditCard, Briefcase, Stethoscope } from 'lucide-react';"
);

// Add getCategoryIcon function inside LiabilityItem
const funcStr = `
  const getCategoryIcon = (category: string | undefined) => {
    switch (category) {
      case 'Mortgage/Home Loan': return <Home className="w-6 h-6 text-indigo-400" />;
      case 'Auto Loan': return <Car className="w-6 h-6 text-indigo-400" />;
      case 'Student Loan': return <GraduationCap className="w-6 h-6 text-indigo-400" />;
      case 'Personal Loan': return <User className="w-6 h-6 text-indigo-400" />;
      case 'Credit Card Debt': return <CreditCard className="w-6 h-6 text-indigo-400" />;
      case 'Medical Bill': return <Stethoscope className="w-6 h-6 text-indigo-400" />;
      case 'Business Loan': return <Briefcase className="w-6 h-6 text-indigo-400" />;
      case 'Tax Debt': return <Landmark className="w-6 h-6 text-indigo-400" />;
      default: return <Landmark className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (
`;

newContent = newContent.replace('  return (', funcStr);

// Replace the hardcoded <Home>
newContent = newContent.replace(
  '<Home className="w-6 h-6 text-indigo-400" />',
  '{getCategoryIcon(category)}'
);

// Remove the footer
const footerStart = '{/* Action buttons footer */}';
const footerEnd = '</li>';

const footerRegex = new RegExp(footerStart.replace(/[.*+?^$\/{}()|\\]/g, '\\$&') + '[\\s\\S]*?(?=</li>)');
newContent = newContent.replace(footerRegex, '');

fs.writeFileSync('components/LiabilityItem.tsx', newContent);
console.log('LiabilityItem patched.');
