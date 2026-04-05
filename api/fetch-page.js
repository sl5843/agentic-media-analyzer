/**
 * Server-side fetch for startup URLs (avoids browser CORS / flaky public proxies).
 * POST JSON: { "url": "https://…" }
 */
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = typeof req.body === 'string' ? safeJson(req.body) : req.body;
  const rawUrl = (payload && String(payload.url || '').trim()) || '';
  if (!rawUrl) {
    return res.status(400).json({ error: 'Missing url' });
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return res.status(400).json({ error: 'Only http(s) URLs' });
  }

  const host = parsed.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host === '0.0.0.0' ||
    host.endsWith('.local') ||
    host === '[::1]' ||
    /^127\.\d+\.\d+\.\d+$/.test(host) ||
    /^10\.\d+\.\d+\.\d+$/.test(host) ||
    /^192\.168\.\d+\.\d+$/.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(host)
  ) {
    return res.status(400).json({ error: 'URL host not allowed' });
  }

  const target = parsed.toString().slice(0, 2048);

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 22000);

  try {
    const r = await fetch(target, {
      signal: ac.signal,
      redirect: 'follow',
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    const buf = await r.arrayBuffer();
    const maxBytes = 900_000;
    const slice = buf.byteLength > maxBytes ? buf.slice(0, maxBytes) : buf;
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let html = decoder.decode(slice);

    if (!r.ok) {
      return res.status(200).json({
        ok: false,
        status: r.status,
        error: `Upstream HTTP ${r.status}`,
        html: html.slice(0, 50_000),
        contentType: ct,
      });
    }

    return res.status(200).json({
      ok: true,
      status: r.status,
      html: html.slice(0, 800_000),
      contentType: ct,
    });
  } catch (e) {
    return res.status(200).json({
      ok: false,
      error: e.name === 'AbortError' ? 'Fetch timed out' : String(e.message),
    });
  } finally {
    clearTimeout(t);
  }
};

function safeJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
