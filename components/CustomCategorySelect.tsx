import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PlusIcon, EditIcon, TrashIcon } from './icons';

interface CustomCategorySelectProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  predefinedCategories: string[];
  userDefinedCategories: string[];
  onAddNew: () => void; // Callback to open "Add New" modal in parent
  onEdit: (categoryName: string) => void; // Callback to open "Edit" modal in parent
  onDelete: (categoryName: string) => void; // Callback to open "Delete" modal in parent
  categoryTypeLabel: string; // e.g., "Income Category"
  disabled?: boolean;
}

export const CustomCategorySelect: React.FC<CustomCategorySelectProps> = ({
  selectedCategory,
  onSelectCategory,
  predefinedCategories,
  userDefinedCategories,
  onAddNew,
  onEdit,
  onDelete,
  categoryTypeLabel,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allCategories = useMemo(() => {
    const combined = [
      ...predefinedCategories,
      ...userDefinedCategories.filter(udc => !predefinedCategories.includes(udc))
    ];
    return combined.filter((value, index, self) => self.indexOf(value) === index).sort((a,b) => a.localeCompare(b));
  }, [predefinedCategories, userDefinedCategories]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (category: string) => {
    onSelectCategory(category);
    setIsOpen(false);
  };

  const isUserModifiable = (category: string): boolean => {
    return userDefinedCategories.includes(category) && !predefinedCategories.includes(category);
  };
  
  const displaySelected = selectedCategory || `Select ${categoryTypeLabel.replace('*', '')}`;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label htmlFor={`${categoryTypeLabel.toLowerCase().replace(/\s/g, '-')}-select`} className="block text-sm font-medium text-gray-300 mb-1">{categoryTypeLabel}</label>
      <button
        type="button"
        id={`${categoryTypeLabel.toLowerCase().replace(/\s/g, '-')}-select`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 text-left flex justify-between items-center
                    focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-500'}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className={selectedCategory ? "text-gray-100" : "text-gray-400"}>{displaySelected}</span>
        <svg className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-slate-700 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
          <ul role="listbox">
            {allCategories.length === 0 && (
                 <li className="text-gray-400 px-3 py-2">No categories available.</li>
            )}
            {allCategories.map((cat) => (
              <li
                key={cat}
                onClick={() => handleSelect(cat)}
                className={`px-3 py-2.5 text-sm cursor-pointer hover:bg-slate-600 flex justify-between items-center ${selectedCategory === cat ? 'bg-sky-600 text-white' : 'text-gray-200'}`}
                role="option"
                aria-selected={selectedCategory === cat}
              >
                <span>{cat}</span>
                {isUserModifiable(cat) && (
                  <div className="flex space-x-1.5">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onEdit(cat); }}
                      className="p-1 text-yellow-400 hover:text-yellow-300 hover:bg-slate-500 rounded"
                      aria-label={`Edit category ${cat}`}
                      title={`Edit ${cat}`}
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDelete(cat); }}
                      className="p-1 text-red-500 hover:text-red-400 hover:bg-slate-500 rounded"
                      aria-label={`Delete category ${cat}`}
                       title={`Delete ${cat}`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
            <li
              onClick={() => { onAddNew(); setIsOpen(false); }}
              className="px-3 py-2.5 text-sm cursor-pointer hover:bg-slate-600 text-sky-400 flex items-center border-t border-slate-600"
              role="option"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add New Category
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
