const fs = require('fs');

let content = fs.readFileSync('components/LiabilityDetailsPage.tsx', 'utf8');

const targetProps = `interface LiabilityDetailsPageProps {
  liabilities: Liability[];
  allTransactions: Transaction[];
  onNavigate: (view: import("../types").View) => void;
  onEditLiability: (liability: Liability) => void;
  onDeleteLiability: (id: string) => void;
  onRecordPayment: (liability: Liability) => void;
  onUpdateRate: (liability: Liability) => void;
  onViewEMIs?: (liabilityId: string) => void; 
}`;

const replacementProps = `interface LiabilityDetailsPageProps {
  liabilities: Liability[];
  allTransactions: Transaction[];
  onNavigate: (view: import("../types").View) => void;
  onViewEMIs?: (liabilityId: string) => void; 
}`;

content = content.replace(targetProps, replacementProps);

const targetSignature = `export const LiabilityDetailsPage: React.FC<LiabilityDetailsPageProps> = ({ 
  liabilities, 
  allTransactions,
  onNavigate, 
  onEditLiability, 
  onDeleteLiability,
  onRecordPayment,
  onUpdateRate,
  onViewEMIs,
}) => {`;

const replacementSignature = `export const LiabilityDetailsPage: React.FC<LiabilityDetailsPageProps> = ({ 
  liabilities, 
  allTransactions,
  onNavigate, 
  onViewEMIs,
}) => {`;

content = content.replace(targetSignature, replacementSignature);

const targetListCall = `<LiabilityList
                  liabilities={filteredLiabilities}
                  allTransactions={allTransactions} 
                  onDelete={onDeleteLiability}
                  onEdit={onEditLiability}
                  onRecordPayment={onRecordPayment}
                  onUpdateRate={onUpdateRate}
                  onViewEMIs={onViewEMIs}
                />`;

const replacementListCall = `<LiabilityList
                  liabilities={filteredLiabilities}
                  allTransactions={allTransactions} 
                  onViewEMIs={onViewEMIs}
                />`;

content = content.replace(targetListCall, replacementListCall);

fs.writeFileSync('components/LiabilityDetailsPage.tsx', content);
console.log('LiabilityDetailsPage cleaned.');
