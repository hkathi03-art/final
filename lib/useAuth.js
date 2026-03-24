import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) await hydrateUser(session.user)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (session?.user) await hydrateUser(session.user)
      else setUser(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  function buildUser(authUser, profile = null) {
    const fallbackName = authUser.email.split('@')[0]
    const name = profile?.full_name || authUser.user_metadata?.full_name || fallbackName
    const email = (authUser.email || '').toLowerCase()
    const major = (profile?.major || '').toLowerCase()
    const role = (profile?.role || '').toLowerCase()
    const isAdmin = (
      role === 'admin' ||
      role === 'staff' ||
      role === 'faculty' ||
      (email.endsWith('@bowiestate.edu') && !email.includes('@students.')) ||
      major.includes('staff') ||
      major.includes('faculty')
    )

    return {
      id:       authUser.id,
      email:    authUser.email,
      name,
      initials: name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
      major:    profile?.major   || 'International Student',
      country:  profile?.country || '',
      role:     profile?.role    || 'student',
      isAdmin,
    }
  }

  async function hydrateUser(u) {
    // Set a fast fallback user immediately to avoid perceived "slow sign-in" waits.
    setUser({
      ...buildUser(u),
    })

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', u.id).single()
    setUser(buildUser(u, profile))
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data?.user || null
  }

  async function signUp(email, password, fullName, country, major) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, email, full_name: fullName, country, major })
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  async function resetPassword(email) {
    const options = typeof window !== 'undefined'
      ? { redirectTo: `${window.location.origin}/login` }
      : undefined
    const { error } = await supabase.auth.resetPasswordForEmail(email, options)
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)