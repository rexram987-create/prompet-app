import React, { useState } from 'react';
import { Download, Loader2, Wand2, Smartphone, Monitor, Square, Columns } from 'lucide-react';
import { AspectRatio } from '../types';
import { ASPECT_RATIOS } from '../constants';
import { generateWallpaperImage } from '../services/geminiService';

interface WallpaperGeneratorProps {
  onSaveHistory: (title: string, preview: string) => void;
}

const WallpaperGenerator: React.FC<WallpaperGeneratorProps> = ({ onSaveHistory }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState<string>(AspectRatio.Portrait);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const base64Image = await generateWallpaperImage(prompt, selectedRatio);
      const fullImageStr = `data:image/png;base64,${base64Image}`;
      setGeneratedImage(fullImageStr);
      onSaveHistory(prompt.slice(0, 50) + "...", fullImageStr);
    } catch (err) {
      setError("נכשל ביצירת תמונה. נסה לשנות את הפרומפט או לפשט את הפרמטרים.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `nano-banana-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getRatioIcon = (id: string) => {
    switch (id) {
      case AspectRatio.Mobile: return <Smartphone size={20} />;
      case AspectRatio.Landscape: return <Monitor size={20} />;
      case AspectRatio.Square: return <Square size={20} />;
      default: return <Columns size={20} className="rotate-90" />;
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 p-4 md:p-6 bg-cyber-900 overflow-y-auto">
      
      {/* Controls Panel (Right side in RTL) */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        
        <div className="space-y-2">
          <h3 className="text-banana-500 font-mono text-sm uppercase tracking-wider">01. תיאור</h3>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="רחוב סייברפאנק בלילה, אורות ניאון, גשם, רזולוציה גבוהה 8k..."
            className="w-full h-32 bg-cyber-800 border border-cyber-700 rounded-xl p-4 text-slate-200 focus:border-banana-500 focus:ring-1 focus:ring-banana-500 outline-none resize-none transition-all text-right"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-banana-500 font-mono text-sm uppercase tracking-wider">02. פורמט</h3>
          <div className="grid grid-cols-2 gap-3">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.id}
                onClick={() => setSelectedRatio(ratio.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  selectedRatio === ratio.id
                    ? 'bg-banana-500/10 border-banana-500 text-banana-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                    : 'bg-cyber-800 border-cyber-700 text-slate-400 hover:bg-cyber-700 hover:text-slate-200'
                }`}
              >
                {getRatioIcon(ratio.id)}
                <span className="text-xs mt-2 font-medium">{ratio.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className={`mt-4 w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
            isGenerating || !prompt.trim()
              ? 'bg-cyber-700 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-banana-500 to-banana-600 text-cyber-900 hover:from-banana-400 hover:to-banana-500 shadow-banana-500/20'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" /> יוצר...
            </>
          ) : (
            <>
              <Wand2 /> צור טפט
            </>
          )}
        </button>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Preview Panel (Left side in RTL) */}
      <div className="w-full md:w-2/3 bg-cyber-950/50 rounded-2xl border border-cyber-700/50 flex flex-col relative overflow-hidden min-h-[400px]">
        {generatedImage ? (
          <div className="relative w-full h-full flex items-center justify-center p-4">
             {/* Background blur effect */}
             <div 
               className="absolute inset-0 opacity-20 blur-3xl z-0" 
               style={{ backgroundImage: `url(${generatedImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} 
             />
             
             {/* Actual Image */}
             <img 
               src={generatedImage} 
               alt="Generated Wallpaper" 
               className="relative z-10 max-w-full max-h-full rounded-lg shadow-2xl border border-white/10 object-contain"
             />

             {/* Action Bar */}
             <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-4">
               <button
                 onClick={handleDownload}
                 className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-slate-200 transition-colors shadow-xl"
               >
                 <Download size={18} /> הורד
               </button>
             </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
            <div className="w-24 h-24 rounded-full bg-cyber-800 flex items-center justify-center mb-4 border border-cyber-700">
              <Wand2 size={40} className="text-cyber-600" />
            </div>
            <p className="font-mono text-sm">מוכן ליצירה.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default WallpaperGenerator;