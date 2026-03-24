import { createClient } from '@supabase/supabase-js'

function firstNonEmpty(...values) {
  return values.find((value) => typeof value === 'string' && value.trim().length > 0) || null
}

function normalizeUrl(url) {
  if (!url) return null
  return url.trim().replace(/\/$/, '')
}

function resolveSupabaseUrl() {
  const fromEnv = firstNonEmpty(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL,
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PROJECT_URL,
  )
  if (fromEnv) return normalizeUrl(fromEnv)

  const ref = firstNonEmpty(
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID,
    process.env.SUPABASE_PROJECT_ID,
  )

  return ref ? `https://${ref}.supabase.co` : null
}

const supabaseUrl = resolveSupabaseUrl()
const supabaseAnon = firstNonEmpty(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  process.env.SUPABASE_ANON_KEY,
  process.env.SUPABASE_PUBLISHABLE_KEY,
)

function createMissingConfigClient() {
  const msg = [
    'Supabase client is not configured.',
    'Set NEXT_PUBLIC_SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_PROJECT_URL / NEXT_PUBLIC_SUPABASE_PROJECT_ID)',
    'and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / SUPABASE_ANON_KEY).',
  ].join(' ')

  const fail = () => {
    throw new Error(msg)
  }

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
