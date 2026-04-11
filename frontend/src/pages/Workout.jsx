import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'

// ── Rep counter config per exercise ─────────────────────────────────────────
const EXERCISE_CONFIGS = {
  'bicep curl':      { joints: [11, 13, 15], downAngle: 160, upAngle: 50 },
  'hammer curl':     { joints: [11, 13, 15], downAngle: 160, upAngle: 50 },
  'tricep dip':      { joints: [11, 13, 15], downAngle: 50,  upAngle: 155 },
  'squat':           { joints: [23, 25, 27], downAngle: 100, upAngle: 160 },
  'lunge':           { joints: [23, 25, 27], downAngle: 100, upAngle: 160 },
  'push up':         { joints: [11, 13, 15], downAngle: 90,  upAngle: 155 },
  'shoulder press':  { joints: [13, 11, 23], downAngle: 85,  upAngle: 155 },
  'lateral raise':   { joints: [13, 11, 23], downAngle: 25,  upAngle: 75  },
  'deadlift':        { joints: [11, 23, 25], downAngle: 90,  upAngle: 160 },
  'romanian deadlift': { joints: [11, 23, 25], downAngle: 90, upAngle: 160 },
  'calf raise':      { joints: [25, 27, 31], downAngle: 80,  upAngle: 110 },
}

function getConfig(name) {
  if (!name) return null
  const key = name.toLowerCase()
  return EXERCISE_CONFIGS[key] || null
}

function calcAngle(A, B, C) {
  const rad = Math.atan2(C.y - B.y, C.x - B.x) - Math.atan2(A.y - B.y, A.x - B.x)
  let angle = Math.abs(rad * 180 / Math.PI)
  if (angle > 180) angle = 360 - angle
  return Math.round(angle)
}

// ── AI Chat component ────────────────────────────────────────────────────────
function AIChat({ contextRef }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! I'm your AI coach. Start the camera and tell me what exercise you're doing. I'll help with form and feedback!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text) => {
    if (!text.trim() || loading) return
    const userMsg = { role: 'user', content: text }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const history = [...messages, userMsg].slice(-10)
      const res = await api.post('/chat', {
        messages: history.map(m => ({ role: m.role, content: m.content })),
        exercise_context: contextRef.current || null,
      })
      setMessages(m => [...m, { role: 'assistant', content: res.data.reply }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Connection error. Try again.' }])
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      width: '340px', flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: 'var(--surface)', borderLeft: '1px solid var(--border)',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 600, color: 'white',
        }}>AI</div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 500 }}>Form Coach</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Powered by Llama</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ fontSize: '10px', color: 'var(--muted2)', marginBottom: '3px', padding: '0 4px' }}>
              {m.role === 'user' ? 'You' : 'Form Coach'}
            </div>
            <div style={{
              maxWidth: '88%', padding: '9px 13px', borderRadius: m.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
              fontSize: '13px', lineHeight: 1.5,
              background: m.role === 'user' ? 'var(--accent)' : 'var(--surface2)',
              color: m.role === 'user' ? 'white' : 'var(--text)',
              border: m.role === 'user' ? 'none' : '1px solid var(--border)',
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '4px', padding: '10px 14px', background: 'var(--surface2)', borderRadius: '4px 12px 12px 12px', width: 'fit-content' }}>
            {[0, 0.2, 0.4].map((d, i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%', background: 'var(--muted)',
                animation: 'bounce 1.2s infinite', animationDelay: `${d}s`,
              }}/>
            ))}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
        <textarea
          style={{
            flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '9px 12px', fontSize: '13px', color: 'var(--text)',
            fontFamily: 'Inter, sans-serif', resize: 'none', outline: 'none', maxHeight: '80px',
          }}
          placeholder="Ask about your form…"
          value={input}
          rows={1}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          style={{
            width: 36, height: 36, background: 'var(--accent)', border: 'none',
            borderRadius: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, opacity: (!input.trim() || loading) ? 0.4 : 1,
          }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
          </svg>
        </button>
      </div>
      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-5px);opacity:1} }`}</style>
    </div>
  )
}

// ── Main Workout page ────────────────────────────────────────────────────────
export default function Workout() {
  const { routineId } = useParams()
  const navigate = useNavigate()

  const [routine, setRoutine] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [currentExIdx, setCurrentExIdx] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [reps, setReps] = useState(0)
  const [stage, setStage] = useState('down')
  const [cameraReady, setCameraReady] = useState(false)
  const [angle, setAngle] = useState(null)
  const [feedback, setFeedback] = useState('Start the camera to begin')
  const [feedbackColor, setFeedbackColor] = useState('var(--muted)')
  const [restTimer, setRestTimer] = useState(null)
  const [listening, setListening] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const [formScores, setFormScores] = useState([])
  const [mediapipeLoaded, setMediapipeLoaded] = useState(false)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const repsRef = useRef(0)
  const stageRef = useRef('down')
  const formScoresRef = useRef([])
  const restTimerRef = useRef(null)
  const aiContextRef = useRef('')

  // Load MediaPipe from CDN
  useEffect(() => {
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js',
    ]
    let loaded = 0
    scripts.forEach(src => {
      if (document.querySelector(`script[src="${src}"]`)) { loaded++; if (loaded === 3) setMediapipeLoaded(true); return }
      const s = document.createElement('script')
      s.src = src
      s.onload = () => { loaded++; if (loaded === 3) setMediapipeLoaded(true) }
      document.head.appendChild(s)
    })
  }, [])

  // Load routine + start session
  useEffect(() => {
    api.get(`/routines/${routineId}`).then(r => {
      setRoutine(r.data)
      return api.post('/sessions', { routine_id: parseInt(routineId) })
    }).then(r => {
      setSessionId(r.data.id)
      setSessionStartTime(Date.now())
    })
  }, [routineId])

  // Update AI context when exercise changes
  useEffect(() => {
    if (!routine) return
    const ex = routine.exercises[currentExIdx]
    if (ex) {
      aiContextRef.current = `Exercise: ${ex.exercise_name} | Set ${currentSet}/${ex.sets} | Target reps: ${ex.target_reps} | Reps done: ${repsRef.current} | Angle: ${angle ?? 'unknown'}°`
    }
  }, [routine, currentExIdx, currentSet, angle])

  // Start camera + pose
  const startCamera = useCallback(() => {
    if (!mediapipeLoaded || !videoRef.current || !canvasRef.current) return
    const { Pose, POSE_CONNECTIONS } = window
    const { Camera } = window
    const { drawConnectors, drawLandmarks } = window

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = 1280; canvas.height = 720

    const pose = new Pose({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}` })
    pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 })

    pose.onResults(results => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)
      if (!results.poseLandmarks) return

      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: 'rgba(124,110,245,0.7)', lineWidth: 2.5 })
      drawLandmarks(ctx, results.poseLandmarks, { color: '#7c6ef5', fillColor: 'rgba(124,110,245,0.3)', lineWidth: 1.5, radius: 4 })

      const lm = results.poseLandmarks
      const ex = routine?.exercises[currentExIdx]
      if (!ex) return

      const config = getConfig(ex.exercise_name)
      if (!config) return

      const [ai, bi, ci] = config.joints
      if (!lm[ai] || !lm[bi] || !lm[ci]) return

      const currentAngle = calcAngle(lm[ai], lm[bi], lm[ci])
      setAngle(currentAngle)

      // Form scoring — penalise large deviations
      const idealRange = config.upAngle - config.downAngle
      const score = Math.max(0, Math.min(100, 100 - Math.abs(currentAngle - ((config.upAngle + config.downAngle) / 2)) / Math.abs(idealRange) * 100))
      formScoresRef.current.push(score)

      // Rep counting state machine
      if (currentAngle > config.downAngle && stageRef.current === 'up') {
        stageRef.current = 'down'
        setStage('down')
      }
      if (currentAngle < config.upAngle && stageRef.current === 'down') {
        stageRef.current = 'up'
        setStage('up')
        repsRef.current += 1
        setReps(repsRef.current)
      }

      // Feedback
      if (currentAngle > config.downAngle) { setFeedback('Ready position'); setFeedbackColor('var(--muted)') }
      else if (currentAngle < config.upAngle) { setFeedback('Full range! Great work 💪'); setFeedbackColor('var(--green)') }
      else { setFeedback('Keep going…'); setFeedbackColor('var(--yellow)') }

      // Auto complete set when target reps reached
      if (repsRef.current >= ex.target_reps && !restTimerRef.current) {
        completeSet(ex)
      }
    })

    const camera = new Camera(videoRef.current, {
      onFrame: async () => await pose.send({ image: videoRef.current }),
      width: 1280, height: 720,
    })
    camera.start().then(() => {
      setCameraReady(true)
      setFeedback('Tracking active — start your set!')
      setFeedbackColor('var(--green)')
    })
  }, [mediapipeLoaded, routine, currentExIdx])

  const completeSet = useCallback(async (ex) => {
    const avgFormScore = formScoresRef.current.length
      ? formScoresRef.current.reduce((a, b) => a + b, 0) / formScoresRef.current.length
      : 0

    // Save to backend
    if (sessionId) {
      await api.post(`/sessions/${sessionId}/sets`, {
        exercise_id: ex.exercise_id,
        reps_completed: repsRef.current,
        form_score: Math.round(avgFormScore),
        set_number: currentSet,
      })
    }

    formScoresRef.current = []
    repsRef.current = 0
    setReps(0)
    stageRef.current = 'down'

    const isLastSet = currentSet >= ex.sets
    const isLastExercise = currentExIdx >= (routine?.exercises.length ?? 1) - 1

    if (isLastSet && isLastExercise) {
      finishWorkout()
      return
    }

    // Start rest timer
    const restSecs = ex.rest_seconds || 60
    setRestTimer(restSecs)
    setFeedback(`Set complete! Rest for ${restSecs}s`)
    setFeedbackColor('var(--accent)')

    let remaining = restSecs
    restTimerRef.current = setInterval(() => {
      remaining -= 1
      setRestTimer(remaining)
      if (remaining <= 0) {
        clearInterval(restTimerRef.current)
        restTimerRef.current = null
        setRestTimer(null)
        if (isLastSet) {
          setCurrentExIdx(i => i + 1)
          setCurrentSet(1)
        } else {
          setCurrentSet(s => s + 1)
        }
        setFeedback('Rest over — start your next set!')
        setFeedbackColor('var(--green)')
      }
    }, 1000)
  }, [sessionId, currentSet, currentExIdx, routine])

  const finishWorkout = async () => {
    if (!sessionId) return
    const duration = Math.round((Date.now() - (sessionStartTime || Date.now())) / 1000)
    await api.post(`/sessions/${sessionId}/complete`, { duration_seconds: duration })
    navigate('/history')
  }

  // Voice recognition
  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return alert('Voice recognition not supported in this browser. Try Chrome.')
    const rec = new SR()
    rec.continuous = false
    rec.interimResults = false
    setListening(true)
    rec.onresult = e => {
      const text = e.results[0][0].transcript.toLowerCase()
      setFeedback(`Heard: "${text}" — matching exercise…`)
      if (routine) {
        const match = routine.exercises.findIndex(ex => text.includes(ex.exercise_name.toLowerCase()))
        if (match !== -1) {
          setCurrentExIdx(match)
          setCurrentSet(1)
          repsRef.current = 0; setReps(0)
          setFeedback(`Switched to: ${routine.exercises[match].exercise_name}`)
          setFeedbackColor('var(--green)')
        } else {
          setFeedback(`Couldn't find that exercise. Try saying the exact name.`)
          setFeedbackColor('var(--yellow)')
        }
      }
      setListening(false)
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    rec.start()
  }

  const currentExercise = routine?.exercises[currentExIdx]

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Top bar */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: '52px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: '12px' }}
            onClick={() => { if (confirm('End workout?')) finishWorkout() }}>
            ← Back
          </button>
          <div style={{ height: '20px', width: '1px', background: 'var(--border)' }}/>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{routine?.name ?? 'Workout'}</span>
        </div>

        {currentExercise && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
              Exercise <span style={{ color: 'var(--text)', fontWeight: 500 }}>{currentExIdx + 1}/{routine?.exercises.length}</span>
            </span>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
              Set <span style={{ color: 'var(--text)', fontWeight: 500 }}>{currentSet}/{currentExercise.sets}</span>
            </span>
          </div>
        )}

        <button className="btn btn-danger" style={{ padding: '5px 14px', fontSize: '12px' }}
          onClick={() => { if (confirm('Finish workout now?')) finishWorkout() }}>
          Finish
        </button>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Camera side */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px', overflow: 'hidden' }}>

          {/* Camera view */}
          <div style={{ flex: 1, position: 'relative', background: 'var(--surface)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <video ref={videoRef} style={{ display: 'none' }} autoPlay playsInline/>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>

            {!cameraReady && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '16px',
              }}>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                  <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
                </svg>
                <button
                  className="btn btn-primary"
                  style={{ fontSize: '14px', padding: '10px 24px' }}
                  onClick={startCamera}
                  disabled={!mediapipeLoaded || !routine}
                >
                  {!mediapipeLoaded ? 'Loading AI…' : !routine ? 'Loading routine…' : 'Start Camera'}
                </button>
              </div>
            )}

            {/* Overlays */}
            {cameraReady && (
              <>
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px' }}>
                  {angle !== null && (
                    <div style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid var(--border2)', borderRadius: '9px', padding: '7px 13px', fontSize: '13px' }}>
                      Angle: <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '15px' }}>{angle}°</span>
                    </div>
                  )}
                </div>
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(245,101,101,0.15)', border: '1px solid rgba(245,101,101,0.3)', borderRadius: '9px', padding: '5px 11px', fontSize: '12px', color: '#f56565', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f56565', animation: 'blink 1s infinite' }}/>
                  LIVE
                </div>
              </>
            )}

            {/* Rest timer overlay */}
            {restTimer !== null && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(10,10,15,0.85)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
              }}>
                <div style={{ fontSize: '13px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Rest Time</div>
                <div style={{ fontSize: '72px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: restTimer <= 5 ? 'var(--red)' : 'var(--accent)' }}>
                  {restTimer}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>seconds remaining</div>
                <button className="btn btn-ghost" style={{ marginTop: '8px' }} onClick={() => {
                  clearInterval(restTimerRef.current); restTimerRef.current = null; setRestTimer(null)
                  setCurrentSet(s => s + 1); setFeedback('Skipped rest — start your set!'); setFeedbackColor('var(--yellow)')
                }}>Skip Rest</button>
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
            {/* Exercise info */}
            <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              {currentExercise ? (
                <>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '2px' }}>{currentExercise.exercise_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {currentExercise.sets} sets · {currentExercise.target_reps} reps · {currentExercise.rest_seconds}s rest
                    </div>
                  </div>
                  {/* Rep counter */}
                  <div style={{ textAlign: 'center', padding: '0 16px', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', color: 'var(--accent)', lineHeight: 1 }}>{reps}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>/ {currentExercise.target_reps} reps</div>
                  </div>
                  {/* Feedback */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: feedbackColor, flexShrink: 0 }}/>
                    <span style={{ fontSize: '13px', color: feedbackColor }}>{feedback}</span>
                  </div>
                </>
              ) : (
                <span style={{ color: 'var(--muted)', fontSize: '14px' }}>Loading routine…</span>
              )}
            </div>

            {/* Voice button */}
            <button
              onClick={startVoice}
              title="Say an exercise name"
              style={{
                width: '56px', height: '56px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: listening ? 'var(--red)' : 'var(--surface2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s', flexShrink: 0,
                boxShadow: listening ? '0 0 0 3px rgba(245,101,101,0.3)' : 'none',
              }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={listening ? 'white' : 'var(--muted)'} strokeWidth="2">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
              </svg>
            </button>

            {/* Manual complete set */}
            <button
              className="btn btn-primary"
              style={{ padding: '0 20px', height: '56px', flexShrink: 0, fontSize: '13px' }}
              disabled={!cameraReady || restTimer !== null}
              onClick={() => currentExercise && completeSet(currentExercise)}
            >
              Complete Set
            </button>
          </div>
        </div>

        {/* AI Chat */}
        <AIChat contextRef={aiContextRef}/>
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }`}</style>
    </div>
  )
}
