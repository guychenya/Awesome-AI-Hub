import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Search, Bot } from 'lucide-react';

interface HeaderProps {
  onToggleChat?: () => void;
  isChatOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleChat, isChatOpen }) => {
  const location = useLocation();

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group mr-8">
            <div className="p-2 bg-brand-600 rounded-lg text-white group-hover:bg-brand-700 transition-colors">
                <Sparkles size={20} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-slate-900 hidden sm:block">
                Awesome AI Hub
            </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Discover</Link>
            <Link to="/data-sources" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Data Sources</Link>
            <a href="https://github.com/tankvn/awesome-ai-tools" target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">GitHub</a>
            </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
             <Link 
               to="/submit"
               className="hidden sm:block text-xs font-semibold px-4 py-2 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-all mr-2"
             >
               Submit Tool
             </Link>

             {/* AI Toggle Button */}
             <button
               onClick={onToggleChat}
               className={`
                 flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200
                 ${isChatOpen 
                   ? 'bg-brand-50 border-brand-200 text-brand-700' 
                   : 'bg-white border-slate-200 text-slate-600 hover:border-brand-200 hover:text-brand-600'}
               `}
             >
                <Bot size={18} />
                <span className="text-sm font-medium hidden sm:inline">AI Assistant</span>
             </button>
        </div>
      </div>
    </header>
  );
};

export default Header;