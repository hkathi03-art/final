import { useEffect, useMemo, useRef, useState } from 'react'

const HOOP_PRESETS = [
  { label: '4x4 in (100x100 mm)', widthMm: 100, heightMm: 100 },
  { label: '5x7 in (130x180 mm)', widthMm: 130, heightMm: 180 },
  { label: '6x10 in (160x260 mm)', widthMm: 160, heightMm: 260 },
]

const DEFAULT_SETTINGS = {
  hoopIndex: 0,
  density: 3,
  maxStitchMm: 3.5,
  jumpThresholdMm: 5,
  edgeThreshold: 105,
  smoothPasses: 2,
  threadColor: '#0f172a',
}

const mmToPx = 3

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

function simplifyPath(points, minDistance) {
  if (points.length <= 2) return points
  const out = [points[0]]
  for (let i = 1; i < points.length; i += 1) {
    if (distance(out[out.length - 1], points[i]) >= minDistance || i === points.length - 1) {
      out.push(points[i])
    }
  }
  return out
}

function smoothPath(points, passes = 1) {
  if (points.length < 3) return points
  let current = points
  for (let pass = 0; pass < passes; pass += 1) {
    const next = [current[0]]
    for (let i = 1; i < current.length - 1; i += 1) {
      const prev = current[i - 1]
      const node = current[i]
      const after = current[i + 1]
      next.push({ x: (prev.x + node.x + after.x) / 3, y: (prev.y + node.y + after.y) / 3 })
    }
    next.push(current[current.length - 1])
    current = next
  }
  return current
}

function createEmbroideryPlan(imageData, width, height, settings) {
  const pixels = imageData.data
  const getGray = (x, y) => {
    const idx = (y * width + x) * 4
    return (pixels[idx] * 0.2126) + (pixels[idx + 1] * 0.7152) + (pixels[idx + 2] * 0.0722)
  }

  const edges = new Uint8Array(width * height)
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const gx =
        -1 * getGray(x - 1, y - 1) + 1 * getGray(x + 1, y - 1) +
        -2 * getGray(x - 1, y) + 2 * getGray(x + 1, y) +
        -1 * getGray(x - 1, y + 1) + 1 * getGray(x + 1, y + 1)
      const gy =
        -1 * getGray(x - 1, y - 1) - 2 * getGray(x, y - 1) - 1 * getGray(x + 1, y - 1) +
         1 * getGray(x - 1, y + 1) + 2 * getGray(x, y + 1) + 1 * getGray(x + 1, y + 1)
      const magnitude = Math.min(255, Math.sqrt(gx * gx + gy * gy))
      edges[y * width + x] = magnitude > settings.edgeThreshold ? 255 : 0
    }
  }

  const sampleStep = clamp(Math.round(8 - settings.density * 2), 1, 6)
  const stitchStepPx = Math.max(1, settings.maxStitchMm * mmToPx)
  const jumpPx = Math.max(stitchStepPx, settings.jumpThresholdMm * mmToPx)

  const stitches = []
  for (let y = 0; y < height; y += sampleStep) {
    const row = []
    for (let x = 0; x < width; x += sampleStep) {
      if (edges[y * width + x] === 255) row.push({ x, y })
    }

    if (row.length > 1) {
      const ordered = y % (sampleStep * 2) === 0 ? row : [...row].reverse()
      const simplified = simplifyPath(ordered, stitchStepPx)
      const smoothed = smoothPath(simplified, settings.smoothPasses)

      smoothed.forEach((point, idx) => {
        const prev = stitches[stitches.length - 1]
        const cmd = !prev ? 'color-start' : (distance(prev, point) > jumpPx ? 'jump' : idx === 0 ? 'trim' : 'stitch')
        stitches.push({ x: point.x, y: point.y, cmd })
      })
    }
  }

  const stats = {
    stitches: stitches.filter((s) => s.cmd === 'stitch').length,
    jumps: stitches.filter((s) => s.cmd === 'jump').length,
    trims: stitches.filter((s) => s.cmd === 'trim').length,
    estimatedMinutes: Math.ceil((stitches.length / 650) * 10) / 10,
  }

  return { stitches, stats }
}

export default function Home() {
  const previewRef = useRef(null)
  const sourceImageRef = useRef(null)

  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [projectName, setProjectName] = useState('untitled-design')
  const [sourceImage, setSourceImage] = useState(null)
  const [result, setResult] = useState({ stitches: [], stats: { stitches: 0, jumps: 0, trims: 0, estimatedMinutes: 0 } })
  const [isGenerating, setIsGenerating] = useState(false)
  const [playhead, setPlayhead] = useState(1)
  const [playback, setPlayback] = useState(false)

  const hoop = HOOP_PRESETS[settings.hoopIndex]
  const canvasWidth = Math.round(hoop.widthMm * mmToPx)
  const canvasHeight = Math.round(hoop.heightMm * mmToPx)

  useEffect(() => {
    const cached = localStorage.getItem('embroidery-mvp-project')
    if (!cached) return
    try {
      const parsed = JSON.parse(cached)
      if (parsed.settings) setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings })
      if (parsed.projectName) setProjectName(parsed.projectName)
      if (parsed.sourceImage) setSourceImage(parsed.sourceImage)
    } catch {
      // ignore malformed cache
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('embroidery-mvp-project', JSON.stringify({ projectName, settings, sourceImage }))
  }, [projectName, settings, sourceImage])

  useEffect(() => {
    if (!playback) return undefined
    const id = setInterval(() => {
      setPlayhead((prev) => {
        const max = Math.max(1, result.stitches.length)
        if (prev >= max) {
          setPlayback(false)
          return max
        }
        return prev + Math.ceil(max / 220)
      })
    }, 25)
    return () => clearInterval(id)
  }, [playback, result.stitches.length])

  useEffect(() => {
    if (!previewRef.current) return
    const canvas = previewRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (sourceImageRef.current) {
      ctx.globalAlpha = 0.17
      ctx.drawImage(sourceImageRef.current, 0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = 1
    }

    const limit = playback ? playhead : result.stitches.length
    const stitched = result.stitches.slice(0, limit)

    if (stitched.length > 0) {
      ctx.beginPath()
      ctx.lineWidth = 1.4
      ctx.strokeStyle = settings.threadColor
      ctx.moveTo(stitched[0].x, stitched[0].y)
      for (let i = 1; i < stitched.length; i += 1) {
        const step = stitched[i]
        if (step.cmd === 'jump') {
          ctx.moveTo(step.x, step.y)
        } else {
          ctx.lineTo(step.x, step.y)
        }
      }
      ctx.stroke()
    }

    ctx.strokeStyle = '#94a3b8'
    ctx.setLineDash([8, 5])
    ctx.lineWidth = 1
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2)
  }, [playhead, playback, result.stitches, settings.threadColor, sourceImage])

  const commandsByType = useMemo(() => {
    const counts = { stitch: 0, jump: 0, trim: 0, 'color-start': 0 }
    result.stitches.forEach((s) => { counts[s.cmd] += 1 })
    return counts
  }, [result.stitches])

  const handleUpload = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setSourceImage(reader.result)
      const image = new window.Image()
      image.onload = () => {
        sourceImageRef.current = image
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  const generatePlan = async () => {
    if (!sourceImage) return
    setIsGenerating(true)

    const image = new window.Image()
    image.src = sourceImage

    await new Promise((resolve) => {
      image.onload = () => resolve()
    })

    sourceImageRef.current = image
    const offscreen = document.createElement('canvas')
    offscreen.width = canvasWidth
    offscreen.height = canvasHeight
    const ctx = offscreen.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, offscreen.width, offscreen.height)
    ctx.drawImage(image, 0, 0, offscreen.width, offscreen.height)

    const plan = createEmbroideryPlan(ctx.getImageData(0, 0, offscreen.width, offscreen.height), offscreen.width, offscreen.height, settings)
    setResult(plan)
    setPlayhead(Math.min(1, plan.stitches.length))
    setPlayback(false)
    setIsGenerating(false)
  }

  const exportFile = (kind) => {
    if (!result.stitches.length) return

    const payload = kind === 'json'
      ? JSON.stringify({
          app: 'browser-embroidery-digitizer',
          version: 1,
          projectName,
          hoop,
          settings,
          stitches: result.stitches,
          stats: result.stats,
          generatedAt: new Date().toISOString(),
        }, null, 2)
      : ['index,x_px,y_px,command', ...result.stitches.map((s, i) => `${i},${s.x.toFixed(2)},${s.y.toFixed(2)},${s.cmd}`)].join('\n')

    const blob = new Blob([payload], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${projectName || 'design'}.${kind}`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <main className="digitizer-page">
      <header className="hero">
        <div>
          <p className="eyebrow">Production MVP</p>
          <h1>Browser Embroidery Digitizer</h1>
          <p className="sub">Upload artwork, auto-digitize edge stitches, preview stitch simulation, and export machine-friendly plans.</p>
        </div>
      </header>

      <section className="workspace">
        <aside className="controls card">
          <label>
            Project Name
            <input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          </label>

          <label>
            Source Artwork
            <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files?.[0])} />
          </label>

          <label>
            Hoop Size
            <select value={settings.hoopIndex} onChange={(e) => setSettings((s) => ({ ...s, hoopIndex: Number(e.target.value) }))}>
              {HOOP_PRESETS.map((preset, i) => (<option key={preset.label} value={i}>{preset.label}</option>))}
            </select>
          </label>

          <label>
            Stitch Density ({settings.density})
            <input type="range" min="1" max="4" value={settings.density} onChange={(e) => setSettings((s) => ({ ...s, density: Number(e.target.value) }))} />
          </label>

          <label>
            Edge Threshold ({settings.edgeThreshold})
            <input type="range" min="60" max="180" value={settings.edgeThreshold} onChange={(e) => setSettings((s) => ({ ...s, edgeThreshold: Number(e.target.value) }))} />
          </label>

          <label>
            Max Stitch Length ({settings.maxStitchMm.toFixed(1)} mm)
            <input type="range" min="1.5" max="6" step="0.1" value={settings.maxStitchMm} onChange={(e) => setSettings((s) => ({ ...s, maxStitchMm: Number(e.target.value) }))} />
          </label>

          <label>
            Jump Threshold ({settings.jumpThresholdMm.toFixed(1)} mm)
            <input type="range" min="2" max="12" step="0.2" value={settings.jumpThresholdMm} onChange={(e) => setSettings((s) => ({ ...s, jumpThresholdMm: Number(e.target.value) }))} />
          </label>

          <label>
            Thread Color
            <input type="color" value={settings.threadColor} onChange={(e) => setSettings((s) => ({ ...s, threadColor: e.target.value }))} />
          </label>

          <button className="primary" disabled={!sourceImage || isGenerating} onClick={generatePlan}>
            {isGenerating ? 'Digitizing…' : 'Generate Stitch Plan'}
          </button>

          <div className="actions">
            <button disabled={!result.stitches.length} onClick={() => exportFile('json')}>Export JSON</button>
            <button disabled={!result.stitches.length} onClick={() => exportFile('csv')}>Export CSV</button>
          </div>
        </aside>

        <section className="preview card">
          <div className="preview-head">
            <div>
              <h2>Stitch Preview</h2>
              <p>{hoop.widthMm} × {hoop.heightMm} mm · {result.stitches.length.toLocaleString()} commands</p>
            </div>
            <div className="preview-controls">
              <button disabled={!result.stitches.length} onClick={() => { setPlayback(false); setPlayhead(result.stitches.length) }}>Full</button>
              <button disabled={!result.stitches.length} onClick={() => { setPlayhead(1); setPlayback(true) }}>{playback ? 'Playing…' : 'Simulate'}</button>
            </div>
          </div>
          <div className="canvas-wrap">
            <canvas ref={previewRef} width={canvasWidth} height={canvasHeight} />
          </div>

          <div className="stats-grid">
            <article><h3>Stitches</h3><p>{result.stats.stitches.toLocaleString()}</p></article>
            <article><h3>Jumps</h3><p>{result.stats.jumps.toLocaleString()}</p></article>
            <article><h3>Trims</h3><p>{result.stats.trims.toLocaleString()}</p></article>
            <article><h3>Run Time</h3><p>{result.stats.estimatedMinutes} min</p></article>
          </div>

          <div className="command-breakdown">
            {Object.entries(commandsByType).map(([cmd, count]) => (
              <span key={cmd}>{cmd}: {count.toLocaleString()}</span>
            ))}
          </div>
        </section>
      </section>

      <style jsx>{`
        .digitizer-page { max-width: 1280px; margin: 0 auto; padding: 2rem 1rem 3rem; color: #0f172a; }
        .hero { margin-bottom: 1rem; background: linear-gradient(120deg, #0f172a, #1e293b); border-radius: 20px; padding: 1.5rem; color: #fff; }
        .hero h1 { font-size: clamp(1.8rem, 4vw, 2.7rem); margin: 0.2rem 0; }
        .eyebrow { text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.75rem; color: #93c5fd; }
        .sub { color: #cbd5e1; max-width: 58ch; }
        .workspace { display: grid; grid-template-columns: 320px 1fr; gap: 1rem; align-items: start; }
        .card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 6px 24px rgba(15, 23, 42, 0.08); }
        .controls { padding: 1rem; display: grid; gap: 0.8rem; position: sticky; top: 1rem; }
        label { display: grid; gap: 0.3rem; font-size: 0.82rem; color: #334155; }
        input, select, button { width: 100%; border: 1px solid #cbd5e1; border-radius: 10px; padding: 0.55rem 0.7rem; font: inherit; background: #fff; }
        input[type='range'] { padding: 0; }
        input[type='color'] { height: 44px; }
        button { cursor: pointer; font-weight: 600; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        .primary { background: #0f172a; color: #fff; border-color: #0f172a; }
        .actions { display: grid; gap: 0.6rem; grid-template-columns: 1fr 1fr; }
        .preview { padding: 1rem; }
        .preview-head { display: flex; justify-content: space-between; gap: 0.8rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.8rem; }
        .preview-head h2 { margin: 0; font-size: 1.1rem; }
        .preview-head p { margin: 0.2rem 0 0; color: #64748b; }
        .preview-controls { display: flex; gap: 0.5rem; }
        .preview-controls button { width: auto; }
        .canvas-wrap { border: 1px solid #cbd5e1; border-radius: 12px; overflow: auto; background: #f8fafc; max-height: 60vh; }
        canvas { display: block; margin: 0 auto; max-width: 100%; height: auto; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.6rem; margin-top: 0.8rem; }
        .stats-grid article { border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.55rem; background: #f8fafc; }
        .stats-grid h3 { margin: 0; color: #64748b; font-size: 0.75rem; text-transform: uppercase; }
        .stats-grid p { margin: 0.35rem 0 0; font-size: 1.05rem; font-weight: 700; }
        .command-breakdown { margin-top: 0.85rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .command-breakdown span { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 999px; padding: 0.3rem 0.65rem; font-size: 0.75rem; color: #1e3a8a; }
        @media (max-width: 960px) {
          .workspace { grid-template-columns: 1fr; }
          .controls { position: static; }
          .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
      `}</style>
    </main>
  )
}
