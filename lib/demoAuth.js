import { DEMO_STUDENTS } from './data'

const DEMO_EMAILS = new Set(DEMO_STUDENTS.map((student) => student.email))

function isInvalidCredentialsError(error) {
  return /invalid login credentials/i.test(error?.message || '')
}

async function ensureDemoAccountOnServer(student, password) {
  if (!DEMO_EMAILS.has(student.email)) {
    throw new Error('Invalid demo student selected.')
  }

  const res = await fetch('/api/demo-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: student.email,
      password,
      name: student.name,
      country: student.country,
      major: student.major,
    }),
  })

  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(payload?.error || 'Unable to prepare demo account.')
  }

  return { created: Boolean(payload?.created) }
}

async function ensureDemoAccountWithClient(supabase, student, password) {
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: student.email,
    password,
  })

  if (signUpError && !/user already registered/i.test(signUpError.message || '')) {
    throw signUpError
  }

  if (data?.user?.id) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email: student.email,
      full_name: student.name,
      country: student.country,
      major: student.major,
    })

    if (profileError) throw profileError
  }

  return { created: true }
}

export async function signInDemoStudent(supabase, student, password) {
  const trySignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: student.email, password })
    if (error) throw error
  }

  try {
    await trySignIn()
    return { created: false }
  } catch (signInError) {
    if (!isInvalidCredentialsError(signInError)) throw signInError

    let result
    try {
      result = await ensureDemoAccountOnServer(student, password)
    } catch {
      result = await ensureDemoAccountWithClient(supabase, student, password)
    }

    await trySignIn()
    return result
  }
}
