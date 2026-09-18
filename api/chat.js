export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method not allowed' });
  }

  try {
    const { userMood, boardContext } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('API Key Missing');
      return res.status(200).json({ reply: "Configuration error: GEMINI_API_KEY is not set in Vercel environment variables 💕" });
    }

    const completedTasks = boardContext?.completed?.length ? boardContext.completed.join(', ') : 'None yet';
    const pendingTasks = boardContext?.pending?.length ? boardContext.pending.join(', ') : 'None';

    const systemPrompt = `You are a warm, supportive, and sweet study companion sitting on an aesthetic corkboard workspace.

Current User Tasks Context:
- Completed tasks today: ${completedTasks}
- Remaining tasks: ${pendingTasks}

Instructions:
1. The user is sharing their mood or check-in: "${userMood || 'Hello'}".
2. Respond with warmth, empathy, and cute supportive energy (use gentle emojis like 💕, 🌸, ✨).
3. Keep your response brief (2-4 sentences max).`;

    const googleResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: systemPrompt }]
            }
          ]
        })
      }
    );

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error('Google API Error:', data);
      return res.status(200).json({ 
        reply: `API Error: ${data.error?.message || 'Failed to communicate with Gemini.'}` 
      });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      return res.status(200).json({ reply: "I'm having trouble thinking right now, but I'm here for you! 💕" });
    }

    return res.status(200).json({ reply: replyText });

  } catch (err) {
    console.error('Internal Server Error:', err);
    return res.status(200).json({ reply: "Server error occurred while connecting. Please try again! 🌸" });
  }
}