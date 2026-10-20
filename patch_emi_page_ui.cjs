const fs = require('fs');

let content = fs.readFileSync('components/LiabilityEMIDetailPage.tsx', 'utf8');

// Update imports
const importTarget = "import { PageNavigationDropdown } from './PageNavigationDropdown';";
const importReplacement = "import { PageNavigationDropdown } from './PageNavigationDropdown';\nimport { Landmark, Home, Car, GraduationCap, User, CreditCard, Briefcase, Stethoscope, Calendar, Percent, IndianRupee, PieChart, Activity, Info } from 'lucide-react';";
content = content.replace(importTarget, importReplacement);

// Add getCategoryIcon function inside component
const componentStartTarget = "  const outstandingPrincipal = liability.initialAmount - liability.amountRepaid;";
const componentStartReplacement = `  const outstandingPrincipal = liability.initialAmount - liability.amountRepaid;

  const getCategoryIcon = (category: string | undefined) => {
    switch (category) {
      case 'Mortgage/Home Loan': return <Home className="w-8 h-8 text-indigo-400" />;
      case 'Auto Loan': return <Car className="w-8 h-8 text-indigo-400" />;
      case 'Student Loan': return <GraduationCap className="w-8 h-8 text-indigo-400" />;
      case 'Personal Loan': return <User className="w-8 h-8 text-indigo-400" />;
      case 'Credit Card Debt': return <CreditCard className="w-8 h-8 text-indigo-400" />;
      case 'Medical Bill': return <Stethoscope className="w-8 h-8 text-indigo-400" />;
      case 'Business Loan': return <Briefcase className="w-8 h-8 text-indigo-400" />;
      case 'Tax Debt': return <Landmark className="w-8 h-8 text-indigo-400" />;
      default: return <Landmark className="w-8 h-8 text-indigo-400" />;
    }
  };

  const progressPercent = liability.initialAmount > 0 ? (liability.amountRepaid / liability.initialAmount) * 100 : 0;
`;
content = content.replace(componentStartTarget, componentStartReplacement);

// Replace Liability Summary Card
const summaryStart = "{/* Liability Summary Card */}";
const summaryEnd = "</div>\n            {/* EMI Transaction List */}";

const summaryRegex = new RegExp(summaryStart.replace(/[.*+?^$\/{}()|\\]/g, '\\$&') + '[\\s\\S]*?(?=' + "{/\\* EMI Transaction List \\*/}".replace(/[.*+?^$\/{}()|\\]/g, '\\$&') + ')');

const newSummary = `{/* Liability Summary Section */}
            <div className="bg-[#0b1021] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800/60 relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="bg-[#1c2340] p-4 rounded-2xl border border-slate-700/50 shadow-inner">
                            {getCategoryIcon(liability.category)}
                        </div>
                        <div>
                            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">{liability.category || 'LOAN'}</p>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">{liability.name || liability.category}</h2>
                        </div>
                    </div>
                    
                    <div className="bg-[#12182b] border border-slate-800 p-4 rounded-2xl text-center min-w-[160px]">
                        <p className="text-xs text-slate-400 mb-1">Outstanding Principal</p>
                        <p className="text-2xl font-bold text-slate-100 tracking-tight">₹{outstandingPrincipal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>

                {/* Progress */}
                <div className="mt-8 relative z-10">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-sm text-slate-400">Principal Repaid</p>
                            <p className="text-base font-semibold text-emerald-400">₹{liability.amountRepaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-400">Initial Amount</p>
                            <p className="text-base font-semibold text-slate-300">₹{liability.initialAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-800/80 overflow-hidden shadow-inner">
                        <div 
                            className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700 ease-out" 
                            style={{ width: \`\${Math.min(progressPercent, 100)}%\` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-500 text-right mt-2">{progressPercent.toFixed(1)}% repaid</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 relative z-10">
                    <div className="bg-[#12182b] border border-slate-800/80 p-4 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                            <Calendar className="w-4 h-4" />
                            <p className="text-xs font-medium">Next Due Date</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-200">
                            {new Date(liability.nextDueDate + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}
                        </p>
                    </div>
                    <div className="bg-[#12182b] border border-slate-800/80 p-4 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                            <IndianRupee className="w-4 h-4" />
                            <p className="text-xs font-medium">Upcoming EMI</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-200">
                            {liability.emiAmount ? \`₹\${liability.emiAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\` : 'N/A'}
                        </p>
                    </div>
                    <div className="bg-[#12182b] border border-slate-800/80 p-4 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                            <Percent className="w-4 h-4" />
                            <p className="text-xs font-medium">Interest Rate</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-200">
                            {liability.interestRate !== undefined ? \`\${liability.interestRate.toFixed(2)}% p.a.\` : 'N/A'}
                        </p>
                    </div>
                    <div className="bg-[#12182b] border border-slate-800/80 p-4 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                            <PieChart className="w-4 h-4" />
                            <p className="text-xs font-medium">Total Interest Paid</p>
                        </div>
                        <p className="text-sm font-semibold text-yellow-500">
                            ₹{totalInterestPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* Notes */}
                {liability.notes && (
                    <div className="mt-6 p-4 bg-[#12182b]/50 border border-slate-800/50 rounded-xl flex items-start gap-3 relative z-10">
                        <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-300 leading-relaxed">{liability.notes}</p>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-slate-800 relative z-10">
                    <button
                        onClick={() => onRecordPayment(liability)}
                        className="flex-1 min-w-[140px] text-emerald-400 hover:text-emerald-300 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors flex justify-center items-center gap-2 text-sm font-medium"
                        disabled={outstandingPrincipal <= 0}
                    >
                        <PaymentIcon className="h-5 w-5" /> Record Payment
                    </button>
                    <button
                        onClick={() => onUpdateRate(liability)}
                        className="flex-1 min-w-[140px] text-blue-400 hover:text-blue-300 px-4 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors flex justify-center items-center gap-2 text-sm font-medium"
                        disabled={outstandingPrincipal <= 0}
                    >
                        <Activity className="h-5 w-5" /> Update Rate
                    </button>
                    <button
                        onClick={() => onEditLiability(liability)}
                        className="flex-1 min-w-[140px] text-yellow-400 hover:text-yellow-300 px-4 py-2.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors flex justify-center items-center gap-2 text-sm font-medium"
                    >
                        <EditIcon className="h-5 w-5" /> Edit Liability
                    </button>
                    <button
                        onClick={() => {
                            onNavigate('liabilityDetails');
                            onDeleteLiability(liability.id);
                        }}
                        className="flex-1 min-w-[140px] text-red-400 hover:text-red-300 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors flex justify-center items-center gap-2 text-sm font-medium"
                    >
                        <TrashIcon className="h-5 w-5" /> Delete
                    </button>
                </div>
            </div>
            
            `;

content = content.replace(summaryRegex, newSummary);

fs.writeFileSync('components/LiabilityEMIDetailPage.tsx', content);
console.log('LiabilityEMIDetailPage UI updated.');
