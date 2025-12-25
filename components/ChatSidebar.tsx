import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { X, Send, Bot, PanelRightClose, Trash2, Sparkles, User, BarChart2, Table as TableIcon, ExternalLink, Settings, Save, Key, Eye, EyeOff, AlertCircle, ChevronDown, Maximize, Minimize, Image as ImageIcon, Download, Copy, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { MOCK_TOOLS } from '../constants';

interface MessagePart {
  type: 'text' | 'image' | 'chart' | 'table';
  content: any;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  parts: MessagePart[];
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

interface ChartDataPoint {
  label: string;
  value: number;
}

interface ModelConfig {
  provider: 'google';
  modelId: string;
  apiKeys: {
    google: string;
  };
}

const DEFAULT_CONFIG: ModelConfig = {
  provider: 'google',
  modelId: 'gemini-3-flash-preview',
  apiKeys: {
    google: ''
  }
};

const SimpleFormat: React.FC<{ text: string }> = ({ text }) => {
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts = text.split(boldRegex);
  return (
    <>
      {parts.map((part, i) => (
        i % 2 === 1 ? <strong key={i} className="font-bold text-slate-800">{part}</strong> : <span key={i}>{part}</span>
      ))}
    </>
  );
};

const RichText: React.FC<{ text: string }> = ({ text }) => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = text.split(linkRegex);
  return (
    <span className="leading-relaxed break-words">
      {parts.map((part, i) => {
        if (i % 3 === 0) return <SimpleFormat key={i} text={part} />;
        if (i % 3 === 1) {
          const url = parts[i + 1];
          return (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-800 font-bold inline-flex items-center bg-brand-50 px-1 rounded mx-0.5">
              {part} <ExternalLink size={10} className="ml-0.5" />
            </a>
          );
        }
        return null;
      })}
    </span>
  );
};

const RenderChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="my-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm w-full">
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-xs text-slate-600">
              <span className="font-medium truncate pr-2">{d.label}</span>
              <span className="font-mono text-slate-400">{d.value}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-500 rounded-full transition-all duration-1000"
                style={{ width: `${(d.value / maxValue) * 100}%`, animation: `growWidth 1s ease-out` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RenderTable: React.FC<{ content: string }> = ({ content }) => {
  const rows = content.trim().split('\n').filter(r => r.includes('|'));
  if (rows.length < 2) return <RichText text={content} />;
  const headers = rows[0].split('|').map(h => h.trim()).filter(h => h !== '');
  const dataRows = rows.slice(2).map(row => row.split('|').map(c => c.trim()).filter(c => c !== ''));
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white overflow-x-auto">
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
          <tr>{headers.map((h, i) => <th key={i} className="px-4 py-3">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {dataRows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/50">
              {row.map((cell, j) => <td key={j} className="px-4 py-3"><RichText text={cell} /></td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const RenderImage: React.FC<{ src: string }> = ({ src }) => (
  <div className="my-4 rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white relative group">
    <img src={src} alt="AI Generated" className="w-full h-auto object-contain" />
    <div className="absolute top-2 right-2 flex items-center gap-2 p-1.5 bg-black/50 text-white/90 rounded-full text-[10px] backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
      <ImageIcon size={10}/><span className="font-bold">AI Generated</span>
    </div>
  </div>
);

const parseTextToBlocks = (text: string): MessagePart[] => {
  const blocks: MessagePart[] = [];
  const lines = text.split('\n');
  let currentBuffer: string[] = [];
  let inCodeBlock = false;

  lines.forEach(line => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        const content = currentBuffer.join('\n');
        try { blocks.push({ type: 'chart', content: JSON.parse(content) }); }
        catch { blocks.push({ type: 'text', content }); }
        currentBuffer = []; inCodeBlock = false;
      } else {
        if (currentBuffer.length > 0) blocks.push({ type: 'text', content: currentBuffer.join('\n') });
        currentBuffer = []; inCodeBlock = true;
      }
    } else {
      currentBuffer.push(line);
    }
  });
  if (currentBuffer.length > 0) {
    const content = currentBuffer.join('\n');
    if (content.trim().startsWith('|') && content.includes('\n|--')) blocks.push({ type: 'table', content });
    else blocks.push({ type: 'text', content });
  }
  return blocks;
};

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onClose, isMaximized, onToggleMaximize }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [modelConfig, setModelConfig] = useState<ModelConfig>(DEFAULT_CONFIG);
  const [showKey, setShowKey] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(450);

  useEffect(() => {
    const saved = localStorage.getItem('ai_hub_model_config');
    if (saved) try { setModelConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) }); } catch (e) {}
  }, []);

  const saveConfig = (newConfig: ModelConfig) => {
    setModelConfig(newConfig);
    localStorage.setItem('ai_hub_model_config', JSON.stringify(newConfig));
  };

  useEffect(() => {
    if (isOpen && messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', parts: [{ type: 'text', content: textToSend }] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = modelConfig.apiKeys.google || process.env.API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      const context = MOCK_TOOLS.map(t => `- ${t.name} (${t.pricing}, ${t.categories[0]})`).join('\n');
      const isImageRequest = /design|logo|create image|draw/i.test(textToSend);
      
      const response = await ai.models.generateContent({
        model: isImageRequest ? 'gemini-2.5-flash-image' : 'gemini-3-flash-preview',
        contents: [...messages.map(m => ({ role: m.role, parts: [{ text: m.parts.map(p => p.content).join('\n') }] })), { role: 'user', parts: [{ text: textToSend }] }],
        config: {
          systemInstruction: `Assistant for SeekCompass. Data: ${context}. Use markdown tables for comparisons and JSON code blocks for charts. If asked for a logo/design, return an image part.`,
          temperature: 0.3
        }
      });

      const parts: MessagePart[] = [];
      response.candidates?.[0]?.content?.parts?.forEach(p => {
        if (p.inlineData) parts.push({ type: 'image', content: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` });
        else if (p.text) parts.push(...parseTextToBlocks(p.text));
      });

      if (parts.length === 0 && response.text) parts.push(...parseTextToBlocks(response.text));
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', parts }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', parts: [{ type: 'text', content: "I encountered an error. Please check your API key." }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside 
      className={`bg-white border-l shadow-2xl flex flex-col transition-all duration-300 ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} ${isMaximized ? 'fixed inset-0 z-40' : 'relative'}`}
      style={{ width: isMaximized ? '100%' : (isOpen ? (window.innerWidth >= 768 ? `${sidebarWidth}px` : '100%') : '0px'), paddingTop: isMaximized ? '5rem' : '0' }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white/80 backdrop-blur-sm z-10">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white"><Bot size={20} /></div>
          <div><h2 className="font-bold text-slate-800 text-sm">Hub Assistant</h2><p className="text-[10px] text-slate-500 uppercase tracking-wider">{modelConfig.modelId}</p></div>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={() => setMessages([])} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
          <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-2 text-slate-400 hover:text-brand-600"><Settings size={18} /></button>
          <button onClick={onToggleMaximize} className="p-2 text-slate-400 hover:text-slate-600 hidden md:block">{isMaximized ? <Minimize size={18} /> : <Maximize size={18} />}</button>
          <button onClick={onClose} className="p-2 text-slate-400"><X size={20} /></button>
        </div>
      </div>

      {isSettingsOpen ? (
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-sm mx-auto space-y-6">
            <h3 className="text-xl font-bold text-center">Settings</h3>
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-500 uppercase">Google API Key</label>
              <div className="relative">
                <input type={showKey ? "text" : "password"} value={modelConfig.apiKeys.google} onChange={(e) => saveConfig({ ...modelConfig, apiKeys: { google: e.target.value } })} className="w-full p-2.5 text-sm border rounded-xl" placeholder="AI Studio Key..." />
                <button onClick={() => setShowKey(!showKey)} className="absolute inset-y-0 right-0 pr-3 text-slate-400">{showKey ? <EyeOff size={14} /> : <Eye size={14} />}</button>
              </div>
            </div>
            <button onClick={() => setIsSettingsOpen(false)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Save & Close</button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <Sparkles size={40} className="text-brand-500" />
              <h3 className="font-bold">Multimodal AI Canvas</h3>
              <button onClick={() => handleSend("Compare video tools")} className="p-3 bg-white border rounded-xl text-xs w-full text-left">Compare top video tools</button>
              <button onClick={() => handleSend("Show popularity chart")} className="p-3 bg-white border rounded-xl text-xs w-full text-left">Visualize coding tools popularity</button>
            </div>
          ) : messages.map(msg => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white"><Bot size={16} /></div>}
              <div className={`max-w-[85%] px-5 py-4 text-sm rounded-2xl ${msg.role === 'user' ? 'bg-brand-600 text-white shadow-lg' : 'bg-white border text-slate-800 shadow-sm'}`}>
                {msg.role === 'model' ? msg.parts.map((p, i) => {
                  if (p.type === 'text') return <div key={i} className="whitespace-pre-wrap"><RichText text={p.content} /></div>;
                  if (p.type === 'image') return <RenderImage key={i} src={p.content} />;
                  if (p.type === 'chart') return <RenderChart key={i} data={p.content} />;
                  if (p.type === 'table') return <RenderTable key={i} content={p.content} />;
                  return null;
                }) : <p>{msg.parts[0].content}</p>}
              </div>
              {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500"><User size={16} /></div>}
            </div>
          ))}
          {isLoading && <div className="flex items-center space-x-1.5 p-4"><span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span><span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span></div>}
          <div ref={messagesEndRef} />
        </div>
      )}

      {!isSettingsOpen && (
        <div className="p-4 bg-white border-t">
          <div className="relative flex items-center border rounded-2xl bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Ask me anything..." className="w-full px-5 py-4 bg-transparent border-none focus:outline-none text-sm resize-none h-[56px]" />
            <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className="absolute right-2 p-2.5 bg-brand-600 text-white rounded-xl disabled:opacity-50"><Send size={18} /></button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default ChatSidebar;