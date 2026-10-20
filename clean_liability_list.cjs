const fs = require('fs');

let content = fs.readFileSync('components/LiabilityList.tsx', 'utf8');

const targetPropsInterface = `interface LiabilityListProps {
  liabilities: Liability[];
  allTransactions: Transaction[]; // New prop
  onDelete: (id: string) => void;
  onEdit: (liability: Liability) => void;
  onRecordPayment: (liability: Liability) => void;
  onUpdateRate: (liability: Liability) => void;
  onViewEMIs?: (liabilityId: string) => void; 
}`;

const replacementPropsInterface = `interface LiabilityListProps {
  liabilities: Liability[];
  allTransactions: Transaction[]; // New prop
  onViewEMIs?: (liabilityId: string) => void; 
}`;

content = content.replace(targetPropsInterface, replacementPropsInterface);

const targetComponentSignature = `export const LiabilityList: React.FC<LiabilityListProps> = ({ liabilities, allTransactions, onDelete, onEdit, onRecordPayment, onUpdateRate, onViewEMIs }) => {`;

const replacementComponentSignature = `export const LiabilityList: React.FC<LiabilityListProps> = ({ liabilities, allTransactions, onViewEMIs }) => {`;

content = content.replace(targetComponentSignature, replacementComponentSignature);

const targetItemCall = `<LiabilityItem 
              key={liability.id} 
              liability={liability} 
              allTransactions={allTransactions} // Pass down
              onDelete={onDelete}
              onEdit={onEdit}
              onRecordPayment={onRecordPayment}
              onUpdateRate={onUpdateRate}
              onViewEMIs={onViewEMIs} 
            />`;

const replacementItemCall = `<LiabilityItem 
              key={liability.id} 
              liability={liability} 
              allTransactions={allTransactions}
              onViewEMIs={onViewEMIs} 
            />`;

content = content.replace(targetItemCall, replacementItemCall);

fs.writeFileSync('components/LiabilityList.tsx', content);
console.log('LiabilityList cleaned.');
