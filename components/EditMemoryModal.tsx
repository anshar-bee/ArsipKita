import React, { useState, useEffect } from 'react';
import { Save, Loader2, X } from 'lucide-react';
import { Memory } from '../types';

interface EditMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, title: string, description: string) => Promise<void>;
  memory: Memory | null;
}

export const EditMemoryModal: React.FC<EditMemoryModalProps> = ({ isOpen, onClose, onUpdate, memory }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (memory) {
      setTitle(memory.title);
      setDescription(memory.description);
    }
  }, [memory]);

  if (!isOpen || !memory) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title && description) {
      setIsSubmitting(true);
      await onUpdate(memory.id, title, description);
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
          <h2 className="font-display text-2xl text-gray-800 dark:text-gray-100">Edit Kenangan</h2>
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto no-scrollbar">
          <div className="space-y-6">
            {/* Image Preview (Read Only) */}
            <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
               <img 
                src={memory.imageUrl} 
                alt="Preview" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Form Fields */}
            <form id="editForm" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-display text-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cerita Singkat</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none h-32 font-hand text-lg resize-none bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors disabled:opacity-50"
                />
              </div>
            </form>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
          <button
            form="editForm"
            type="submit"
            disabled={!title || isSubmitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Menyimpan Perubahan...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};