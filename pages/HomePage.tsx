import React, { useState, useMemo } from 'react';
import Hero from '../components/Hero';
import ToolCard from '../components/ToolCard';
import FilterSidebar from '../components/FilterSidebar';
import { getTools } from '../services/toolService';
import { PricingModel, SortOption } from '../types';
import { SlidersHorizontal, ChevronDown, Loader2 } from 'lucide-react';

const TOOLS_PER_PAGE = 12;

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<PricingModel[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('popular');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(TOOLS_PER_PAGE);

  // Derive all filtered tools
  const allFilteredTools = useMemo(() => getTools({
    searchQuery,
    categories: selectedCategories,
    pricing: selectedPricing,
    sort: sortOption
  }), [searchQuery, selectedCategories, selectedPricing, sortOption]);

  // Reset visible count when filters change
  React.useEffect(() => {
    setVisibleCount(TOOLS_PER_PAGE);
  }, [searchQuery, selectedCategories, selectedPricing, sortOption]);

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

  return (
    <div className="min-h-full bg-slate-50">
      <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-4">
              <FilterSidebar 
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
                selectedPricing={selectedPricing}
                togglePricing={togglePricing}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-grow">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <div className="text-slate-600 font-medium">
                Showing <span className="text-slate-900 font-bold">{displayedTools.length}</span> of {allFilteredTools.length} tools
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                 {/* Mobile Filter Toggle */}
                <button 
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                  className="lg:hidden flex items-center justify-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex-1 sm:flex-none"
                >
                  <SlidersHorizontal size={16} className="mr-2" />
                  Filters
                </button>

                {/* Sort Dropdown */}
                <div className="relative group flex-1 sm:flex-none">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="w-full sm:w-48 appearance-none bg-white border border-slate-300 text-slate-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-brand-500 cursor-pointer text-sm font-medium"
                  >
                    <option value="popular">Popularity</option>
                    <option value="newest">Newest Added</option>
                    <option value="nameAsc">Name (A-Z)</option>
                    <option value="nameDesc">Name (Z-A)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Filter Panel */}
            {isMobileFilterOpen && (
              <div className="lg:hidden mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                 <FilterSidebar 
                  selectedCategories={selectedCategories}
                  toggleCategory={toggleCategory}
                  selectedPricing={selectedPricing}
                  togglePricing={togglePricing}
                />
              </div>
            )}

            {/* Grid */}
            {displayedTools.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayedTools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
                
                {/* Load More Button */}
                {hasMore && (
                  <div className="mt-12 flex justify-center">
                    <button 
                      onClick={handleLoadMore}
                      className="group flex items-center px-8 py-3 bg-white border border-slate-200 text-slate-900 font-semibold rounded-full shadow-sm hover:shadow-md hover:border-brand-300 hover:text-brand-600 transition-all duration-300"
                    >
                      Load More Tools
                      <ChevronDown size={16} className="ml-2 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed">
                <p className="text-slate-400 text-lg">No tools found matching your criteria.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategories([]);
                    setSelectedPricing([]);
                  }}
                  className="mt-4 text-brand-600 font-medium hover:underline"
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