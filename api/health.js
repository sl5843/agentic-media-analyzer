/** Readiness check for the static app (no secrets exposed). */
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return res.status(200).json({
    gemini: Boolean(process.env.GEMINI_API_KEY),
    groq: Boolean(process.env.GROQ_API_KEY),
    serper: Boolean(process.env.SERPER_API_KEY),
    serpapi: Boolean(process.env.SERPAPI_API_KEY),
  });
};
