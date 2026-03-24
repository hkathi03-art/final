import { useState } from 'react'
import { CONTACTS, CONTACT_INIT_MSGS } from '../lib/data'

function now() { return new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) }

export default function Messages() {
  const [active, setActive]   = useState(CONTACTS[0])
  const [allMsgs, setAllMsgs] = useState(CONTACT_INIT_MSGS)
  const [input, setInput]     = useState('')

  const msgs = allMsgs[active.id] || []

  function sendMsg() {
    const text = input.trim()
    if (!text) return
    setInput('')
    const t = now()
    setAllMsgs(prev => ({ ...prev, [active.id]: [...(prev[active.id]||[]), { role:'sent', text, time:t }] }))
    setTimeout(() => {
      const reply = 'Thanks for your message! I\'ll get back to you shortly. In the meantime, check the FAQ section for quick answers.'
      setAllMsgs(prev => ({ ...prev, [active.id]: [...(prev[active.id]||[]), { role:'recv', text:reply, time:now() }] }))
    }, 1800)
  }

  return (
    <div className="main-wrap">
      <div className="msgs-layout">
        {/* Contacts panel */}
        <div className="contacts-panel">
          <div className="contacts-hd">
            <h3>Messages</h3>
            <input className="contact-search" placeholder="Search conversations…"/>
          </div>
          <div className="contacts-list">
            {CONTACTS.map(c => (
              <div key={c.id} className={`contact-row${active.id===c.id?' active':''}`} onClick={() => setActive(c)}>
                <div className="c-av">{c.initials}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="c-name">{c.name}</div>
                  <div className="c-prev">{c.preview}</div>
                </div>
                <div className="c-time">{c.time}</div>
                {c.online && (
                  <span style={{position:'absolute',bottom:'.95rem',right:'1.2rem',width:7,height:7,borderRadius:'50%',background:'#22c55e',display:'inline-block'}}/>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className="chat-panel">
          <div className="chat-topbar">
            <div className="c-av">{active.initials}</div>
            <div>
              <h4>{active.name}</h4>
              <p>{active.online ? '● Online' : '● Last seen recently'}</p>
            </div>
          </div>

          <div className="chat-msgs" id="chatMsgs">
            {msgs.map((m,i) => (
              <div key={i} className={`msg-row ${m.role}`}>
                <div className="msg-bubble">{m.text}</div>
                <div className="msg-time">{m.time}</div>
              </div>
            ))}
          </div>

          <div className="chat-input-bar">
            <input
              className="chat-field"
              placeholder={`Message ${active.name.split(' ')[0]}…`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMsg()}
            />
            <button className="chat-send" onClick={sendMsg}>
              <i className="fas fa-paper-plane"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
