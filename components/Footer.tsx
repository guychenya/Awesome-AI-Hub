import React from 'react';
import { Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <div className="flex flex-col items-center md:items-start mb-4 md:mb-0 space-y-2">
             <p className="font-semibold text-slate-700">© 2025 Awesome AI Hub.</p>
             <p className="flex items-center text-xs text-slate-400">
               Adapted from the <a href="https://github.com/tankvn/awesome-ai-tools" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-brand-600 mx-1 font-medium transition-colors">awesome-ai-tools</a> repository.
             </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end space-y-3">
             <div className="flex items-center space-x-1 px-4 py-2 bg-brand-50 rounded-full border border-brand-100 text-brand-700 shadow-sm">
                <span className="text-xs font-semibold">Built with ❤️ by</span>
                <a 
                  href="https://www.linkedin.com/in/guychenya/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center font-bold hover:underline ml-1"
                >
                  Guy Chenya
                  <Linkedin size={12} className="ml-1" />
                </a>
             </div>
             
             <div className="flex space-x-6 text-xs font-medium">
                <Link to="/privacy" className="hover:text-brand-600 transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-brand-600 transition-colors">Terms of Service</Link>
                <Link to="/data-sources" className="hover:text-brand-600 transition-colors">Data Sources</Link>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;