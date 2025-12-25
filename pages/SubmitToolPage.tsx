import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UploadCloud, CheckCircle, Info, Sparkles, X, Loader2, Mail, Wand2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { CATEGORIES } from '../constants';
import { PricingModel, Tool } from '../types';
import { saveToolLocally } from '../services/toolService';

const SubmitToolPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', url: '', description: '', category: CATEGORIES[0].id, pricing: PricingModel.Freemium, logoUrl: '', tags: '' });
  const [showSmartFill, setShowSmartFill] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [generatedLogo, setGeneratedLogo] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryName = CATEGORIES.find(c => c.id === formData.category)?.name || 'General';
    const finalImageUrl = generatedLogo || formData.logoUrl || `https://logo.clearbit.com/${new URL(formData.url).hostname}`;
    const newTool: Tool = { id: `local-${Date.now()}`, name: formData.name, description: formData.description, websiteUrl: formData.url, imageUrl: finalImageUrl, pricing: formData.pricing, categories: [categoryName], features: formData.tags.split(',').map(t => t.trim()), addedAt: new Date().toISOString(), popular: false };
    saveToolLocally(newTool);
    setSubmitted(true);
  };

  const handleSmartFill = async () => {
    if (!pasteContent.trim()) return;
    setIsParsing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Extract tool info from: ${pasteContent}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              url: { type: Type.STRING },
              description: { type: Type.STRING },
              pricing: { type: Type.STRING },
              tags: { type: Type.STRING }
            }
          }
        }
      });
      const data = JSON.parse(response.text || '{}');
      setFormData(prev => ({ ...prev, ...data }));
      setShowSmartFill(false);
    } catch (e) { setGenError("Failed to parse."); }
    finally { setIsParsing(false); }
  };

  const handleGenerateLogo = async () => {
    if (!formData.name) return;
    setIsGeneratingLogo(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: `Modern minimalist app icon for "${formData.name}". Style: Startup logo, white background.`
      });
      const imgPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imgPart?.inlineData) setGeneratedLogo(`data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`);
    } catch (e) { setGenError("Logo generation failed."); }
    finally { setIsGeneratingLogo(false); }
  };

  if (submitted) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-12 shadow-xl border text-center space-y-6 max-w-lg w-full">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"><CheckCircle size={40} /></div>
        <h2 className="text-3xl font-bold font-display">Tool Added Locally!</h2>
        <p className="text-slate-600">The tool is now visible in your local directory browse. Refreshing will keep it stored.</p>
        <Link to="/" className="inline-flex w-full justify-center px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl">Back to Directory</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link to="/" className="inline-flex items-center text-slate-500 hover:text-brand-600"><ArrowLeft size={16} className="mr-2" /> Back</Link>
        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
          <div className="bg-brand-600 p-8 text-white"><h1 className="text-2xl font-bold flex items-center gap-2"><UploadCloud size={24}/> Submit Tool</h1></div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className={`p-4 rounded-2xl border ${showSmartFill ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowSmartFill(!showSmartFill)}>
                <div className="flex items-center gap-2 font-bold text-indigo-800"><Wand2 size={18}/> Smart Fill</div>
                <span className="text-xs text-indigo-600">{showSmartFill ? 'Cancel' : 'Paste to auto-fill'}</span>
              </div>
              {showSmartFill && <div className="mt-3 space-y-3">
                <textarea value={pasteContent} onChange={e => setPasteContent(e.target.value)} className="w-full h-24 p-3 border rounded-xl text-sm" placeholder="Paste website content..."/>
                <button type="button" onClick={handleSmartFill} disabled={isParsing} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold">{isParsing ? 'Parsing...' : 'Magic Fill'}</button>
              </div>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input name="name" placeholder="Tool Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="p-3 border rounded-xl" />
              <input name="url" placeholder="URL" required value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="p-3 border rounded-xl" />
            </div>
            <textarea name="description" placeholder="Description" required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 border rounded-xl" />
            <div className="flex gap-2">
              <input name="logoUrl" placeholder="Logo URL (Optional)" value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} className="flex-1 p-3 border rounded-xl" />
              <button type="button" onClick={handleGenerateLogo} disabled={isGeneratingLogo} className="px-4 py-2 bg-brand-500 text-white rounded-xl font-bold">{isGeneratingLogo ? '...' : 'AI Logo'}</button>
            </div>
            {generatedLogo && <div className="flex items-center gap-3 p-2 bg-brand-50 border rounded-xl"><img src={generatedLogo} className="w-12 h-12 rounded border" /><span className="text-xs font-bold text-brand-900">Logo Generated</span><button onClick={()=>setGeneratedLogo(null)}><X size={16}/></button></div>}
            <div className="grid grid-cols-2 gap-4">
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="p-3 border rounded-xl bg-white">{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <select value={formData.pricing} onChange={e => setFormData({...formData, pricing: e.target.value as PricingModel})} className="p-3 border rounded-xl bg-white">{Object.values(PricingModel).map(p => <option key={p} value={p}>{p}</option>)}</select>
            </div>
            <button type="submit" className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl shadow-lg">Submit Tool</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitToolPage;