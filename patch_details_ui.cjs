const fs = require('fs');

let content = fs.readFileSync('components/LiabilityDetailsPage.tsx', 'utf8');

// 1. Add imports
const importTarget = "import { PageNavigationDropdown } from './PageNavigationDropdown';";
const importReplacement = `import { PageNavigationDropdown } from './PageNavigationDropdown';
import { PieChart, Landmark, CreditCard, Home, MoreHorizontal, ChevronDown } from 'lucide-react';`;
content = content.replace(importTarget, importReplacement);

// 2. Replace the layout
const layoutTargetStart = `<div className="mt-6 p-3 sm:p-4 lg:p-6 space-y-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:space-y-0">`;
const layoutTargetEnd = `          </div>
        </div>`;
const layoutRegex = new RegExp(layoutTargetStart.replace(/[.*+?^$\/{}()|\\]/g, '\\$&') + '[\\s\\S]*?' + layoutTargetEnd.replace(/[.*+?^$\/{}()|\\]/g, '\\$&'));

const newLayout = `
        <div className="mt-6 p-3 sm:p-4 lg:p-6 space-y-6">
          {/* New Liability Summary Card */}
          {liabilities.length > 0 && (
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
                'Loans': { amount: 0, color: 'bg-[#8473fb]', dotColor: 'bg-[#8473fb]', icon: <Landmark className="w-6 h-6 text-[#9a8dfb]" /> },
                'Credit Cards': { amount: 0, color: 'bg-[#21a25d]', dotColor: 'bg-[#21a25d]', icon: <CreditCard className="w-6 h-6 text-[#4ade80]" /> },
                'EMIs': { amount: 0, color: 'bg-[#dc8634]', dotColor: 'bg-[#dc8634]', icon: <Home className="w-6 h-6 text-[#fdb374]" /> },
                'Other': { amount: 0, color: 'bg-[#e24c55]', dotColor: 'bg-[#e24c55]', icon: <MoreHorizontal className="w-6 h-6 text-[#fc8289]" /> },
              };

              filteredLiabilities.forEach(l => {
                const groupName = categoryMapping[l.category] || 'Other';
                const outstanding = l.initialAmount - l.amountRepaid;
                if (outstanding > 0) {
                  groups[groupName as keyof typeof groups].amount += outstanding;
                }
              });

              const total = summaryFigures.totalOutstanding;

              return (
                <div className="bg-[#12182b] rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <PieChart className="w-8 h-8 text-sky-400 fill-sky-400/20" />
                      <h2 className="text-2xl font-bold text-slate-100">Liability Summary</h2>
                    </div>
                    <div className="flex items-center gap-2 bg-[#1c2340] px-4 py-2 rounded-xl border border-slate-700/50 cursor-pointer hover:bg-slate-700 transition-colors">
                      <span className="text-sm font-medium text-slate-300">All Months</span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Main Metric */}
                  <div className="mb-10">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-100 tracking-tight mb-2">
                      ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h1>
                    <p className="text-slate-400 text-lg">Total Liabilities</p>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {Object.entries(groups).map(([name, data]) => {
                      const percentage = total > 0 ? (data.amount / total) * 100 : 0;
                      return (
                        <div key={name} className="bg-[#0b1021] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-40 shadow-inner">
                          <div className={\`w-12 h-12 rounded-full \${data.color.replace('bg-', 'bg-opacity-20 bg-')} flex items-center justify-center mb-4\`}>
                            <div className={\`\${data.color} w-full h-full rounded-full opacity-20 absolute\`}></div>
                            {data.icon}
                          </div>
                          <div>
                            <p className="text-slate-300 text-sm mb-1">{name}</p>
                            <p className="text-slate-100 font-bold text-lg leading-tight">
                               ₹{data.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-slate-500 text-sm mt-1">{percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress Bar */}
                  <div className="flex h-6 rounded-full overflow-hidden mb-6 bg-slate-800">
                    {Object.entries(groups).map(([name, data]) => {
                      const percentage = total > 0 ? (data.amount / total) * 100 : 0;
                      if (percentage === 0) return null;
                      return (
                        <div 
                          key={name}
                          className={\`h-full \${data.color}\`}
                          style={{ width: \`\${percentage}%\` }}
                        />
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
                    {Object.entries(groups).map(([name, data]) => (
                      <div key={name} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className={\`w-3 h-3 rounded-full \${data.dotColor}\`} />
                          <span className="text-slate-300 text-sm">{name}</span>
                        </div>
                        <span className="text-slate-400 text-sm pl-5">
                          ₹{data.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          )}

          <div className="flex flex-col lg:flex-row gap-6 mt-8">
              {/* Filter */}
              <div className="w-full lg:w-1/4 xl:w-1/5">
                <div className="p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <FilterDropdown
                    label="Category"
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

              {/* List */}
              <div className="w-full lg:w-3/4 xl:w-4/5">
                {liabilities.length === 0 && filteredLiabilities.length === 0 ? (
                    <div className="text-center py-10 bg-slate-800 rounded-lg border border-slate-700">
                        <p className="text-xl text-gray-400">No liabilities recorded yet.</p>
                        <p className="text-gray-500 mt-2 mb-4">Click "Add" in the header to get started.</p>
                    </div>
                ) : (
                    <LiabilityList
                      liabilities={filteredLiabilities}
                      allTransactions={allTransactions} 
                      onViewEMIs={onViewEMIs}
                    />
                )}
              </div>
          </div>
        </div>`;

content = content.replace(layoutRegex, newLayout);

fs.writeFileSync('components/LiabilityDetailsPage.tsx', content);
console.log('LiabilityDetailsPage layout updated.');
