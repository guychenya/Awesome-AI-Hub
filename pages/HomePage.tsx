import React, { useState, useMemo, useEffect } from 'react';
import Hero from '../components/Hero';
import ToolCard from '../components/ToolCard';
import FilterSidebar from '../components/FilterSidebar';
import { getTools } from '../services/toolService';
import { PricingModel, SortOption } from '../types';
import { ChevronDown, SlidersHorizontal, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const TOOLS_PER_PAGE = 12;

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<PricingModel[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('popular');
  const [popularOnly, setPopularOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(TOOLS_PER_PAGE);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Derive all filtered tools
  const allFilteredTools = useMemo(() => {
    let tools = getTools({
      searchQuery,
      categories: selectedCategories,
      pricing: selectedPricing,
      sort: sortOption
    });
    
    if (popularOnly) {
      tools = tools.filter(t => t.popular);
    }
    
    return tools;
  }, [searchQuery, selectedCategories, selectedPricing, sortOption, popularOnly]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(TOOLS_PER_PAGE);
  }, [searchQuery, selectedCategories, selectedPricing, sortOption, popularOnly]);

  // Slice for display
  const displayedTools = allFilteredTools.slice(0, visibleCount);
  const hasMore = visibleCount < allFilteredTools.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + TOOLS_PER_PAGE);
  };

  const toggleCategory = (id: string) => {
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
    setPopularOnly(false);
  };

  return (
    <div className="min-h-full bg-slate-50">
      <Hero 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
        selectedPricing={selectedPricing}
        togglePricing={togglePricing}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 transition-all">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
             <button 
               onClick={() => setShowMobileFilters(true)}
               className="w-full flex items-center justify-center space-x-2 bg-white border border-slate-200 p-3 rounded-xl font-bold text-slate-700 shadow-sm"
             >
               <SlidersHorizontal size={18} />
               <span>Filters & Sort</span>
             </button>
          </div>

          {/* Left Sidebar (Desktop) */}
          <aside 
            className={`hidden lg:block flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-72 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-4 overflow-hidden'}`}
          >
            <FilterSidebar 
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
              selectedPricing={selectedPricing}
              togglePricing={togglePricing}
              sortOption={sortOption}
              setSortOption={setSortOption}
              popularOnly={popularOnly}
              togglePopular={() => setPopularOnly(!popularOnly)}
              onClearAll={clearFilters}
            />
          </aside>

          {/* Mobile Filter Drawer */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}></div>
              <div className="absolute inset-y-0 left-0 w-80 bg-white shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-left duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold font-display text-slate-900">Filters</h3>
                  <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                    <X size={20} />
                  </button>
                </div>
                <FilterSidebar 
                  selectedCategories={selectedCategories}
                  toggleCategory={toggleCategory}
                  selectedPricing={selectedPricing}
                  togglePricing={togglePricing}
                  sortOption={sortOption}
                  setSortOption={setSortOption}
                  popularOnly={popularOnly}
                  togglePopular={() => setPopularOnly(!popularOnly)}
                  onClearAll={clearFilters}
                />
              </div>
            </div>
          )}

          {/* Main Grid Content */}
          <div className="flex-1 min-w-0">
             <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   {/* Sidebar Toggle Button */}
                   <button 
                     onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                     className="hidden lg:flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                     title={isSidebarOpen ? "Collapse Filters" : "Expand Filters"}
                   >
                     {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                   </button>

                   <p className="text-slate-500 text-sm">
                     Showing <span className="font-bold text-slate-900">{displayedTools.length}</span> of {allFilteredTools.length} tools
                   </p>
                </div>

                {/* Active Filter Pills (Optional summary) */}
                {(selectedCategories.length > 0) && (
                  <div className="hidden sm:flex gap-2">
                     {selectedCategories.slice(0, 3).map(c => (
                       <span key={c} className="text-xs font-semibold bg-brand-50 text-brand-700 px-2 py-1 rounded-full border border-brand-100">
                         {c}
                       </span>
                     ))}
                     {selectedCategories.length > 3 && (
                       <span className="text-xs text-slate-400">+{selectedCategories.length - 3} more</span>
                     )}
                  </div>
                )}
             </div>

            {displayedTools.length > 0 ? (
              <>
                <div className={`grid grid-cols-1 gap-6 transition-all duration-300 ${isSidebarOpen ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-3 xl:grid-cols-4'}`}>
                  {displayedTools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
                
                {hasMore && (
                  <div className="mt-16 flex justify-center">
                    <button 
                      onClick={handleLoadMore}
                      className="group relative inline-flex items-center justify-center px-8 py-3.5 font-bold text-white transition-all duration-200 bg-slate-900 font-display rounded-full hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 active:scale-95"
                    >
                      Load More Tools
                      <ChevronDown size={18} className="ml-2 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-32 bg-white rounded-3xl border border-slate-200 border-dashed">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 mb-6">
                   <SlidersHorizontal size={32} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No tools found</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-8">We couldn't find any tools matching your current filters. Try adjusting your search or categories.</p>
                <button 
                  onClick={clearFilters}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-bold rounded-full shadow-sm text-white bg-brand-600 hover:bg-brand-700 transition-all"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;