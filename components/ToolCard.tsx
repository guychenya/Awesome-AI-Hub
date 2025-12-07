import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Tag } from 'lucide-react';
import { Tool, PricingModel } from '../types';

const ToolCard: React.FC<{ tool: Tool }> = ({ tool }) => {
  const [imageError, setImageError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  const getPricingColor = (pricing: PricingModel) => {
    switch (pricing) {
      case PricingModel.Free: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case PricingModel.Freemium: return 'bg-amber-100 text-amber-700 border-amber-200';
      case PricingModel.Paid: return 'bg-rose-100 text-rose-700 border-rose-200';
      case PricingModel.FreeTrial: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Helper to determine parent domain fallback for common cases
  const getFallbackUrl = (currentUrl: string): string | null => {
    if (currentUrl.includes('adobe')) return 'https://logo.clearbit.com/adobe.com';
    if (currentUrl.includes('google')) return 'https://logo.clearbit.com/google.com';
    if (currentUrl.includes('microsoft')) return 'https://logo.clearbit.com/microsoft.com';
    if (currentUrl.includes('amazon')) return 'https://logo.clearbit.com/amazon.com';
    if (currentUrl.includes('meta') || currentUrl.includes('facebook')) return 'https://logo.clearbit.com/meta.com';
    return null;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!fallbackAttempted) {
      const fallback = getFallbackUrl(tool.imageUrl);
      if (fallback && fallback !== tool.imageUrl) {
        e.currentTarget.src = fallback;
        setFallbackAttempted(true);
      } else {
        setImageError(true);
      }
    } else {
      setImageError(true);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Generate a consistent pastel color based on name length
  const getGradientClass = (name: string) => {
    const gradients = [
      'from-blue-400 to-indigo-500',
      'from-emerald-400 to-teal-500',
      'from-orange-400 to-pink-500',
      'from-purple-400 to-fuchsia-500',
      'from-cyan-400 to-blue-500'
    ];
    const index = name.length % gradients.length;
    return gradients[index];
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-200 transition-all duration-300 flex flex-col h-full">
      <div className="h-32 bg-slate-50 border-b border-slate-100 relative flex items-center justify-center p-6">
         {!imageError ? (
           <img 
            src={tool.imageUrl} 
            alt={`${tool.name} logo`} 
            className="w-full h-full object-contain filter group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
            onError={handleImageError}
           />
         ) : (
           <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getGradientClass(tool.name)} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
             <span className="text-white font-display font-bold text-xl tracking-wider">
               {getInitials(tool.name)}
             </span>
           </div>
         )}
         <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPricingColor(tool.pricing)}`}>
              {tool.pricing}
            </span>
         </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-brand-600 transition-colors">
              {tool.name}
            </h3>
        </div>
        
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">
          {tool.description}
        </p>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {tool.categories.slice(0, 2).map((cat, i) => (
              <span key={i} className="inline-flex items-center text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                <Tag size={10} className="mr-1" />
                {cat}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <Link 
              to={`/tool/${tool.id}`}
              className="flex items-center justify-center py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
            >
              Details
            </Link>
            <a 
              href={tool.websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center py-2 text-sm font-semibold text-white bg-slate-900 rounded-full hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/20 transition-all active:scale-95"
            >
              Visit <ExternalLink size={14} className="ml-1.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolCard;