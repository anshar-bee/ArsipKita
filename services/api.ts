import { Memory } from '../types';

// ============================================================================================
// INSTRUKSI UPDATE BACKEND (PENTING! VERSI GOOGLE DRIVE)
// ============================================================================================
// Agar gambar tersimpan di Google Drive (tidak rusak), ikuti langkah ini:
// 1. Buat FOLDER BARU di Google Drive Anda (beri nama misal: "Database Arsip Kita").
// 2. Buka folder tersebut, dan salin ID FOLDER dari URL browser.
//    (Contoh URL: drive.google.com/drive/u/0/folders/1AbC-1234_xYz... -> ID-nya adalah "1AbC-1234_xYz...")
// 3. Buka Extensions > Apps Script di Google Sheet.
// 4. Hapus semua kode lama, dan paste kode di bawah ini.
// 5. ISI variabel FOLDER_ID di baris paling atas dengan ID Folder yang Anda salin.
// 6. Klik Deploy > New deployment > Web app > Execute as Me > Who has access: Anyone > Deploy.
// 7. Saat Deploy, Google akan meminta izin akses Drive (Review Permissions). Izinkan.
// 8. Copy URL Web App baru dan paste ke konstanta API_URL di bawah.

/*
// --- KODE GOOGLE APPS SCRIPT MULAI ---

// !!! PENTING: GANTI INI DENGAN ID FOLDER GOOGLE DRIVE ANDA !!!
var FOLDER_ID = "GANTI_DENGAN_ID_FOLDER_DRIVE_ANDA_DISINI"; 

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    if (action === 'create') {
      // 1. Decode gambar dari Base64
      var imageBlob = Utilities.newBlob(Utilities.base64Decode(data.imageBase64), MimeType.JPEG, data.title);
      
      // 2. Simpan ke Google Drive
      var folder = DriveApp.getFolderById(FOLDER_ID);
      var file = folder.createFile(imageBlob);
      
      // 3. Atur agar file bisa dilihat publik (supaya bisa tampil di web)
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      // 4. Ambil Direct Link untuk gambar
      // Menggunakan format uc?export=view agar bisa dirender sebagai gambar
      var fileUrl = "https://drive.google.com/uc?export=view&id=" + file.getId();

      // 5. Simpan URL ke Spreadsheet (Bukan base64 lagi, jadi hemat tempat & tidak error)
      sheet.appendRow([
        data.id,
        data.date,
        data.title,
        data.description,
        fileUrl,            // Kolom E sekarang menyimpan URL Drive
        data.rotation || 0,
        data.swayClass || ''
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', action: 'create' })).setMimeType(ContentService.MimeType.JSON);
    } 
    
    else if (action === 'delete') {
      var rows = sheet.getDataRange().getValues();
      var deleteId = data.id;
      
      for (var i = rows.length - 1; i >= 0; i--) {
        if (rows[i][0].toString() == deleteId.toString()) {
          // Opsional: Hapus juga file dari Drive untuk menghemat ruang
          try {
            var fileUrl = rows[i][4];
            if (fileUrl.indexOf("id=") > -1) {
              var fileId = fileUrl.split("id=")[1];
              DriveApp.getFileById(fileId).setTrashed(true);
            }
          } catch(err) {
            // Abaikan jika gagal hapus file di drive (mungkin format lama)
          }

          sheet.deleteRow(i + 1);
          return ContentService.createTextOutput(JSON.stringify({ status: 'success', action: 'delete' })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'ID not found' })).setMimeType(ContentService.MimeType.JSON);
    }

    else if (action === 'update') {
      var rows = sheet.getDataRange().getValues();
      var updateId = data.id;
      
      for (var i = 0; i < rows.length; i++) {
        if (rows[i][0].toString() == updateId.toString()) {
          sheet.getRange(i + 1, 3).setValue(data.title);
          sheet.getRange(i + 1, 4).setValue(data.description);
          return ContentService.createTextOutput(JSON.stringify({ status: 'success', action: 'update' })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'ID not found' })).setMimeType(ContentService.MimeType.JSON);
    }

  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: e.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var result = [];
  
  for (var i = 1; i < rows.length; i++) {
    if(rows[i][0]) {
      var imgData = rows[i][4];
      var finalImg = "";
      
      // Cek apakah data lama (Base64 panjang) atau data baru (URL Drive)
      if (imgData.toString().startsWith("http")) {
        finalImg = imgData; // Sudah URL
      } else if (imgData.toString().length > 0) {
        finalImg = "data:image/jpeg;base64," + imgData; // Format lama (Base64)
      }

      result.push({
        id: rows[i][0],
        date: rows[i][1],
        title: rows[i][2],
        description: rows[i][3],
        imageUrl: finalImg,
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
const API_URL = "https://script.google.com/macros/s/AKfycbx1WrMtih5BDZp0fwBBhawaxb2KmksSGLeoG9mkuu2ioJ6sjhwc9jCcfuzQRywLchss/exec";

export const api = {
  fetchMemories: async (): Promise<Memory[]> => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      // Filter data valid.
      // Kita turunkan batas length check ke 20 karena URL Drive lebih pendek dari Base64
      const validData = data.filter((m: any) => {
        const hasValidImage = m.imageUrl && m.imageUrl.length > 20 && !m.imageUrl.includes('undefined');
        return m.id && hasValidImage;
      });

      return validData.sort((a: Memory, b: Memory) => new Date(b.date).getTime() - new Date(a.date).getTime());
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