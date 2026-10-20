const fs = require('fs');

let content = fs.readFileSync('components/LiabilityDetailsPage.tsx', 'utf8');

const targetObjStr = `              const groups = {
                'Loans': { amount: 0, color: 'bg-[#8473fb]', dotColor: 'bg-[#8473fb]', icon: <Landmark className="w-6 h-6 text-[#9a8dfb]" /> },
                'Credit Cards': { amount: 0, color: 'bg-[#21a25d]', dotColor: 'bg-[#21a25d]', icon: <CreditCard className="w-6 h-6 text-[#4ade80]" /> },
                'EMIs': { amount: 0, color: 'bg-[#dc8634]', dotColor: 'bg-[#dc8634]', icon: <Home className="w-6 h-6 text-[#fdb374]" /> },
                'Other': { amount: 0, color: 'bg-[#e24c55]', dotColor: 'bg-[#e24c55]', icon: <MoreHorizontal className="w-6 h-6 text-[#fc8289]" /> },
              };`;

const replacementObjStr = `              const groups = {
                'Loans': { amount: 0, color: 'bg-[#8370f8]', dotColor: 'bg-[#8370f8]', iconBg: 'bg-[#2c2b5d]', iconColor: 'text-[#cdc5ff]', Icon: Landmark },
                'Credit Cards': { amount: 0, color: 'bg-[#2fa861]', dotColor: 'bg-[#2fa861]', iconBg: 'bg-[#193a2e]', iconColor: 'text-[#ccf7de]', Icon: CreditCard },
                'EMIs': { amount: 0, color: 'bg-[#dc8734]', dotColor: 'bg-[#dc8734]', iconBg: 'bg-[#422c22]', iconColor: 'text-[#ffe2cc]', Icon: Home },
                'Other': { amount: 0, color: 'bg-[#e54d58]', dotColor: 'bg-[#e54d58]', iconBg: 'bg-[#452129]', iconColor: 'text-[#ffd6d9]', Icon: MoreHorizontal },
              };`;

content = content.replace(targetObjStr, replacementObjStr);


const targetMapStr = `                        <div key={name} className="bg-[#0b1021] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-40 shadow-inner">
                          <div className={\`w-12 h-12 rounded-full \${data.color.replace('bg-', 'bg-opacity-20 bg-')} flex items-center justify-center mb-4\`}>
                            <div className={\`\${data.color} w-full h-full rounded-full opacity-20 absolute\`}></div>
                            {data.icon}
                          </div>
                          <div>`;

const replacementMapStr = `                        <div key={name} className="bg-[#12182b] border border-slate-700/50 p-5 rounded-2xl flex flex-col justify-between h-40 shadow-inner hover:bg-[#161d33] transition-colors">
                          <div className={\`w-12 h-12 rounded-full \${data.iconBg} flex items-center justify-center mb-4\`}>
                            <data.Icon className={\`w-6 h-6 \${data.iconColor}\`} />
                          </div>
                          <div>`;
                          
content = content.replace(targetMapStr, replacementMapStr);


const headerTarget = `<h2 className="text-2xl font-bold text-slate-100">Liability Summary</h2>`;
const headerRep = `<h2 className="text-2xl font-bold text-slate-100 tracking-tight">Liability Summary</h2>`;
content = content.replace(headerTarget, headerRep);

const mainBoxBgTarget = `<div className="bg-[#12182b] rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl">`;
const mainBoxBgRep = `<div className="bg-[#0d1323] rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl">`;
content = content.replace(mainBoxBgTarget, mainBoxBgRep);

const pbTarget = `                  {/* Progress Bar */}
                  <div className="flex h-6 rounded-full overflow-hidden mb-6 bg-slate-800">`;
const pbRep = `                  {/* Progress Bar */}
                  <div className="flex h-6 rounded-full overflow-hidden mb-8 bg-[#1a233a] gap-[2px]">`;
content = content.replace(pbTarget, pbRep);

fs.writeFileSync('components/LiabilityDetailsPage.tsx', content);
console.log('UI updated 2.');
