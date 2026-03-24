import { createClient } from '@supabase/supabase-js'
import { DEMO_STUDENTS } from '../../lib/data'

const DEMO_EMAILS = new Set(DEMO_STUDENTS.map((student) => student.email))

function getAdminClient() {
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || (projectRef ? `https://${projectRef}.supabase.co` : null)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Demo auth server is not configured.')
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password, name, country, major } = req.body || {}
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required demo auth fields.' })
  }

  if (!DEMO_EMAILS.has(email)) {
    return res.status(403).json({ error: 'Only approved demo accounts can be created.' })
  }

  try {
    const admin = getAdminClient()

    let created = false
    const { data: existingUserData, error: getUserError } = await admin.auth.admin.getUserByEmail(email)
    if (getUserError) throw getUserError

    let userId = existingUserData?.user?.id

    if (!userId) {
      const { data: createData, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name },
      })
      if (createError) throw createError
      userId = createData?.user?.id
      created = true
    }

    if (!userId) {
      throw new Error('Unable to identify demo user id.')
    }

    const { error: profileError } = await admin.from('profiles').upsert({
      id: userId,
      email,
      full_name: name,
      country,
      major,
    })
    if (profileError) throw profileError

    return res.status(200).json({ created })
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to prepare demo account.' })
  }
}
