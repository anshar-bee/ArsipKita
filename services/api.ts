import { Memory } from '../types';

// ============================================================================================
// INSTRUKSI UPDATE BACKEND (PENTING!)
// ============================================================================================
// Agar fitur EDIT berfungsi, Anda HARUS mengupdate kode di Google Apps Script.
// 1. Buka Google Sheet database Anda.
// 2. Klik Extensions > Apps Script.
// 3. Ganti seluruh kode yang ada dengan kode di bawah ini.
// 4. Klik Deploy > New deployment.
// 5. Pilih type 'Web app', description 'Update V2', execute as 'Me', access 'Anyone'.
// 6. Klik Deploy dan pastikan URL Web App di variabel API_URL di bawah ini sesuai.

/*
// --- KODE GOOGLE APPS SCRIPT MULAI ---

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    if (action === 'create') {
      // Menambah data baru
      sheet.appendRow([
        data.id,
        data.date,
        data.title,
        data.description,
        data.imageBase64,
        data.rotation || 0,
        data.swayClass || ''
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', action: 'create' })).setMimeType(ContentService.MimeType.JSON);
    } 
    
    else if (action === 'delete') {
      // Menghapus data berdasarkan ID
      var rows = sheet.getDataRange().getValues();
      var deleteId = data.id;
      
      // Loop dari bawah untuk menghindari indeks bergeser saat delete
      for (var i = rows.length - 1; i >= 0; i--) {
        if (rows[i][0].toString() == deleteId.toString()) {
          sheet.deleteRow(i + 1);
          return ContentService.createTextOutput(JSON.stringify({ status: 'success', action: 'delete' })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'ID not found' })).setMimeType(ContentService.MimeType.JSON);
    }

    else if (action === 'update') {
      // Update data (Title & Description) berdasarkan ID
      var rows = sheet.getDataRange().getValues();
      var updateId = data.id;
      
      for (var i = 0; i < rows.length; i++) {
        if (rows[i][0].toString() == updateId.toString()) {
          // Kolom ke-3 adalah Title (index 2), Kolom ke-4 adalah Description (index 3)
          // Baris di sheet dimulai dari 1, array dimulai dari 0. Jadi row i+1.
          
          // Update Title
          sheet.getRange(i + 1, 3).setValue(data.title);
          // Update Description
          sheet.getRange(i + 1, 4).setValue(data.description);
          
          return ContentService.createTextOutput(JSON.stringify({ status: 'success', action: 'update' })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'ID not found' })).setMimeType(ContentService.MimeType.JSON);
    }

    else if (action === 'read') {
      // Membaca semua data (biasanya via doGet, tapi doPost juga bisa jika diperlukan)
      var rows = sheet.getDataRange().getValues();
      var result = [];
      // Skip header row if exists, or adjust loop
      for (var i = 1; i < rows.length; i++) {
        result.push({
          id: rows[i][0],
          date: rows[i][1],
          title: rows[i][2],
          description: rows[i][3],
          imageUrl: "data:image/jpeg;base64," + rows[i][4],
          rotation: rows[i][5],
          swayClass: rows[i][6]
        });
      }
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }

  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: e.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  // Setup untuk mengambil data (Fetch)
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var result = [];
  
  // Asumsi baris 1 adalah Header, data mulai dari baris 2 (index 1)
  for (var i = 1; i < rows.length; i++) {
    // Validasi data minimal punya ID
    if(rows[i][0]) {
      result.push({
        id: rows[i][0],
        date: rows[i][1],
        title: rows[i][2],
        description: rows[i][3],
        imageUrl: "data:image/jpeg;base64," + rows[i][4],
        rotation: rows[i][5],
        swayClass: rows[i][6]
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

// --- KODE SELESAI ---
*/

// GANTI URL INI DENGAN URL DEPLOYMENT GOOGLE APPS SCRIPT ANDA
const API_URL = "https://script.google.com/macros/s/AKfycbw-S1uvKSJz9fgug-h8hBR_fyADYEW7H6JKL4XDG5f22i4fmSBqI5iJa91pO6PyD0Jd/exec";

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
      const payload = {
        action: 'create',
        ...memory
      };

      // Explicitly use text/plain to avoid CORS preflight issues on GAS
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      return result.status === 'success';
    } catch (error) {
      console.error("Error adding memory:", error);
      return false;
    }
  },

  updateMemory: async (id: string, title: string, description: string): Promise<boolean> => {
    try {
      const payload = {
        action: 'update',
        id: id,
        title: title,
        description: description
      };

      // Explicitly use text/plain to avoid CORS preflight issues on GAS
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      return result.status === 'success';
    } catch (error) {
      console.error("Error updating memory:", error);
      return false;
    }
  },

  deleteMemory: async (id: string): Promise<boolean> => {
    try {
      const payload = {
        action: 'delete',
        id: id
      };

      // Explicitly use text/plain to avoid CORS preflight issues on GAS
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
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