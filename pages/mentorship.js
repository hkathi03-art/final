import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'
import { useToast } from '../components/Toast'
import { MENTORS } from '../lib/data'

const SPECS = ['All','Technology','Business','Wellness','Research','Career','Legal','Finance']

export default function Mentorship() {
  const router = useRouter()
  const { user } = useAuth()
  const toast = useToast()
  const [filter, setFilter] = useState('All')
  const [connected, setConnected] = useState([])

  useEffect(() => {
    try { setConnected(JSON.parse(localStorage.getItem('bsu-mentors') || '[]')) } catch {}
  }, [])

  function toggleConnect(id) {
    if (!user) { toast('Please sign in to connect with mentors', 'error'); router.push('/login'); return }
    const next = connected.includes(id) ? connected.filter(x=>x!==id) : [...connected, id]
    setConnected(next)
    try {
      localStorage.setItem('bsu-mentors', JSON.stringify(next))
      localStorage.setItem('bsu-mentor-count', String(next.length))
    } catch {}
    const m = MENTORS.find(x=>x.id===id)
    toast(next.includes(id) ? `Connected with ${m?.name}! They'll reach out soon 🤝` : 'Disconnected from mentor', next.includes(id) ? 'success' : 'info')
  }

  const filtered = filter === 'All' ? MENTORS : MENTORS.filter(m => m.specialty === filter)

  return (
    <div className="main-wrap">
      <div className="page-banner">
        <div className="page-banner-inner">
          <div>
            <h1 className="page-title">Peer <em>Mentorship</em></h1>
            <p className="page-sub">Connect with alumni who've navigated the exact challenges you face at Bowie State</p>
          </div>
          <span style={{padding:'.45rem 1rem',background:'rgba(56,161,105,.15)',border:'1px solid rgba(56,161,105,.3)',borderRadius:'999px',fontSize:'.73rem',fontWeight:600,color:'#4ade80'}}>
            {MENTORS.filter(m=>m.avail==='available').length} Available Now
          </span>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-bar-inner">
          {SPECS.map(s => (
            <button key={s} className={`f-chip${filter===s?' active':''}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="page-body">
        <div className="mentors-grid">
          {filtered.map(m => (
            <div key={m.id} className="mentor-card">
              <div style={{display:'flex',alignItems:'center',gap:'.85rem',marginBottom:'1rem'}}>
                <div className="mentor-av">{m.initials}</div>
                <div>
                  <div className="mentor-name">
                    {m.name}
                    {m.verified && <span style={{color:'var(--teal)',fontSize:'.75rem',marginLeft:'.35rem'}}>✓</span>}
                  </div>
                  <div className="mentor-role">{m.role}</div>
                  <div style={{fontSize:'.72rem',color:'var(--text3)'}}>{m.country}</div>
                </div>
              </div>

              <div style={{display:'flex',gap:'.35rem',flexWrap:'wrap',marginBottom:'.85rem'}}>
                {m.tags.slice(0,3).map(t => <span key={t} className="mentor-tag">{t}</span>)}
              </div>

              <p className="mentor-bio">{m.bio}</p>

              <div style={{display:'flex',gap:'.5rem',marginTop:'1rem',alignItems:'center'}}>
                <button
                  className={`btn-connect${connected.includes(m.id)?' connected':''}`}
                  onClick={() => toggleConnect(m.id)}
                >
                  {connected.includes(m.id) ? '✓ Connected' : 'Connect'}
                </button>
                <div style={{fontSize:'.72rem',color:'var(--text3)',marginLeft:'auto'}}>
                  <span style={{color:'var(--yellow-dk)'}}>★{m.rating}</span> · {m.sessions} sessions
                </div>
              </div>

              <div style={{marginTop:'.65rem',display:'flex',alignItems:'center',gap:.35}}>
                <span style={{width:7,height:7,borderRadius:'50%',background: m.avail==='available'?'#22c55e': m.avail==='busy'?'#f59e0b':'#94a3b8',display:'inline-block',marginRight:'.3rem'}}/>
                <span style={{fontSize:'.68rem',color:'var(--text3)'}}>
                  {m.avail === 'available' ? 'Available for sessions' : m.avail === 'busy' ? 'Busy — limited slots' : 'Away this week'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
