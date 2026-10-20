const fs = require('fs');

let content = fs.readFileSync('components/IncomeDetailsPage.tsx', 'utf8');

// The line is: <div className="flex-none w-10 sm:w-[70px]"> 
// Let's replace it.

content = content.replace(
  /<div className="flex-none w-10 sm:w-\[70px\]">\s*<\/div>/,
  `<div className="flex-none flex items-center">
                  <button
                    onClick={() => onOpenNewTransactionForm(TransactionType.INCOME)}
                    className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-600 text-sky-400 hover:text-sky-300 px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    title="Add Income"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm font-medium">Add</span>
                  </button>
              </div>`
);

fs.writeFileSync('components/IncomeDetailsPage.tsx', content);
