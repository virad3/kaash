
import React from 'react';

interface IconProps {
  className?: string;
}

export const PlusIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

// New Icon for Add Income (Bill with Plus)
export const AddIncomeIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 10.5v8.25c0 .966.784 1.75 1.75 1.75h15.5c.966 0 1.75-.784 1.75-1.75V10.5M4 10.5H20M4 10.5V6a2 2 0 012-2h12a2 2 0 012 2v4.5m-16 0h16" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 13.5v3M10.5 15h3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25v4.5M9.75 4.5h4.5" />
  </svg>
);

// New Icon for Add Expense (Wallet with Plus)
export const AddExpenseIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5v10.5a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V7.5m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 7.5m18 0v-2.25c0-.966-.784-1.75-1.75-1.75H19.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5V18M16.5 7.5c0-1.036-.84-1.875-1.875-1.875H12" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 3.75v3M3.75 5.25h3" />
  </svg>
);

// New Icon for Add Liability (Document with Plus)
export const AddLiabilityIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 17.25v3M6 18.75h3" /> {/* Plus sign */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0M14.25 18a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H15a.75.75 0 01-.75-.75z" /> {/* Currency symbol */}
  </svg>
);

export const BanknotesIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6A.75.75 0 012.25 5.25V4.5m19.5 0v.75a.75.75 0 01-.75.75a.75.75 0 01-.75-.75V4.5m0 0H2.25m19.5 0h.008v.008h-.008V4.5zM2.25 4.5V18.75m19.5-14.25V18.75M3.75 7.5h16.5M3.75 12h16.5m-16.5 4.5h16.5" />
  </svg>
);

export const WalletIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5v10.5a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V7.5m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 7.5m18 0v-2.25c0-.966-.784-1.75-1.75-1.75H19.5M16.5 7.5V18M16.5 7.5c0-1.036-.84-1.875-1.875-1.875H12" />
  </svg>
);

export const DocumentTextIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 7.5h4.5M9.75 12h4.5m-4.5 3h.75" />
  </svg>
);


export const TrashIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.032 3.223.094M7.5 3.75l.608 .608A14.93 14.93 0 0012 5.344a14.93 14.93 0 003.892-1.025l.608-.608M7.5 3.75V2.25A1.5 1.5 0 019 1.5h6A1.5 1.5 0 0116.5 2.25v1.5m0 0h1.5a1.5 1.5 0 011.5 1.5v.75a1.5 1.5 0 01-1.5-1.5h-15a1.5 1.5 0 01-1.5-1.5V6a1.5 1.5 0 011.5-1.5H7.5" />
  </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
  </svg>
);

export const KaashLogoIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 75" fill="none" className={className || "w-auto h-10"}>
    <defs>
      <linearGradient id="cloudGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#79BCFF"/>
        <stop offset="100%" stopColor="#3A8DFF"/>
      </linearGradient>
      <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6EE8A3"/>
        <stop offset="100%" stopColor="#2FB47C"/>
      </linearGradient>
       <linearGradient id="coinGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#4FD3B8"/>
        <stop offset="100%" stopColor="#30B098"/>
      </linearGradient>
    </defs>
    
    {/* Cloud */}
    <path d="M75.5 25C75.5 15.6 67.65 7.75 58.25 7.75C51.75 7.75 46.1 11.8 43.25 17.35C40.925 15.4375 37.85 14.25 34.5 14.25C27.325 14.25 21.5 20.075 21.5 27.25C21.5 28.1125 21.6 28.95 21.775 29.7625C19.752 30.7701 18.1062 32.3763 17.0625 34.375C14.25 34.875 12 37.4125 12 40.5C12 43.95 14.8 46.75 18.25 46.75H30.5V70H80.5V40.5C80.5 32.25 75.5 25 75.5 25Z" fill="url(#cloudGrad)"/>
    <rect x="30.5" y="46.75" width="50" height="23.25" fill="url(#cloudGrad)" />


    {/* Bars */}
    <rect x="36" y="45" width="10" height="25" fill="url(#barGrad)" rx="2"/>
    <rect x="50" y="35" width="10" height="35" fill="url(#barGrad)" rx="2"/>
    <rect x="64" y="25" width="10" height="45" fill="url(#barGrad)" rx="2"/>
    
    {/* Coin */}
    <circle cx="77" cy="38" r="12" fill="url(#coinGrad)"/>
    <text x="77" y="41.5" fill="white" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle">₹</text>
  </svg>
);

export const EditIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

export const PaymentIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6m3-3.75l-3 3m0 0l-3-3m3 3V1.5m9 4.5l-3-3m0 0l-3 3m3-3v12.75" />
  </svg>
);

export const CreditCardIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6M3 17.25a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 17.25V6.75A2.25 2.25 0 0018.75 4.5H5.25A2.25 2.25 0 003 6.75v10.5z" />
  </svg>
);

export const BellIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

export const SavingsIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6.062c0 .606-.442 1.134-1.036 1.258l-5.076.922a2.41 2.41 0 01-2.188 0l-5.076-.922A1.218 1.218 0 013 18.062V12m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m0 0h18M12 6.75h.008v.008H12V6.75z" />
  </svg>
);

export const PiggyBankIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 9h16.5m-16.5 2.25h16.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12.75c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H8.25a.75.75 0 00-.75.75v.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0z" />
 </svg>
);

export const CoinsIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 100 8.488M14.25 7.756c.032-.006.064-.01.097-.013l.004-.001M14.25 7.756a4.5 4.5 0 110 8.488M14.25 16.244c.032.006.064.01.097.013l.004.001M14.25 16.244a4.5 4.5 0 100-8.488" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 8.251c0-.414.336-.75.75-.75h3c.414 0 .75.336.75.75v0c0 .414-.336.75-.75.75h-3a.75.75 0 01-.75-.75v0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12.251c0-.414.336-.75.75-.75h3c.414 0 .75.336.75.75v0c0 .414-.336.75-.75.75h-3a.75.75 0 01-.75-.75v0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 15.751c0-.414.336-.75.75-.75h3c.414 0 .75.336.75.75v0c0 .414-.336.75-.75.75h-3a.75.75 0 01-.75-.75v0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18Z" />
  </svg>
);

export const GoogleIcon: React.FC<IconProps> = ({ className }) => (
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={className || "w-6 h-6"}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
    <path fill="none" d="M0 0h48v48H0z"></path>
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);

export const BackIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

export const MenuIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

// Summary Icons (without plus)
export const IncomeSummaryIcon: React.FC<IconProps> = ({ className }) => ( // Renamed to be more specific
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6A.75.75 0 012.25 5.25V4.5m19.5 0v.75a.75.75 0 01-.75.75a.75.75 0 01-.75-.75V4.5m0 0H2.25m19.5 0h.008v.008h-.008V4.5zM2.25 4.5V18.75m19.5-14.25V18.75M3.75 7.5h16.5M3.75 12h16.5m-16.5 4.5h16.5" />
  </svg>
);

export const ExpenseSummaryIcon: React.FC<IconProps> = ({ className }) => ( // Renamed
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5v10.5a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V7.5m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 7.5m18 0v-2.25c0-.966-.784-1.75-1.75-1.75H19.5M16.5 7.5V18M16.5 7.5c0-1.036-.84-1.875-1.875-1.875H12" />
  </svg>
);

export const LiabilitySummaryIcon: React.FC<IconProps> = ({ className }) => ( // Renamed
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 7.5h4.5M9.75 12h4.5m-4.5 3h.75" />
  </svg>
);

export const EarlyLoanClosureIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    {/* Document */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    {/* Fast Forward / Completion symbol (simple checkmark or double arrow) */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L13.5 7.5L16.5 6L13.5 4.5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.5 4.5L17.5 7.5L20.5 6L17.5 4.5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 14.5l3 3 5-5" />
  </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);
