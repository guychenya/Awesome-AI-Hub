import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Check, Share2, Tag, Calendar, Globe } from 'lucide-react';
import { getToolById, getRelatedTools } from '../services/toolService';
import ToolCard from '../components/ToolCard';

const ToolDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const tool = id ? getToolById(id) : undefined;
  const [isCopied, setIsCopied] = useState(false);
  
  // Use related tools or empty array if tool not found
  const relatedTools = tool ? getRelatedTools(tool) : [];

  const handleShare = async () => {
    if (!tool) return;

    const shareData = {
      title: tool.name,
      text: `Check out ${tool.name} on SeekCompass: ${tool.description}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error("Sharing failed:", error);
      }
    } else {
      // Fallback to clipboard for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy URL:", error);
        alert("Could not copy URL to clipboard.");
      }
    }
  };


  if (!tool) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Tool not found</h2>
        <Link to="/" className="text-brand-600 hover:underline mt-4 inline-block">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Header/Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
           <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-brand-600 transition-colors mb-6">
             <ArrowLeft size={16} className="mr-2" />
             Back to Browse
           </Link>
           
           <div className="flex flex-col md:flex-row md:items-start gap-8">
              {/* Logo/Image */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-white flex-shrink-0 border border-slate-200 shadow-sm p-4 flex items-center justify-center">
                <img src={tool.imageUrl} alt={tool.name} className="max-w-full max-h-full object-contain" />
              </div>

              {/* Title & Main Actions */}
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
                      {tool.name}
                    </h1>
                    <div className="flex flex-wrap gap-3 items-center">
                       {tool.categories.map((cat) => (
                         <span key={cat} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                           {cat}
                         </span>
                       ))}
                       <span className="text-slate-300">|</span>
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${tool.pricing === 'Free' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {tool.pricing}
                       </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={handleShare}
                      className={`p-2.5 rounded-lg border transition-colors duration-200 ${isCopied ? 'bg-emerald-50 text-emerald-600 border-emerald-300' : 'border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-brand-600'}`}
                      title="Share"
                    >
                      {isCopied ? <Check size={20} /> : <Share2 size={20} />}
                    </button>
                    <a 
                      href={tool.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm hover:shadow md:w-auto w-full"
                    >
                      Visit Website
                      <ExternalLink size={16} className="ml-2" />
                    </a>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About {tool.name}</h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                <p>{tool.longDescription || tool.description}</p>
              </div>
            </section>

            {/* Features */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tool.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-brand-50 text-brand-600">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    </div>
                    <p className="ml-3 text-sm text-slate-600 font-medium">{feature}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Tool Details</h3>
              <div className="space-y-4">
                 <div className="flex items-center text-sm text-slate-600">
                    <Globe size={18} className="mr-3 text-slate-400" />
                    <span className="truncate">{new URL(tool.websiteUrl).hostname}</span>
                 </div>
                 <div className="flex items-center text-sm text-slate-600">
                    <Tag size={18} className="mr-3 text-slate-400" />
                    <span>{tool.categories[0]}</span>
                 </div>
                 <div className="flex items-center text-sm text-slate-600">
                    <Calendar size={18} className="mr-3 text-slate-400" />
                    <span>Added {new Date(tool.addedAt).toLocaleDateString()}</span>
                 </div>
              </div>
            </div>
            
            {/* CTA Box */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
               <h3 className="font-bold text-lg mb-2">Ready to try it?</h3>
               <p className="text-slate-300 text-sm mb-6">Visit the official website to get started with {tool.name}.</p>
               <a 
                 href={tool.websiteUrl}
                 target="_blank"
                 rel="noreferrer"
                 className="block w-full py-3 bg-white text-slate-900 text-center font-bold rounded-lg hover:bg-brand-50 transition-colors"
               >
                 Go to {tool.name}
               </a>
            </div>
          </div>

        </div>

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <div className="mt-16 border-t border-slate-200 pt-12">
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-8">Related Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedTools.map(t => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ToolDetailPage;