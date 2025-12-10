import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UploadCloud, CheckCircle, Info, Sparkles, X, Loader2, Mail, ExternalLink, Bot } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { CATEGORIES } from '../constants';
import { PricingModel } from '../types';

const SubmitToolPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    category: CATEGORIES[0].id,
    pricing: PricingModel.Freemium,
    logoUrl: '',
    tags: ''
  });

  // Free Text Parsing State
  const [freeText, setFreeText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);


  // AI Generation State
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Construct Email Body for Admin
    const subject = encodeURIComponent(`New Tool Submission: ${formData.name}`);
    const body = encodeURIComponent(`
Hi SeekCompass Admin,

I would like to submit a new tool for review.

--- TOOL DETAILS ---
Name: ${formData.name}
Website: ${formData.url}
Category: ${CATEGORIES.find(c => c.id === formData.category)?.name || formData.category}
Pricing: ${formData.pricing}
Tags: ${formData.tags}

Description:
${formData.description}

Logo: ${generatedLogo ? 'AI Generated (See Attached or Context)' : (formData.logoUrl || 'None provided')}

---------------------
Please review and add to the directory.
    `);

    // 2. Open Email Client
    window.location.href = `mailto:admin@seekcompass.com?subject=${subject}&body=${body}`;

    // 3. Show Success State
    setTimeout(() => {
      setSubmitted(true);
      window.scrollTo(0, 0);
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleParseText = async () => {
    if (!freeText.trim()) {
        setParseError("Please paste some text to parse.");
        return;
    }
    setIsParsing(true);
    setParseError(null);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const validCategories = CATEGORIES.map(c => c.name).join(', ');
        const validPricing = Object.values(PricingModel).join(', ');

        const prompt = `
          You are an expert data extraction assistant. Your task is to parse the user's text and extract information about an AI tool.
          
          Valid Categories: ${validCategories}
          Valid Pricing Models: ${validPricing}

          Analyze the following text and return a JSON object that matches the specified schema. 
          For the 'category' field, choose the *best single match* from the valid categories list.
          For the 'pricing' field, choose the *best single match* from the valid pricing models list. If no pricing is mentioned, default to 'Freemium'.

          User Text:
          ---
          ${freeText}
          ---
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        url: { type: Type.STRING },
                        description: { type: Type.STRING },
                        category: { type: Type.STRING },
                        pricing: { type: Type.STRING },
                        tags: { type: Type.STRING, description: "Comma-separated keywords" }
                    },
                    required: ["name", "url", "description", "category", "pricing"]
                }
            }
        });

        const parsedData = JSON.parse(response.text);

        // Find the category ID from the returned name
        const foundCategory = CATEGORIES.find(c => c.name.toLowerCase() === parsedData.category?.toLowerCase());
        
        // Find the correct pricing model enum value
        const foundPricing = Object.values(PricingModel).find(p => p.toLowerCase() === parsedData.pricing?.toLowerCase());

        setFormData({
            name: parsedData.name || '',
            url: parsedData.url || '',
            description: parsedData.description || '',
            category: foundCategory?.id || CATEGORIES[0].id,
            pricing: (foundPricing || PricingModel.Freemium) as PricingModel,
            tags: parsedData.tags || '',
            logoUrl: '' // Reset logo URL
        });

        setFreeText(''); // Clear textarea after successful parse

    } catch (e: any) {
        console.error("Parsing failed", e);
        setParseError("Failed to parse text. Please check the format or try again.");
    } finally {
        setIsParsing(false);
    }
  };

  const handleGenerateLogo = async () => {
    if (!formData.name || !formData.description) {
        setGenError("Please enter a Tool Name and Description first.");
        return;
    }

    setIsGeneratingLogo(true);
    setGenError(null);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ 
                    text: `Design a high-quality, modern, minimalist, vector-style app icon/logo for an AI tool named "${formData.name}". 
                    Tool Description: "${formData.description}". 
                    Style: Flat design, solid colors, professional, white background. 
                    Ensure the design is centered and looks like a startup logo.` 
                }]
            }
        });

        const candidate = response.candidates?.[0];
        let foundImage = false;
        if (candidate?.content?.parts) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    setGeneratedLogo(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                    setFormData(prev => ({ ...prev, logoUrl: '' })); // Clear manual URL if user had one
                    foundImage = true;
                    break;
                }
            }
        }
        
        if (!foundImage) {
            setGenError("The model didn't return an image. Please try again.");
        }

    } catch (e: any) {
        console.error("Logo generation failed", e);
        setGenError("Failed to generate logo. Ensure API Key is valid.");
    } finally {
        setIsGeneratingLogo(false);
    }
  };

  const handleRemoveGenerated = () => {
      setGeneratedLogo(null);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 max-w-lg w-full text-center space-y-6 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Mail size={40} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900 font-display">Draft Created!</h2>
            <p className="text-slate-600 text-lg">
              Your submission draft has been opened in your email client.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-3">
             <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">What happens next?</h4>
             <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
               <li><span className="font-semibold">Send Email:</span> Hit "Send" in your email app to notify our admins.</li>
               <li><span className="font-semibold">Review:</span> We verify the tool for safety and quality (24-48h).</li>
               <li><span className="font-semibold">Live:</span> Once approved, <strong>{formData.name}</strong> will appear in the directory.</li>
             </ol>
          </div>

          <div className="pt-4 space-y-3">
            <Link to="/" className="inline-flex items-center justify-center w-full px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
              Return to Discovery
            </Link>
            <button 
              onClick={() => { 
                setSubmitted(false); 
                setFormData({ name: '', url: '', description: '', category: CATEGORIES[0].id, pricing: PricingModel.Freemium, logoUrl: '', tags: '' }); 
                setGeneratedLogo(null);
              }}
              className="block w-full text-sm text-slate-500 hover:text-brand-600 font-medium py-2"
            >
              Submit another tool
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-brand-600 transition-colors mb-8">
          <ArrowLeft size={16} className="mr-2" />
          Back to Hub
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-brand-600 p-8 text-white relative overflow-hidden">
            {/* Abstract Background pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            
            <div className="flex items-center gap-3 mb-4 relative z-10">
               <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                 <UploadCloud size={24} />
               </div>
               <h1 className="text-2xl font-bold font-display">Submit a Tool</h1>
            </div>
            <p className="text-brand-100 relative z-10">
              Found an amazing AI tool that's missing? Help us grow the database by filling out the details below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* AI Parsing Section */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 flex-shrink-0">
                  <Bot size={16} />
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-900">Parse with AI (Beta)</h3>
                    <p className="text-xs text-slate-500">Paste tool info below and let AI fill the form.</p>
                </div>
              </div>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder={`* Tool Name: MindSpark AI\n* Category: Text & Writing\n* Price: Freemium...`}
              />
              <button
                type="button"
                onClick={handleParseText}
                disabled={isParsing || !freeText.trim()}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 whitespace-nowrap"
              >
                {isParsing ? <Loader2 size={16} className="animate-spin mr-2"/> : <Sparkles size={16} className="mr-2" />}
                {isParsing ? 'Extracting...' : 'Parse & Fill Form'}
              </button>
              {parseError && (
                 <p className="text-xs text-rose-500 mt-2 flex items-center font-medium">
                    <Info size={12} className="mr-1" /> {parseError}
                 </p>
              )}
            </div>


            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">1. Tool Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Tool Name <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. ChatGPT"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-1">Website URL <span className="text-rose-500">*</span></label>
                  <input 
                    type="url" 
                    id="url" 
                    name="url" 
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                    placeholder="https://..."
                    value={formData.url}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-rose-500">*</span></label>
                <textarea 
                  id="description" 
                  name="description" 
                  required
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Briefly describe what the tool does..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="logoUrl" className="block text-sm font-medium text-slate-700 mb-1">Logo URL (Optional)</label>
                
                {!generatedLogo ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input 
                            type="url" 
                            id="logoUrl" 
                            name="logoUrl" 
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                            placeholder="https://.../logo.png"
                            value={formData.logoUrl}
                            onChange={handleChange}
                            disabled={isGeneratingLogo}
                        />
                        <button
                            type="button"
                            onClick={handleGenerateLogo}
                            disabled={isGeneratingLogo || (!formData.name && !formData.description)}
                            className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 whitespace-nowrap"
                            title={(!formData.name || !formData.description) ? "Enter Name and Description first" : "Generate Logo"}
                        >
                            {isGeneratingLogo ? <Loader2 size={16} className="animate-spin mr-2"/> : <Sparkles size={16} className="mr-2" />}
                            {isGeneratingLogo ? 'Designing...' : 'Generate with AI'}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 p-3 border border-brand-200 bg-brand-50 rounded-xl animate-in fade-in zoom-in-50">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-brand-100 bg-white shadow-sm flex-shrink-0 relative">
                             {/* Transparent checkerboard background simulation */}
                             <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:8px_8px]"></div>
                             <img src={generatedLogo} alt="Generated Logo" className="w-full h-full object-contain relative z-10" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-brand-900">AI Generated Logo</p>
                            <p className="text-xs text-brand-700 truncate">Created by Gemini</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemoveGenerated}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove and use URL"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}
                
                {genError && (
                    <p className="text-xs text-rose-500 mt-2 flex items-center font-medium">
                        <Info size={12} className="mr-1" /> {genError}
                    </p>
                )}
                
                {!generatedLogo && (
                    <p className="text-xs text-slate-500 mt-1">
                        Paste a direct link to a PNG/JPG, or let our AI design a custom logo for you.
                    </p>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">2. Classification</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Primary Category <span className="text-rose-500">*</span></label>
                  <select 
                    id="category" 
                    name="category"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-white"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="pricing" className="block text-sm font-medium text-slate-700 mb-1">Pricing Model <span className="text-rose-500">*</span></label>
                  <select 
                    id="pricing" 
                    name="pricing"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-white"
                    value={formData.pricing}
                    onChange={handleChange}
                  >
                    {Object.values(PricingModel).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-1">Tags / Keywords</label>
                <input 
                  type="text" 
                  id="tags" 
                  name="tags" 
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. copywriting, seo, free tier (comma separated)"
                  value={formData.tags}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 text-sm text-blue-800">
               <Info size={18} className="flex-shrink-0 mt-0.5" />
               <p>
                 <strong>Process:</strong> Submitting will open your default email client with a draft addressed to our review team.
               </p>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit"
                className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/30 transform active:scale-95 transition-all flex items-center"
              >
                <Mail size={18} className="mr-2" />
                Submit via Email
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitToolPage;
