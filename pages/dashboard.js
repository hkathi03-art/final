import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'
import { useToast } from '../components/Toast'
import { supabase } from '../lib/supabase'
import { HOUSINGS, MENTORS } from '../lib/data'

export default function Dashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const toast = useToast()
  const [myListings, setMyListings] = useState([])
  const [mentorCount, setMentorCount] = useState(0)
  const [chatCount, setChatCount] = useState(0)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    loadMyListings()
    // Load local state
    try {
      const mc = parseInt(localStorage.getItem('bsu-mentor-count') || '0')
      const cc = parseInt(localStorage.getItem('bsu-chat-count') || '0')
      setMentorCount(mc)
      setChatCount(cc)
    } catch {}
  }, [user])

  async function loadMyListings() {
    if (!user) return
    const { data } = await supabase.from('student_listings').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setMyListings(data || [])
  }

  if (!user) return null
  const first = user.name.split(' ')[0]

  return (
    <div className="main-wrap">
      <div className="dash-body">
        <div className="dash-welcome">
          <h1>Welcome back, <span>{first}</span> 👋</h1>
          <p>Here's your BSU journey at a glance.{user.country ? ` From ${user.country} to Bowie State! 🌍` : ''}</p>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card" onClick={() => router.push('/housing')}>
            <div className="kpi-val">{HOUSINGS.length}+</div>
            <div className="kpi-lbl">Housing Listings</div>
          </div>
          <div className="kpi-card" onClick={() => router.push('/mentorship')}>
            <div className="kpi-val">{mentorCount}</div>
            <div className="kpi-lbl">Mentors Connected</div>
          </div>
          <div className="kpi-card" onClick={() => router.push('/housing')}>
            <div className="kpi-val">{myListings.length}</div>
            <div className="kpi-lbl">My Listings Posted</div>
          </div>
          <div className="kpi-card" onClick={() => router.push('/chatbot')}>
            <div className="kpi-val">{chatCount}</div>
            <div className="kpi-lbl">Maya Conversations</div>
          </div>
        </div>

        <div className="alert-bar">
          <span style={{fontSize:'1.2rem'}}>⚠️</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:'.87rem',color:'var(--text)'}}>OPT Application Window — Act Early</div>
            <div style={{fontSize:'.78rem',color:'var(--text3)'}}>Apply up to 90 days before graduation. USCIS processing takes 3–5 months — start now!</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => router.push('/chatbot')}>Ask Maya</button>
        </div>


        {myListings.length > 0 && (
          <div style={{marginTop:'2.5rem'}}>
            <div style={{fontFamily:'var(--serif)',fontSize:'1.05rem',fontWeight:700,marginBottom:'1.2rem'}}>My Posted Listings</div>
            <div className="housing-grid">
              {myListings.slice(0,3).map(l => (
                <div key={l.id} className="listing-card">
                  <div className="listing-img">
                    <img src={l.image_url || 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=700&h=420&fit=crop'} alt={l.title}/>
                    <div className="listing-overlay"/>
                    <span className="avail-badge av-Available">Available</span>
                    <span className="student-badge">📤 Mine</span>
                    <div className="listing-price">${(l.price||0).toLocaleString()}<span>/mo</span></div>
                  </div>
                  <div className="listing-body">
                    <div className="listing-name">{l.title}</div>
                    <div className="listing-loc"><i className="fas fa-location-dot"/>{l.location}</div>
                    <div className="listing-foot">
                      <span className="listing-agent">Posted by <strong>you</strong></span>
                      <button className="btn btn-sm" style={{background:'#fee2e2',color:'#991b1b',borderRadius:'6px',fontSize:'.64rem',fontWeight:700,border:'none',cursor:'pointer',padding:'.2rem .6rem'}}
                        onClick={async () => {
                          await supabase.from('student_listings').delete().eq('id', l.id)
                          setMyListings(prev => prev.filter(x => x.id !== l.id))
                          toast('Listing removed', 'info')
                        }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
