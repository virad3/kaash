const fs = require('fs');

let content = fs.readFileSync('components/LiabilityDetailsPage.tsx', 'utf8');

const importTarget = "import { PieChart, Landmark, CreditCard, Home, MoreHorizontal, ChevronDown } from 'lucide-react';";
const importReplacement = "import { PieChart, Landmark, CreditCard, Home, MoreHorizontal, ChevronDown, Car, GraduationCap, User, Briefcase, Stethoscope } from 'lucide-react';";
content = content.replace(importTarget, importReplacement);

const IIFETargetStart = `              const categoryMapping: Record<string, string> = {`;
const IIFETargetEnd = `                  {/* Embedded Liabilities List */}`;

const IIFERegex = new RegExp(IIFETargetStart.replace(/[.*+?^$\/{}()|\\]/g, '\\$&') + '[\\s\\S]*?' + IIFETargetEnd.replace(/[.*+?^$\/{}()|\\]/g, '\\$&'));

const newIIFE = `              const total = summaryFigures.totalOutstanding;
              const sortedLiabilities = [...filteredLiabilities].sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());

              const PALETTE = [
                { color: 'bg-[#8370f8]', dotColor: 'bg-[#8370f8]', iconBg: 'bg-[#2c2b5d]', iconColor: 'text-[#cdc5ff]' },
                { color: 'bg-[#2fa861]', dotColor: 'bg-[#2fa861]', iconBg: 'bg-[#193a2e]', iconColor: 'text-[#ccf7de]' },
                { color: 'bg-[#dc8734]', dotColor: 'bg-[#dc8734]', iconBg: 'bg-[#422c22]', iconColor: 'text-[#ffe2cc]' },
                { color: 'bg-[#e54d58]', dotColor: 'bg-[#e54d58]', iconBg: 'bg-[#452129]', iconColor: 'text-[#ffd6d9]' },
                { color: 'bg-[#3b82f6]', dotColor: 'bg-[#3b82f6]', iconBg: 'bg-[#1e3a8a]', iconColor: 'text-[#bfdbfe]' },
                { color: 'bg-[#ec4899]', dotColor: 'bg-[#ec4899]', iconBg: 'bg-[#831843]', iconColor: 'text-[#fbcfe8]' },
                { color: 'bg-[#14b8a6]', dotColor: 'bg-[#14b8a6]', iconBg: 'bg-[#115e59]', iconColor: 'text-[#ccfbf1]' },
                { color: 'bg-[#eab308]', dotColor: 'bg-[#eab308]', iconBg: 'bg-[#713f12]', iconColor: 'text-[#fef08a]' },
              ];

              const activeLiabilitiesData = sortedLiabilities
                .filter(l => (l.initialAmount - l.amountRepaid) > 0)
                .map((l, index) => {
                    const outstanding = l.initialAmount - l.amountRepaid;
                    const theme = PALETTE[index % PALETTE.length];
                    
                    let Icon = Landmark;
                    switch(l.category) {
                      case 'Mortgage/Home Loan': Icon = Home; break;
                      case 'Auto Loan': Icon = Car; break;
                      case 'Student Loan': Icon = GraduationCap; break;
                      case 'Personal Loan': Icon = User; break;
                      case 'Credit Card Debt': Icon = CreditCard; break;
                      case 'Medical Bill': Icon = Stethoscope; break;
                      case 'Business Loan': Icon = Briefcase; break;
                      case 'Tax Debt': Icon = Landmark; break;
                      default: Icon = MoreHorizontal;
                    }

                    return {
                        id: l.id,
                        name: l.name || l.category,
                        amount: outstanding,
                        percentage: total > 0 ? (outstanding / total) * 100 : 0,
                        ...theme,
                        Icon
                    };
                });

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
                  {activeLiabilitiesData.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                        {activeLiabilitiesData.map((data) => (
                          <div 
                            key={data.id} 
                            onClick={() => onViewEMIs && onViewEMIs(data.id)}
                            className="bg-[#12182b] border border-slate-700/50 p-5 rounded-3xl flex flex-col justify-between h-44 shadow-inner hover:bg-[#161d33] transition-colors cursor-pointer group"
                          >
                            <div className={\`w-14 h-14 rounded-2xl \${data.iconBg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110\`}>
                              <data.Icon className={\`w-7 h-7 \${data.iconColor}\`} />
                            </div>
                            <div>
                              <p className="text-slate-400 text-sm mb-1 truncate">{data.name}</p>
                              <p className="text-slate-100 font-bold text-xl leading-tight mb-1 truncate">
                                 ₹{data.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <p className="text-slate-500 text-sm font-medium">{data.percentage.toFixed(1)}%</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Progress Bar */}
                      <div className="flex h-6 rounded-full overflow-hidden mb-8 bg-[#1a233a] gap-[2px]">
                        {activeLiabilitiesData.map((data) => {
                          if (data.percentage === 0) return null;
                          return (
                            <div 
                              key={data.id}
                              className={\`h-full \${data.color}\`}
                              style={{ width: \`\${data.percentage}%\` }}
                              title={\`\${data.name}: \${data.percentage.toFixed(1)}%\`}
                            />
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap gap-x-6 gap-y-4 px-2">
                        {activeLiabilitiesData.map((data) => (
                          <div key={data.id} className="flex flex-col gap-1.5 min-w-[120px]">
                            <div className="flex items-center gap-2">
                              <div className={\`w-3.5 h-3.5 rounded-full \${data.dotColor}\`} />
                              <span className="text-slate-300 text-sm font-medium truncate max-w-[150px]" title={data.name}>{data.name}</span>
                            </div>
                            <span className="text-slate-400 text-sm pl-5.5 font-mono">
                              ₹{data.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-500">All matched liabilities are fully paid off.</p>
                    </div>
                  )}

                  {/* Embedded Liabilities List */}`;

content = content.replace(IIFERegex, newIIFE);

// Also remove the "Embedded Liabilities List" section as requested by user
const embeddedListStart = `{/* Embedded Liabilities List */}`;
const embeddedListEnd = `</div>
                </div>
              );
            })()`;

const listRegex = new RegExp(embeddedListStart.replace(/[.*+?^$\/{}()|\\]/g, '\\$&') + '[\\s\\S]*?' + embeddedListEnd.replace(/[.*+?^$\/{}()|\\]/g, '\\$&'));
content = content.replace(listRegex, `</div>
              );
            })()`);

fs.writeFileSync('components/LiabilityDetailsPage.tsx', content);
console.log('UI updated with individual liabilities.');
