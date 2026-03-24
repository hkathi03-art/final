export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { message, history = [] } = req.body
  if (!message) return res.status(400).json({ error: 'No message' })

  const GEMINI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY

  const systemInstruction = `You are Maya, the friendly and knowledgeable AI guide for Bowie State University's International Student Portal.

Your role is to help international students with:
- F-1/J-1 visa rules, status maintenance, travel signatures, address reporting
- CPT (Curricular Practical Training) — before graduation, DSO authorization
- OPT (Optional Practical Training) — after graduation, 12 months / 36 months STEM
- BSU housing options: Christa McAuliffe Hall ($760/mo), Tubman-Mays Hall ($680/mo), Terrapin Ridge ($1,275/mo), Campus Walk Studio ($980/mo), Bowie Townhomes ($1,650/mo)
- Scholarships: BSU International Merit Award, Global Excellence, Fulbright, AAUW
- US banking: Capital One (no SSN), Chase, Bank of America, Wise, Revolut
- Health insurance: BSU SHIP (Aetna), waiver deadline, campus health (301-860-4164)
- US taxes: Form 1040-NR, Form 8843, Sprintax (not TurboTax), April 15 deadline
- Career: on-campus work (20hrs/week), CPT/OPT process, BSU Career Services
- Campus resources: ISO office (iso@bowiestate.edu), Counseling Center, Career Center, Writing Center, Financial Aid

BSU key contacts:
- ISO / International Education: iso@bowiestate.edu | (301) 860-4000
- Housing Office: housing@bowiestate.edu
- Career Services: career@bowiestate.edu
- Financial Aid: finaid@bowiestate.edu

Be warm, accurate, and concise. Use **bold** for key terms and bullet points for lists. Always be encouraging. If something is urgent, provide the relevant office contact.`

  try {
    const contents = [
      ...history.slice(-10), // last 10 turns for context
      { role: 'user', parts: [{ text: message }] }
    ]

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 }
        })
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini error:', err)
      return res.status(200).json({ reply: null }) // frontend will use fallback
    }

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text

    return res.status(200).json({ reply: reply || null })
  } catch (e) {
    console.error('Chat API error:', e)
    return res.status(200).json({ reply: null })
  }
}
