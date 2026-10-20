import React from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  allLabel?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  selectedValue,
  onSelect,
  allLabel = 'All'
}) => {
  return (
    <div className="flex-1 min-w-[100px]">
      <label className="block text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
      <select
        value={selectedValue}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full bg-slate-700/50 border border-slate-600 text-gray-200 rounded-md shadow-sm p-2 text-sm focus:ring-sky-500 focus:border-sky-500 transition outline-none"
      >
        <option value="all">{allLabel}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
