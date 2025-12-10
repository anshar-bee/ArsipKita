import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Loader2, X } from 'lucide-react';
import { analyzeImage } from '../services/gemini';
import { Memory } from '../types';

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onAdd now accepts the base64 string instead of URL directly, and returns a promise
  onAdd: (memory: Omit<Memory, 'id' | 'rotation' | 'swayClass' | 'imageUrl'> & { imageBase64: string }) => Promise<void>;
}

export const AddMemoryModal: React.FC<AddMemoryModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        // Reset fields when new image selected
        setTitle('');
        setDescription('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    try {
      // Remove data URL prefix for API
      const base64Data = image.split(',')[1];
      const result = await analyzeImage(base64Data);
      setTitle(result.title);
      setDescription(result.description);
    } catch (error) {
      console.error("Failed to analyze", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (image && title) {
      setIsSubmitting(true);
      // Remove header from base64 string for storage optimization if needed, 
      // but here we pass full string or split it. Let's pass split for API consistency.
      const base64Data = image.split(',')[1];
      
      await onAdd({
        imageBase64: base64Data,
        title,
        description,
        date: new Date().toISOString(),
      });
      setIsSubmitting(false);
      handleClose();
    }
  };

  const handleClose = () => {
    setImage(null);
    setTitle('');
    setDescription('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
          <h2 className="font-display text-2xl text-gray-800 dark:text-gray-100">Tambah Kenangan</h2>
          <button onClick={handleClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto no-scrollbar">
          <div className="space-y-6">
            {/* Image Upload Area */}
            <div 
              onClick={() => !isSubmitting && fileInputRef.current?.click()}
              className={`
                relative aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
                ${image 
                  ? 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800' 
                  : 'border-indigo-300 dark:border-indigo-700/50 bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100/50 dark:hover:bg-slate-700'
                }
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload size={24} />
                  </div>
                  <p className="font-sans text-sm text-gray-600 dark:text-gray-400">Klik untuk upload foto</p>
                  <p className="font-sans text-xs text-gray-400 dark:text-gray-500 mt-1">JPEG, PNG</p>
                </div>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
                disabled={isSubmitting}
              />
            </div>

            {/* AI Action Main */}
            {image && (
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || isSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span className="font-hand text-lg">Sedang merangkai kata...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span className="font-hand text-lg">Beri Judul & Cerita Ajaib</span>
                  </>
                )}
              </button>
            )}

            {/* Form Fields */}
            <form id="memoryForm" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Misal: Pantai Kuta 2023"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-display text-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cerita Singkat</label>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Tulis sedikit cerita tentang foto ini..."
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none h-24 font-hand text-lg resize-none bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors disabled:opacity-50"
                />
              </div>
            </form>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
          <button
            form="memoryForm"
            type="submit"
            disabled={!image || !title || isSubmitting}
            className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Menyimpan ke Google Drive...</span>
              </>
            ) : (
              'Simpan ke Arsip'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};