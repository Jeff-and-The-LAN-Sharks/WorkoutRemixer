import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/client'

const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

// ── AI Chat ──────────────────────────────────────────────────────────────────
function AIChat({ context }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! I'm your AI coach. Ask me about form, technique, nutrition — anything to help your workout!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    if (!text?.trim() || loading) return
    const userMsg = { role: 'user', content: text }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const allMsgs = [...messages, userMsg]
      const res = await api.post('/chat', {
        messages: allMsgs.map(m => ({ role: m.role, content: m.content })),
        exercise_context: context,
      })
      setMessages(m => [...m, { role: 'assistant', content: res.data.reply }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'AI coach unavailable right now.' }])
    } finally { setLoading(false) }
  }

  const QUICK = ['How is my form for this?', 'Tips to improve?', 'What muscles does this work?', 'How many sets should I do?']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>AI</div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500 }}>Form Coach</p>
          <p style={{ fontSize: 11, color: 'var(--green)' }}>● Online</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, scrollbarWidth: 'thin' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <span style={{ fontSize: 10, color: 'var(--muted2)' }}>{m.role === 'user' ? 'You' : 'Form Coach'}</span>
            <div style={{
              padding: '9px 13px',
              borderRadius: m.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
              background: m.role === 'user' ? 'var(--accent)' : 'var(--surface2)',
              border: m.role === 'user' ? 'none' : '1px solid var(--border)',
              fontSize: 13, lineHeight: 1.55, maxWidth: '90%',
              color: m.role === 'user' ? 'white' : 'var(--text)',
            }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 4, padding: '10px 13px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px 12px 12px 12px', width: 'fit-content' }}>
            {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--muted)', display: 'block', animation: `bounce 1.2s ${i*0.2}s infinite` }}/>)}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div style={{ padding: '6px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 5, flexWrap: 'wrap', flexShrink: 0 }}>
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)} style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            color: 'var(--muted)', borderRadius: 20, padding: '3px 10px',
            fontSize: 11, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.target.style.borderColor = ''; e.target.style.color = '' }}
          >{q}</button>
        ))}
      </div>

      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0 }}>
        <textarea
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
          placeholder="Ask your coach…"
          style={{
            flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '8px 12px', fontSize: 13, color: 'var(--text)',
            fontFamily: 'Inter, sans-serif', resize: 'none', outline: 'none',
            maxHeight: 80, overflowY: 'auto',
          }}
        />
        <button onClick={() => send(input)} disabled={!input.trim() || loading} style={{
          width: 36, height: 36, background: 'var(--accent)', border: 'none',
          borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
          opacity: !input.trim() || loading ? 0.4 : 1, transition: 'opacity 0.15s',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
        </button>
      </div>
    </div>
  )
}

// ── Main Workout Page ─────────────────────────────────────────────────────────
export default function Workout() {
  const { routineId } = useParams()
  const navigate = useNavigate()

  const [routine, setRoutine] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Progress
  const [exIdx, setExIdx] = useState(0)
  const [setNum, setSetNum] = useState(1)
  const [repCount, setRepCount] = useState(0)
  const [done, setDone] = useState(false)
  const [completedSets, setCompletedSets] = useState([])

  // Timers
  const [elapsed, setElapsed] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [restLeft, setRestLeft] = useState(0)
  const [restTotal, setRestTotal] = useState(60)

  const sessionIdRef = useRef(null)
  const elapsedRef = useRef(null)
  const restRef = useRef(null)

  useEffect(() => {
    api.get(`/routines/${routineId}`)
      .then(async r => {
        setRoutine(r.data)
        const sess = await api.post('/sessions', { routine_id: parseInt(routineId) })
        setSessionId(sess.data.id)
        sessionIdRef.current = sess.data.id
        setLoading(false)
      })
      .catch(() => navigate('/routines'))
  }, [routineId])

  // Elapsed timer
  useEffect(() => {
    elapsedRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(elapsedRef.current)
  }, [])

  const currentEx = routine?.exercises[exIdx]

  const buildContext = () => {
    if (!currentEx) return ''
    return `Routine: ${routine.name}\nExercise: ${currentEx.exercise_name} (${currentEx.muscle_group})\nSet: ${setNum} of ${currentEx.sets}\nReps completed: ${repCount} / target ${currentEx.target_reps}`
  }

  const adjustReps = (delta) => setRepCount(r => Math.max(0, r + delta))

  const completeSet = async () => {
    const newSet = {
      exercise_name: currentEx.exercise_name,
      set_number: setNum,
      reps: repCount,
    }
    setCompletedSets(s => [...s, newSet])

    try {
      await api.post(`/sessions/${sessionIdRef.current}/sets`, {
        exercise_id: currentEx.exercise_id,
        reps_completed: repCount,
        form_score: 75,
        set_number: setNum,
      })
    } catch (e) { console.error(e) }

    const isLastSet = setNum >= currentEx.sets
    const isLastEx = exIdx >= routine.exercises.length - 1

    if (isLastSet && isLastEx) { finishWorkout(); return }

    // Start rest
    const rest = currentEx.rest_seconds || 60
    setRestTotal(rest)
    setRestLeft(rest)
    setIsResting(true)
    setRepCount(0)

    restRef.current = setInterval(() => {
      setRestLeft(prev => {
        if (prev <= 1) {
          clearInterval(restRef.current)
          setIsResting(false)
          if (isLastSet) {
            setExIdx(i => i + 1)
            setSetNum(1)
          } else {
            setSetNum(s => s + 1)
          }
          setRepCount(0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const skipRest = () => {
    clearInterval(restRef.current)
    setIsResting(false)
    const isLastSet = setNum >= currentEx.sets
    if (isLastSet) { setExIdx(i => i + 1); setSetNum(1) }
    else { setSetNum(s => s + 1) }
    setRepCount(0)
  }

  const finishWorkout = async () => {
    clearInterval(elapsedRef.current)
    try {
      await api.post(`/sessions/${sessionIdRef.current}/complete`, { duration_seconds: elapsed })
    } catch (e) { console.error(e) }
    setDone(true)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--muted)' }}>Loading workout…</p>
    </div>
  )

  // ── Done screen ──
  if (done) {
    const totalReps = completedSets.reduce((a, s) => a + s.reps, 0)
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 0, padding: 24 }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          {/* Trophy */}
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,211,160,0.12)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Workout Complete!</h1>
          <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 32 }}>
            Great work finishing <strong style={{ color: 'var(--text)' }}>{routine?.name}</strong>
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Duration', value: fmtTime(elapsed) },
              { label: 'Sets done', value: completedSets.length },
              { label: 'Total reps', value: totalReps },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 10px', textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
                <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--green)' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Completed sets list */}
          {completedSets.length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 28, textAlign: 'left' }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sets Completed</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {completedSets.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: 'var(--surface2)', borderRadius: 8 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--muted)', flexShrink: 0 }}>{i+1}</span>
                    <span style={{ flex: 1, fontSize: 13 }}>{s.exercise_name}</span>
                    <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{s.reps} reps</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/history')} style={{ padding: '10px 24px' }}>View History</button>
            <button className="btn btn-ghost" onClick={() => navigate('/routines')} style={{ padding: '10px 24px' }}>Back to Routines</button>
          </div>
        </div>
      </div>
    )
  }

  // ── Rest screen ──
  if (isResting) {
    const progress = ((restTotal - restLeft) / restTotal) * 100
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, padding: 24 }}>
        <p style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 2 }}>Rest Time</p>

        {/* Circular timer */}
        <div style={{ position: 'relative', width: 180, height: 180 }}>
          <svg width="180" height="180" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
            <circle cx="90" cy="90" r="80" fill="none" stroke="var(--surface2)" strokeWidth="8"/>
            <circle cx="90" cy="90" r="80" fill="none"
              stroke={restLeft <= 5 ? 'var(--red)' : restLeft <= 15 ? 'var(--yellow)' : 'var(--green)'}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 80}`}
              strokeDashoffset={`${2 * Math.PI * 80 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{
              fontSize: 52, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
              color: restLeft <= 5 ? 'var(--red)' : restLeft <= 15 ? 'var(--yellow)' : 'var(--green)',
              lineHeight: 1,
            }}>{restLeft}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>seconds</span>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>
            {exIdx < routine.exercises.length - 1 && setNum >= currentEx?.sets
              ? `Next: ${routine.exercises[exIdx + 1]?.exercise_name}`
              : `Up next: Set ${setNum + 1} of ${currentEx?.exercise_name}`}
          </p>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Take a breath, hydrate, reset</p>
        </div>

        <button className="btn btn-ghost" onClick={skipRest} style={{ padding: '9px 24px' }}>
          Skip Rest →
        </button>
      </div>
    )
  }

  // ── Active workout ──
  const progress = ((exIdx * (currentEx?.sets || 1) + (setNum - 1)) / (routine.exercises.reduce((a, e) => a + e.sets, 0))) * 100

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 52, borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        <Link to={`/routines/${routineId}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13, textDecoration: 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600 }}>{routine?.name}</span>
          {/* Elapsed timer */}
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--accent)' }}>
            ⏱ {fmtTime(elapsed)}
          </div>
        </div>
        <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: 12 }} onClick={finishWorkout}>Finish</button>
      </header>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--surface2)', flexShrink: 0 }}>
        <div style={{ height: '100%', background: 'var(--accent)', width: `${progress}%`, transition: 'width 0.5s ease' }}/>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left — exercise */}
        <div style={{ flex: '0 0 60%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Video */}
          {currentEx?.video_id && (
            <div style={{ position: 'relative', paddingBottom: '42%', background: '#000', flexShrink: 0 }}>
              <iframe
                key={currentEx.exercise_id}
                src={`https://www.youtube.com/embed/${currentEx.video_id}?autoplay=1&mute=1&loop=1&rel=0&controls=1`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          )}

          {/* Exercise info + rep counter */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            {currentEx && (
              <>
                {/* Exercise header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Exercise {exIdx + 1} of {routine.exercises.length}
                      </span>
                    </div>
                    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
                      {currentEx.exercise_name}
                    </h2>
                    <span className="badge badge-purple">{currentEx.muscle_group}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Set</p>
                    <p style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--accent)' }}>
                      {setNum}<span style={{ color: 'var(--muted2)', fontSize: 16 }}>/{currentEx.sets}</span>
                    </p>
                  </div>
                </div>

                {/* Rep counter */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px', marginBottom: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                    Reps Completed
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, marginBottom: 16 }}>
                    <button onClick={() => adjustReps(-1)} style={{
                      width: 52, height: 52, borderRadius: '50%', border: '2px solid var(--border2)',
                      background: 'var(--surface2)', color: 'var(--text)', fontSize: 24, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                    >−</button>

                    <div style={{ minWidth: 100, textAlign: 'center' }}>
                      <span style={{
                        fontSize: 72, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1,
                        color: repCount >= currentEx.target_reps ? 'var(--green)' : 'var(--text)',
                        transition: 'color 0.3s',
                      }}>{repCount}</span>
                      <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                        target: <span style={{ color: 'var(--text)', fontWeight: 500 }}>{currentEx.target_reps}</span>
                      </p>
                    </div>

                    <button onClick={() => adjustReps(1)} style={{
                      width: 52, height: 52, borderRadius: '50%', border: '2px solid var(--border2)',
                      background: 'var(--surface2)', color: 'var(--text)', fontSize: 24, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                    >+</button>
                  </div>

                  <button className="btn btn-primary" onClick={completeSet}
                    style={{ padding: '12px 40px', fontSize: 15, borderRadius: 12, width: '100%', justifyContent: 'center' }}>
                    {repCount >= currentEx.target_reps ? '✓ ' : ''}Complete Set {setNum}
                  </button>
                </div>

                {/* Upcoming */}
                {routine.exercises.length > 1 && (
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Coming up</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {routine.exercises.slice(exIdx + 1, exIdx + 4).map((ex, i) => (
                        <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
                          <span style={{ fontSize: 11, color: 'var(--muted2)', width: 18, textAlign: 'center' }}>{exIdx + i + 2}</span>
                          <span style={{ flex: 1, fontSize: 13, color: 'var(--muted)' }}>{ex.exercise_name}</span>
                          <span className="badge badge-purple" style={{ fontSize: 10 }}>{ex.muscle_group}</span>
                          <span style={{ fontSize: 11, color: 'var(--muted2)' }}>{ex.sets}×{ex.target_reps}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right — AI Chat */}
        <div style={{ flex: '0 0 40%', borderLeft: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <AIChat context={buildContext()} />
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-5px);opacity:1} }
      `}</style>
    </div>
  )
}
