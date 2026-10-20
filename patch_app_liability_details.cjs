const fs = require('fs');

let content = fs.readFileSync('App.tsx', 'utf8');

const target = `        return <LiabilityDetailsPage 
                  liabilities={liabilities} 
                  allTransactions={transactions}
                  onNavigate={handleNavigate}
                  onEditLiability={handleOpenEditLiabilityForm} 
                  onDeleteLiability={handleDeleteLiability}
                  onRecordPayment={setPayingLiability}
                  onUpdateRate={setUpdatingRateLiability}
                  onViewEMIs={(liabilityId) => {
                    const l = liabilities.find(lib => lib.id === liabilityId);
                    if (l) navigateToLiabilityEMIDetail(l);
                  }} 
               />;`;

const replacement = `        return <LiabilityDetailsPage 
                  liabilities={liabilities} 
                  allTransactions={transactions}
                  onNavigate={handleNavigate}
                  onViewEMIs={(liabilityId) => {
                    const l = liabilities.find(lib => lib.id === liabilityId);
                    if (l) navigateToLiabilityEMIDetail(l);
                  }} 
               />;`;

content = content.replace(target, replacement);

fs.writeFileSync('App.tsx', content);
console.log('App.tsx cleaned.');
