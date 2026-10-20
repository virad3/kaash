const fs = require('fs');
let content = fs.readFileSync('components/LiabilityItem.tsx', 'utf8');

const target = `<div className="flex items-start justify-between">
            <div>
                <h4 className="text-base sm:text-lg font-semibold text-sky-300 truncate group-hover:underline">{displayName}</h4>`;

const replacement = `<div className="flex items-center justify-between">
            <div>
                <h4 className="text-base sm:text-lg font-semibold text-sky-300 truncate group-hover:underline flex items-center">
                    {displayName}
                    {onViewEMIs && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    )}
                </h4>`;

if(content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('components/LiabilityItem.tsx', content);
  console.log('patched');
} else {
  console.log('target not found');
}
