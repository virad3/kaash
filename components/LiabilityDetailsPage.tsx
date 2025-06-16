
import React, { useState, useMemo } from 'react';
import { Liability, LiabilityCategory } from '../types';
import { LiabilityList } from './LiabilityList'; 
import { BackIcon, PlusIcon } from './icons'; 
import { LIABILITY_CATEGORIES } from '../constants';

interface LiabilityDetailsPageProps {
  liabilities: Liability[];
  onBack: () => void;
  onEditLiability: (liability: Liability) => void;
  onDeleteLiability: (id: string) => void;
  onRecordPayment: (liability: Liability) => void;
  onViewEMIs?: (liabilityId: string) => void; 
  onOpenNewLiabilityForm: () => void;
}

export const LiabilityDetailsPage: React.FC<LiabilityDetailsPageProps> = ({ 
  liabilities, 
  onBack, 
  onEditLiability, 
  onDeleteLiability, 
  onRecordPayment, 
  onViewEMIs,
  onOpenNewLiabilityForm
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const uniqueCategories = useMemo(() => {
    const categoriesFromLiabilities = new Set<string>();
    liabilities.forEach(l => categoriesFromLiabilities.add(l.category));
    const allUnique = new Set([...LIABILITY_CATEGORIES.map(String), ...Array.from(categoriesFromLiabilities)]);
    return Array.from(allUnique).sort();
  }, [liabilities]);

  const filteredLiabilities = useMemo(() => {
    return liabilities.filter(l => {
      const categoryMatch = selectedCategory === 'all' || l.category === selectedCategory;
      return categoryMatch;
    });
  }, [liabilities, selectedCategory]);

  const totalFilteredOutstanding = useMemo(() => {
    return filteredLiabilities.reduce((sum, l) => sum + (l.initialAmount - l.amountRepaid), 0);
  }, [filteredLiabilities]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 p-2 sm:p-4 md:p-6 selection:bg-sky-400 selection:text-sky-900">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="block">
            <button 
              onClick={onBack}
              className="flex items-center space-x-2 text-sky-400 hover:text-sky-300 transition-colors p-2 rounded-md hover:bg-slate-700 mb-2"
              aria-label="Back"
            >
              <BackIcon className="h-6 w-6" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-orange-400 text-center w-full mt-3">Liability Details</h1>
          </div>
        </header>

        <div className="mt-6 space-y-6 md:grid md:grid-cols-12 md:gap-x-8 md:space-y-0">
          {/* Left Sidebar: Filters and Summary */}
          <div className="md:col-span-4 xl:col-span-3 space-y-6">
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 space-y-4">
              <h3 className="text-lg font-semibold text-sky-300 mb-3">Filters</h3>
              <div>
                <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-300 mb-1">Filter by Category:</label>
                <select
                  id="categoryFilter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-center">
              <p className="text-sm text-gray-400 uppercase tracking-wider">Liabilities Summary</p>
              <p className="text-3xl font-bold text-orange-400">₹{totalFilteredOutstanding.toFixed(2)}</p>
            </div>

            <button
              onClick={onOpenNewLiabilityForm}
              className="w-full px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 flex items-center justify-center gap-2"
              aria-label="Add new liability"
            >
              <PlusIcon className="h-5 w-5" /> Add Liability
            </button>
          </div>

          {/* Right Main Content: Liability List */}
          <div className="md:col-span-8 xl:col-span-9 space-y-6">
            {liabilities.length === 0 ? (
                <div className="text-center py-10 bg-slate-800 rounded-lg border border-slate-700">
                    <p className="text-xl text-gray-400">No liabilities recorded yet.</p>
                    <p className="text-gray-500 mt-2 mb-4">Click "Add Liability" to get started.</p>
                </div>
            ) : (
                <LiabilityList
                  liabilities={filteredLiabilities}
                  onDelete={onDeleteLiability}
                  onEdit={onEditLiability}
                  onRecordPayment={onRecordPayment}
                  onViewEMIs={onViewEMIs}
                />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
