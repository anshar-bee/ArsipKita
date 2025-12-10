// Kita tidak lagi mengimport @google/genai di sini karena logika sudah pindah ke server (api/analyze.js)
// Ini membuat loading website lebih ringan dan API Key aman.

export const analyzeImage = async (base64Image: string): Promise<{ title: string; description: string }> => {
  try {
    // Panggil Endpoint Serverless Vercel kita sendiri
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageBase64: base64Image }),
    });

    if (!response.ok) {
      throw new Error('Gagal menghubungi AI Server');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error analyzing image:", error);
    return {
      title: "Sebuah Kenangan",
      description: "Kenangan indah yang tersimpan abadi di dalam hati."
    };
  }
};