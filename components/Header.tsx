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
            {/* Custom SVG Logo - SeekCompass Premium Design */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full transform transition-transform group-hover:rotate-12 duration-700 ease-out">
                <defs>
                  <linearGradient id="premiumGradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6366f1" /> {/* Indigo */}
                    <stop offset="50%" stopColor="#8b5cf6" /> {/* Violet */}
                    <stop offset="100%" stopColor="#d946ef" /> {/* Fuchsia */}
                  </linearGradient>
                  <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feComposite in="coloredBlur" in2="SourceAlpha" operator="in" result="glow"/>
                    <feMerge>
                      <feMergeNode in="glow"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Abstract Navigation Rings */}
                <circle cx="24" cy="24" r="20" stroke="url(#premiumGradient)" strokeWidth="1.5" strokeOpacity="0.15" />
                <path d="M24 4V8M24 40V44M4 24H8M40 24H44" stroke="url(#premiumGradient)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.3" />

                {/* Main Compass Star */}
                <path 
                  d="M24 6L29 19L42 24L29 29L24 42L19 29L6 24L19 19L24 6Z" 
                  fill="url(#premiumGradient)" 
                  filter="url(#softGlow)"
                  className="drop-shadow-sm"
                />
                
                {/* Inner White Core */}
                <path d="M24 16L26 22L32 24L26 26L24 32L22 26L16 24L22 22L24 16Z" fill="white" fillOpacity="0.95" />
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