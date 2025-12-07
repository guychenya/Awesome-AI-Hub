import React from 'react';
import { Filter, X } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { PricingModel } from '../types';

interface FilterSidebarProps {
  selectedCategories: string[];
  toggleCategory: (id: string) => void;
  selectedPricing: PricingModel[];
  togglePricing: (pricing: PricingModel) => void;
  className?: string;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  selectedCategories, 
  toggleCategory, 
  selectedPricing, 
  togglePricing,
  className 
}) => {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-2 text-slate-900 font-semibold pb-4 border-b border-slate-100">
        <Filter size={18} />
        <span>Filters</span>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Categories</h4>
        <div className="space-y-2">
          {CATEGORIES.map(category => (
            <label key={category.id} className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  className="peer h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 transition duration-150 ease-in-out"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                />
              </div>
              <span className={`text-sm group-hover:text-brand-600 transition-colors ${selectedCategories.includes(category.id) ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Pricing</h4>
        <div className="space-y-2">
          {Object.values(PricingModel).map(model => (
            <label key={model} className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                checked={selectedPricing.includes(model)}
                onChange={() => togglePricing(model)}
              />
              <span className={`text-sm group-hover:text-brand-600 transition-colors ${selectedPricing.includes(model) ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                {model}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;