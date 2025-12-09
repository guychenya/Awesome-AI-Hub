import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, X, Tag, DollarSign, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { PricingModel } from '../types';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: string[];
  toggleCategory: (id: string) => void;
  selectedPricing: PricingModel[];
  togglePricing: (pricing: PricingModel) => void;
}

const Hero: React.FC<HeroProps> = ({ 
  searchQuery, 
  setSearchQuery,
  selectedCategories,
  toggleCategory,
  selectedPricing,
  togglePricing
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{type: 'category' | 'pricing', id: string, label: string}>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Logic to handle backspace deleting chips and Enter key to add filter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && searchQuery === '') {
      // Remove last filter if input is empty
      if (selectedPricing.length > 0) {
        togglePricing(selectedPricing[selectedPricing.length - 1]);
      } else if (selectedCategories.length > 0) {
        toggleCategory(selectedCategories[selectedCategories.length - 1]);
      }
    }
    
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      addFilter(suggestions[0]);
    }
  };

  // Logic to show suggestions based on typing or focus
  useEffect(() => {
    // If input is empty, show suggested/popular categories to allow quick multi-select
    if (!searchQuery.trim()) {
      const availableCategories = CATEGORIES
        .filter(c => !selectedCategories.includes(c.id))
        .slice(0, 6)
        .map(c => ({ type: 'category' as const, id: c.id, label: c.name }));
        
      const availablePricing = Object.values(PricingModel)
        .filter(p => !selectedPricing.includes(p))
        .slice(0, 2)
        .map(p => ({ type: 'pricing' as const, id: p, label: p }));

      setSuggestions([...availableCategories, ...availablePricing]);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    // Find matching categories
    const catMatches = CATEGORIES
      .filter(c => !selectedCategories.includes(c.id))
      .filter(c => c.name.toLowerCase().includes(query))
      .map(c => ({ type: 'category' as const, id: c.id, label: c.name }))
      .slice(0, 3);

    // Find matching pricing
    const priceMatches = Object.values(PricingModel)
      .filter(p => !selectedPricing.includes(p))
      .filter(p => p.toLowerCase().includes(query))
      .map(p => ({ type: 'pricing' as const, id: p, label: p }))
      .slice(0, 2);

    setSuggestions([...catMatches, ...priceMatches]);
  }, [searchQuery, selectedCategories, selectedPricing]);

  const addFilter = (item: {type: 'category' | 'pricing', id: string, label: string}) => {
    if (item.type === 'category') {
      toggleCategory(item.id);
    } else {
      togglePricing(item.id as PricingModel);
    }
    setSearchQuery(''); // Clear input after adding tag
    // Keep focus to allow adding multiple
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const hasFilters = selectedCategories.length > 0 || selectedPricing.length > 0;

  return (
    <div className="relative bg-white border-b border-slate-200 overflow-visible flex-shrink-0 z-20">
      {/* Abstract Background pattern */}
      <div className="absolute inset-0 bg-slate-50 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-20 relative z-10 text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-6 border border-brand-100">
           <Sparkles size={12} className="mr-2" />
           The Ultimate AI Directory
        </div>
        <h1 className="font-display font-bold text-4xl md:text-6xl text-slate-900 mb-6 leading-tight">
          Empowering Efficiency & <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-600">
            Trusted Discovery
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Navigate the expanding universe of AI tools. Streamlined, intelligent, and designed to help you find the perfect tool for your workflow.
        </p>

        <div className="max-w-2xl mx-auto relative group text-left">
          <div 
            className={`
              relative flex flex-wrap items-center bg-white border rounded-[2rem] shadow-xl transition-all duration-300 px-2
              ${isFocused ? 'ring-4 ring-brand-500/10 border-brand-500' : 'border-slate-200 shadow-slate-200/50'}
            `}
            onClick={() => inputRef.current?.focus()}
          >
             {/* Left Icon */}
            <div className="pl-3 pr-2 py-4 text-slate-400 flex-shrink-0">
              <Search className={`h-5 w-5 transition-colors ${isFocused ? 'text-brand-500' : ''}`} />
            </div>

            {/* Chips Container */}
            <div className="flex flex-wrap gap-2 items-center py-2 flex-grow">
               {/* Category Chips */}
               {selectedCategories.map(catId => {
                 const cat = CATEGORIES.find(c => c.id === catId);
                 return (
                   <span key={catId} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 animate-in zoom-in-50 duration-200 whitespace-nowrap">
                     <Tag size={10} className="mr-1.5 opacity-50" />
                     {cat?.name}
                     <button 
                       onClick={(e) => { e.stopPropagation(); toggleCategory(catId); }}
                       className="ml-1.5 hover:text-rose-500 rounded-full"
                     >
                       <X size={12} />
                     </button>
                   </span>
                 );
               })}

               {/* Pricing Chips */}
               {selectedPricing.map(price => (
                 <span key={price} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-100 animate-in zoom-in-50 duration-200 whitespace-nowrap">
                   <DollarSign size={10} className="mr-1 opacity-50" />
                   {price}
                   <button 
                     onClick={(e) => { e.stopPropagation(); togglePricing(price); }}
                     className="ml-1.5 hover:text-rose-500 rounded-full"
                   >
                     <X size={12} />
                   </button>
                 </span>
               ))}
               
               {/* Actual Input */}
               <input
                ref={inputRef}
                type="text"
                className="flex-grow min-w-[150px] bg-transparent border-none outline-none text-base text-slate-900 placeholder:text-slate-400 py-2 focus:ring-0"
                placeholder={hasFilters ? "Add another filter..." : "Search tools (e.g. 'Video', 'Free')..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow click on suggestions
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Suggestions Dropdown */}
            {isFocused && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-2 z-50">
                 <div className="px-4 py-2 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                   <span>Suggested Filters</span>
                   <span className="text-[9px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500">Press Enter to Select</span>
                 </div>
                 <div className="max-h-60 overflow-y-auto">
                   {suggestions.map((item) => (
                     <button
                       key={`${item.type}-${item.id}`}
                       className="w-full text-left px-4 py-3 hover:bg-brand-50 flex items-center justify-between group transition-colors"
                       onMouseDown={(e) => e.preventDefault()} // Prevent blur so click registers immediately
                       onClick={() => addFilter(item)}
                     >
                       <div className="flex items-center">
                          {item.type === 'category' ? <Tag size={14} className="mr-3 text-slate-400 group-hover:text-brand-500" /> : <DollarSign size={14} className="mr-3 text-slate-400 group-hover:text-brand-500" />}
                          <span className="text-sm font-medium text-slate-700 group-hover:text-brand-900">{item.label}</span>
                       </div>
                       <div className="flex items-center">
                         <span className="text-[10px] font-semibold text-slate-300 group-hover:text-brand-400 uppercase mr-2">
                           Add {item.type}
                         </span>
                         <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                       </div>
                     </button>
                   ))}
                 </div>
              </div>
            )}
          </div>
          
          {/* Visual indicator for AI Chat */}
          <div className="absolute -bottom-8 right-0 text-xs text-slate-400 hidden md:block">
            PowerSearch active. Type 'Video' or 'Free' to quick-add filters.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;