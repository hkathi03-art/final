import { useRouter } from 'next/router'

export default function Custom404() {
  const router = useRouter()
  return (
    <div className="main-wrap" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'calc(100vh - 62px)',flexDirection:'column',gap:'1rem',padding:'2rem',textAlign:'center'}}>
      <div style={{fontSize:'4rem'}}>🎓</div>
      <h1 style={{fontFamily:'var(--serif)',fontSize:'2rem',fontWeight:700}}>Page Not Found</h1>
      <p style={{color:'var(--text3)',maxWidth:360}}>This page doesn't exist, but BSU has plenty of resources for you.</p>
      <button className="btn btn-primary" onClick={() => router.push('/')}>Back to Home</button>
    </div>
  )
}
