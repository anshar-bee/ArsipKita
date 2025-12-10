import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-sm overflow-hidden transform transition-all scale-100 border border-gray-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} />
          </div>
          <h3 className="font-display text-2xl text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
          <p className="font-sans text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Apakah kamu yakin ingin menghapus kenangan ini? <br/>
            <span className="text-red-500/80 dark:text-red-400/80 text-xs">Foto di Google Drive juga akan dihapus otomatis.</span>
          </p>
          
          <div className="flex gap-3 justify-center">
             <button 
              onClick={onClose}
              className="px-5 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
            >
              Batal
            </button>
            <button 
              onClick={onConfirm}
              className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium text-sm shadow-md hover:shadow-lg"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};