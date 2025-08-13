// api/chat.js
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  const { model, messages } = request.body;
  const apiKey = process.env.OPENROUTER_API_KEY; // Lee la clave desde Vercel

  if (!apiKey) {
    return response.status(500).json({ error: 'API key not configured' });
  }

  try {
    const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages }),
    });

    const data = await apiResponse.json();
    return response.status(200).json(data);

  } catch (error) {
    return response.status(500).json({ error: 'Failed to fetch from OpenRouter' });
  }
}