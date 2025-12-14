import React, { useState, useEffect } from 'react';
import { Menu, Zap, Image as ImageIcon } from 'lucide-react';
import PromptArchitect from './components/PromptArchitect';
import WallpaperGenerator from './components/WallpaperGenerator';
import Sidebar from './components/Sidebar';
import { HistoryItem, TabView } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<TabView>('architect');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('nano-banana-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  // Save history helper
  const saveToHistory = (title: string, preview: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      title,
      timestamp: Date.now(),
      preview,
      type: activeTab
    };
    const updated = [newItem, ...history].slice(0, 50); // Limit to 50 items
    setHistory(updated);
    localStorage.setItem('nano-banana-history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('nano-banana-history');
  };

  return (
    <div className="flex h-screen w-screen bg-cyber-900 text-slate-100 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <Sidebar 
        history={history}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onClear={clearHistory}
        onSelect={(item) => {
          setActiveTab(item.type);
          setIsSidebarOpen(false);
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Header */}
        <header className="h-16 border-b border-cyber-700 bg-cyber-900/90 backdrop-blur flex items-center px-4 justify-between z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-cyber-800 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-banana-500 rounded-lg flex items-center justify-center text-cyber-900 font-bold text-lg">
                N
              </div>
              <h1 className="font-bold text-lg tracking-tight hidden md:block">
                סטודיו <span className="font-light text-slate-400">ננו בננה</span>
              </h1>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-cyber-800 p-1 rounded-xl border border-cyber-700">
            <button
              onClick={() => setActiveTab('architect')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'architect' 
                  ? 'bg-cyber-700 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap size={16} className={activeTab === 'architect' ? 'text-banana-500' : ''} />
              <span className="hidden sm:inline">אדריכל פרומפטים</span>
            </button>
            <button
              onClick={() => setActiveTab('wallpaper')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'wallpaper' 
                  ? 'bg-cyber-700 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon size={16} className={activeTab === 'wallpaper' ? 'text-purple-400' : ''} />
              <span className="hidden sm:inline">מחולל טפטים</span>
            </button>
          </div>
        </header>

        {/* Workspace */}
        <main className="flex-1 relative overflow-hidden">
          {activeTab === 'architect' ? (
            <div className="h-full animate-fade-in">
              <PromptArchitect onSaveHistory={saveToHistory} />
            </div>
          ) : (
            <div className="h-full animate-fade-in">
              <WallpaperGenerator onSaveHistory={saveToHistory} />
            </div>
          )}
        </main>

      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;