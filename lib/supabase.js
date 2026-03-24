import { createClient } from '@supabase/supabase-js'

function resolveSupabaseUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  if (fromEnv) return fromEnv

  const ref = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID
  if (ref) return `https://${ref}.supabase.co`

  return null
}

const supabaseUrl = resolveSupabaseUrl()
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

function createMissingConfigClient() {
  const msg = 'Supabase client is not configured. Set NEXT_PUBLIC_SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_PROJECT_ID) and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  const fail = () => { throw new Error(msg) }
  return {
    auth: {
      getSession: async () => fail(),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithPassword: async () => fail(),
      signUp: async () => fail(),
      signOut: async () => fail(),
      resetPasswordForEmail: async () => fail(),
    },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => fail() }) }) }),
  }
}

export const supabase = (supabaseUrl && supabaseAnon)
  ? createClient(supabaseUrl, supabaseAnon)
  : createMissingConfigClient()
