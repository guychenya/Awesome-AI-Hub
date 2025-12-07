import React, { useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ToolDetailPage from './pages/ToolDetailPage';
import SubmitToolPage from './pages/SubmitToolPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import DataSourcesPage from './pages/DataSourcesPage';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatSidebar from './components/ChatSidebar';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    const mainContainer = document.getElementById('main-content');
    if (mainContainer) {
      mainContainer.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <HashRouter>
      <ScrollToTop />
      <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
        <Header 
          isChatOpen={isChatOpen} 
          onToggleChat={() => setIsChatOpen(!isChatOpen)} 
        />
        
        <div className="flex flex-1 pt-16 overflow-hidden relative">
          {/* Main Content Area */}
          <main 
            id="main-content"
            className="flex-1 overflow-y-auto scroll-smooth transition-all duration-300 ease-in-out"
          >
            <div className="min-h-full flex flex-col">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tool/:id" element={<ToolDetailPage />} />
                <Route path="/submit" element={<SubmitToolPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/data-sources" element={<DataSourcesPage />} />
              </Routes>
              <Footer />
            </div>
          </main>

          {/* AI Sidebar - Integrated Split View */}
          <ChatSidebar 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
          />
        </div>
      </div>
    </HashRouter>
  );
};

export default App;