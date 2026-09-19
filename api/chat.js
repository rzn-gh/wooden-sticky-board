export default async function handler(req, res) {
  // CORS & Preflight headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method not allowed' });
  }

  try {
    const { userMood, boardContext } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({ 
        reply: "Configuration missing! Please make sure GEMINI_API_KEY is added under Vercel Environment Variables. 💕" 
      });
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
          contents: [{ parts: [{ text: systemPrompt }] }]
        })
      }
    );

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      return res.status(200).json({ 
        reply: `Gemini API error: ${data.error?.message || 'Please verify your API key.'}` 
      });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      return res.status(200).json({ reply: "I'm right here with you! Keep taking small steps today 💕" });
    }

    return res.status(200).json({ reply: replyText });

  } catch (err) {
    return res.status(200).json({ reply: "Connection glitch! Please try sending your message again 🌸" });
  }
}