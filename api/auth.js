export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Di Vercel Serverless (Node.js), gunakan request.body langsung, bukan request.json()
    const { password } = request.body;
    
    // Ambil password dari Environment Variable Vercel
    const correctPassword = process.env.VITE_APP_PASSWORD || "1234";

    // Debugging (Opsional: Hapus ini nanti jika sudah jalan)
    // console.log("Input:", password, "Correct:", correctPassword);

    if (String(password) === String(correctPassword)) {
      return response.status(200).json({ success: true });
    } else {
      return response.status(401).json({ success: false, error: 'Password salah' });
    }
  } catch (error) {
    console.error("Auth Error:", error);
    return response.status(500).json({ error: 'Server error' });
  }
}