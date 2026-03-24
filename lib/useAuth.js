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

  async function hydrateUser(u) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', u.id).single()
    const name = profile?.full_name || u.email.split('@')[0]
    setUser({
      id:       u.id,
      email:    u.email,
      name,
      initials: name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
      major:    profile?.major   || 'International Student',
      country:  profile?.country || '',
    })
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
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

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
