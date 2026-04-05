/**
 * Google search via SerpAPI (https://serpapi.com)
 * Key: process.env.SERPAPI_API_KEY, or optional body.api_key / body.apiKey (demo only).
 */
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = typeof req.body === 'string' ? safeJson(req.body) : req.body;
  const q = (payload && String(payload.q || '').trim()) || '';
  if (!q) {
    return res.status(400).json({ error: 'Missing q' });
  }

  const key =
    (payload && String(payload.api_key || payload.apiKey || '').trim()) ||
    process.env.SERPAPI_API_KEY ||
    '';

  if (!key) {
    return res.status(200).json({ configured: false, organic_results: [], source: 'none' });
  }

  const params = new URLSearchParams({
    engine: 'google',
    q: q.slice(0, 400),
    api_key: key,
    num: '10',
  });

  try {
    const url = `https://serpapi.com/search.json?${params.toString()}`;
    const r = await fetch(url);
    const data = await r.json();
    if (data.error) {
      return res.status(200).json({
        configured: true,
        organic_results: [],
        serpapi_error: String(data.error),
        source: 'serpapi',
      });
    }
    return res.status(200).json({
      configured: true,
      organic_results: data.organic_results || [],
      source: 'serpapi',
    });
  } catch (e) {
    return res.status(502).json({ error: 'SerpAPI request failed', detail: String(e.message) });
  }
};

function safeJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
