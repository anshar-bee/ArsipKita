export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = await request.json();
    // Ambil password dari Environment Variable Vercel
    const correctPassword = process.env.VITE_APP_PASSWORD || "1234";

    if (password === correctPassword) {
      return response.status(200).json({ success: true });
    } else {
      return response.status(401).json({ success: false, error: 'Password salah' });
    }
  } catch (error) {
    return response.status(500).json({ error: 'Server error' });
  }
}