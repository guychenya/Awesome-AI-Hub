import React from 'react';
import { Search, Sparkles } from 'lucide-react';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Hero: React.FC<HeroProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative bg-white border-b border-slate-200 overflow-hidden flex-shrink-0">
      {/* Abstract Background pattern */}
      <div className="absolute inset-0 bg-slate-50 pointer-events-none">
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

        <div className="max-w-xl mx-auto relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-full text-slate-900 shadow-xl shadow-slate-200/50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-slate-400 text-base"
            placeholder="Search AI tools (e.g., 'text generation', 'video editor')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Visual indicator for AI Chat */}
          <div className="absolute -bottom-8 right-0 text-xs text-slate-400 hidden md:block">
            Want smart recommendations? Toggle the <span className="font-semibold text-brand-600">AI Assistant</span> in the header.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;