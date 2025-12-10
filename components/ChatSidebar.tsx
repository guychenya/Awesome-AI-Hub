import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { X, Send, Bot, PanelRightClose, Trash2, Sparkles, User, BarChart2, Table as TableIcon, ExternalLink, Settings, Save, Key, Eye, EyeOff, AlertCircle, ChevronDown } from 'lucide-react';
import { MOCK_TOOLS } from '../constants';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChartDataPoint {
  label: string;
  value: number;
}

interface ModelConfig {
  provider: 'google' | 'openai' | 'anthropic';
  modelId: string;
  apiKeys: {
    google: string;
    openai: string;
    anthropic: string;
  };
}

const DEFAULT_CONFIG: ModelConfig = {
  provider: 'google',
  modelId: 'gemini-2.5-flash',
  apiKeys: {
    google: '',
    openai: '',
    anthropic: ''
  }
};

const AVAILABLE_MODELS = {
  google: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-2.0-flash-lite-preview-02-05', name: 'Gemini 2.0 Flash Lite' },
    { id: 'gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus' },
  ]
};

// --- Rich Content Renderers ---

const SimpleFormat: React.FC<{ text: string }> = ({ text }) => {
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts = text.split(boldRegex);
  
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i} className="font-bold text-slate-800">{part}</strong>;
        }
        const italicRegex = /\*(.*?)\*/g;
        const subParts = part.split(italicRegex);
        return (
          <span key={i}>
            {subParts.map((sub, j) => (
               j % 2 === 1 ? <em key={j} className="italic">{sub}</em> : <span key={j}>{sub}</span>
            ))}
          </span>
        );
      })}
    </>
  );
};

const RichText: React.FC<{ text: string }> = ({ text }) => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = text.split(linkRegex);

  return (
    <span className="leading-relaxed break-words">
      {parts.map((part, i) => {
        if (i % 3 === 0) {
           return <SimpleFormat key={i} text={part} />;
        }
        if (i % 3 === 1) {
           const url = parts[i + 1];
           return (
             <a 
               key={i} 
               href={url} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="text-brand-600 hover:text-brand-800 hover:underline font-bold inline-flex items-center bg-brand-50 px-1 rounded mx-0.5"
             >
               {part}
               <ExternalLink size={10} className="ml-0.5" />
             </a>
           );
        }
        return null;
      })}
    </span>
  );
};

const RenderChart: React.FC<{ data: ChartDataPoint[], title?: string }> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="my-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm w-full">
      {title && <div className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center"><BarChart2 size={12} className="mr-1.5"/> {title}</div>}
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={i} className="space-y-1 group">
            <div className="flex justify-between text-xs text-slate-600">
              <span className="font-medium truncate pr-2">{d.label}</span>
              <span className="font-mono text-slate-400">{d.value}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-1000 ease-out group-hover:from-brand-600 group-hover:to-brand-500 relative"
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
  const rows = content.trim().split('\n');
  const headers = rows[0].split('|').map(h => h.trim()).filter(h => h !== '');
  const dataRows = rows.slice(2).map(row => row.split('|').map(c => c.trim()).filter(c => c !== ''));

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-700 uppercase font-semibold">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 border-b border-slate-200 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {i === 0 && <TableIcon size={10} className="text-slate-400" />}
                    {h}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dataRows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-slate-600 min-w-[100px]">
                    <RichText text={cell || ''} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CanvasMessageRenderer: React.FC<{ text: string }> = ({ text }) => {
  const blocks = [];
  const lines = text.split('\n');
  let currentBuffer: string[] = [];
  let inCodeBlock = false;
  let codeBlockType = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        if (codeBlockType === 'chart') {
           try {
             const jsonStr = currentBuffer.join('\n');
             const data = JSON.parse(jsonStr);
             blocks.push({ type: 'chart', content: data });
           } catch (e) {
             blocks.push({ type: 'text', content: 'Error parsing chart data.' });
           }
        } else {
           blocks.push({ type: 'text', content: currentBuffer.join('\n') });
        }
        currentBuffer = [];
        inCodeBlock = false;
        codeBlockType = '';
      } else {
        if (currentBuffer.length > 0) {
           blocks.push({ type: 'text', content: currentBuffer.join('\n') });
           currentBuffer = [];
        }
        const type = line.replace('```', '').trim();
        codeBlockType = type === 'json' || type === 'chart' ? 'chart' : 'text'; 
        inCodeBlock = true;
      }
      continue;
    }

    const isTableLine = !inCodeBlock && line.trim().startsWith('|') && line.trim().endsWith('|');
    
    if (inCodeBlock) {
      currentBuffer.push(line);
    } else {
      if (isTableLine) {
        if (currentBuffer.length > 0 && !currentBuffer[0].trim().startsWith('|')) {
           blocks.push({ type: 'text', content: currentBuffer.join('\n') });
           currentBuffer = [];
        }
        currentBuffer.push(line);
      } else {
        if (currentBuffer.length > 0 && currentBuffer[0].trim().startsWith('|')) {
           blocks.push({ type: 'table', content: currentBuffer.join('\n') });
           currentBuffer = [];
        }
        currentBuffer.push(line);
      }
    }
  }
  
  if (currentBuffer.length > 0) {
    if (currentBuffer[0].trim().startsWith('|')) {
        blocks.push({ type: 'table', content: currentBuffer.join('\n') });
    } else {
        blocks.push({ type: 'text', content: currentBuffer.join('\n') });
    }
  }

  return (
    <div className="space-y-2">
      {blocks.map((block, idx) => {
        if (block.type === 'chart') {
          return <RenderChart key={idx} data={block.content as ChartDataPoint[]} title="Data Visualization" />;
        }
        if (block.type === 'table') {
          return <RenderTable key={idx} content={block.content as string} />;
        }
        return <div key={idx} className="whitespace-pre-wrap"><RichText text={block.content as string} /></div>
      })}
    </div>
  );
};


const SUGGESTIONS = [
  "Compare Free vs Paid video tools",
  "Chart the popularity of coding tools",
  "List best image generators with links",
  "Show me marketing tools pricing"
];

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Settings & Config State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [modelConfig, setModelConfig] = useState<ModelConfig>(DEFAULT_CONFIG);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  // Resize logic state
  const [sidebarWidth, setSidebarWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  
  // Load Config
  useEffect(() => {
    const saved = localStorage.getItem('ai_hub_model_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setModelConfig({ ...DEFAULT_CONFIG, ...parsed });
      } catch (e) {
        console.error('Failed to parse config', e);
      }
    }
  }, []);

  const saveConfig = (newConfig: ModelConfig) => {
    setModelConfig(newConfig);
    localStorage.setItem('ai_hub_model_config', JSON.stringify(newConfig));
  };

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = window.innerWidth - mouseMoveEvent.clientX;
      if (newWidth >= 300 && newWidth <= 800) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);


  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Handle Providers
    if (modelConfig.provider !== 'google') {
       // Placeholder for non-Gemini providers
       setTimeout(() => {
          setMessages(prev => [...prev, { 
            id: (Date.now() + 1).toString(), 
            role: 'model', 
            text: `**${modelConfig.provider.toUpperCase()} Integration:**\n\nI am currently configured to use ${modelConfig.modelId}, but the backend integration for this provider is in "Preview Mode" and not fully connected in this demo environment. \n\nPlease switch back to **Google Gemini** in settings to experience the full features (Charts, Tables, Live Analysis).` 
          }]);
          setIsLoading(false);
       }, 1000);
       return;
    }

    try {
      // Use Custom Key if provided, otherwise default env key
      const apiKey = modelConfig.apiKeys.google || process.env.API_KEY;
      const ai = new GoogleGenAI({ apiKey });

      const toolsContext = MOCK_TOOLS.map(t => 
        `- ${t.name} (Category: ${t.categories.join(', ')}, Price: ${t.pricing}, Popularity: ${t.popular ? 'High' : 'Average'}, URL: ${t.websiteUrl})`
      ).join('\n');

      const systemInstruction = `You are an advanced AI assistant for "SeekCompass". 
      
      DATA CONTEXT:
      ${toolsContext}
      
      FORMATTING RULES (CANVAS MODE):
      1. **Text**: Use **bold** for emphasis. Keep it conversational.
      2. **Tables**: When comparing tools or listing items with attributes, MUST use Markdown tables.
      3. **Links**: When listing tools, ALWAYS include a clickable link in Markdown format: [Link Label](URL).
      4. **Charts**: When discussing popularity, pricing distributions, or comparisons that involve numbers, you MUST output a JSON block tagged as 'chart'.
         Format:
         \`\`\`chart
         [
           {"label": "Tool A", "value": 85},
           {"label": "Tool B", "value": 60}
         ]
         \`\`\`
      
      BEHAVIOR:
      - If asked for "best X", provide a Table with Links.
      - If asked for "comparison" or "popularity", provide a Chart.
      - Always be helpful and concise.`;

      const response = await ai.models.generateContent({
        model: modelConfig.modelId || 'gemini-2.5-flash',
        contents: [
          ...messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: userMessage.text }] }
        ],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.3,
        }
      });

      const text = response.text;
      if (text) {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text }]);
      }
    } catch (error: any) {
      console.error('Error generating response:', error);
      let errorMessage = 'Oops! I ran into a hiccup. Can you try asking that again?';
      if (error.message?.includes('API key')) {
        errorMessage = 'Authentication Error: Please check your Google API Key in Settings.';
      }
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const toggleKeyVisibility = (provider: string) => {
    setShowKey(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  return (
    <aside 
      className={`
        fixed inset-y-0 right-0 z-40 bg-white border-l border-slate-200 shadow-2xl transform transition-all ease-in-out flex flex-col
        md:relative md:transform-none md:shadow-none
        ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full md:w-0 md:opacity-0 md:overflow-hidden'}
      `}
      style={{ 
        paddingTop: '4rem',
        width: isOpen ? (window.innerWidth >= 768 ? `${sidebarWidth}px` : '100%') : '0px',
        transitionProperty: isResizing ? 'none' : 'width, transform, opacity'
      }} 
    >
      {/* Drag Handle (Desktop Only) */}
      <div 
        className="hidden md:flex absolute left-0 top-0 bottom-0 w-1.5 hover:w-2 bg-transparent hover:bg-brand-500/10 cursor-col-resize z-50 items-center justify-center group transition-all"
        onMouseDown={startResizing}
      >
         <div className="h-8 w-1 rounded-full bg-slate-300 group-hover:bg-brand-400 transition-colors"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-sm z-10 flex-shrink-0">
        <div className="flex items-center space-x-3">
           <div className="relative">
             <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
               <Bot size={20} />
             </div>
             <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></div>
             </div>
           </div>
           <div>
             <h2 className="font-bold text-slate-800 text-sm font-display">Hub Assistant</h2>
             <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                {isSettingsOpen ? 'Configuration' : `${modelConfig.modelId}`}
             </p>
           </div>
        </div>
        <div className="flex items-center space-x-1">
           {!isSettingsOpen && (
             <button 
              onClick={clearChat}
              className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-colors hover:bg-rose-50"
              title="Clear Conversation"
            >
              <Trash2 size={16} />
            </button>
           )}
           <button 
             onClick={() => setIsSettingsOpen(!isSettingsOpen)}
             className={`p-2 rounded-lg transition-colors ${isSettingsOpen ? 'bg-brand-100 text-brand-600' : 'text-slate-400 hover:text-brand-600 hover:bg-slate-100'}`}
             title="Settings & Keys"
           >
             <Settings size={18} />
           </button>
           <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors md:hidden"
          >
            <X size={20} />
          </button>
           <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors hidden md:block"
          >
            <PanelRightClose size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area: Switch between Chat and Settings */}
      {isSettingsOpen ? (
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="max-w-sm mx-auto space-y-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 font-display">Model Configuration</h3>
              <p className="text-sm text-slate-500 mt-1">Configure your preferred AI models and Bring Your Own Keys (BYOK).</p>
            </div>

            {/* Provider Selection */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Active Provider & Model
              </label>
              
              <div className="grid grid-cols-3 gap-2 p-1 bg-white rounded-xl border border-slate-200">
                {(['google', 'openai', 'anthropic'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => saveConfig({ ...modelConfig, provider: p, modelId: AVAILABLE_MODELS[p][0].id })}
                    className={`
                      py-2 rounded-lg text-xs font-bold capitalize transition-all
                      ${modelConfig.provider === p 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-50'}
                    `}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="relative">
                <select
                  value={modelConfig.modelId}
                  onChange={(e) => saveConfig({ ...modelConfig, modelId: e.target.value })}
                  className="w-full appearance-none bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-brand-500 focus:border-brand-500 block p-3 pr-8 font-medium shadow-sm"
                >
                  {AVAILABLE_MODELS[modelConfig.provider].map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* API Keys Section */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                API Keys (BYOK)
              </label>
              
              {/* Google Key */}
              <div className="space-y-1">
                 <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Google Gemini Key</span>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">Get Key</a>
                 </div>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key size={14} className="text-slate-400" />
                    </div>
                    <input
                      type={showKey['google'] ? "text" : "password"}
                      value={modelConfig.apiKeys.google}
                      onChange={(e) => saveConfig({ 
                        ...modelConfig, 
                        apiKeys: { ...modelConfig.apiKeys, google: e.target.value } 
                      })}
                      placeholder={process.env.API_KEY ? "Using Default (Override here)" : "Enter AI Studio Key"}
                      className="pl-9 pr-10 w-full p-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-brand-500 focus:border-brand-500"
                    />
                    <button 
                      onClick={() => toggleKeyVisibility('google')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showKey['google'] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                 </div>
              </div>

              {/* OpenAI Key */}
               <div className="space-y-1">
                 <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">OpenAI Key</span>
                 </div>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key size={14} className="text-slate-400" />
                    </div>
                    <input
                      type={showKey['openai'] ? "text" : "password"}
                      value={modelConfig.apiKeys.openai}
                      onChange={(e) => saveConfig({ 
                        ...modelConfig, 
                        apiKeys: { ...modelConfig.apiKeys, openai: e.target.value } 
                      })}
                      placeholder="sk-..."
                      className="pl-9 pr-10 w-full p-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-brand-500 focus:border-brand-500"
                    />
                    <button 
                      onClick={() => toggleKeyVisibility('openai')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showKey['openai'] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                 </div>
              </div>

              {/* Anthropic Key */}
               <div className="space-y-1">
                 <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Anthropic Key</span>
                 </div>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key size={14} className="text-slate-400" />
                    </div>
                    <input
                      type={showKey['anthropic'] ? "text" : "password"}
                      value={modelConfig.apiKeys.anthropic}
                      onChange={(e) => saveConfig({ 
                        ...modelConfig, 
                        apiKeys: { ...modelConfig.apiKeys, anthropic: e.target.value } 
                      })}
                      placeholder="sk-ant-..."
                      className="pl-9 pr-10 w-full p-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-brand-500 focus:border-brand-500"
                    />
                    <button 
                      onClick={() => toggleKeyVisibility('anthropic')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showKey['anthropic'] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                 </div>
              </div>
            </div>

            <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 flex gap-3 text-xs text-brand-800 leading-relaxed">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p>
                API Keys are stored locally in your browser's LocalStorage. We never transmit them to our servers. Google Gemini keys are currently the only ones fully integrated for live chat.
              </p>
            </div>

            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-slate-900/20 active:scale-95"
            >
              <Save size={16} />
              <span>Save & Return to Chat</span>
            </button>
          </div>
        </div>
      ) : (
        /* Chat Messages Area */
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 relative scrollbar-thin scrollbar-thumb-slate-200">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-8 opacity-0 animate-in fade-in duration-700 fill-mode-forwards">
               <div className="relative">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 flex items-center justify-center text-brand-500 mb-2 rotate-3 transform transition-transform hover:rotate-0 duration-500">
                    <Sparkles size={40} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 animate-bounce">
                    <BarChart2 size={16} />
                  </div>
               </div>
               
               <div className="space-y-2">
                 <h3 className="text-slate-900 font-bold text-xl font-display">Data-Ready AI Canvas</h3>
                 <p className="text-slate-500 text-sm max-w-[260px] mx-auto leading-relaxed">
                   Ask me to compare tools, visualize popularity, or create pricing tables. I'm equipped with a rich rendering engine.
                 </p>
               </div>
               
               <div className="grid grid-cols-1 gap-2.5 w-full max-w-xs">
                 {SUGGESTIONS.map((s) => (
                   <button 
                     key={s}
                     onClick={() => handleSend(s)}
                     className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-700 hover:shadow-md hover:-translate-y-0.5 transition-all text-left flex items-center justify-between group"
                   >
                     {s}
                     <Send size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-brand-500" />
                   </button>
                 ))}
               </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={msg.id} 
                className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white shadow-md self-start mt-1">
                    <Bot size={16} />
                  </div>
                )}
                
                <div 
                  className={`max-w-[85%] sm:max-w-[90%] px-5 py-4 text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-600 text-white rounded-2xl rounded-br-sm shadow-brand-500/20' 
                      : 'bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-bl-sm shadow-slate-200/50'
                  }`}
                >
                  {msg.role === 'model' ? (
                    <CanvasMessageRenderer text={msg.text} />
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-500 shadow-inner self-start mt-1">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-start gap-3 animate-in fade-in duration-300">
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white shadow-md">
                    <Bot size={16} />
              </div>
              <div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center space-x-1.5 h-12">
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      {!isSettingsOpen && (
        <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
          <div className="relative flex items-center shadow-sm border border-slate-200 rounded-2xl bg-slate-50 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent focus-within:bg-white transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI to compare tools, visualize data, or explain concepts..."
              className="w-full pl-5 pr-14 py-4 bg-transparent border-none focus:outline-none text-sm placeholder:text-slate-400 resize-none max-h-32 min-h-[56px]"
              rows={1}
              style={{ minHeight: '56px' }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:hover:bg-brand-600 transition-all duration-200 transform active:scale-95 shadow-md shadow-brand-500/20"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
            Canvas Mode Enabled • Model: <span className="text-brand-600">{modelConfig.modelId}</span>
          </p>
        </div>
      )}
    </aside>
  );
};

export default ChatSidebar;