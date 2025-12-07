import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Bot } from 'lucide-react';

interface HeaderProps {
  onToggleChat?: () => void;
  isChatOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleChat, isChatOpen }) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group mr-8">
            {/* Custom SVG Logo */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full transform transition-transform group-hover:scale-110 duration-300">
                <defs>
                  <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
                <path d="M20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35C28.2843 35 35 28.2843 35 20C35 11.7157 28.2843 5 20 5ZM20 12C21.6569 12 23 13.3431 23 15C23 16.6569 21.6569 18 20 18C18.3431 18 17 16.6569 17 15C17 13.3431 18.3431 12 20 12ZM13 22C11.3431 22 10 20.6569 10 19C10 17.3431 11.3431 16 13 16C14.6569 16 16 17.3431 16 19C16 20.6569 14.6569 22 13 22ZM27 22C25.3431 22 24 20.6569 24 19C24 17.3431 25.3431 16 27 16C28.6569 16 30 17.3431 30 19C30 20.6569 28.6569 22 27 22ZM20 28C18.3431 28 17 26.6569 17 25C17 23.3431 18.3431 22 20 22C21.6569 22 23 23.3431 23 25C23 26.6569 21.6569 28 20 28Z" fill="url(#logoGradient)" fillOpacity="0.2"/>
                <circle cx="20" cy="15" r="3" fill="url(#logoGradient)" />
                <circle cx="13" cy="19" r="3" fill="url(#logoGradient)" />
                <circle cx="27" cy="19" r="3" fill="url(#logoGradient)" />
                <circle cx="20" cy="25" r="3" fill="url(#logoGradient)" />
                <path d="M20 15L13 19M20 15L27 19M13 19L20 25M27 19L20 25" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
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
               className="hidden sm:block text-xs font-semibold px-4 py-2.5 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-all mr-2"
             >
               Submit Tool
             </Link>

             {/* AI Toggle Button */}
             <button
               onClick={onToggleChat}
               className={`
                 relative group flex items-center space-x-2 px-5 py-2.5 rounded-full border transition-all duration-300
                 ${isChatOpen 
                   ? 'bg-gradient-to-r from-brand-50 to-indigo-50 border-brand-200 text-brand-700 shadow-inner' 
                   : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300 hover:shadow-md hover:shadow-brand-500/10'}
               `}
             >
                {/* Animated gradient border on hover (optional enhancement usually done with pseudo elements, keeping simple here) */}
                <div className={`flex items-center space-x-2 relative z-10`}>
                  {isChatOpen ? (
                     <Sparkles size={18} className="text-brand-600 animate-pulse" />
                  ) : (
                     <Bot size={18} className="group-hover:text-brand-600 transition-colors" />
                  )}
                  <span className={`text-sm font-semibold hidden sm:inline ${isChatOpen ? 'text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600' : ''}`}>
                    AI Assistant
                  </span>
                </div>
             </button>
        </div>
      </div>
    </header>
  );
};

export default Header;