import React, { useState, useEffect } from 'react';
import { Plus, Search, Archive, Sun, Moon, Calendar, Loader2, Lock, ArrowRight, KeyRound } from 'lucide-react';
import { PhotoCard } from './components/PhotoCard';
import { AddMemoryModal } from './components/AddMemoryModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Memory } from './types';
import { api } from './services/api';

const SWAY_CLASSES = ['sway-slow', 'sway-medium', 'sway-fast'];
const MEMORIES_CACHE_KEY = 'arsip_memories_data'; // Key for localStorage caching

function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false); // New state for loading

  // App State
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [isDarkMode, setIsDarkMode] = useState(() => 
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Check Local Storage for Auth
  useEffect(() => {
    const storedAuth = localStorage.getItem('arsip_authenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load memories with caching strategy
  const loadMemories = async () => {
    const cachedData = localStorage.getItem(MEMORIES_CACHE_KEY);
    let hasCache = false;

    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setMemories(parsedData);
          setIsLoading(false);
          hasCache = true;
        }
      } catch (error) {
        console.error("Failed to parse memories cache", error);
      }
    }

    if (!hasCache) {
      setIsLoading(true);
    }

    try {
      const data = await api.fetchMemories();
      setMemories(data);
      localStorage.setItem(MEMORIES_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Network fetch failed, relying on cache if available");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadMemories();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(false);
    setIsVerifying(true);

    try {
      // Panggil API Vercel untuk verifikasi password
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });

      const result = await response.json();

      if (result.success) {
        setIsAuthenticated(true);
        localStorage.setItem('arsip_authenticated', 'true');
        setAuthError(false);
      } else {
        setAuthError(true);
      }
    } catch (error) {
      console.error("Auth error:", error);
      setAuthError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('arsip_authenticated');
    setPasswordInput('');
  };

  const handleAddMemory = async (newMemoryData: Omit<Memory, 'id' | 'rotation' | 'swayClass' | 'imageUrl'> & { imageBase64: string }) => {
    const tempId = Date.now().toString();
    const rotation = Math.random() * 6 - 3;
    const swayClass = SWAY_CLASSES[Math.floor(Math.random() * SWAY_CLASSES.length)];
    
    const success = await api.addMemory({
      ...newMemoryData,
      id: tempId,
      rotation,
      swayClass
    });

    if (success) {
      await loadMemories();
      setIsModalOpen(false);
    } else {
      alert("Gagal menyimpan kenangan. Silakan coba lagi.");
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      const previousMemories = [...memories];
      const newMemories = memories.filter(m => m.id !== deleteId);
      
      setMemories(newMemories);
      localStorage.setItem(MEMORIES_CACHE_KEY, JSON.stringify(newMemories));
      
      setDeleteId(null);

      const success = await api.deleteMemory(deleteId);
      if (!success) {
        setMemories(previousMemories);
        localStorage.setItem(MEMORIES_CACHE_KEY, JSON.stringify(previousMemories));
        alert("Gagal menghapus kenangan.");
      }
    }
  };

  const filteredMemories = memories.filter(m => {
    const dateString = new Date(m.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const matchesSearch = 
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dateString.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (!isAuthenticated) {
    if (isCheckingAuth) return null;
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300 bg-[#f8fafc] dark:bg-[#0f172a] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 p-8 md:p-10 text-center transform transition-all">
            
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-gray-700 dark:text-gray-200 shadow-inner">
              <Lock size={32} />
            </div>

            <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Arsip Rahasia</h1>
            <p className="font-hand text-lg text-gray-500 dark:text-gray-400 mb-8">Masukkan kode kunci untuk membuka kenangan.</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <KeyRound size={18} />
                </div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError(false);
                  }}
                  disabled={isVerifying}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-sans text-gray-800 dark:text-white placeholder-gray-400 ${authError ? 'border-red-500 ring-2 ring-red-100 dark:ring-red-900/20' : 'border-gray-200 dark:border-slate-700'} ${isVerifying ? 'opacity-70 cursor-not-allowed' : ''}`}
                  placeholder="Kode Akses"
                  autoFocus
                />
              </div>

              {authError && (
                <p className="text-red-500 text-sm font-hand animate-pulse">Kode salah, coba lagi ya.</p>
              )}

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all font-medium flex items-center justify-center gap-2 group mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                   <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>Buka Arsip</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
              <p className="font-script text-xs text-gray-400">Secure Personal Archive • 2023</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main App Content
  return (
    <div className="min-h-screen relative flex flex-col transition-colors duration-300">
      {/* Background decorations - String lines */}
      <div className="fixed top-32 left-0 right-0 h-px bg-gray-300 dark:bg-slate-700 shadow-sm z-0 transition-colors"></div>
      <div className="fixed top-96 left-0 right-0 h-px bg-gray-300 dark:bg-slate-700 shadow-sm z-0 transition-colors"></div>
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-40 border-b border-gray-200/50 dark:border-slate-700/50 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleLogout} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-2 rounded-lg transition-colors hover:scale-105 active:scale-95" title="Keluar">
               <Archive size={20} />
            </button>
            <h1 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-100 tracking-wide transition-colors hidden sm:block">Arsip Kita</h1>
            <h1 className="text-2xl font-display font-bold text-gray-800 dark:text-gray-100 tracking-wide transition-colors sm:hidden">Arsip</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Search Bar - Desktop */}
            <div className="hidden md:flex items-center bg-gray-100 dark:bg-slate-800 rounded-full px-4 py-1.5 border border-gray-200 dark:border-slate-700 transition-colors group focus-within:ring-2 focus-within:ring-indigo-500/20">
              <Search size={16} className="text-gray-400 dark:text-gray-500 mr-2" />
              <input 
                type="text" 
                placeholder="Cari..." 
                className="bg-transparent border-none outline-none text-sm w-32 lg:w-48 font-sans text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition-colors"
              title={isDarkMode ? "Mode Siang" : "Mode Malam"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-2 md:px-4 md:py-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={18} />
              <span className="font-medium text-sm hidden sm:inline">Tambah</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Filters Row */}
        <div className="md:hidden px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
           <div className="flex-1 flex items-center bg-gray-100 dark:bg-slate-800 rounded-full px-3 py-1.5 border border-gray-200 dark:border-slate-700">
              <Search size={16} className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Cari kenangan..." 
                className="bg-transparent border-none outline-none text-sm w-full font-sans text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 min-w-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
        </div>
      </header>

      {/* Main Wall */}
      <main className="flex-1 pt-32 md:pt-24 pb-12 px-4 overflow-x-hidden relative z-10">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
              <p className="font-hand text-xl text-gray-500 dark:text-gray-400">Mengambil kenangan dari awan...</p>
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center opacity-60">
              <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 transition-colors">
                <Calendar size={40} className="text-gray-400 dark:text-gray-500" />
              </div>
              <p className="font-hand text-2xl text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Tidak ada kenangan yang ditemukan.' : 'Belum ada kenangan tersimpan.'}
              </p>
              <p className="font-sans text-sm text-gray-400 dark:text-gray-500 mt-2">
                {searchTerm ? 'Coba ubah kata kuncimu.' : 'Mulailah dengan tombol Tambah di atas.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 pb-20">
              {filteredMemories.map((memory) => (
                <PhotoCard 
                  key={memory.id} 
                  memory={memory} 
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer Decoration */}
      <div className="fixed bottom-4 left-4 font-script text-gray-300 dark:text-slate-700 text-sm select-none z-0 transition-colors">
        est. 2023
      </div>

      <AddMemoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddMemory} 
      />

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Hapus Kenangan?"
        message=""
      />
    </div>
  );
}

export default App;