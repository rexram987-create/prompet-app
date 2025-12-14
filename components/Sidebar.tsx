import React from 'react';
import { HistoryItem } from '../types';
import { Clock, MessageSquare, Image as ImageIcon, Trash2, X } from 'lucide-react';

interface SidebarProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ history, onSelect, onClear, isOpen, onClose }) => {
  return (
    <div 
      className={`fixed inset-y-0 right-0 z-50 w-72 bg-cyber-900 border-l border-cyber-700 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } lg:relative lg:translate-x-0 flex flex-col`}
    >
      <div className="p-4 border-b border-cyber-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Clock size={20} className="text-banana-500" />
          היסטוריה
        </h2>
        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {history.length === 0 ? (
          <p className="text-slate-500 text-sm text-center mt-10">אין היסטוריה עדיין.</p>
        ) : (
          history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full text-right p-3 rounded-lg bg-cyber-800 hover:bg-cyber-700 border border-transparent hover:border-banana-500/50 transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                {item.type === 'architect' ? (
                  <MessageSquare size={14} className="text-blue-400" />
                ) : (
                  <ImageIcon size={14} className="text-purple-400" />
                )}
                <span className="text-xs text-slate-400">
                  {new Date(item.timestamp).toLocaleDateString('he-IL')}
                </span>
              </div>
              <p className="text-sm text-slate-200 line-clamp-2">{item.title}</p>
            </button>
          ))
        )}
      </div>

      <div className="p-4 border-t border-cyber-700">
        <button
          onClick={onClear}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
          נקה היסטוריה
        </button>
      </div>
    </div>
  );
};

export default Sidebar;