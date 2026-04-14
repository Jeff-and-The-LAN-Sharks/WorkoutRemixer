import { useState, useEffect } from 'react'
import api from '../api/client'
import Stars from '../components/Stars'

const MUSCLE_GROUPS = ['All', 'Arms', 'Chest', 'Back', 'Shoulders', 'Legs', 'Core', 'Full Body']
const DIFFICULTY_COLOR = { beginner: 'badge-green', intermediate: 'badge-yellow', advanced: 'badge-red' }

function VideoModal({ exercise, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 18, width: '100%', maxWidth: 620, overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
          {exercise.video_id ? (
            <iframe
              src={`https://www.youtube.com/embed/${exercise.video_id}?autoplay=1&mute=1&rel=0`}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; encrypted-media" allowFullScreen
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
              <p style={{ fontSize: 14 }}>No video available</p>
            </div>
          )}
        </div>
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
                {exercise.name}
              </h2>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className="badge badge-purple">{exercise.muscle_group}</span>
                <span className={`badge ${DIFFICULTY_COLOR[exercise.difficulty] || 'badge-green'}`}>
                  {exercise.difficulty}
                </span>
                <Stars difficulty={exercise.difficulty} />
              </div>
            </div>
            <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 18, lineHeight: 1 }}>✕</button>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{exercise.description}</p>
        </div>
      </div>
    </div>
  )
}

export default function Exercises() {
  const [exercises, setExercises] = useState([])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/exercises').then(r => setExercises(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = exercises.filter(ex => {
    const matchGroup = filter === 'All' || ex.muscle_group === filter
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase())
    return matchGroup && matchSearch
  })

  return (
    <div className="page">
      <h1 className="page-title">Exercise Library</h1>
      <p className="page-sub">Click any exercise to watch the tutorial video and see instructions.</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input className="input" style={{ maxWidth: 260 }} placeholder="Search exercises…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {MUSCLE_GROUPS.map(g => (
            <button key={g} onClick={() => setFilter(g)} style={{
              padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', border: 'none', fontFamily: 'Inter, sans-serif',
              background: filter === g ? 'var(--accent)' : 'var(--surface2)',
              color: filter === g ? 'white' : 'var(--muted)', transition: 'all 0.15s',
            }}>{g}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 40 }}>Loading exercises…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <p>No exercises found</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(ex => (
            <div key={ex.id} className="card" onClick={() => setSelected(ex)}
              style={{ cursor: 'pointer', transition: 'all 0.15s', padding: 0, overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = '' }}
            >
              {}
              {ex.video_id && (
                <div style={{ position: 'relative', paddingBottom: '52%', background: '#000' }}>
                  <img src={`https://img.youtube.com/vi/${ex.video_id}/mqdefault.jpg`} alt={ex.name}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.parentElement.style.display = 'none' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(124,110,245,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{ex.name}</h3>
                  <span className={`badge ${DIFFICULTY_COLOR[ex.difficulty] || 'badge-green'}`} style={{ flexShrink: 0, marginLeft: 8 }}>
                    {ex.difficulty}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="badge badge-purple">{ex.muscle_group}</span>
                  <Stars difficulty={ex.difficulty} />
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                  {ex.description.length > 75 ? ex.description.slice(0, 75) + '…' : ex.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <VideoModal exercise={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
