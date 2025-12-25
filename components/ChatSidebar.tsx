import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { X, Send, Bot, Trash2, Sparkles, User, ExternalLink, Settings, Eye, EyeOff, Maximize, Minimize, Image as ImageIcon } from 'lucide-react';
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
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-800 font-bold inline-flex items-center bg-brand-50 px-1 rounded mx-0.5 transition-colors">
              {part} <ExternalLink size={10} className="ml-0.5" />
            </a>
          );
        }
        return null;
      })}
    </span>
  );
};

const RenderChart: React.FC<{ data: any }> = ({ data }) => {
  const chartArray = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
  if (chartArray.length === 0) return null;

  const maxValue = Math.max(...chartArray.map((d: any) => Number(d.value) || 0), 1);
  return (
    <div className="my-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm w-full overflow-hidden">
      <div className="space-y-3">
        {chartArray.map((d: any, i: number) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-xs text-slate-600">
              <span className="font-medium truncate pr-2">{d.label || 'Unknown'}</span>
              <span className="font-mono text-slate-400 font-bold">{d.value}</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 rounded-full transition-all duration-1000"
                style={{ width: `${((Number(d.value) || 0) / maxValue) * 100}%`, animation: `growWidth 1s ease-out` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RenderTable: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.trim().split('\n');
  const rows = lines.filter(r => r.trim().startsWith('|') && r.trim().endsWith('|'));
  if (rows.length < 2) return <RichText text={content} />;
  
  const headers = rows[0].split('|').map(h => h.trim()).filter(h => h !== '');
  const dataRows = rows.slice(2).map(row => row.split('|').map(c => c.trim()).filter(c => c !== ''));
  
  return (
    <div className="my-5 overflow-hidden rounded-2xl border border-slate-200 shadow-lg bg-white overflow-x-auto">
      <table className="w-full text-[13px] text-left border-collapse">
        <thead className="bg-slate-900 text-white font-bold">
          <tr>{headers.map((h, i) => <th key={i} className="px-5 py-4 whitespace-nowrap">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {dataRows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              {row.map((cell, j) => <td key={j} className="px-5 py-4"><RichText text={cell} /></td>)}
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
    <div className="absolute top-2 right-2 flex items-center gap-2 p-1.5 bg-black/60 text-white rounded-full text-[10px] backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
      <ImageIcon size={10}/><span className="font-bold">AI Generated</span>
    </div>
  </div>
);

const parseTextToBlocks = (text: string): MessagePart[] => {
  const blocks: MessagePart[] = [];
  
  // High-fidelity pattern detection
  // 1. Table Detection Pattern: Look for markdown table structure
  const tableRegex = /(\n|^)(\|.*\|.*\n\|[-| :]+\|\n(\|.*\|.*\n?)+)/g;
  
  let lastIndex = 0;
  let match;

  while ((match = tableRegex.exec(text)) !== null) {
    // Add text before the table
    if (match.index > lastIndex) {
      const precedingText = text.substring(lastIndex, match.index).trim();
      if (precedingText) processCodeBlocks(precedingText, blocks);
    }

    // Add the table block
    blocks.push({ type: 'table', content: match[2].trim() });
    lastIndex = tableRegex.lastIndex;
  }

  // Add remaining text after the last table
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex).trim();
    if (remainingText) processCodeBlocks(remainingText, blocks);
  }

  return blocks;
};

const processCodeBlocks = (text: string, blocks: MessagePart[]) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const textPart = text.substring(lastIndex, match.index).trim();
      if (textPart) blocks.push({ type: 'text', content: textPart });
    }

    const codeContent = match[2].trim();
    try {
      const parsed = JSON.parse(codeContent);
      if (Array.isArray(parsed) || (parsed.data && Array.isArray(parsed.data))) {
        blocks.push({ type: 'chart', content: parsed });
      } else {
        blocks.push({ type: 'text', content: '```\n' + codeContent + '\n```' });
      }
    } catch {
      blocks.push({ type: 'text', content: '```\n' + codeContent + '\n```' });
    }
    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    const textPart = text.substring(lastIndex).trim();
    if (textPart) blocks.push({ type: 'text', content: textPart });
  }
};

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onClose, isMaximized, onToggleMaximize }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ai_hub_api_key');
    if (saved) setApiKey(saved);
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('ai_hub_api_key', key);
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
      const activeKey = apiKey || process.env.API_KEY;
      const ai = new GoogleGenAI({ apiKey: activeKey });
      const context = MOCK_TOOLS.map(t => `- ${t.name} (Pricing: ${t.pricing}, Category: ${t.categories[0]})`).join('\n');
      const isImageRequest = /design|logo|create image|draw|picture/i.test(textToSend);
      
      const response = await ai.models.generateContent({
        model: isImageRequest ? 'gemini-2.5-flash-image' : 'gemini-3-flash-preview',
        contents: [
          ...messages.map(m => ({ 
            role: m.role, 
            parts: [{ text: m.parts.map(p => p.type === 'text' ? p.content : '').join('\n') }] 
          })), 
          { role: 'user', parts: [{ text: textToSend }] }
        ],
        config: {
          systemInstruction: `You are the SeekCompass Hub Assistant.
          
          AI HUB CONTEXT TOOLS:
          ${context}

          OUTPUT RULES:
          1. Use standard Markdown tables (with | and ---) for comparisons or lists.
          2. Use JSON code blocks [ { "label": "Text", "value": 50 } ] for stats or popularity charts.
          3. Use bold formatting (**Name**) for tool names.
          4. For logos or visuals, generate an image part directly.
          5. If a tool isn't in the context, search for it or clarify.
          6. Be visual, helpful, and concise.`,
          temperature: 0.1
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
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', parts: [{ type: 'text', content: "I encountered an error connecting to the AI brain. Check your API key." }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside 
      className={`bg-white border-l shadow-2xl flex flex-col transition-all duration-300 ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} ${isMaximized ? 'fixed inset-0 z-[60]' : 'relative z-40'}`}
      style={{ width: isMaximized ? '100%' : (isOpen ? '450px' : '0px'), paddingTop: isMaximized ? '5rem' : '0' }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg"><Bot size={20} /></div>
          <div><h2 className="font-bold text-slate-800 text-sm">Hub Assistant</h2><p className="text-[10px] text-brand-600 font-bold uppercase tracking-wider">Multimodal Insight</p></div>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={() => setMessages([])} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Clear Chat"><Trash2 size={16} /></button>
          <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-2 text-slate-400 hover:text-brand-600 transition-colors" title="Settings"><Settings size={18} /></button>
          <button onClick={onToggleMaximize} className="p-2 text-slate-400 hover:text-slate-600 hidden md:block transition-colors">{isMaximized ? <Minimize size={18} /> : <Maximize size={18} />}</button>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><X size={20} /></button>
        </div>
      </div>

      {isSettingsOpen ? (
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-sm mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">Settings</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Customize your AI experience. Enter your own API key to bypass rate limits.</p>
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Google AI Studio Key</label>
              <div className="relative">
                <input type={showKey ? "text" : "password"} value={apiKey} onChange={(e) => saveApiKey(e.target.value)} className="w-full px-4 py-3 text-sm border rounded-xl bg-white focus:ring-2 focus:ring-brand-500 outline-none transition-all" placeholder="Paste your key here..." />
                <button onClick={() => setShowKey(!showKey)} className="absolute inset-y-0 right-0 pr-3 text-slate-400 hover:text-slate-600">{showKey ? <EyeOff size={14} /> : <Eye size={14} />}</button>
              </div>
            </div>
            <button onClick={() => setIsSettingsOpen(false)} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all">Close & Save</button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
              <div className="p-4 bg-brand-50 rounded-3xl animate-pulse">
                <Sparkles size={48} className="text-brand-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg">Your Intelligent Companion</h3>
                <p className="text-sm text-slate-500">Compare top AI tools or request data visualizations instantly.</p>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
                <button onClick={() => handleSend("Compare ChatGPT, Claude, and Gemini in a table")} className="p-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-left hover:border-brand-300 hover:bg-brand-50 transition-all shadow-sm">📊 Compare main LLMs</button>
                <button onClick={() => handleSend("Show popularity chart of text tools")} className="p-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-left hover:border-brand-300 hover:bg-brand-50 transition-all shadow-sm">📈 Tool Popularity Chart</button>
              </div>
            </div>
          ) : messages.map(msg => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm"><Bot size={16} /></div>}
              <div className={`max-w-[90%] px-4 py-3 text-sm rounded-2xl ${msg.role === 'user' ? 'bg-brand-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-800 shadow-sm'}`}>
                {msg.role === 'model' ? msg.parts.map((p, i) => {
                  if (p.type === 'text') return <div key={i} className="whitespace-pre-wrap"><RichText text={p.content} /></div>;
                  if (p.type === 'image') return <RenderImage key={i} src={p.content} />;
                  if (p.type === 'chart') return <RenderChart key={i} data={p.content} />;
                  if (p.type === 'table') return <RenderTable key={i} content={p.content} />;
                  return null;
                }) : <p>{msg.parts[0].content}</p>}
              </div>
              {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0"><User size={16} /></div>}
            </div>
          ))}
          {isLoading && <div className="flex items-center space-x-1.5 p-4"><span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span><span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span></div>}
          <div ref={messagesEndRef} />
        </div>
      )}

      {!isSettingsOpen && (
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="relative flex items-center border border-slate-200 rounded-2xl bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
            <textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} 
              placeholder="Ask me to compare or graph..." 
              className="w-full px-5 py-4 bg-transparent border-none focus:outline-none text-sm resize-none h-[56px] custom-scrollbar" 
            />
            <button 
              onClick={() => handleSend()} 
              disabled={!input.trim() || isLoading} 
              className="absolute right-2 p-2.5 bg-brand-600 text-white rounded-xl disabled:opacity-50 hover:bg-brand-700 transition-all active:scale-95 shadow-lg shadow-brand-500/20"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default ChatSidebar;