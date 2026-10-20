const fs = require('fs');

let content = fs.readFileSync('components/LiabilityDetailsPage.tsx', 'utf8');

const pieChartTarget = `<PieChart className="w-8 h-8 text-sky-400 fill-sky-400/20" />`;
const pieChartRep = `<PieChart className="w-8 h-8 text-[#609afa] fill-[#609afa]" />`;
content = content.replace(pieChartTarget, pieChartRep);

const totalNumTarget = `<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-100 tracking-tight mb-2">`;
const totalNumRep = `<h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-100 tracking-tight mb-2">`;
content = content.replace(totalNumTarget, totalNumRep);


fs.writeFileSync('components/LiabilityDetailsPage.tsx', content);
console.log('UI updated 3.');
