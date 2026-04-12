import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

const NAV_CARDS = [
  {
    to: '/routines', label: 'My Routines', sub: 'Build and manage your workouts',
    color: 'var(--accent)', bg: 'rgba(124,110,245,0.1)',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
  },
  {
    to: '/exercises', label: 'Exercise Library', sub: 'Browse exercises with tutorials',
    color: 'var(--green)', bg: 'rgba(34,211,160,0.1)',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  },
  {
    to: '/food', label: 'Nutrition', sub: 'Meals, calories & water tracker',
    color: 'var(--yellow)', bg: 'rgba(245,197,66,0.1)',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg>,
  },
  {
    to: '/history', label: 'History', sub: 'Track your progress over time',
    color: '#f56565', bg: 'rgba(245,101,101,0.1)',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  },
]

export default function Home() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ routines: 0, sessions: 0, exercises: 0 })
  const [recentSessions, setRecentSessions] = useState([])
  const [todayLog, setTodayLog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/routines'),
      api.get('/sessions'),
      api.get('/exercises'),
      api.get('/health/today'),
    ]).then(([r, s, e, h]) => {
      setStats({ routines: r.data.length, sessions: s.data.filter(x => x.completed).length, exercises: e.data.length })
      setRecentSessions(s.data.filter(x => x.completed).slice(0, 3))
      setTodayLog(h.data)
    }).finally(() => setLoading(false))
  }, [])

  const waterGlasses = todayLog ? Math.round(todayLog.water_ml / 250) : 0
  const waterTarget = 8
  const calorieTarget = 2000
  const timeOfDay = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const fmtDuration = (s) => s >= 60 ? `${Math.floor(s/60)}m` : `${s}s`

  return (
    <div className="page">
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
          {timeOfDay()}, {user?.username} 👋
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15 }}>Here's your fitness overview for today.</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Workouts', value: stats.sessions },
          { label: 'Routines', value: stats.routines },
          { label: 'Exercises', value: stats.exercises },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
            <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--accent)' }}>
              {loading ? '—' : value}
            </p>
          </div>
        ))}
      </div>

      {/* Today's health */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px', marginBottom: 32 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>Today's Health</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Water */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>💧 Water</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: waterGlasses >= waterTarget ? 'var(--green)' : 'var(--text)' }}>
                {waterGlasses}/{waterTarget} glasses
              </span>
            </div>
            <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--green)', borderRadius: 4, width: `${Math.min(100, (waterGlasses / waterTarget) * 100)}%`, transition: 'width 0.5s' }}/>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
              {Array.from({ length: waterTarget }).map((_, i) => (
                <div key={i} style={{ width: 24, height: 24, borderRadius: 6, background: i < waterGlasses ? 'rgba(34,211,160,0.2)' : 'var(--surface2)', border: `1px solid ${i < waterGlasses ? 'var(--green)' : 'var(--border)'}`, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {i < waterGlasses ? '💧' : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Calories */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>🔥 Calories</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: (todayLog?.calories || 0) > calorieTarget ? 'var(--red)' : 'var(--text)' }}>
                {todayLog?.calories || 0} / {calorieTarget} kcal
              </span>
            </div>
            <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: (todayLog?.calories || 0) > calorieTarget ? 'var(--red)' : 'var(--yellow)', borderRadius: 4, width: `${Math.min(100, ((todayLog?.calories || 0) / calorieTarget) * 100)}%`, transition: 'width 0.5s' }}/>
            </div>
            <Link to="/food" style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>
              Log calories →
            </Link>
          </div>
        </div>
      </div>

      {/* Nav cards */}
      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Quick Access</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 32 }}>
        {NAV_CARDS.map(card => (
          <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ transition: 'all 0.15s', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, marginBottom: 12 }}>
                {card.icon}
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{card.label}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>{card.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent workouts */}
      {recentSessions.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600 }}>Recent Workouts</h2>
            <Link to="/history" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentSessions.map(s => (
              <div key={s.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(124,110,245,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{fmtDate(s.started_at)}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>{s.sets.length} sets · {s.sets.reduce((a,x)=>a+x.reps_completed,0)} reps</p>
                </div>
                <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{fmtDuration(s.duration_seconds)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
