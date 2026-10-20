
import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Liability, LiabilityCategory, Transaction, TransactionType } from '../types'; // Added TransactionType
import { LiabilityItem } from './LiabilityItem';
import { PlusIcon } from './icons'; 
import { PageNavigationDropdown } from './PageNavigationDropdown';
import { PieChart, Landmark, CreditCard, Home, MoreHorizontal, ChevronDown, Car, GraduationCap, User, Briefcase, Stethoscope } from 'lucide-react';



interface LiabilityDetailsPageProps {
  liabilities: Liability[];
  allTransactions: Transaction[]; 
  onNavigate: (view: import("../types").View) => void;
  onEditLiability: (liability: Liability) => void;
  onDeleteLiability: (id: string) => void;
  onRecordPayment: (liability: Liability) => void;
  onUpdateRate: (liability: Liability) => void;
  onViewEMIs?: (liabilityId: string) => void; 
  onOpenNewLiabilityForm: () => void;
}

export const LiabilityDetailsPage: React.FC<LiabilityDetailsPageProps> = ({ 
  liabilities, 
  allTransactions, 
  onNavigate, 
  onEditLiability, 
  onDeleteLiability, 
  onRecordPayment, 
  onUpdateRate,
  onViewEMIs,
  onOpenNewLiabilityForm
}) => {
  const summaryFigures = useMemo(() => {
    const totalInitialAmount = liabilities.reduce((sum, l) => sum + l.initialAmount, 0);
    const totalPrincipalRepaid = liabilities.reduce((sum, l) => sum + l.amountRepaid, 0);
    const totalOutstanding = totalInitialAmount - totalPrincipalRepaid;

    const liabilityIds = new Set(liabilities.map(l => l.id));
    const totalEMIsPaid = allTransactions.reduce((sum, t) => {
      if (
        t.type === TransactionType.EXPENSE &&
        t.relatedLiabilityId &&
        liabilityIds.has(t.relatedLiabilityId)
      ) {
        return sum + t.amount;
      }
      return sum;
    }, 0);

    const totalInterestPaid = Math.max(0, totalEMIsPaid - totalPrincipalRepaid);

    return {
      totalInitialAmount,
      totalPrincipalRepaid,
      totalEMIsPaid,
      totalInterestPaid,
      totalOutstanding,
    };
  }, [liabilities, allTransactions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 selection:bg-sky-400 selection:text-sky-900">
      <div>
        <header className="sticky top-0 z-30 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 py-2 sm:py-3">
            <div className="flex items-center justify-between h-full px-2 sm:px-4 lg:px-6">
                 <div className="flex-none">
                    <PageNavigationDropdown currentView="liabilityDetails" onNavigate={onNavigate} />
                </div>
                <div className="flex-grow text-center px-2">
                    <h1 className="text-lg sm:text-xl font-semibold text-orange-400 truncate">
                        Liability Details
                    </h1>
                </div>
                 <div className="flex-none flex items-center">
                  <button
                    onClick={() => onOpenNewLiabilityForm()}
                    className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-600 text-sky-400 hover:text-sky-300 px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    title="Add Liability"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm font-medium">Add</span>
                  </button>
              </div>
            </div>
        </header>
        
        <div className="mt-6 p-3 sm:p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
          {/* New Liability Summary Card */}
          {liabilities.length === 0 ? (
              <div className="text-center py-16 bg-[#0d1323] rounded-3xl border border-slate-800/80 shadow-2xl">
                  <p className="text-xl text-slate-400">No liabilities recorded yet.</p>
                  <p className="text-slate-500 mt-2 mb-6">Click "Add" in the header to get started.</p>
                  <button
                      onClick={() => onOpenNewLiabilityForm()}
                      className="inline-flex items-center space-x-2 bg-[#1c2340] hover:bg-slate-700 text-sky-400 px-6 py-3 rounded-xl transition-colors font-medium border border-slate-700/50"
                  >
                      <PlusIcon className="w-5 h-5" />
                      <span>Add Liability</span>
                  </button>
              </div>
          ) : (
            (() => {
              const total = summaryFigures.totalOutstanding;
              const sortedLiabilities = [...liabilities].sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());

              const PALETTE = [
                { color: 'bg-[#8370f8]', dotColor: 'bg-[#8370f8]', iconBg: 'bg-[#2c2b5d]', iconColor: 'text-[#cdc5ff]' },
                { color: 'bg-[#2fa861]', dotColor: 'bg-[#2fa861]', iconBg: 'bg-[#193a2e]', iconColor: 'text-[#ccf7de]' },
                { color: 'bg-[#dc8734]', dotColor: 'bg-[#dc8734]', iconBg: 'bg-[#422c22]', iconColor: 'text-[#ffe2cc]' },
                { color: 'bg-[#e54d58]', dotColor: 'bg-[#e54d58]', iconBg: 'bg-[#452129]', iconColor: 'text-[#ffd6d9]' },
                { color: 'bg-[#3b82f6]', dotColor: 'bg-[#3b82f6]', iconBg: 'bg-[#1e3a8a]', iconColor: 'text-[#bfdbfe]' },
                { color: 'bg-[#ec4899]', dotColor: 'bg-[#ec4899]', iconBg: 'bg-[#831843]', iconColor: 'text-[#fbcfe8]' },
                { color: 'bg-[#14b8a6]', dotColor: 'bg-[#14b8a6]', iconBg: 'bg-[#115e59]', iconColor: 'text-[#ccfbf1]' },
                { color: 'bg-[#eab308]', dotColor: 'bg-[#eab308]', iconBg: 'bg-[#713f12]', iconColor: 'text-[#fef08a]' },
              ];

              const activeLiabilitiesData = sortedLiabilities
                .filter(l => (l.initialAmount - l.amountRepaid) > 0)
                .map((l, index) => {
                    const outstanding = l.initialAmount - l.amountRepaid;
                    const theme = PALETTE[index % PALETTE.length];
                    
                    let Icon = Landmark;
                    switch(l.category) {
                      case 'Mortgage/Home Loan': Icon = Home; break;
                      case 'Auto Loan': Icon = Car; break;
                      case 'Student Loan': Icon = GraduationCap; break;
                      case 'Personal Loan': Icon = User; break;
                      case 'Credit Card Debt': Icon = CreditCard; break;
                      case 'Medical Bill': Icon = Stethoscope; break;
                      case 'Business Loan': Icon = Briefcase; break;
                      case 'Tax Debt': Icon = Landmark; break;
                      default: Icon = MoreHorizontal;
                    }

                    return {
                        id: l.id,
                        name: l.name || 'Liability',
                        amount: outstanding,
                        percentage: total > 0 ? (outstanding / total) * 100 : 0,
                        ...theme,
                        Icon
                    };
                });

              return (
                <div className="bg-[#0d1323] rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-800/80 shadow-2xl">
                  {/* Main Metric */}
                  <div className="mb-10">
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-100 tracking-tight mb-2">
                      ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h1>
                    <p className="text-slate-400 text-lg">Total Liabilities</p>
                  </div>

                  {/* Cards Grid */}
                  {activeLiabilitiesData.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                        {activeLiabilitiesData.map((data) => (
                          <div 
                            key={data.id} 
                            onClick={() => onViewEMIs && onViewEMIs(data.id)}
                            className="bg-[#12182b] border border-slate-700/50 p-5 rounded-3xl flex flex-col justify-between h-44 shadow-inner hover:bg-[#161d33] transition-colors cursor-pointer group"
                          >
                            <div className={`w-14 h-14 rounded-2xl ${data.iconBg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                              <data.Icon className={`w-7 h-7 ${data.iconColor}`} />
                            </div>
                            <div>
                              <p className="text-slate-400 text-sm mb-1 truncate">{data.name}</p>
                              <p className="text-slate-100 font-bold text-xl leading-tight mb-1 truncate">
                                 ₹{data.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <p className="text-slate-500 text-sm font-medium">{data.percentage.toFixed(1)}%</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Progress Bar */}
                      <div className="flex h-6 rounded-full overflow-hidden mb-8 bg-[#1a233a] gap-[2px]">
                        {activeLiabilitiesData.map((data) => {
                          if (data.percentage === 0) return null;
                          return (
                            <div 
                              key={data.id}
                              className={`h-full ${data.color}`}
                              style={{ width: `${data.percentage}%` }}
                              title={`${data.name}: ${data.percentage.toFixed(1)}%`}
                            />
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap gap-x-6 gap-y-4 px-2">
                        {activeLiabilitiesData.map((data) => (
                          <div key={data.id} className="flex flex-col gap-1.5 min-w-[120px]">
                            <div className="flex items-center gap-2">
                              <div className={`w-3.5 h-3.5 rounded-full ${data.dotColor}`} />
                              <span className="text-slate-300 text-sm font-medium truncate max-w-[150px]" title={data.name}>{data.name}</span>
                            </div>
                            <span className="text-slate-400 text-sm pl-5.5 font-mono">
                              ₹{data.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-500">All matched liabilities are fully paid off.</p>
                    </div>
                  )}

                  </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
};