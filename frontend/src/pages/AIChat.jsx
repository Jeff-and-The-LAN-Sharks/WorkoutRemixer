import { useState, useRef, useEffect } from 'react'
import api from '../api/client'

const SUGGESTIONS = [
  { label: '💪 Workout Advice', prompt: 'Can you suggest a good workout routine for building muscle?' },
  { label: '🥗 Nutrition Tips', prompt: 'What should I eat before and after a workout?' },
  { label: '📋 Plan My Week', prompt: 'Can you create a 5 day workout plan for me?' },
  { label: '🔥 Lose Weight', prompt: 'What is the best way to lose weight through exercise and diet?' },
  { label: '😴 Recovery', prompt: 'How important is rest and recovery between workouts?' },
  { label: '🧘 Flexibility', prompt: 'What stretches should I do after a workout?' },
]

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey! I'm your AI fitness coach powered by Groq. Ask me anything about workouts, nutrition, recovery, or planning your fitness journey. I'm here to help!"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const newMessages = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await api.post('/chat', {
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        exercise_context: null,
      })
      setMessages(m => [...m, { role: 'assistant', content: res.data.reply }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, the AI coach is unavailable right now. Please try again.' }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Hey! I'm your AI fitness coach powered by Groq. Ask me anything about workouts, nutrition, recovery, or planning your fitness journey. I'm here to help!"
    }])
  }

  return (
    <div className="page" style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', padding: '24px 24px 0' }}>

      {}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexShrink: 0 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>AI Coach</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }}/>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Powered by Groq · Llama 3.3 70B</p>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={clearChat} style={{ fontSize: 12, padding: '6px 14px' }}>
          Clear chat
        </button>
      </div>

      {}
      <div style={{
        flex: 1, overflowY: 'auto', scrollbarWidth: 'thin',
        scrollbarColor: 'var(--surface3) transparent',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 8 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>

              {}
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: m.role === 'user'
                  ? 'linear-gradient(135deg, var(--accent), #a78bfa)'
                  : 'linear-gradient(135deg, var(--green), #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: 'white',
              }}>
                {m.role === 'user' ? 'U' : 'AI'}
              </div>

              {}
              <div style={{
                maxWidth: '75%',
                padding: '12px 16px',
                borderRadius: m.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                background: m.role === 'user' ? 'var(--accent)' : 'var(--surface)',
                border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                fontSize: 14, lineHeight: 1.65,
                color: m.role === 'user' ? 'white' : 'var(--text)',
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
            </div>
          ))}

          {}
          {loading && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--green), #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>AI</div>
              <div style={{ padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px 16px 16px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0,1,2].map(i => (
                  <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--muted)', display: 'block', animation: `bounce 1.2s ${i*0.2}s infinite` }}/>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef}/>
        </div>
      </div>

      {}
      {messages.length === 1 && (
        <div style={{ marginBottom: 16, flexShrink: 0 }}>
          <p style={{ fontSize: 12, color: 'var(--muted2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Suggested questions</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTIONS.map(s => (
              <button key={s.label} onClick={() => send(s.prompt)} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                color: 'var(--text)', borderRadius: 20, padding: '7px 14px',
                fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = '' }}
              >{s.label}</button>
            ))}
          </div>
        </div>
      )}

      {}
      <div style={{
        display: 'flex', gap: 10, alignItems: 'flex-end',
        padding: '16px 0 24px', flexShrink: 0,
        borderTop: '1px solid var(--border)',
      }}>
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Ask your coach anything… (Enter to send)"
          style={{
            flex: 1, background: 'var(--surface2)',
            border: '1px solid var(--border)', borderRadius: 14,
            padding: '12px 16px', fontSize: 14, color: 'var(--text)',
            fontFamily: 'Inter, sans-serif', resize: 'none', outline: 'none',
            overflowY: 'auto', lineHeight: 1.5, transition: 'border-color 0.2s',
            minHeight: 48,
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = ''}
        />
        <button onClick={() => send()} disabled={!input.trim() || loading} style={{
          width: 48, height: 48, background: 'var(--accent)', border: 'none',
          borderRadius: 14, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          opacity: !input.trim() || loading ? 0.4 : 1,
          transition: 'opacity 0.15s, transform 0.1s',
        }}
          onMouseEnter={e => { if (input.trim() && !loading) e.currentTarget.style.background = 'var(--accent2)' }}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = ''}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-5px);opacity:1} }
      `}</style>
    </div>
  )
}