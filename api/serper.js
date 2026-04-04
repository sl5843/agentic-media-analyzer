/**
 * Optional Serper search (key in env only). If SERPER_API_KEY is unset, returns configured:false
 * so the client falls back to Wikipedia (browser, no key).
 */
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.SERPER_API_KEY;
  if (!key) {
    return res.status(200).json({ configured: false, results: [], source: 'none' });
  }

  const payload = typeof req.body === 'string' ? safeJson(req.body) : req.body;
  const q = (payload && payload.q) || '';
  const num = Math.min(10, Math.max(1, Number(payload?.num) || 8));
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing q' });
  }

  try {
    const serperRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: q.slice(0, 200), num }),
    });
    const data = await serperRes.json();
    if (!serperRes.ok) {
      return res.status(200).json({
        configured: true,
        results: [],
        source: 'serper_error',
        detail: data?.message || serperRes.status,
      });
    }
    const organic = data.organic || [];
    const results = organic.map((o) => ({
      title: o.title,
      url: o.link,
      snippet: o.snippet || '',
    }));
    return res.status(200).json({ configured: true, results, source: 'serper' });
  } catch (e) {
    return res.status(200).json({
      configured: true,
      results: [],
      source: 'serper_error',
      detail: String(e.message),
    });
  }
};

function safeJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
