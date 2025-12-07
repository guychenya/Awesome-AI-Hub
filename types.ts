export enum PricingModel {
  Free = 'Free',
  Freemium = 'Freemium',
  Paid = 'Paid',
  FreeTrial = 'Free Trial',
  Contact = 'Contact for Pricing',
  Deals = 'Active Deal'
}

export interface Category {
  id: string;
  name: string;
  subCategories?: string[];
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  longDescription?: string; // Markdown supported ideally, plain text for MVP
  websiteUrl: string;
  imageUrl: string;
  pricing: PricingModel;
  categories: string[];
  features: string[];
  addedAt: string; // ISO Date
  popular: boolean;
}

export type SortOption = 'newest' | 'popular' | 'nameAsc' | 'nameDesc';
