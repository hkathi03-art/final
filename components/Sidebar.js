import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'

export default function Sidebar({ open, onClose }) {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const page = router.pathname.replace('/', '') || 'home'

  function nav(href) {
    router.push(href)
    onClose()
  }

  const baseItems = [
    { icon:'fa-gauge',         label:'Dashboard', href:'/dashboard' },
    { icon:'fa-user-shield',   label:'Admin',     href:'/admin' },
    { icon:'fa-house',         label:'Home',      href:'/' },
    { icon:'fa-building',      label:'Housing',   href:'/housing' },
    { icon:'fa-user-group',    label:'Mentorship',href:'/mentorship' },
    { icon:'fa-comment-dots',  label:'Messages',  href:'/messages' },
    { icon:'fa-book-open',     label:'Resources', href:'/resources' },
    { icon:'fa-circle-question',label:'FAQ',      href:'/faq' },
  ]

  const items = user?.isAdmin 
    ? [...baseItems, { icon:'fa-user-shield', label:'Admin', href:'/admin' }]
    : baseItems

  return (
    <>
      <div className={`sb-overlay${open ? ' open' : ''}`} onClick={onClose}>
        <aside className="sb-drawer" onClick={e => e.stopPropagation()}>
          <div className="sb-head">
            <div className="sb-brand">
              <div className="sb-badge">B</div>
              <div className="sb-title">BSU Portal</div>
            </div>
            <button className="sb-close-btn" onClick={onClose}>✕</button>
          </div>

          <nav className="sb-links">
            {items.map(item => (
              <a
                key={item.label}
                className={`sb-item${('/' + page) === item.href || (page === 'home' && item.href === '/') ? ' active' : ''}`}
                onClick={() => item.action ? item.action() : nav(item.href)}
              >
                <i className={`fas ${item.icon}`} />
                <span>{item.label}</span>
              </a>
            ))}
            <div className="sb-sep" />
            {user
              ? <a className="sb-item logout" onClick={() => { signOut(); onClose() }}><i className="fas fa-right-from-bracket" /><span>Sign Out</span></a>
              : <a className="sb-item" onClick={() => nav('/login')}><i className="fas fa-right-to-bracket" /><span>Sign In</span></a>
            }
          </nav>

          {user && (
            <div className="sb-foot">
              <div className="sb-user">
                <div className="sb-user-av">{user.initials}</div>
                <div>
                  <div className="sb-user-name">{user.name}</div>
                  <div className="sb-user-role">{user.major}</div>
                  {user.isAdmin && <div className="sb-user-admin">Staff/Faculty</div>}
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      <style jsx>{`
        .sb-user-admin {
          font-size: 0.7rem;
          color: #ffd700;
          font-weight: bold;
          margin-top: 2px;
        }
      `}</style>
    </>
  )
}
