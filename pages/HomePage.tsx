import React, { useState, useMemo, useRef, useEffect } from 'react';
import Hero from '../components/Hero';
import ToolCard from '../components/ToolCard';
import { getTools } from '../services/toolService';
import { PricingModel, SortOption } from '../types';
import { CATEGORIES } from '../constants';
import { ChevronDown, Check, X, Filter } from 'lucide-react';

const TOOLS_PER_PAGE = 12;

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<PricingModel[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('popular');
  const [visibleCount, setVisibleCount] = useState(TOOLS_PER_PAGE);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const pricingDropdownRef = useRef<HTMLDivElement>(null);

  // Close pricing dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pricingDropdownRef.current && !pricingDropdownRef.current.contains(event.target as Node)) {
        setIsPricingOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Derive all filtered tools
  const allFilteredTools = useMemo(() => getTools({
    searchQuery,
    categories: selectedCategories,
    pricing: selectedPricing,
    sort: sortOption
  }), [searchQuery, selectedCategories, selectedPricing, sortOption]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(TOOLS_PER_PAGE);
  }, [searchQuery, selectedCategories, selectedPricing, sortOption]);

  // Slice for display
  const displayedTools = allFilteredTools.slice(0, visibleCount);
  const hasMore = visibleCount < allFilteredTools.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + TOOLS_PER_PAGE);
  };

  const toggleCategory = (id: string) => {
    // Single select behavior for pills usually feels better, but multi-select is powerful. 
    // Let's stick to multi-select for power, but visual toggle.
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const togglePricing = (model: PricingModel) => {
    setSelectedPricing(prev => 
      prev.includes(model) ? prev.filter(p => p !== model) : [...prev, model]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedPricing([]);
  };

  return (
    <div className="min-h-full bg-slate-50 pb-20">
      <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Sticky Filter Bar */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="container mx-auto px-4 py-4 space-y-4">
          
          {/* Top Row: Categories (Horizontal Scroll) */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
             <button 
                onClick={() => setSelectedCategories([])}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                  ${selectedCategories.length === 0 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                `}
              >
                All
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`
                    flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap
                    ${selectedCategories.includes(cat.id)
                      ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-200 hover:text-brand-600 hover:bg-brand-50'}
                  `}
                >
                  {cat.name}
                </button>
              ))}
          </div>

          {/* Bottom Row: Controls (Pricing, Sort, Count) */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-1">
             
             <div className="flex items-center space-x-3 w-full sm:w-auto overflow-x-visible">
                {/* Pricing Dropdown */}
                <div className="relative" ref={pricingDropdownRef}>
                  <button 
                    onClick={() => setIsPricingOpen(!isPricingOpen)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedPricing.length > 0 ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span>Pricing</span>
                    {selectedPricing.length > 0 && (
                      <span className="flex items-center justify-center w-5 h-5 bg-brand-600 text-white text-[10px] rounded-full">
                        {selectedPricing.length}
                      </span>
                    )}
                    <ChevronDown size={14} className={`transition-transform ${isPricingOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isPricingOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                      {Object.values(PricingModel).map(model => (
                        <label key={model} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedPricing.includes(model) ? 'bg-brand-600 border-brand-600' : 'border-slate-300 bg-white'}`}>
                            {selectedPricing.includes(model) && <Check size={12} className="text-white" />}
                          </div>
                          <input 
                            type="checkbox" 
                            className="hidden"
                            checked={selectedPricing.includes(model)}
                            onChange={() => togglePricing(model)}
                          />
                          <span className="text-sm text-slate-700">{model}</span>
                        </label>
                      ))}
                      {selectedPricing.length > 0 && (
                        <div className="border-t border-slate-100 mt-2 pt-2">
                           <button 
                            onClick={() => setSelectedPricing([])}
                            className="w-full text-center text-xs text-rose-500 hover:text-rose-700 font-medium py-1"
                           >
                             Reset Pricing
                           </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Sort Select */}
                <div className="relative group">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest Added</option>
                    <option value="nameAsc">Name (A-Z)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <Filter size={14} />
                  </div>
                </div>

                {/* Active Filters Clear Button (Mobile/Desktop) */}
                {(selectedCategories.length > 0 || selectedPricing.length > 0 || searchQuery) && (
                   <button 
                    onClick={clearFilters}
                    className="flex items-center space-x-1 text-xs font-medium text-slate-500 hover:text-rose-600 px-2 py-1 rounded-md hover:bg-rose-50 transition-colors"
                   >
                     <X size={12} />
                     <span>Clear</span>
                   </button>
                )}
             </div>

             <div className="text-sm text-slate-500 hidden sm:block">
                Showing <span className="font-bold text-slate-900">{displayedTools.length}</span> results
             </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
            {/* Grid */}
            {displayedTools.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedTools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
                
                {/* Load More Button */}
                {hasMore && (
                  <div className="mt-16 flex justify-center">
                    <button 
                      onClick={handleLoadMore}
                      className="group relative inline-flex items-center justify-center px-8 py-3 font-semibold text-white transition-all duration-200 bg-slate-900 font-display rounded-full hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 active:scale-95"
                    >
                      Load More Tools
                      <ChevronDown size={18} className="ml-2 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-32">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-6">
                   <Filter size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No tools found</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-8">We couldn't find any tools matching your current filters. Try adjusting your search or categories.</p>
                <button 
                  onClick={clearFilters}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-brand-600 hover:bg-brand-700 transition-all"
                >
                  Clear all filters
                </button>
              </div>
            )}
      </div>
    </div>
  );
};

export default HomePage;