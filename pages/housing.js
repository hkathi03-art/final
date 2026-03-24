import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'
import { useToast } from '../components/Toast'
import { supabase } from '../lib/supabase'
import { HOUSINGS } from '../lib/data'
import Modal from '../components/Modal'

export default function Housing() {
  const router = useRouter()
  const { user } = useAuth()
  const toast = useToast()

  const [studentListings, setStudentListings] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [detailListing, setDetailListing] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [hType,  setHType]  = useState('all')
  const [hAvail, setHAvail] = useState('all')
  const [hPrice, setHPrice] = useState('')

  // Upload form
  const [upTitle, setUpTitle] = useState('')
  const [upLoc,   setUpLoc]   = useState('')
  const [upPrice, setUpPrice] = useState('')
  const [upType,  setUpType]  = useState('Off-Campus')
  const [upBeds,  setUpBeds]  = useState('1')
  const [upDesc,  setUpDesc]  = useState('')
  const [upPreview, setUpPreview] = useState('')
  const [upUploading, setUpUploading] = useState(false)
  const fileRef = useRef()

  useEffect(() => { loadListings() }, [])
  useEffect(() => {
    try { setFavorites(JSON.parse(localStorage.getItem('bsu-favs') || '[]')) } catch {}
  }, [])

  async function loadListings() {
    setLoading(true)
    const { data } = await supabase.from('student_listings').select('*').order('created_at', { ascending:false })
    setStudentListings(data || [])
    setLoading(false)
  }

  const all = [
    ...HOUSINGS,
    ...studentListings.map(l => ({
      id: 'sl-'+l.id, type:l.type||'Off-Campus', title:l.title, location:l.location,
      distance:'Student listing', price:l.price, beds:l.beds||1, baths:1, sqft:null,
      availability:'Available', tags:[], desc:l.description||'', amenities:[],
      img:l.image_url, agent:l.user_name||'Student', isStudentListing:true, userId:l.user_id
    }))
  ]

  const filtered = all.filter(h => {
    const s = search.toLowerCase()
    if (s && !h.title.toLowerCase().includes(s) && !h.location.toLowerCase().includes(s)) return false
    if (hType !== 'all' && h.type !== hType) return false
    if (hAvail !== 'all' && h.availability !== hAvail) return false
    if (hPrice && h.price > parseInt(hPrice)) return false
    return true
  })

  function toggleFav(id) {
    const next = favorites.includes(id) ? favorites.filter(x=>x!==id) : [...favorites, id]
    setFavorites(next)
    try { localStorage.setItem('bsu-favs', JSON.stringify(next)) } catch {}
    toast(next.includes(id) ? 'Added to favorites ❤️' : 'Removed from favorites', 'info')
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setUpPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function submitListing() {
    if (!upTitle || !upLoc || !upPrice) { toast('Please fill in all required fields', 'error'); return }
    if (!user) { toast('Please sign in to post a listing', 'error'); router.push('/login'); return }
    setUpUploading(true)

    let imageUrl = ''
    const file = fileRef.current?.files?.[0]
    if (file) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('housing-images').upload(path, file, { upsert:true })
      if (!upErr) {
        const { data: urlData } = supabase.storage.from('housing-images').getPublicUrl(path)
        imageUrl = urlData.publicUrl
      }
    }
    if (!imageUrl) imageUrl = upPreview || 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=700&h=420&fit=crop'

    const { data, error } = await supabase.from('student_listings').insert({
      user_id: user.id, user_name: user.name,
      title: upTitle, location: upLoc, price: parseInt(upPrice),
      type: upType, beds: parseInt(upBeds), description: upDesc, image_url: imageUrl, availability: 'Available'
    }).select().single()

    if (error) { toast('Error posting listing: ' + error.message, 'error'); setUpUploading(false); return }

    setStudentListings(prev => [data, ...prev])
    toast('Listing posted! 🎉 Everyone in class can see it now.', 'success')
    setShowModal(false)
    // Reset form
    setUpTitle(''); setUpLoc(''); setUpPrice(''); setUpDesc(''); setUpPreview(''); setUpUploading(false)
  }

  return (
    <div className="main-wrap">
      <div className="page-banner">
        <div className="page-banner-inner">
          <div>
            <h1 className="page-title">Find Your <em>Perfect Home</em></h1>
            <p className="page-sub">Verified housing near Bowie State — updated in real-time. Students can post listings too!</p>
          </div>
          <div style={{display:'flex',gap:'.65rem',flexWrap:'wrap',alignItems:'center'}}>
            <span style={{padding:'.45rem 1rem',background:'rgba(56,161,105,.15)',border:'1px solid rgba(56,161,105,.3)',borderRadius:'999px',fontSize:'.73rem',fontWeight:600,color:'#4ade80'}}>
              <i className="fas fa-circle-check" style={{marginRight:'.3rem'}}/>{all.filter(h=>h.availability==='Available').length} Available
            </span>
            <span style={{padding:'.45rem 1rem',background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.12)',borderRadius:'999px',fontSize:'.73rem',fontWeight:600,color:'rgba(255,255,255,.6)'}}>
              {all.length} Total
            </span>
            {user
              ? <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><i className="fas fa-plus"/>Add Listing</button>
              : <button className="btn btn-primary btn-sm" onClick={() => router.push('/login')}><i className="fas fa-plus"/>Sign In to Post</button>
            }
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-bar-inner">
          <div className="f-search">
            <i className="fas fa-search" style={{color:'var(--text3)'}}/>
            <input placeholder="Search listings…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          {['all','On-Campus','Off-Campus'].map(t => (
            <button key={t} className={`f-chip${hType===t?' active':''}`} onClick={() => setHType(t)}>
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
          <select className="f-select" value={hAvail} onChange={e => setHAvail(e.target.value)}>
            <option value="all">All Availability</option>
            <option value="Available">Available</option>
            <option value="Limited">Limited</option>
            <option value="Waitlist">Waitlist</option>
          </select>
          <select className="f-select" value={hPrice} onChange={e => setHPrice(e.target.value)}>
            <option value="">Any Price</option>
            <option value="800">Under $800</option>
            <option value="1200">Under $1,200</option>
            <option value="1600">Under $1,600</option>
          </select>
          <span className="f-count"><strong>{filtered.length}</strong> listings</span>
        </div>
      </div>

      {/* Grid */}
      <div className="page-body">
        {loading && <div style={{textAlign:'center',padding:'3rem'}}><div className="spinner" style={{margin:'0 auto'}}/></div>}
        <div className="housing-grid">
          {filtered.map(h => {
            const isSaved = favorites.includes(h.id)
            const img = h.img || h.image_url || 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=700&h=420&fit=crop'
            return (
              <div key={h.id} className="listing-card" onClick={() => setDetailListing(h)}>
                <div className="listing-img">
                  <img src={img} alt={h.title} loading="lazy"/>
                  <div className="listing-overlay"/>
                  <span className={`avail-badge av-${h.availability}`}>{h.availability}</span>
                  {h.isStudentListing && <span className="student-badge">📤 Student</span>}
                  <button className={`heart-btn${isSaved?' saved':''}`} onClick={e => { e.stopPropagation(); toggleFav(h.id) }}>
                    <i className={`${isSaved?'fas':'far'} fa-heart`}/>
                  </button>
                  <div className="listing-price">${(h.price||0).toLocaleString()}<span>/mo</span></div>
                </div>
                <div className="listing-body">
                  <div className="listing-name">{h.title}</div>
                  <div className="listing-loc"><i className="fas fa-location-dot"/>{h.location}</div>
                  <div className="listing-specs">
                    {h.beds > 0 && <div className="listing-spec"><i className="fas fa-bed"/>{h.beds} bed</div>}
                    <div className="listing-spec"><i className="fas fa-bath"/>{h.baths||1} bath</div>
                    {h.sqft && <div className="listing-spec"><i className="fas fa-ruler-combined"/>{h.sqft} sqft</div>}
                  </div>
                  {(h.tags||[]).length > 0 && (
                    <div className="listing-tags">{h.tags.slice(0,3).map(t => <span key={t} className="listing-tag">{t}</span>)}</div>
                  )}
                  <div className="listing-foot">
                    <span className="listing-agent">Via <strong>{h.agent}</strong></span>
                    <span style={{fontSize:'.72rem',color:'var(--text3)'}}>{h.distance}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {filtered.length === 0 && !loading && (
          <div style={{textAlign:'center',padding:'4rem',color:'var(--text3)'}}>
            <div style={{fontSize:'2.5rem',marginBottom:'1rem'}}>🏠</div>
            <p>No listings match your filters.</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Modal open={!!detailListing} onClose={() => setDetailListing(null)}>
        {detailListing && (
          <>
            <button className="modal-close" onClick={() => setDetailListing(null)}><i className="fas fa-xmark"/></button>
            <div className="modal-img">
              <img src={detailListing.img || detailListing.image_url || 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=700&h=420&fit=crop'} alt={detailListing.title}/>
            </div>
            <span className={`avail-badge av-${detailListing.availability}`} style={{display:'inline-block',marginBottom:'.65rem'}}>{detailListing.availability}</span>
            <div className="modal-title">{detailListing.title}</div>
            <div className="spec-row">
              <div style={{fontFamily:'var(--serif)',fontSize:'1.8rem',fontWeight:700,color:'var(--yellow-dk)'}}>${(detailListing.price||0).toLocaleString()}/mo</div>
              {detailListing.beds > 0 && <div className="spec-item"><i className="fas fa-bed"/>{detailListing.beds} bed</div>}
              <div className="spec-item"><i className="fas fa-bath"/>{detailListing.baths||1} bath</div>
              {detailListing.sqft && <div className="spec-item"><i className="fas fa-ruler-combined"/>{detailListing.sqft} sqft</div>}
              <div className="spec-item"><i className="fas fa-location-dot"/>{detailListing.distance || detailListing.location}</div>
            </div>
            <p style={{fontSize:'.86rem',color:'var(--text3)',lineHeight:1.72,marginBottom:'1.25rem'}}>{detailListing.desc || 'Contact the agent for more details about this property.'}</p>
            {(detailListing.amenities||[]).length > 0 && (
              <>
                <div style={{fontWeight:700,fontSize:'.82rem',marginBottom:'.5rem'}}>Amenities</div>
                <div className="amenity-grid">
                  {detailListing.amenities.map(a => <div key={a} className="amenity"><i className="fas fa-check-circle"/>{a}</div>)}
                </div>
              </>
            )}
            <div style={{display:'flex',gap:'.75rem',marginTop:'1.25rem'}}>
              <button className="btn btn-primary" style={{flex:1}} onClick={() => { toast(`Tour request sent to ${detailListing.agent}! 📩`,'success'); setDetailListing(null) }}>Request Tour</button>
              <button className="btn btn-outline" onClick={() => setDetailListing(null)}>Close</button>
            </div>
          </>
        )}
      </Modal>

      {/* Upload modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <button className="modal-close" onClick={() => setShowModal(false)}><i className="fas fa-xmark"/></button>
        <h2 style={{fontFamily:'var(--serif)',fontSize:'1.3rem',fontWeight:700,marginBottom:'1.5rem'}}>📋 Post a Housing Listing</h2>
        <div className="form-group">
          <label className="form-label">Listing Title *</label>
          <input className="form-input" placeholder="e.g., 2BR Apartment near BSU" value={upTitle} onChange={e => setUpTitle(e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="form-label">Location *</label>
          <input className="form-input" placeholder="e.g., Bowie, MD 20715" value={upLoc} onChange={e => setUpLoc(e.target.value)}/>
        </div>
        <div className="form-2col">
          <div className="form-group">
            <label className="form-label">Monthly Rent ($) *</label>
            <input className="form-input" type="number" placeholder="950" value={upPrice} onChange={e => setUpPrice(e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-input" value={upType} onChange={e => setUpType(e.target.value)}>
              <option value="Off-Campus">Off-Campus</option>
              <option value="On-Campus">On-Campus</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Bedrooms</label>
          <select className="form-input" value={upBeds} onChange={e => setUpBeds(e.target.value)}>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3+ Bedrooms</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={3} placeholder="Describe the property, amenities, distance from BSU…" value={upDesc} onChange={e => setUpDesc(e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="form-label">📷 Upload Photo</label>
          <input className="form-input" type="file" accept="image/*" ref={fileRef} onChange={handleFileChange}/>
        </div>
        {upPreview && (
          <div className="upload-preview" style={{marginBottom:'1rem'}}>
            <img src={upPreview} alt="preview"/>
          </div>
        )}
        <button className="btn btn-primary btn-full" onClick={submitListing} disabled={upUploading}>
          {upUploading ? 'Posting…' : 'Post Listing'} <i className="fas fa-check"/>
        </button>
      </Modal>
    </div>
  )
}
