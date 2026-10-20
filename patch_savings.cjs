const fs = require('fs');
let content = fs.readFileSync('components/SavingsDetailsPage.tsx', 'utf8');

const regex = /<button\s*onClick=\{\(\) => onOpenNewTransactionForm\(TransactionType\.SAVING\)\}\s*className="w-full px-6 py-2\.5 bg-teal-500 [^>]+>\s*<PlusIcon className="h-5 w-5" \/> Add Saving\s*<\/button>/;

if(regex.test(content)) {
  content = content.replace(regex, '');
  fs.writeFileSync('components/SavingsDetailsPage.tsx', content);
  console.log('patched');
} else {
  console.log('not found');
}
