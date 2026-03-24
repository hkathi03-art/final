import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/useAuth'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import MayaFab from './MayaFab'

export default function Layout({ children }) {
  const [sbOpen, setSbOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('bsu-sidebar-collapsed')
    if (saved === '1') {
      setDesktopCollapsed(true)
      document.body.classList.remove('sb-open')
      document.body.classList.add('sb-collapsed')
      return
    }

    if (window.innerWidth >= 1024 && user) {
      document.body.classList.add('sb-open')
    }
  }, [user])

  useEffect(() => {
    if (typeof window === 'undefined') return
    document.body.classList.toggle('sb-collapsed', desktopCollapsed)
    if (!desktopCollapsed && window.innerWidth >= 1024 && user) {
      document.body.classList.add('sb-open')
    }
  }, [desktopCollapsed, user])

  // Handle lifecycle scroll when navigating to home with ?lc=1
  useEffect(() => {
    if (router.query.lc === '1') {
      setTimeout(() => {
        document.getElementById('lcSection')?.scrollIntoView({ behavior:'smooth', block:'start' })
      }, 300)
    }
  }, [router.query])

  function toggleSidebar() {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      const next = !desktopCollapsed
      setDesktopCollapsed(next)
      localStorage.setItem('bsu-sidebar-collapsed', next ? '1' : '0')
      if (next) document.body.classList.remove('sb-open')
      else document.body.classList.add('sb-open')
      return
    }

    setSbOpen(prev => !prev)
    document.body.style.overflow = !sbOpen ? 'hidden' : ''
  }

  function closeSidebar() {
    setSbOpen(false)
    document.body.style.overflow = ''
  }

  return (
    <>
      <Navbar onHamburger={toggleSidebar} sidebarCollapsed={desktopCollapsed} />
      <Sidebar open={sbOpen} onClose={closeSidebar} />
      <div className="main-wrap">
        {children}
      </div>
      <MayaFab />
    </>
  )
}
