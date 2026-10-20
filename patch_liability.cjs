const fs = require('fs');
let content = fs.readFileSync('components/LiabilityDetailsPage.tsx', 'utf8');

const regex = /<button\s*onClick=\{onOpenNewLiabilityForm\}\s*className="w-full px-6 py-3 bg-sky-600 [^>]+>\s*<PlusIcon className="h-5 w-5" \/> Add Liability\s*<\/button>/;

if(regex.test(content)) {
  content = content.replace(regex, '');
  fs.writeFileSync('components/LiabilityDetailsPage.tsx', content);
  console.log('patched');
} else {
  console.log('not found');
}
