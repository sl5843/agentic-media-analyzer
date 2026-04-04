# Agentic Media Analyzer

Single-file web app: an autonomous research-style pipeline over a URL or pasted text, powered by **Gemini 2.0 Flash** (`generativelanguage.googleapis.com`).

## Setup

1. Open `index.html` in a browser (or serve the folder with any static server).
2. In the `<head>` script block, set `GEMINI_API_KEY` to your key from [Google AI Studio](https://aistudio.google.com/apikey).
3. Optional: set `SERPER_API_KEY` for Google-style related search; otherwise the app uses Wikipedia search (no key).

## Security

Do not commit real API keys. Keep the placeholder `your-key-here` in git and configure keys only on your machine.

## License

Use at your own discretion; add a license if you redistribute.
