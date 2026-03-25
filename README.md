# Browser Embroidery Digitizer (MVP)

Production-quality MVP built with Next.js.

## Features

- Upload raster artwork (`png`, `jpg`, `webp`)
- Auto-digitize edge-based running stitches
- Control hoop size, stitch density, stitch length, jump threshold, smoothing, and thread color
- Stitch simulation playback in-browser canvas
- Machine-plan exports (`.json` and `.csv`)
- Local project persistence via `localStorage`

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy on Vercel

### Option A: Vercel Dashboard (fastest)
1. Push this repo to GitHub/GitLab/Bitbucket.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Keep default settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `next build` (auto-detected)
   - **Output Directory**: `.next` (auto)
4. Click **Deploy**.

### Option B: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```
For production:
```bash
vercel --prod
```

## Production Checks (recommended before deploy)

```bash
npm run build
```

## Environment Variables

Core digitizer functionality on `/` does **not** require environment variables.

If you use optional legacy routes/API integrations in this repo (e.g., Supabase/Gemini-powered pages), add their corresponding env vars in **Vercel Project Settings → Environment Variables** before deploying those features.

## Notes

- This MVP currently outputs neutral stitch-plan formats (JSON/CSV) rather than vendor-specific embroidery binaries (`DST`, `PES`, etc.).
- The digitizer prioritizes edge outlines and serpentine scan routing for fast preview and stable first-pass results.
