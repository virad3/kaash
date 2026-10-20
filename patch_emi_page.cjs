const fs = require('fs');

let content = fs.readFileSync('components/LiabilityEMIDetailPage.tsx', 'utf8');

// 1. Imports
content = content.replace(
  "import { TransactionItem } from './TransactionItem';",
  "import { TransactionItem } from './TransactionItem';\nimport { TrashIcon, EditIcon, PaymentIcon } from './icons';"
);

// 2. Props Interface
const propsInterface = `interface LiabilityEMIDetailPageProps {
  liability: Liability | undefined;
  allTransactions: Transaction[];
  onNavigate: (view: import("../types").View) => void;
  onEditEMI: (transaction: Transaction) => void; 
  onDeleteEMI: (transactionId: string, relatedLiabilityId: string, emiAmount: number) => void;
  onRecordPayment: (liability: Liability) => void;
  onUpdateRate: (liability: Liability) => void;
  onEditLiability: (liability: Liability) => void;
  onDeleteLiability: (id: string) => void;
}`;

content = content.replace(
  /interface LiabilityEMIDetailPageProps \{[^}]+\}/,
  propsInterface
);

// 3. Component signature
content = content.replace(
  "  onDeleteEMI,\n}) => {",
  "  onDeleteEMI,\n  onRecordPayment,\n  onUpdateRate,\n  onEditLiability,\n  onDeleteLiability,\n}) => {"
);

// 4. Add action buttons to Liability Summary card
const liabilitySummaryCardTarget = `{liability.interestRate !== undefined && <p><span className="text-gray-400">Interest Rate:</span> <span className="text-gray-300">{liability.interestRate.toFixed(2)}%</span></p>}
            </div>
            {liability.notes && <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-slate-700">Notes: {liability.notes}</p>}
            </div>`;

const actionsButtonsHtml = `{liability.interestRate !== undefined && <p><span className="text-gray-400">Interest Rate:</span> <span className="text-gray-300">{liability.interestRate.toFixed(2)}%</span></p>}
            </div>
            {liability.notes && <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-slate-700">Notes: {liability.notes}</p>}
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-700">
                <button
                  onClick={() => onRecordPayment(liability)}
                  className="flex-1 min-w-[140px] text-emerald-400 hover:text-emerald-300 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors flex justify-center items-center gap-2 text-sm font-medium"
                  disabled={outstandingPrincipal <= 0}
                >
                  <PaymentIcon className="h-5 w-5" /> Record Payment
                </button>
                <button
                  onClick={() => onUpdateRate(liability)}
                  className="flex-1 min-w-[140px] text-blue-400 hover:text-blue-300 px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors flex justify-center items-center gap-2 text-sm font-medium"
                  disabled={outstandingPrincipal <= 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  Update Rate
                </button>
                <button
                  onClick={() => onEditLiability(liability)}
                  className="flex-1 min-w-[140px] text-yellow-400 hover:text-yellow-300 px-4 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors flex justify-center items-center gap-2 text-sm font-medium"
                >
                  <EditIcon className="h-5 w-5" /> Edit Liability
                </button>
                <button
                  onClick={() => {
                    onNavigate('liabilityDetails');
                    onDeleteLiability(liability.id);
                  }}
                  className="flex-1 min-w-[140px] text-red-400 hover:text-red-300 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors flex justify-center items-center gap-2 text-sm font-medium"
                >
                  <TrashIcon className="h-5 w-5" /> Delete
                </button>
            </div>
            </div>`;

content = content.replace(liabilitySummaryCardTarget, actionsButtonsHtml);

fs.writeFileSync('components/LiabilityEMIDetailPage.tsx', content);
console.log('LiabilityEMIDetailPage patched.');
