import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'
import { HOUSINGS, MENTORS, LIFECYCLE_STAGES, TESTIMONIALS } from '../lib/data'

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&h=900&fit=crop" alt="BSU Campus" loading="eager"/>
        </div>
        <div className="hero-inner">
          <div>
            <div className="hero-tag"><i className="fas fa-graduation-cap"/>&nbsp;Bowie State University · Est. 1865</div>
            <h1 className="hero-h1">Your Journey<br/>Starts <em>Here.</em></h1>
            <p className="hero-p">BSU's International Student Portal gives you everything in one place — housing, mentors, AI guidance, and community — so you can focus on what matters: building your future.</p>
            <div className="hero-btns">
              <button className="btn btn-primary btn-lg" onClick={() => router.push(user ? '/dashboard' : '/login')}>
                <i className="fas fa-rocket"/> Get Started
              </button>
              <button className="btn-outline-white btn-lg" onClick={() => router.push('/housing')}>
                <i className="fas fa-building"/> Browse Housing
              </button>
            </div>
            <div className="hero-stats">
              <div><div className="h-stat-n">1,200+</div><div className="h-stat-l">International Students</div></div>
              <div><div className="h-stat-n">{HOUSINGS.length}+</div><div className="h-stat-l">Housing Listings</div></div>
              <div><div className="h-stat-n">{MENTORS.length}</div><div className="h-stat-l">Expert Mentors</div></div>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-title"><i className="fas fa-star" style={{color:'var(--yellow)'}}/>&nbsp;Featured Listings</div>
            {HOUSINGS.slice(0,3).map(h => (
              <div key={h.id} className="hero-listing-row" onClick={() => router.push('/housing')}>
                <div className="hero-listing-thumb"><img src={h.img} alt={h.title}/></div>
                <div className="hero-listing-info">
                  <div className="hero-listing-name">{h.title}</div>
                  <div className="hero-listing-loc"><i className="fas fa-location-dot" style={{color:'var(--yellow)',fontSize:'.62rem',marginRight:'.2rem'}}/>{h.location}</div>
                </div>
                <div className="hero-listing-price">${h.price.toLocaleString()}<br/><span>/mo</span></div>
              </div>
            ))}
            <div className="hero-card-title" style={{marginTop:'1.1rem'}}><i className="fas fa-user-group" style={{color:'var(--yellow)'}}/>&nbsp;Available Mentors</div>
            <div className="hero-mentor-row">
              {MENTORS.slice(0,6).map(m => (
                <div key={m.id} className="hero-mentor-av" onClick={() => router.push('/mentorship')} title={m.name}>{m.initials}</div>
              ))}
              <span className="hero-mentor-more">+{MENTORS.length-6} more</span>
            </div>
            <div className="hero-ai-teaser">
              <div className="hero-ai-msg"><strong style={{color:'var(--yellow)'}}>Maya:</strong>&nbsp;<span style={{color:'rgba(255,255,255,.62)'}}>Ask me about housing, F-1 status, CPT/OPT, or anything about BSU life.</span></div>
              <div className="hero-ai-input" onClick={() => router.push('/chatbot')}>
                <span>Ask me anything…</span>
                <i className="fas fa-paper-plane" style={{color:'var(--yellow)'}}/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIFECYCLE */}
      <section className="lc-section" id="lcSection">
        <div className="lc-inner">
          <div className="section-head">
            <div className="section-overline">Student Lifecycle</div>
            <h2 className="section-title" style={{color:'#fff'}}>Your BSU Journey in 6 Clear Stages</h2>
            <p className="section-sub" style={{color:'rgba(255,255,255,.58)'}}>From pre-arrival planning to graduation outcomes — follow the same roadmap BSU international support teams use.</p>
          </div>
          <div className="lc-grid">
            {LIFECYCLE_STAGES.map((s, i) => (
              <div key={s.key} className="lc-card" onClick={() => router.push('/' + s.page)}>
                <div className="lc-step">0{i+1}</div>
                <div className="lc-icon"><i className={`fas ${s.icon}`}/></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="home-section" style={{background:'var(--surface)'}}>
        <div className="home-section-inner">
          <div className="section-head">
            <div className="section-overline">What We Offer</div>
            <h2 className="section-title">Built for International Students,<br/>by BSU</h2>
            <p className="section-sub" style={{color:'var(--text3)'}}>Every feature addresses the real challenges you face — from finding safe housing to landing your first US job.</p>
          </div>
          <div className="features-grid">
            {[
              { href:'/chatbot',    icon:'🎓', title:'Ask Maya, Your AI Guide',  desc:'Got a question about your visa, lease, or career move? Maya knows BSU inside out and is available 24/7.' },
              { href:'/housing',    icon:'🏢', title:'Housing Search',            desc:'Browse verified on/off-campus housing with real photos. Students can also post their own listings.' },
              { href:'/mentorship', icon:'👥', title:'Peer Mentorship',           desc:'Connect with alumni who\'ve navigated the same F-1 challenges. Guidance on academics, career, and US life.' },
              { href:'/resources',  icon:'📚', title:'Resource Library',          desc:'Curated guides on immigration, banking, scholarships, and campus life — everything you need to thrive.' },
              { href:'/faq',        icon:'❓', title:'FAQ Center',                desc:'Instant answers to visa, housing, financial, and campus questions — search or browse by category.' },
              { href:'/messages',   icon:'💬', title:'Direct Messaging',          desc:'Message mentors and advisors directly. Keep all your support conversations organized in one place.' },
            ].map(f => (
              <a key={f.href} className="feat-card" onClick={() => router.push(f.href)} style={{cursor:'pointer'}}>
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <p className="feat-desc">{f.desc}</p>
                <div className="feat-link">Learn more <i className="fas fa-arrow-right"/></div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-strip">
        <div className="stats-inner">
          <div><div className="s-num">1,200+</div><div className="s-lbl">International Students</div></div>
          <div><div className="s-num">85+</div><div className="s-lbl">Countries Represented</div></div>
          <div><div className="s-num">96%</div><div className="s-lbl">OPT Success Rate</div></div>
          <div><div className="s-num">4.9★</div><div className="s-lbl">Student Satisfaction</div></div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="home-section" style={{background:'var(--bg)'}}>
        <div className="home-section-inner">
          <div className="section-head">
            <div className="section-overline">Student Stories</div>
            <h2 className="section-title">What Students Are Saying</h2>
            <p className="section-sub" style={{color:'var(--text3)'}}>Hear from international students who've used the portal to build their BSU story.</p>
          </div>
          <div className="testi-grid">
            {TESTIMONIALS.map((t,i) => (
              <div key={i} className="testi-card">
                <div className="testi-stars">{'★'.repeat(t.rating)}</div>
                <div className="testi-quote">"{t.quote}"</div>
                <div style={{display:'flex',alignItems:'center',gap:'.75rem'}}>
                  <div className="testi-av">{t.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.major} · {t.country}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to <em>Thrive</em><br/>at Bowie State?</h2>
          <p className="cta-sub">Join hundreds of international students already using the portal for housing, mentors, and AI-powered support.</p>
          <div className="cta-btns">
            <button className="btn btn-primary btn-lg" onClick={() => router.push(user ? '/dashboard' : '/login')}>
              <i className="fas fa-gauge"/> {user ? 'My Dashboard' : 'Sign Up Free'}
            </button>
            <button className="btn-outline-white btn-lg" onClick={() => router.push('/chatbot')}>
              <i className="fas fa-robot"/> Talk to Maya
            </button>
          </div>
        </div>
      </section>

      {/* GET TO KNOW US */}
      <div className="gtk-bar">
        <div className="gtk-inner">
          <h3>Get to know us</h3>
          <div className="gtk-social">
            <a href="https://facebook.com/bowiestate" target="_blank" rel="noreferrer"><i className="fab fa-facebook"/></a>
            <a href="https://instagram.com/bowiestate" target="_blank" rel="noreferrer"><i className="fab fa-instagram"/></a>
            <a href="https://twitter.com/bowiestate" target="_blank" rel="noreferrer"><i className="fab fa-x-twitter"/></a>
            <a href="https://linkedin.com/school/bowie-state-university" target="_blank" rel="noreferrer"><i className="fab fa-linkedin"/></a>
            <a href="https://youtube.com/@bowiestate" target="_blank" rel="noreferrer"><i className="fab fa-youtube"/></a>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div style={{display:'flex',alignItems:'center'}}>
              <span className="footer-badge">BSU</span>
              <span className="footer-name">International Portal</span>
            </div>
            <p className="footer-desc">Supporting Bowie State University's international student community with housing, mentorship, AI guidance, and resources.</p>
            <div className="footer-social">
              <a href="https://facebook.com/bowiestate" target="_blank" rel="noreferrer"><i className="fab fa-facebook"/></a>
              <a href="https://instagram.com/bowiestate" target="_blank" rel="noreferrer"><i className="fab fa-instagram"/></a>
              <a href="https://linkedin.com/school/bowie-state-university" target="_blank" rel="noreferrer"><i className="fab fa-linkedin"/></a>
            </div>
          </div>
          <div>
            <div className="footer-col-h">Platform</div>
            <ul className="footer-links">
              <li onClick={() => router.push('/housing')}>Housing Search</li>
              <li onClick={() => router.push('/mentorship')}>Mentorship</li>
              <li onClick={() => router.push('/chatbot')}>Ask Maya</li>
              <li onClick={() => router.push('/resources')}>Resources</li>
              <li onClick={() => router.push('/faq')}>FAQ</li>
            </ul>
          </div>
          <div>
            <div className="footer-col-h">University</div>
            <ul className="footer-links">
              <li><a href="https://www.bowiestate.edu" target="_blank" rel="noreferrer">BSU Homepage</a></li>
              <li>Office of Int'l Education</li>
              <li>Career Center</li>
              <li>Student Health</li>
              <li>Counseling Center</li>
            </ul>
          </div>
          <div>
            <div className="footer-col-h">Contact</div>
            <ul className="footer-links">
              <li>14000 Jericho Park Road</li>
              <li>Bowie, MD 20715-9465</li>
              <li><strong>301-860-4000</strong></li>
              <li>1-877-77-BOWIE</li>
              <li>intlsvc@bowiestate.edu</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2025 <strong>Bowie State University</strong> International Student Portal. All rights reserved.</div>
          <div className="footer-copy">Built with Next.js 14 · Supabase · Google Gemini AI</div>
        </div>
      </footer>
    </>
  )
}
