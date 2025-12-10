import React, { useState, useMemo, useEffect } from 'react';
import Hero from '../components/Hero';
import ToolCard from '../components/ToolCard';
import FilterSidebar from '../components/FilterSidebar';
import { getTools } from '../services/toolService';
import { PricingModel, SortOption } from '../types';
import { ChevronDown, SlidersHorizontal, X, PanelLeftClose, PanelLeftOpen, LayoutGrid, List, ChevronsUp, Search } from 'lucide-react';

const TOOLS_PER_PAGE = 12;

// Helper component for Table Icon with fallback
const TableToolIcon = ({ tool }: { tool: any }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-100 to-indigo-100 text-brand-700 flex items-center justify-center text-[10px] font-bold shrink-0 border border-brand-200">
        {tool.name.substring(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img 
      src={tool.imageUrl} 
      alt="" 
      className="w-8 h-8 object-contain rounded-lg bg-white border border-slate-100 shrink-0"
      onError={() => setError(true)}
    />
  );
};

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<PricingModel[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('popular');
  const [popularOnly, setPopularOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(TOOLS_PER_PAGE);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHeroOpen, setIsHeroOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isHeroOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <Hero 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          selectedPricing={selectedPricing}
          togglePricing={togglePricing}
        />
      </div>

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

          {/* Left Sidebar (Desktop) - Auto Toggle Nav */}
          <aside 
            className={`
              hidden lg:block flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar transition-all duration-300 ease-in-out
              ${isSidebarOpen ? 'w-72 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-4 overflow-hidden'}
            `}
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

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
             <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2">
                       {/* Sidebar Toggle Button */}
                       <button 
                         onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                         className="hidden lg:flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors bg-white border border-slate-200 shadow-sm"
                         title={isSidebarOpen ? "Collapse Filters" : "Expand Filters"}
                       >
                         {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                       </button>

                       {/* Hero Toggle Button */}
                       <button 
                         onClick={() => setIsHeroOpen(!isHeroOpen)}
                         className={`hidden lg:flex items-center justify-center p-2 rounded-lg transition-colors border shadow-sm ${!isHeroOpen ? 'bg-brand-50 text-brand-600 border-brand-200 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-200 hover:text-slate-900'}`}
                         title={isHeroOpen ? "Collapse Search Header" : "Expand Search Header"}
                       >
                         {isHeroOpen ? <ChevronsUp size={20} /> : <Search size={20} />}
                       </button>
                   </div>

                   <p className="text-slate-500 text-sm">
                     Showing <span className="font-bold text-slate-900">{displayedTools.length}</span> of {allFilteredTools.length} tools
                   </p>
                </div>

                {/* View Mode Toggle (Example of adding more controls) */}
                <div className="flex items-center gap-2">
                   {/* Active Filter Pills Summary */}
                   {(selectedCategories.length > 0) && (
                    <div className="hidden xl:flex gap-2 mr-4">
                       {selectedCategories.slice(0, 3).map(c => (
                         <span key={c} className="text-xs font-semibold bg-brand-50 text-brand-700 px-2 py-1 rounded-full border border-brand-100">
                           {c}
                         </span>
                       ))}
                       {selectedCategories.length > 3 && (
                         <span className="text-xs text-slate-400">+{selectedCategories.length - 3}</span>
                       )}
                    </div>
                   )}
                   
                   <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Grid View"
                      >
                        <LayoutGrid size={16} />
                      </button>
                      <button 
                        onClick={() => setViewMode('table')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Table View"
                      >
                        <List size={16} />
                      </button>
                   </div>
                </div>
             </div>

            {displayedTools.length > 0 ? (
              <>
                {viewMode === 'grid' ? (
                  <div className={`grid grid-cols-1 gap-6 transition-all duration-300 ${isSidebarOpen ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-3 xl:grid-cols-4'}`}>
                    {displayedTools.map(tool => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700 w-1/3">Tool Name</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Categories</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Pricing</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Link</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {displayedTools.map(tool => (
                             <tr key={tool.id} className="hover:bg-slate-50 transition-colors group">
                               <td className="px-6 py-4">
                                 <div className="flex items-center gap-3 font-medium text-slate-900">
                                   <TableToolIcon tool={tool} />
                                   {tool.name}
                                 </div>
                               </td>
                               <td className="px-6 py-4 text-slate-600">
                                 <div className="flex flex-wrap gap-1">
                                    {tool.categories.slice(0, 2).map(c => (
                                      <span key={c} className="inline-flex px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 border border-slate-200">
                                        {c}
                                      </span>
                                    ))}
                                 </div>
                               </td>
                               <td className="px-6 py-4">
                                 <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
                                   tool.pricing === 'Free' ? 'bg-emerald-100 text-emerald-800' : 
                                   tool.pricing === 'Paid' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                 }`}>
                                   {tool.pricing}
                                 </span>
                               </td>
                               <td className="px-6 py-4">
                                 <a href={tool.websiteUrl} target="_blank" rel="noreferrer" className="text-brand-600 hover:text-brand-800 font-bold hover:underline">
                                   Visit
                                 </a>
                               </td>
                             </tr>
                           ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
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