/**
 * OpenAI-compatible chat completions via Groq (free tier friendly).
 * Env: GROQ_API_KEY (required), GROQ_MODEL (optional, default llama-3.3-70b-versatile)
 */
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: 'GROQ_API_KEY is not set. Add it in Vercel → Environment Variables.',
    });
  }

  const defaultModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const payload = typeof req.body === 'string' ? safeJson(req.body) : req.body;
  if (!payload || !Array.isArray(payload.messages)) {
    return res.status(400).json({ error: 'Expected JSON body with messages[]' });
  }

  const model = payload.model || defaultModel;
  const out = {
    model,
    messages: payload.messages,
    temperature: typeof payload.temperature === 'number' ? payload.temperature : 0.35,
    max_tokens: typeof payload.max_tokens === 'number' ? payload.max_tokens : 8192,
  };
  if (payload.response_format) {
    out.response_format = payload.response_format;
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(out),
    });
    const data = await groqRes.json();
    return res.status(groqRes.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'Groq request failed', detail: String(e.message) });
  }
};

function safeJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
