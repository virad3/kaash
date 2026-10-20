const fs = require('fs');

function replaceHeaderButton(filename, transactionTypeOrAction, titleText) {
  let content = fs.readFileSync(filename, 'utf8');
  content = content.replace(
    /<div className="flex-none w-10 sm:w-\[70px\]">\s*<\/div>/,
    `<div className="flex-none flex items-center">
                  <button
                    onClick={() => ${transactionTypeOrAction}}
                    className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-600 text-sky-400 hover:text-sky-300 px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    title="${titleText}"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm font-medium">Add</span>
                  </button>
              </div>`
  );
  fs.writeFileSync(filename, content);
}

replaceHeaderButton('components/IncomeDetailsPage.tsx', 'onOpenNewTransactionForm(TransactionType.INCOME)', 'Add Income');
replaceHeaderButton('components/SavingsDetailsPage.tsx', 'onOpenNewTransactionForm(TransactionType.SAVING)', 'Add Savings');
replaceHeaderButton('components/LiabilityDetailsPage.tsx', 'onOpenNewLiabilityForm()', 'Add Liability');

