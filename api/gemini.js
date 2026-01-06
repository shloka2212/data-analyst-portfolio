export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Check if API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY environment variable is not set');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction || '' }] }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', response.status, JSON.stringify(data));
      // Pass through the actual error message from Gemini
      const errorMessage = data?.error?.message || 'AI service error';
      return res.status(response.status).json({
        error: errorMessage,
        status: response.status
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Server error:', error.message);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}