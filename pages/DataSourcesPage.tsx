import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Database, Github } from 'lucide-react';

const DataSourcesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-brand-600 transition-colors mb-8">
          <ArrowLeft size={16} className="mr-2" />
          Back to Hub
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
           <div className="flex items-center space-x-3 mb-8 border-b border-slate-100 pb-6">
            <div className="p-3 bg-brand-50 rounded-xl text-brand-600">
              <Database size={28} />
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Data Sources</h1>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600">
            <h3>Primary Source</h3>
            <p>
              The core dataset for Awesome AI Hub is adapted from the open-source community effort hosted on GitHub:
            </p>
            
            <a 
              href="https://github.com/tankvn/awesome-ai-tools" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center p-4 border border-slate-200 rounded-xl hover:border-brand-300 hover:bg-brand-50 hover:shadow-md transition-all group no-underline"
            >
              <Github size={32} className="text-slate-800 group-hover:text-brand-600 transition-colors" />
              <div className="ml-4">
                <span className="block font-bold text-slate-900 group-hover:text-brand-700">tankvn/awesome-ai-tools</span>
                <span className="text-sm text-slate-500">A curated list of Artificial Intelligence Top Tools.</span>
              </div>
            </a>

            <h3 className="mt-8">Enrichment</h3>
            <p>
              While the list provides the foundation, we enrich the data to provide a better user experience:
            </p>
            <ul>
              <li><strong>Logos:</strong> Sourced via Clearbit Logo API based on tool domains.</li>
              <li><strong>Categorization:</strong> Tools are tagged with consistent taxonomy for better filtering.</li>
              <li><strong>Pricing Info:</strong> Manually verified or crowd-sourced pricing models (Free, Freemium, Paid).</li>
            </ul>

            <h3 className="mt-8">Verification & Updates</h3>
            <p>
              The AI landscape moves fast. While we strive to sync with the repository and verify user submissions, some data points (especially pricing and feature availability) may become outdated.
            </p>
            <p>
              We encourage the community to:
            </p>
            <ul>
               <li>Use the "Submit Tool" page to suggest corrections.</li>
               <li>Contribute directly to the upstream GitHub repository.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourcesPage;