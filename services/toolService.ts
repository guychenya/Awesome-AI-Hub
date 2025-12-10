import { MOCK_TOOLS, CATEGORIES } from '../constants';
import { Tool, PricingModel, SortOption } from '../types';

interface FilterOptions {
  categories: string[];
  pricing: PricingModel[];
  searchQuery: string;
  sort: SortOption;
}

const STORAGE_KEY = 'seekcompass_user_tools';

// Helper to get local tools
const getLocalTools = (): Tool[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load local tools", e);
    return [];
  }
};

export const getTools = (options: FilterOptions): Tool[] => {
  const localTools = getLocalTools();
  const allTools = [...localTools, ...MOCK_TOOLS];

  let filtered = allTools.filter(tool => {
    // Search Filter
    const query = options.searchQuery.toLowerCase();
    const matchesSearch = 
      tool.name.toLowerCase().includes(query) || 
      tool.description.toLowerCase().includes(query) ||
      tool.categories.some(c => c.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    // Category Filter
    if (options.categories.length > 0) {
      // Resolve ID to Name for comparison
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
  const localTools = getLocalTools();
  const tool = localTools.find(t => t.id === id);
  if (tool) return tool;
  
  return MOCK_TOOLS.find(t => t.id === id);
};

export const getRelatedTools = (tool: Tool): Tool[] => {
  const localTools = getLocalTools();
  const allTools = [...localTools, ...MOCK_TOOLS];

  return allTools
    .filter(t => t.id !== tool.id && t.categories.some(c => tool.categories.includes(c)))
    .slice(0, 3);
};

export const getRecentTools = (): Tool[] => {
  const localTools = getLocalTools();
  const allTools = [...localTools, ...MOCK_TOOLS];

  return allTools
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, 4);
};

// Helper to save a new tool
export const saveToolLocally = (tool: Tool) => {
  const current = getLocalTools();
  const updated = [tool, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};