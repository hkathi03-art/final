import { useState } from 'react'
import { RESOURCES } from '../lib/data'

const CATS = ['all','immigration','financial','campus']

export default function Resources() {
  const [tab, setTab] = useState('all')
  const filtered = tab === 'all' ? RESOURCES : RESOURCES.filter(r => r.cat === tab)

  return (
    <div className="main-wrap">
      <div className="page-banner">
        <div className="page-banner-inner">
          <div>
            <h1 className="page-title">Student <em>Resources</em></h1>
            <p className="page-sub">Curated guides and tools for international students at Bowie State</p>
          </div>
        </div>
      </div>

      <div className="page-body" style={{maxWidth:1200}}>
            <div className="sec-tabs">
              {CATS.map(c => (
                <button key={c} className={`sec-tab${tab===c?' active':''}`} onClick={() => setTab(c)}>
                  {c === 'all' ? 'All Resources' : c.charAt(0).toUpperCase()+c.slice(1)}
                </button>
              ))}
            </div>
            <div className="res-grid">
              {filtered.map((r,i) => (
                <a key={i} className="res-card" href={r.link} target="_blank" rel="noreferrer">
                  <div className="res-icon">{r.icon}</div>
                  <div className="res-tag">{r.tag}</div>
                  <div className="res-title">{r.title}</div>
                  <p className="res-desc">{r.desc}</p>
                </a>
              ))}
            </div>
      </div>
    </div>
  )
}
