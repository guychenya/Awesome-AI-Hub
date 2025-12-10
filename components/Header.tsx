import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Bot } from 'lucide-react';

interface HeaderProps {
  onToggleChat?: () => void;
  isChatOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleChat, isChatOpen }) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 transition-all duration-300 shadow-sm">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group mr-10">
            {/* Custom SVG Logo */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full transform transition-transform group-hover:scale-105 duration-300">
                <defs>
                  <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <path d="M20 4C11.1634 4 4 11.1634 4 20C4 28.8366 11.1634 36 20 36C28.8366 36 36 28.8366 36 20C36 11.1634 28.8366 4 20 4ZM20 10C21.6569 10 23 11.3431 23 13C23 14.6569 21.6569 16 20 16C18.3431 16 17 14.6569 17 13C17 11.3431 18.3431 10 20 10ZM12 21C10.3431 21 9 19.6569 9 18C9 16.3431 10.3431 15 12 15C13.6569 15 15 16.3431 15 18C15 19.6569 13.6569 21 12 21ZM28 21C26.3431 21 25 19.6569 25 18C25 16.3431 26.3431 15 28 15C29.6569 15 31 16.3431 31 18C31 19.6569 29.6569 21 28 21ZM20 30C18.3431 30 17 28.6569 17 27C17 25.3431 18.3431 24 20 24C21.6569 24 23 25.3431 23 27C23 28.6569 21.6569 30 20 30Z" fill="url(#logoGradient)" className="opacity-20"/>
                <circle cx="20" cy="13" r="3" fill="url(#logoGradient)" />
                <circle cx="12" cy="18" r="3" fill="url(#logoGradient)" />
                <circle cx="28" cy="18" r="3" fill="url(#logoGradient)" />
                <circle cx="20" cy="27" r="3" fill="url(#logoGradient)" />
                <path d="M20 13L12 18M20 13L28 18M12 18L20 27M28 18L20 27" stroke="url(#logoGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-slate-900 hidden sm:block">
                SeekCompass
            </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link to="/" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all">Discover</Link>
              <Link to="/data-sources" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all">Data</Link>
              <a href="https://github.com/tankvn/awesome-ai-tools" target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all">GitHub</a>
            </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
             <Link 
               to="/submit"
               className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
             >
               Submit Tool
             </Link>

             {/* Premium AI Toggle Button */}
             <button
               onClick={onToggleChat}
               className={`
                 relative overflow-hidden group flex items-center justify-center px-1 py-1 rounded-full transition-all duration-300
                 ${isChatOpen 
                   ? 'ring-4 ring-brand-100' 
                   : ''}
               `}
             >
                <div className={`
                  flex items-center space-x-2 px-6 py-2.5 rounded-full transition-all duration-300
                  ${isChatOpen 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:shadow-brand-500/25'}
                `}>
                  {isChatOpen ? (
                     <Sparkles size={18} className="animate-pulse text-brand-300" />
                  ) : (
                     <Bot size={20} className="group-hover:rotate-12 transition-transform" />
                  )}
                  <span className="font-bold text-sm tracking-wide">
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