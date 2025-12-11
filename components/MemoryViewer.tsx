import React from 'react';
import { Memory } from '../types';
import { X } from 'lucide-react';

interface MemoryViewerProps {
  memory: Memory;
  onClose: () => void;
}

export const MemoryViewer: React.FC<MemoryViewerProps> = ({ memory, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-20 md:p-8" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 p-4 pt-4 pb-8 shadow-2xl rounded-sm max-w-2xl w-full transform transition-all duration-300 scale-100 border border-transparent dark:border-slate-700 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-slate-800 mb-6 rounded-sm border border-gray-200 dark:border-slate-700">
           <img 
            src={memory.imageUrl} 
            alt={memory.title} 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="px-2 text-center">
          <h3 className="font-display text-3xl text-gray-800 dark:text-gray-100 mb-2">{memory.title}</h3>
          <p className="font-hand text-xl text-gray-600 dark:text-gray-300 leading-relaxed">{memory.description}</p>
          <p className="font-sans text-xs text-gray-400 dark:text-gray-500 mt-4 uppercase tracking-widest">{new Date(memory.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
          title="Tutup"
        >
          <X size={24} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
};