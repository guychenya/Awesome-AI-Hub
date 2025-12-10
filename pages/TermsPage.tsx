import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, AlertTriangle } from 'lucide-react';

const TermsPage: React.FC = () => {
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
              <FileText size={28} />
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Terms of Service</h1>
          </div>

          <div className="prose prose-slate max-w-none text-slate-600">
            <p>Last updated: {new Date().toLocaleDateString()}</p>

            <h3>1. Acceptance of Terms</h3>
            <p>
              By accessing and using SeekCompass, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h3>2. Use License</h3>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on SeekCompass's website for personal, non-commercial transitory viewing only.
            </p>

            <h3>3. Disclaimer of Warranties</h3>
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 my-6">
               <div className="flex items-center gap-2 text-rose-600 mb-2 font-bold">
                 <AlertTriangle size={20} />
                 <span>Critical Disclaimer</span>
               </div>
               <p className="text-sm">
                 The materials on SeekCompass are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
               </p>
               <p className="text-sm mt-3">
                 <strong>AI Accuracy:</strong> Information regarding AI tools, including but not limited to pricing, features, and capabilities, is subject to change without notice. AI models (including our Assistant) may generate incorrect information ("hallucinations"). Verification of all output is the user's responsibility.
               </p>
            </div>

            <h3>4. Limitations</h3>
            <p>
              In no event shall SeekCompass or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on SeekCompass's website.
            </p>

            <h3>5. Revisions and Errata</h3>
            <p>
              The materials appearing on SeekCompass's website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its website are accurate, complete, or current. We may make changes to the materials contained on its website at any time without notice.
            </p>

            <h3>6. Links</h3>
            <p>
              SeekCompass has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by SeekCompass of the site. Use of any such linked website is at the user's own risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;