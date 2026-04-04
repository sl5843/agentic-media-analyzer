# Agentic Media Analyzer

Single-page UI plus **Vercel serverless** proxies. The browser never sees your Gemini (or Serper) keys — they live only in **environment variables** on Vercel (or in a local `.env.local` for `vercel dev`).

## Why not put the key in `index.html`?

For a **live demo**, anything in the page is public: viewers can open DevTools and copy your key. Keys belong on the **server** (here: `/api/*` functions), not in JavaScript sent to the client.

You do **not** need to store the key “on your machine” for the demo if you only configure it in the Vercel dashboard. Your laptop is just where you deploy from.

## Deploy on Vercel

1. Push this repo to GitHub (or connect the folder in Vercel).
2. In [Vercel](https://vercel.com) → your project → **Settings** → **Environment Variables**, add:
   - **`GEMINI_API_KEY`** — from [Google AI Studio](https://aistudio.google.com/apikey) (required).
   - **`SERPER_API_KEY`** — optional; from [Serper](https://serper.dev) for Google-style “related” results. If omitted, the app uses Wikipedia search in the browser (no key).
3. Apply to **Production** (and **Preview** if you want preview deployments to work).
4. **Redeploy** after saving env vars.

Open your deployment URL — **do not** rely on opening `index.html` as a `file://` page; the app calls `/api/health` and `/api/gemini`, which only exist when the site is served by Vercel (or `vercel dev`).

## Local development

```bash
npm i -g vercel
cd "path/to/Media Analyzer"
cp .env.example .env.local
# Edit .env.local and set GEMINI_API_KEY
vercel dev
```

Then open the URL Vercel prints (usually `http://localhost:3000`).

## API routes

| Path | Purpose |
|------|--------|
| `GET /api/health` | Returns `{ gemini, serper }` booleans — no secrets. |
| `POST /api/gemini` | Body = Gemini `generateContent` JSON; uses `GEMINI_API_KEY`. Query `?model=` optional. |
| `POST /api/serper` | Body `{ "q": "...", "num": 8 }`; uses `SERPER_API_KEY` if set. |

## Demo security note

Your deployed `/api/gemini` endpoint is **unauthenticated**: anyone with the site URL could trigger model calls and spend your quota. For a small demo that is often acceptable; for wider sharing consider [Vercel deployment protection](https://vercel.com/docs/security/deployment-protection), a password, or rate limits.

## License

Use at your own discretion; add a license if you redistribute.
