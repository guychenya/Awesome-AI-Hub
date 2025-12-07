import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPage: React.FC = () => {
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
              <Shield size={28} />
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Privacy Policy</h1>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600">
            <p>Last updated: {new Date().toLocaleDateString()}</p>

            <h3>1. Introduction</h3>
            <p>
              Welcome to Awesome AI Hub ("we," "our," or "us"). We respect your privacy and are committed to protecting it through our compliance with this policy. 
              This policy describes the types of information we may collect from you or that you may provide when you visit our website.
            </p>

            <h3>2. Information We Collect</h3>
            <p>
              We prioritize privacy. We do not require account registration to browse our directory. 
              If you choose to use our "Submit Tool" feature or interact with our AI Assistant, we may process:
            </p>
            <ul>
              <li>Information provided in forms (e.g., tool names, URLs).</li>
              <li>Chat logs with the AI Assistant (for session context only, not permanently stored).</li>
              <li>Usage data (e.g., pages visited) to improve the platform experience.</li>
            </ul>

            <h3>3. AI & Data Accuracy Disclaimer</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 my-6 text-amber-900 text-sm">
              <p className="font-bold mb-2">Important Notice Regarding AI Information</p>
              <p>
                This platform lists third-party Artificial Intelligence tools. Please be aware that:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                 <li><strong>Pricing Changes:</strong> "Free" or "Freemium" statuses change frequently. A tool listed as free today may be paid tomorrow. Always verify directly on the tool's website.</li>
                 <li><strong>AI Mistakes:</strong> Our AI Assistant is powered by Large Language Models which can hallucinate or provide incorrect information. Do not rely on it for legal, medical, or financial advice.</li>
                 <li><strong>Third-Party Links:</strong> We are not responsible for the privacy practices or content of the tools we list.</li>
              </ul>
            </div>

            <h3>4. How We Use Your Information</h3>
            <p>
              We use information that we collect about you or that you provide to us, including any personal information:
            </p>
            <ul>
              <li>To present our Website and its contents to you.</li>
              <li>To improve our directory accuracy.</li>
              <li>To fulfill any other purpose for which you provide it.</li>
            </ul>

            <h3>5. Contact Information</h3>
            <p>
              To ask questions or comment about this privacy policy and our privacy practices, please contact us via our LinkedIn profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;