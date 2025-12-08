import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Tag } from 'lucide-react';
import { Tool, PricingModel } from '../types';

const ToolCard: React.FC<{ tool: Tool }> = ({ tool }) => {
  const [imageError, setImageError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);

  const getPricingColor = (pricing: PricingModel) => {
    switch (pricing) {
      case PricingModel.Free: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case PricingModel.Freemium: return 'bg-amber-100 text-amber-800 border-amber-200';
      case PricingModel.Paid: return 'bg-rose-100 text-rose-800 border-rose-200';
      case PricingModel.FreeTrial: return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

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
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

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
    <div className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-brand-500/10 hover:border-brand-200 transition-all duration-300 flex flex-col h-full relative">
      <div className="h-36 bg-slate-50/50 border-b border-slate-100 relative flex items-center justify-center p-8">
         {/* Background Decoration */}
         <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
         
         {!imageError ? (
           <img 
            src={tool.imageUrl} 
            alt={`${tool.name} logo`} 
            className="w-full h-full object-contain filter group-hover:scale-110 transition-transform duration-500 relative z-10"
            loading="lazy"
            onError={handleImageError}
           />
         ) : (
           <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getGradientClass(tool.name)} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform relative z-10`}>
             <span className="text-white font-display font-bold text-xl tracking-wider">
               {getInitials(tool.name)}
             </span>
           </div>
         )}
         <div className="absolute top-4 right-4 z-20">
            <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${getPricingColor(tool.pricing)}`}>
              {tool.pricing}
            </span>
         </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-2">
            <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-brand-600 transition-colors">
              {tool.name}
            </h3>
        </div>
        
        <p className="text-sm text-slate-500 line-clamp-3 mb-5 flex-grow leading-relaxed">
          {tool.description}
        </p>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {tool.categories.slice(0, 2).map((cat, i) => (
              <span key={i} className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 group-hover:border-brand-100 group-hover:bg-brand-50/50 transition-colors">
                <Tag size={10} className="mr-1.5 opacity-70" />
                {cat}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-5 border-t border-slate-100">
            <Link 
              to={`/tool/${tool.id}`}
              className="flex items-center justify-center py-2.5 text-xs font-bold uppercase tracking-wide text-slate-600 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
            >
              Details
            </Link>
            <a 
              href={tool.websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center py-2.5 text-xs font-bold uppercase tracking-wide text-white bg-slate-900 rounded-2xl hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/20 transition-all active:scale-95"
            >
              Visit <ExternalLink size={12} className="ml-1.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolCard;