const fs = require('fs');

let content = fs.readFileSync('components/LiabilityEMIDetailPage.tsx', 'utf8');

// Add ArrowLeft import
const importTarget = "import { Landmark, Home, Car, GraduationCap, User, CreditCard, Briefcase, Stethoscope, Calendar, Percent, IndianRupee, PieChart, Activity, Info } from 'lucide-react';";
const importReplacement = "import { Landmark, Home, Car, GraduationCap, User, CreditCard, Briefcase, Stethoscope, Calendar, Percent, IndianRupee, PieChart, Activity, Info, ArrowLeft } from 'lucide-react';";
content = content.replace(importTarget, importReplacement);

// Update Header
const headerTarget = `<div className="flex-none">
                    <PageNavigationDropdown currentView="liabilityEMIDetail" onNavigate={onNavigate} />
                </div>`;
                
const headerReplacement = `<div className="flex-none flex items-center gap-2">
                    <button 
                        onClick={() => onNavigate('liabilityDetails')}
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                        title="Back to Liabilities"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <PageNavigationDropdown currentView="liabilityEMIDetail" onNavigate={onNavigate} />
                </div>`;

content = content.replace(headerTarget, headerReplacement);

fs.writeFileSync('components/LiabilityEMIDetailPage.tsx', content);
console.log('Back button added.');
