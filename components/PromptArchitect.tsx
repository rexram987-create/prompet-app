import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Sparkles, Copy, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { ChatMessage, StyleOption, AspectRatio } from '../types';
import { STYLES, ASPECT_RATIOS } from '../constants';
import { generateArchitectResponse, fileToPart } from '../services/geminiService';

interface PromptArchitectProps {
  onSaveHistory: (title: string, preview: string) => void;
}

const PromptArchitect: React.FC<PromptArchitectProps> = ({ onSaveHistory }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "שלום! אני אדריכל הפרומפטים שלך. תאר לי מה תרצה ליצור, ואני אבנה עבורך את הפרומפט המושלם. אתה יכול גם להעלות תמונה לניתוח.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>(STYLES[0]);
  const [selectedRatio, setSelectedRatio] = useState<string>(AspectRatio.Landscape);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSurpriseMe = () => {
    const surprises = [
      "עיר עתידנית המרחפת בין העננים בזריחה",
      "דרקון עשוי קריסטלים ישן בתוך מערה זוהרת",
      "דוכן אוכל רחוב בסגנון סייברפאנק בטוקיו הגשומה",
      "אסטרונאוט עושה מדיטציה על פני מאדים",
      "מכונת קפה בסגנון סטימפאנק עם פרטים מורכבים"
    ];
    setInput(surprises[Math.floor(Math.random() * surprises.length)]);
  };

  const handleSubmit = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: input,
      timestamp: Date.now(),
      image: imagePreview || undefined
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);

    // Prepare context for the AI
    let promptContext = input;
    if (selectedStyle.id !== 'none') {
      promptContext += `\n\nTarget Style: ${selectedStyle.label} (${selectedStyle.promptModifier})`;
    }
    promptContext += `\nTarget Aspect Ratio: ${selectedRatio}`;
    if (selectedImage) {
      promptContext += `\n(An image is attached for visual reference/analysis)`;
    }

    try {
      let imagePart = undefined;
      if (selectedImage) {
        const part = await fileToPart(selectedImage);
        imagePart = part;
      }

      const aiText = await generateArchitectResponse(promptContext, [], imagePart);

      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: 'model',
        text: aiText,
        timestamp: Date.now()
      }]);

      // Save to history (Use truncated input as title)
      const title = input.slice(0, 30) || "ניתוח תמונה";
      onSaveHistory(title, aiText);

      // Reset image state after sending
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "סליחה, נתקלתי בשגיאה ביצירת הפרומפט. אנא נסה שוב.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-cyber-900 relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {messages.map((msg) => (
          <div
            key={msg.id}
            // In RTL: User (Left) is standard for many HE apps, or User (Right). 
            // Standard Hebrew UI (like WhatsApp): User messages align Left (start of time axis? No, user is "me", typically right in LTR, left in RTL context varies).
            // Actually, in WhatsApp HE: User is Left (Green), Other is Right (White).
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] lg:max-w-[70%] p-4 rounded-2xl relative group ${
                msg.role === 'user'
                  ? 'bg-banana-500 text-cyber-900 rounded-bl-none'
                  : 'bg-cyber-800 text-slate-100 border border-cyber-700 rounded-br-none shadow-lg'
              }`}
            >
              {msg.image && (
                <div className="mb-3 rounded-lg overflow-hidden border border-black/10">
                  <img src={msg.image} alt="User upload" className="max-w-full h-auto max-h-60 object-cover" />
                </div>
              )}
              <div className="whitespace-pre-wrap leading-relaxed text-sm lg:text-base font-sans text-right" dir="auto">
                {msg.text}
              </div>
              
              {/* Copy Button for AI messages */}
              {msg.role === 'model' && (
                <button
                  onClick={() => handleCopy(msg.text, msg.id)}
                  className="absolute top-2 left-2 p-1.5 rounded-md bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  title="העתק פרומפט"
                >
                  {copiedId === msg.id ? <Check size={14} /> : <Copy size={14} />}
                </button>
              )}
              
              <div className={`text-[10px] mt-2 opacity-60 text-left ${msg.role === 'user' ? 'text-cyber-900' : 'text-slate-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-cyber-800 p-4 rounded-2xl rounded-br-none border border-cyber-700 flex items-center gap-2">
              <Loader2 className="animate-spin text-banana-500" size={18} />
              <span className="text-sm text-slate-400">חושב...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Sticky Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-cyber-900/90 backdrop-blur-md border-t border-cyber-700 p-4 z-10">
        <div className="max-w-4xl mx-auto space-y-3">
          
          {/* Controls */}
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar max-w-full">
              <select
                value={selectedStyle.id}
                onChange={(e) => setSelectedStyle(STYLES.find(s => s.id === e.target.value) || STYLES[0])}
                className="bg-cyber-800 text-slate-300 text-xs py-1.5 px-3 rounded-lg border border-cyber-600 focus:border-banana-500 outline-none"
              >
                {STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              
              <select
                value={selectedRatio}
                onChange={(e) => setSelectedRatio(e.target.value)}
                className="bg-cyber-800 text-slate-300 text-xs py-1.5 px-3 rounded-lg border border-cyber-600 focus:border-banana-500 outline-none"
              >
                {ASPECT_RATIOS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>

              <button
                onClick={handleSurpriseMe}
                className="flex items-center gap-1 bg-cyber-800 text-banana-500 text-xs py-1.5 px-3 rounded-lg border border-cyber-600 hover:bg-cyber-700 transition-colors whitespace-nowrap"
              >
                <Sparkles size={12} /> אוטומטי
              </button>
            </div>
          </div>

          {/* Image Preview Thumbnail */}
          {imagePreview && (
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-banana-500" />
              <button 
                onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div className="flex items-end gap-2 bg-cyber-800 p-2 rounded-xl border border-cyber-600 focus-within:border-banana-500 transition-colors shadow-lg">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-lg transition-colors ${selectedImage ? 'text-banana-500 bg-banana-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-cyber-700'}`}
              title="העלה תמונה"
            >
              <ImageIcon size={20} />
            </button>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="תאר/י את הרעיון שלך..."
              className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 text-sm p-2 outline-none resize-none max-h-32 min-h-[44px] text-right"
              rows={1}
            />

            <button
              onClick={handleSubmit}
              disabled={(!input.trim() && !selectedImage) || isLoading}
              className={`p-2 rounded-lg transition-all ${
                (!input.trim() && !selectedImage) || isLoading
                  ? 'bg-cyber-700 text-slate-500 cursor-not-allowed'
                  : 'bg-banana-500 text-cyber-900 hover:bg-banana-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
              }`}
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="transform rotate-180" />} 
              {/* Rotate Send icon for RTL if needed, but 'Send' usually points right/forward. In RTL 'forward' is Left. */}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Close Icon Helper
const X = ({ size }: { size: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default PromptArchitect;