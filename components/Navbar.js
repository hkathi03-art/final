import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'
import { useTheme } from '../lib/useTheme'
import { useToast } from './Toast'
import { DEMO_STUDENTS, DEMO_PASS } from '../lib/data'
import { supabase } from '../lib/supabase'
import { signInDemoStudent } from '../lib/demoAuth'

export default function Navbar({ onHamburger, sidebarCollapsed = false }) {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const toast = useToast()
  const [demoBusy, setDemoBusy] = useState(false)
  const [demoSelected, setDemoSelected] = useState('')

  const page = router.pathname.replace('/', '') || 'home'

  async function handleDemoSwitch(key) {
    if (!key || demoBusy) return
    const d = DEMO_STUDENTS.find(s => s.key === key)
    if (!d) return

    setDemoBusy(true)
    try {
      const { created } = await signInDemoStudent(supabase, d, DEMO_PASS)
      toast(created ? `${d.name} account created & signed in` : `Signed in as ${d.name}`, 'success')
      router.push('/dashboard')
    } catch (e) {
      toast(`Demo login failed: ${e.message}`, 'error')
    } finally {
      setDemoBusy(false)
    }
  }

  const navLinks = [
    { href:'/',           label:'Home',       icon:'fa-house',          active: page === 'home' },
    { href:'/admin',      label:'Admin',      icon:'fa-user-shield',    active: page === 'admin' },
    { href:'/housing',    label:'Housing',    icon:'fa-building',       active: page === 'housing' },
    { href:'/mentorship', label:'Mentorship', icon:'fa-user-group',     active: page === 'mentorship' },
    { href:'/resources',  label:'Resources',  icon:'fa-book',           active: page === 'resources' },
    { href:'/faq',        label:'FAQ',        icon:'fa-circle-question',active: page === 'faq' },
    { href:'/messages',   label:'Messages',   icon:'fa-message',        active: page === 'messages' },
  ]

  function handleNavClick(link) {
    router.push(link.href)
  }

  return (
    <nav id="navbar">
      <button className="hamburger-btn" onClick={onHamburger} aria-label="Menu">
        <i className={`fas ${sidebarCollapsed ? 'fa-bars' : 'fa-xmark'}`} />
      </button>

      <a className="nav-logo" onClick={() => router.push('/')} style={{cursor:'pointer'}}>
        <div className="nav-logo-badge">BSU</div>
        <span className="nav-logo-name">International Portal</span>
      </a>

      <div className="nav-links">
        {navLinks.map(link => (
          <button key={link.label} className={`nav-link${link.active ? ' active' : ''}`} onClick={() => handleNavClick(link)}>
            <i className={`fas ${link.icon}`} />
            {link.label}
          </button>
        ))}
      </div>

      <div className="nav-right">
        <div className="demo-switcher">
          <i className="fas fa-user-graduate" />
          <select
            value={demoSelected}
            onChange={e => {
              const key = e.target.value
              setDemoSelected('')
              handleDemoSwitch(key)
            }}
            disabled={demoBusy}
          >
            <option value="">Quick Student Login</option>
            {DEMO_STUDENTS.map(d => (
              <option key={d.key} value={d.key}>{d.name}</option>
            ))}
          </select>
        </div>

        <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
          <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
        </button>

        {user ? (
          <>
            <div className="user-badge" onClick={() => router.push('/dashboard')}>
              <div className="user-av">{user.initials}</div>
              <span>{user.name.split(' ')[0]}</span>
            </div>
            <button className="btn-signout" onClick={signOut}>Sign Out</button>
          </>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => router.push('/login')}>
            <i className="fas fa-right-to-bracket" /> Sign In
          </button>
        )}
      </div>
    </nav>
  )
}
