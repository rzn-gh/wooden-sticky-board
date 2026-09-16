// api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userMood, boardContext } = req.body;
  const apiKey = process.env.GEMINI_API_KEY; // Pulled securely from server environment

  if (!apiKey) {
    return res.status(500).json({ error: 'Server API key missing' });
  }

  const systemPrompt = `
    You are a warm, supportive, and sweet study companion sitting on an aesthetic corkboard workspace.
    
    Current User Tasks Context:
    - Completed tasks today (${boardContext.completed.length}): ${boardContext.completed.length > 0 ? boardContext.completed.join(', ') : 'None yet'}
    - Remaining tasks (${boardContext.pending.length}): ${boardContext.pending.length > 0 ? boardContext.pending.join(', ') : 'None'}
    
    Instructions:
    1. The user is sharing their mood or check-in: "${userMood}".
    2. Respond with warmth, empathy, and cute supportive energy (use gentle emojis like 💕, 🌸, ✨).
    3. If they are sad, stressed, or low energy, gently remind them of what they've already completed today by name.
    4. If they haven't completed any tasks yet, comfort them and reassure them that rest is okay and small steps count.
    5. Keep your response brief (2-4 sentences max).
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }]
      })
    });

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;
    
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch response from Gemini' });
  }
}