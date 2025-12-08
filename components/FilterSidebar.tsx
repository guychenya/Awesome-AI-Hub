import React from 'react';
import { Filter, Zap, TrendingUp, CheckCircle, Tag, DollarSign, RotateCcw } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { PricingModel, SortOption } from '../types';

interface FilterSidebarProps {
  selectedCategories: string[];
  toggleCategory: (id: string) => void;
  selectedPricing: PricingModel[];
  togglePricing: (pricing: PricingModel) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  popularOnly: boolean;
  togglePopular: () => void;
  onClearAll: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  selectedCategories, 
  toggleCategory, 
  selectedPricing, 
  togglePricing,
  sortOption,
  setSortOption,
  popularOnly,
  togglePopular,
  onClearAll
}) => {
  return (
    <div className="space-y-10 pr-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-slate-900">
          <Filter size={20} className="text-brand-600" />
          <span className="font-display font-bold text-lg">Filters</span>
        </div>
        {(selectedCategories.length > 0 || selectedPricing.length > 0 || popularOnly) && (
          <button 
            onClick={onClearAll}
            className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center transition-colors"
          >
            <RotateCcw size={12} className="mr-1" />
            Reset
          </button>
        )}
      </div>

      {/* Popularity Toggle (Heat) */}
      <div className="bg-gradient-to-br from-indigo-50 to-brand-50 rounded-2xl p-5 border border-brand-100">
        <div className="flex items-center justify-between cursor-pointer" onClick={togglePopular}>
           <div className="flex items-center space-x-3">
             <div className={`p-2 rounded-lg transition-colors ${popularOnly ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-slate-400'}`}>
               <TrendingUp size={18} />
             </div>
             <div>
               <h4 className="font-bold text-slate-800 text-sm">Popular & Hot</h4>
               <p className="text-[10px] text-slate-500">Only show trending tools</p>
             </div>
           </div>
           
           {/* Custom Toggle Switch */}
           <div className={`w-12 h-7 rounded-full transition-colors duration-300 flex items-center px-1 ${popularOnly ? 'bg-brand-600' : 'bg-slate-200'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${popularOnly ? 'translate-x-5' : 'translate-x-0'}`}></div>
           </div>
        </div>
      </div>

      {/* Categories (Bubbles) */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Tag size={16} className="text-slate-400" />
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categories</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(category => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border
                  ${isSelected 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600 hover:shadow-sm'}
                `}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pricing (Visual Tiles) */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign size={16} className="text-slate-400" />
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pricing Model</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(PricingModel).map(model => {
            const isSelected = selectedPricing.includes(model);
            return (
              <button
                key={model}
                onClick={() => togglePricing(model)}
                className={`
                  relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200
                  ${isSelected
                    ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-inner'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-brand-200 hover:shadow-md'}
                `}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 text-brand-600">
                    <CheckCircle size={12} />
                  </div>
                )}
                <span className={`text-sm font-bold ${isSelected ? 'text-brand-900' : 'text-slate-700'}`}>{model}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sorting */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
           <Zap size={16} className="text-slate-400" />
           <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort Order</h4>
        </div>
        <div className="bg-slate-100 p-1 rounded-xl flex flex-col gap-1">
          {[
            { id: 'popular', label: 'Recommended' },
            { id: 'newest', label: 'Newest Added' },
            { id: 'nameAsc', label: 'A-Z Name' }
          ].map((opt) => (
             <button
               key={opt.id}
               onClick={() => setSortOption(opt.id as SortOption)}
               className={`
                 w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all
                 ${sortOption === opt.id 
                   ? 'bg-white text-slate-900 shadow-sm' 
                   : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
               `}
             >
               {opt.label}
             </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default FilterSidebar;