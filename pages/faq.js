import { useState } from 'react'
import { useRouter } from 'next/router'
import { FAQS } from '../lib/data'

const CATS = ['all','visa','housing','financial','campus']

export default function FAQ() {
  const router = useRouter()
  const [search, setSearch]   = useState('')
  const [cat, setCat]         = useState('all')
  const [openIdx, setOpenIdx] = useState(null)

  const filtered = FAQS.filter(f => {
    if (cat !== 'all' && f.cat !== cat) return false
    if (search && !f.q.toLowerCase().includes(search) && !f.a.toLowerCase().includes(search)) return false
    return true
  })

  return (
    <div className="main-wrap">
      <div className="page-banner">
        <div className="page-banner-inner">
          <div>
            <h1 className="page-title">Frequently Asked <em>Questions</em></h1>
            <p className="page-sub">Answers to every question international students ask at BSU</p>
          </div>
          <span style={{padding:'.45rem 1rem',background:'rgba(245,197,24,.15)',border:'1px solid rgba(245,197,24,.3)',borderRadius:'999px',fontSize:'.73rem',fontWeight:600,color:'var(--yellow)'}}>{FAQS.length} Questions</span>
        </div>
      </div>

      <div className="page-body" style={{maxWidth:820,margin:'0 auto',padding:'2.5rem 2rem'}}>
        <div className="faq-search-wrap">
          <i className="fas fa-magnifying-glass" style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--text3)'}}/>
          <input
            className="faq-search"
            placeholder="Search questions…"
            value={search}
            onChange={e => { setSearch(e.target.value.toLowerCase()); setOpenIdx(null) }}
          />
        </div>

        <div className="faq-cats">
          {CATS.map(c => (
            <button key={c} className={`faq-cat${cat===c?' active':''}`} onClick={() => { setCat(c); setOpenIdx(null) }}>
              {c === 'all' ? 'All Questions' : c.charAt(0).toUpperCase()+c.slice(1)}
            </button>
          ))}
        </div>

        {filtered.map((f,i) => (
          <div key={i} className={`faq-item${openIdx===i?' open':''}`}>
            <div className="faq-q" onClick={() => setOpenIdx(openIdx===i ? null : i)}>
              <span>{f.q}</span>
              <i className="fas fa-chevron-down faq-chev"/>
            </div>
            <div className="faq-ans">{f.a}</div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{textAlign:'center',padding:'3rem',color:'var(--text3)'}}>
            <div style={{fontSize:'2rem',marginBottom:'1rem'}}>🔍</div>
            <p>No results found. Try{' '}
              <a onClick={() => router.push('/chatbot')} style={{color:'var(--yellow-dk)',cursor:'pointer',fontWeight:700}}>
                asking Maya
              </a>{' '}instead.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
