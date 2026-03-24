import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'
import { useTheme } from '../lib/useTheme'

export default function Navbar({ onHamburger, sidebarCollapsed = false }) {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const page = router.pathname.replace('/', '') || 'home'
  const showBack = router.pathname !== '/'

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

      {showBack && (
        <button
          className="nav-back-btn"
          onClick={() => router.back()}
          aria-label="Go back"
          title="Go back"
        >
          <i className="fas fa-arrow-left" />
          Back
        </button>
      )}

      <div className="nav-links">
        {navLinks.map(link => (
          <button key={link.label} className={`nav-link${link.active ? ' active' : ''}`} onClick={() => handleNavClick(link)}>
            <i className={`fas ${link.icon}`} />
            {link.label}
          </button>
        ))}
      </div>

      <div className="nav-right">
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