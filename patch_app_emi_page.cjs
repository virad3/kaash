const fs = require('fs');

let content = fs.readFileSync('App.tsx', 'utf8');

const target = `          return <LiabilityEMIDetailPage 
                    liability={selectedLiabilityForEMIs} 
                    allTransactions={transactions}
                    onNavigate={handleNavigate}
                    onEditEMI={handleEditEMI}
                    onDeleteEMI={handleDeleteEMI}
                  />;`;

const replacement = `          return <LiabilityEMIDetailPage 
                    liability={selectedLiabilityForEMIs} 
                    allTransactions={transactions}
                    onNavigate={handleNavigate}
                    onEditEMI={handleEditEMI}
                    onDeleteEMI={handleDeleteEMI}
                    onRecordPayment={setPayingLiability}
                    onUpdateRate={setUpdatingRateLiability}
                    onEditLiability={handleOpenEditLiabilityForm} 
                    onDeleteLiability={handleDeleteLiability}
                  />;`;

content = content.replace(target, replacement);

fs.writeFileSync('App.tsx', content);
console.log('App patched.');
