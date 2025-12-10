import React, { useState } from 'react';
import { Memory } from '../types';
import { Maximize2, X } from 'lucide-react';

interface PhotoCardProps {
  memory: Memory;
  onDelete: (id: string) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ memory, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // If expanded, we remove the rotation and sway for a clear view
  const containerStyle = isExpanded 
    ? { transform: 'none', zIndex: 50, position: 'fixed' as const, top: '10%', left: '50%', translate: '-50% 0', width: '90%', maxWidth: '600px' }
    : { transform: `rotate(${memory.rotation}deg)` };
    
  // Reduced margin from m-6 to m-2/m-3 for tighter packing
  const cardClass = isExpanded 
    ? "fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    : `relative inline-block m-2 md:m-3 transition-transform duration-300 ease-out hover:scale-105 hover:z-10 ${memory.swayClass || ''}`;

  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-24 md:p-8" onClick={() => setIsExpanded(false)}>
        <div 
          className="bg-white dark:bg-slate-900 p-4 pt-4 pb-8 shadow-2xl rounded-sm max-w-2xl w-full transform transition-all duration-300 scale-100 border border-transparent dark:border-slate-700 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-slate-800 mb-6 rounded-sm border border-gray-200 dark:border-slate-700">
             <img 
              src={memory.imageUrl} 
              alt={memory.title} 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="px-2 text-center">
            <h3 className="font-display text-3xl text-gray-800 dark:text-gray-100 mb-2">{memory.title}</h3>
            <p className="font-hand text-xl text-gray-600 dark:text-gray-300 leading-relaxed">{memory.description}</p>
            <p className="font-sans text-xs text-gray-400 dark:text-gray-500 mt-4 uppercase tracking-widest">{new Date(memory.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <button 
            onClick={() => setIsExpanded(false)}
            className="absolute top-2 right-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cardClass}
      style={!memory.swayClass ? { transform: `rotate(${memory.rotation}deg)` } : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tape Effect - Slightly smaller */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-yellow-100/80 dark:bg-yellow-200/60 rotate-3 z-20 shadow-sm opacity-80 backdrop-blur-[1px]" style={{ clipPath: 'polygon(0% 0%, 100% 5%, 95% 100%, 5% 95%)' }}></div>

      {/* Reduced padding (p-2) and width (w-[180px] to w-[220px]) */}
      <div className="paper-texture p-2 pb-6 shadow-lg transition-shadow duration-300 hover:shadow-2xl w-[180px] md:w-[200px] lg:w-[220px]">
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-slate-800 mb-3 border border-gray-200/50 dark:border-slate-700/50">
          <img 
            src={memory.imageUrl} 
            alt={memory.title} 
            className="w-full h-full object-cover sepia-[.15] contrast-[.95] brightness-[1.05]"
            loading="lazy"
          />
          
          {/* Actions Overlay */}
          <div className={`absolute inset-0 bg-black/10 dark:bg-black/30 transition-opacity duration-300 flex items-center justify-center gap-2 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button 
              onClick={() => setIsExpanded(true)}
              className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-md hover:scale-110 transition-transform text-gray-700 dark:text-gray-200"
              title="Perbesar"
            >
              <Maximize2 size={14} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(memory.id); }}
              className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-md hover:scale-110 transition-transform text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
              title="Hapus"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="text-center px-1">
          {/* Reduced font sizes */}
          <h3 className="font-display text-lg text-gray-800 dark:text-gray-100 leading-tight mb-1 truncate">{memory.title}</h3>
          <p className="font-hand text-sm text-gray-500 dark:text-gray-400 leading-tight line-clamp-2 min-h-[2.5em]">{memory.description}</p>
          <div className="mt-2 border-t border-gray-200/60 dark:border-slate-700/60 pt-1 w-1/2 mx-auto"></div>
          <span className="font-script text-[10px] text-gray-400 dark:text-gray-500 opacity-70">{new Date(memory.date).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};