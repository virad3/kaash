const fs = require('fs');

let content = fs.readFileSync('components/LiabilityItem.tsx', 'utf8');

const targetPropsInterface = `interface LiabilityItemProps {
  liability: Liability;
  allTransactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (liability: Liability) => void;
  onRecordPayment: (liability: Liability) => void;
  onUpdateRate: (liability: Liability) => void;
  onViewEMIs?: (liabilityId: string) => void; 
}`;

const replacementPropsInterface = `interface LiabilityItemProps {
  liability: Liability;
  allTransactions: Transaction[];
  onViewEMIs?: (liabilityId: string) => void; 
}`;

content = content.replace(targetPropsInterface, replacementPropsInterface);

const targetComponentSignature = `export const LiabilityItem: React.FC<LiabilityItemProps> = ({ liability, allTransactions, onDelete, onEdit, onRecordPayment, onUpdateRate, onViewEMIs }) => {`;

const replacementComponentSignature = `export const LiabilityItem: React.FC<LiabilityItemProps> = ({ liability, allTransactions, onViewEMIs }) => {`;

content = content.replace(targetComponentSignature, replacementComponentSignature);

fs.writeFileSync('components/LiabilityItem.tsx', content);
console.log('LiabilityItem cleaned.');
