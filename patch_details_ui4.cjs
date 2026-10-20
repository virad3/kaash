const fs = require('fs');

let content = fs.readFileSync('components/LiabilityDetailsPage.tsx', 'utf8');

// Ensure LiabilityItem is imported
if (!content.includes("import { LiabilityItem }")) {
    content = content.replace("import { LiabilityList } from './LiabilityList';", "import { LiabilityItem } from './LiabilityItem';\nimport { LiabilityList } from './LiabilityList';");
}

// Replace the main layout rendering
const startLayout = `<div className="mt-6 p-3 sm:p-4 lg:p-6 space-y-6">`;
const endLayout = `          </div>
        </div>`;
const layoutRegex = new RegExp(startLayout.replace(/[.*+?^$\/{}()|\\]/g, '\\$&') + '[\\s\\S]*?' + endLayout.replace(/[.*+?^$\/{}()|\\]/g, '\\$&'));

const newLayout = `<div className="mt-6 p-3 sm:p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
          {/* New Liability Summary Card */}
          {liabilities.length === 0 ? (
              <div className="text-center py-16 bg-[#0d1323] rounded-3xl border border-slate-800/80 shadow-2xl">
                  <p className="text-xl text-slate-400">No liabilities recorded yet.</p>
                  <p className="text-slate-500 mt-2 mb-6">Click "Add" in the header to get started.</p>
                  <button
                      onClick={() => onOpenNewLiabilityForm()}
                      className="inline-flex items-center space-x-2 bg-[#1c2340] hover:bg-slate-700 text-sky-400 px-6 py-3 rounded-xl transition-colors font-medium border border-slate-700/50"
                  >
                      <PlusIcon className="w-5 h-5" />
                      <span>Add Liability</span>
                  </button>
              </div>
          ) : (
            (() => {
              const categoryMapping: Record<string, string> = {
                'Auto Loan': 'Loans',
                'Student Loan': 'Loans',
                'Personal Loan': 'Loans',
                'Business Loan': 'Loans',
                'Credit Card Debt': 'Credit Cards',
                'Mortgage/Home Loan': 'EMIs',
                'Medical Bill': 'Other',
                'Tax Debt': 'Other',
                'Other Liability': 'Other',
              };

              const groups = {
                'Loans': { amount: 0, color: 'bg-[#8370f8]', dotColor: 'bg-[#8370f8]', iconBg: 'bg-[#2c2b5d]', iconColor: 'text-[#cdc5ff]', Icon: Landmark },
                'Credit Cards': { amount: 0, color: 'bg-[#2fa861]', dotColor: 'bg-[#2fa861]', iconBg: 'bg-[#193a2e]', iconColor: 'text-[#ccf7de]', Icon: CreditCard },
                'EMIs': { amount: 0, color: 'bg-[#dc8734]', dotColor: 'bg-[#dc8734]', iconBg: 'bg-[#422c22]', iconColor: 'text-[#ffe2cc]', Icon: Home },
                'Other': { amount: 0, color: 'bg-[#e54d58]', dotColor: 'bg-[#e54d58]', iconBg: 'bg-[#452129]', iconColor: 'text-[#ffd6d9]', Icon: MoreHorizontal },
              };

              filteredLiabilities.forEach(l => {
                const groupName = categoryMapping[l.category] || 'Other';
                const outstanding = l.initialAmount - l.amountRepaid;
                if (outstanding > 0) {
                  groups[groupName as keyof typeof groups].amount += outstanding;
                }
              });

              const total = summaryFigures.totalOutstanding;
              const sortedLiabilities = [...filteredLiabilities].sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());

              return (
                <div className="bg-[#0d1323] rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-800/80 shadow-2xl">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <PieChart className="w-8 h-8 text-[#609afa] fill-[#609afa]" />
                      <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Liability Summary</h2>
                    </div>
                    
                    {/* Category Filter embedded in Header */}
                    <div className="w-40 sm:w-48">
                        <FilterDropdown
                            label=""
                            allLabel="All Categories"
                            selectedValue={selectedCategory}
                            onSelect={setSelectedCategory}
                            options={uniqueCategories.map(category => ({
                                value: category,
                                label: category
                            }))}
                        />
                    </div>
                  </div>

                  {/* Main Metric */}
                  <div className="mb-10">
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-100 tracking-tight mb-2">
                      ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h1>
                    <p className="text-slate-400 text-lg">Total Liabilities</p>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                    {Object.entries(groups).map(([name, data]) => {
                      const percentage = total > 0 ? (data.amount / total) * 100 : 0;
                      return (
                        <div key={name} className="bg-[#12182b] border border-slate-700/50 p-5 rounded-3xl flex flex-col justify-between h-44 shadow-inner hover:bg-[#161d33] transition-colors">
                          <div className={\`w-14 h-14 rounded-2xl \${data.iconBg} flex items-center justify-center mb-4\`}>
                            <data.Icon className={\`w-7 h-7 \${data.iconColor}\`} />
                          </div>
                          <div>
                            <p className="text-slate-400 text-sm mb-1">{name}</p>
                            <p className="text-slate-100 font-bold text-xl leading-tight mb-1 truncate">
                               ₹{data.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-slate-500 text-sm font-medium">{percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress Bar */}
                  <div className="flex h-6 rounded-full overflow-hidden mb-8 bg-[#1a233a] gap-[2px]">
                    {Object.entries(groups).map(([name, data]) => {
                      const percentage = total > 0 ? (data.amount / total) * 100 : 0;
                      if (percentage === 0) return null;
                      return (
                        <div 
                          key={name}
                          className={\`h-full \${data.color}\`}
                          style={{ width: \`\${percentage}%\` }}
                          title={\`\${name}: \${percentage.toFixed(1)}%\`}
                        />
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2 mb-12">
                    {Object.entries(groups).map(([name, data]) => (
                      <div key={name} className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className={\`w-3.5 h-3.5 rounded-full \${data.dotColor}\`} />
                          <span className="text-slate-300 text-sm font-medium">{name}</span>
                        </div>
                        <span className="text-slate-400 text-sm pl-5.5 font-mono">
                          ₹{data.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Embedded Liabilities List */}
                  <div className="pt-10 border-t border-slate-800/80">
                     <h3 className="text-xl sm:text-2xl font-bold text-slate-100 mb-6 tracking-tight">Active Liabilities</h3>
                     {sortedLiabilities.length === 0 ? (
                        <p className="text-slate-500 bg-[#0b1021] p-6 rounded-2xl border border-slate-800 text-center">No liabilities match the selected filter.</p>
                     ) : (
                        <ul className="space-y-4">
                          {sortedLiabilities.map(liability => (
                            <LiabilityItem 
                                key={liability.id} 
                                liability={liability} 
                                allTransactions={allTransactions}
                                onViewEMIs={onViewEMIs} 
                            />
                          ))}
                        </ul>
                     )}
                  </div>
                </div>
              );
            })()
          )}
        </div>`;

content = content.replace(layoutRegex, newLayout);

fs.writeFileSync('components/LiabilityDetailsPage.tsx', content);
console.log('UI updated with embedded list.');
