import { useState, useEffect } from 'react'
import api from '../api/client'

function formatDuration(seconds) {
  if (!seconds) return '0m'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function FormScore({ score }) {
  const color = score >= 80 ? 'var(--green)' : score >= 50 ? 'var(--yellow)' : 'var(--red)'
  return (
    <div style={{
      width: 44, height: 44, borderRadius: '50%',
      border: `2px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '12px', fontWeight: 600, color, flexShrink: 0,
    }}>
      {Math.round(score)}
    </div>
  )
}

export default function History() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.get('/sessions').then(r => setSessions(r.data)).finally(() => setLoading(false))
  }, [])

  const completed = sessions.filter(s => s.completed)
  const totalReps = completed.reduce((acc, s) => acc + s.sets.reduce((a, set) => a + set.reps_completed, 0), 0)
  const avgForm = completed.length
    ? Math.round(completed.reduce((acc, s) => {
        const avg = s.sets.length ? s.sets.reduce((a, set) => a + set.form_score, 0) / s.sets.length : 0
        return acc + avg
      }, 0) / completed.length)
    : 0

  return (
    <div className="page">
      <h1 className="page-title">Workout History</h1>
      <p className="page-sub">Track your progress over time.</p>

      {}
      {completed.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Workouts completed', value: completed.length },
            { label: 'Total reps logged', value: totalReps },
            
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '16px 20px',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {label}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif' }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px' }}>Loading…</p>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p>No workouts yet — start a routine to begin!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sessions.map(session => {
            const avgScore = session.sets.length
              ? session.sets.reduce((a, s) => a + s.form_score, 0) / session.sets.length
              : 0
            const isOpen = expanded === session.id

            return (
              <div key={session.id} className="card" style={{ overflow: 'hidden' }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                  onClick={() => setExpanded(isOpen ? null : session.id)}
                >
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 600 }}>
                        {formatDate(session.started_at)}
                      </span>
                      <span className={`badge ${session.completed ? 'badge-green' : 'badge-yellow'}`}>
                        {session.completed ? 'Completed' : 'In progress'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        Duration: <span style={{ color: 'var(--text)' }}>{formatDuration(session.duration_seconds)}</span>
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        Sets: <span style={{ color: 'var(--text)' }}>{session.sets.length}</span>
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        Total reps: <span style={{ color: 'var(--text)' }}>
                          {session.sets.reduce((a, s) => a + s.reps_completed, 0)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="var(--muted)" strokeWidth="2"
                    style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : '' }}
                  >
                    <path d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>

                {isOpen && session.sets.length > 0 && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {session.sets.map(set => (
                        <div key={set.id} style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '10px 14px', background: 'var(--surface2)',
                          borderRadius: '10px',
                        }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: 'var(--surface3)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '11px', color: 'var(--muted)', flexShrink: 0,
                          }}>
                            {set.set_number}
                          </div>
                          <span style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>{set.exercise_name}</span>
                          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                            <span style={{ color: 'var(--text)', fontWeight: 500 }}>{set.reps_completed}</span> reps
                          </span>
                          <div style={{
                            fontSize: '12px', fontWeight: 600, minWidth: '40px', textAlign: 'right',
                            color: set.form_score >= 80 ? 'var(--green)' : set.form_score >= 50 ? 'var(--yellow)' : 'var(--red)',
                          }}>
                            {Math.round(set.form_score)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
