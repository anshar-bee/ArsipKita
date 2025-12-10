import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  // Ambil API Key dari Environment Variable Vercel
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'GEMINI_API_KEY not configured in Vercel' });
  }

  try {
    // Di Vercel Serverless (Node.js), gunakan request.body langsung
    const { imageBase64 } = request.body;
    
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64
            }
          },
          {
            text: "Analyze this image and provide a nostalgic, heartwarming title (max 5 words) and a short, poetic description (max 30 words) in Indonesian suitable for a personal memory scrapbook. Return as JSON."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "description"]
        }
      }
    });

    const text = result.text;
    const json = JSON.parse(text);
    return response.status(200).json(json);

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback response jika AI gagal
    return response.status(200).json({
      title: "Sebuah Kenangan",
      description: "Kenangan indah yang tersimpan abadi di dalam hati."
    });
  }
}