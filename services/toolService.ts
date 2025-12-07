import { MOCK_TOOLS, CATEGORIES } from '../constants';
import { Tool, PricingModel, SortOption } from '../types';

interface FilterOptions {
  categories: string[];
  pricing: PricingModel[];
  searchQuery: string;
  sort: SortOption;
}

export const getTools = (options: FilterOptions): Tool[] => {
  let filtered = MOCK_TOOLS.filter(tool => {
    // Search Filter
    const query = options.searchQuery.toLowerCase();
    const matchesSearch = 
      tool.name.toLowerCase().includes(query) || 
      tool.description.toLowerCase().includes(query) ||
      tool.categories.some(c => c.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    // Category Filter
    if (options.categories.length > 0) {
      // Check if tool has at least one of the selected categories
      // Note: In real app, IDs should be mapped carefully. 
      // For this mock, we are checking if the category Name matches.
      // We need to map Category IDs to Names for comparison or adjust data structure.
      // Let's resolve ID to Name first.
      const selectedCategoryNames = CATEGORIES
        .filter(c => options.categories.includes(c.id))
        .map(c => c.name);
      
      const hasCategory = tool.categories.some(toolCat => 
        selectedCategoryNames.some(selCat => toolCat.includes(selCat))
      );
      if (!hasCategory) return false;
    }

    // Pricing Filter
    if (options.pricing.length > 0) {
      if (!options.pricing.includes(tool.pricing)) return false;
    }

    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    switch (options.sort) {
      case 'newest':
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      case 'nameAsc':
        return a.name.localeCompare(b.name);
      case 'nameDesc':
        return b.name.localeCompare(a.name);
      case 'popular':
      default:
        // Sort by popular flag first, then name
        if (a.popular === b.popular) return a.name.localeCompare(b.name);
        return a.popular ? -1 : 1;
    }
  });

  return filtered;
};

export const getToolById = (id: string): Tool | undefined => {
  return MOCK_TOOLS.find(t => t.id === id);
};

export const getRelatedTools = (tool: Tool): Tool[] => {
  return MOCK_TOOLS
    .filter(t => t.id !== tool.id && t.categories.some(c => tool.categories.includes(c)))
    .slice(0, 3);
};

export const getRecentTools = (): Tool[] => {
  return [...MOCK_TOOLS]
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, 4);
};
