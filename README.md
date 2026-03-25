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

## Production Build

```bash
npm run lint
npm run build
npm run start
```

## Notes

- This MVP currently outputs neutral stitch-plan formats (JSON/CSV) rather than vendor-specific embroidery binaries (`DST`, `PES`, etc.).
- The digitizer prioritizes edge outlines and serpentine scan routing for fast preview and stable first-pass results.
