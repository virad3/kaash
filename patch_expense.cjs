const fs = require('fs');
let content = fs.readFileSync('components/ExpenseDetailsPage.tsx', 'utf8');

const regex = /<div className="space-y-3">\s*<button\s*onClick=\{\(\) => onOpenNewTransactionForm\(TransactionType\.EXPENSE\)\}\s*className="w-full px-6 py-2\.5 bg-red-500 [^>]+>\s*<PlusIcon className="h-5 w-5" \/> Add Expense\s*<\/button>\s*<\/div>/;

if(regex.test(content)) {
  content = content.replace(regex, '');
  fs.writeFileSync('components/ExpenseDetailsPage.tsx', content);
  console.log('patched');
} else {
  console.log('not found');
}
