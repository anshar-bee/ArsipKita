import { Memory } from '../types';

// GANTI URL INI DENGAN URL DEPLOYMENT GOOGLE APPS SCRIPT ANDA
const API_URL = "https://script.google.com/macros/s/AKfycbwMmnDR8mLoaszkumySAEo95kGJkKuREalgy8DgTB2HgsCZTnQWPy_pKzV-eMBRMS26/exec";

export const api = {
  fetchMemories: async (): Promise<Memory[]> => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      // Sort by date descending (newest first)
      return data.sort((a: Memory, b: Memory) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error("Error fetching memories:", error);
      return [];
    }
  },

  addMemory: async (memory: Omit<Memory, 'imageUrl'> & { imageBase64: string }): Promise<boolean> => {
    try {
      // We use fetch with no-cors-like behavior via text/plain to avoid OPTIONS preflight issues in GAS
      const payload = {
        action: 'create',
        ...memory
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      return result.status === 'success';
    } catch (error) {
      console.error("Error adding memory:", error);
      return false;
    }
  },

  deleteMemory: async (id: string): Promise<boolean> => {
    try {
      const payload = {
        action: 'delete',
        id: id
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      return result.status === 'success';
    } catch (error) {
      console.error("Error deleting memory:", error);
      return false;
    }
  }
};