import { useRouter } from 'next/router'

export default function MayaFab() {
  const router = useRouter()

  if (router.pathname === '/chatbot') return null

  return (
    <button
      className="maya-fab"
      onClick={() => router.push('/chatbot')}
      aria-label="Open Ask Maya chat"
      title="Ask Maya"
    >
      <i className="fas fa-robot" />
      <span>Ask Maya</span>
    </button>
  )
}
