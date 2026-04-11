import { useState, useEffect } from 'react'
import api from '../api/client'

const MUSCLE_GROUPS = ['All', 'Arms', 'Legs', 'Chest', 'Shoulders', 'Back', 'Core']
const DIFFICULTY_COLOR = { beginner: 'badge-green', intermediate: 'badge-yellow', advanced: 'badge-red' }

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
      <p className="page-sub">Browse all available exercises. Click any card to see details.</p>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          className="input"
          style={{ maxWidth: 260 }}
          placeholder="Search exercises…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {MUSCLE_GROUPS.map(g => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              style={{
                padding: '7px 14px', borderRadius: '20px', fontSize: '12px',
                fontWeight: 500, cursor: 'pointer', border: 'none', fontFamily: 'Inter, sans-serif',
                background: filter === g ? 'var(--accent)' : 'var(--surface2)',
                color: filter === g ? 'white' : 'var(--muted)',
                transition: 'all 0.15s',
              }}>
              {g}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px' }}>Loading exercises…</p>
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
            <div
              key={ex.id}
              className="card"
              onClick={() => setSelected(ex)}
              style={{ cursor: 'pointer', transition: 'border-color 0.15s, transform 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = '' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600 }}>{ex.name}</h3>
                <span className={`badge ${DIFFICULTY_COLOR[ex.difficulty] || 'badge-purple'}`}>
                  {ex.difficulty}
                </span>
              </div>
              <span style={{
                fontSize: '11px', color: 'var(--accent)',
                background: 'rgba(124,110,245,0.1)',
                padding: '3px 9px', borderRadius: '20px',
                display: 'inline-block', marginBottom: '10px'
              }}>
                {ex.muscle_group}
              </span>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>
                {ex.description.length > 90 ? ex.description.slice(0, 90) + '…' : ex.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 className="modal-title" style={{ marginBottom: 6 }}>{selected.name}</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--accent)', background: 'rgba(124,110,245,0.1)', padding: '3px 9px', borderRadius: '20px' }}>
                    {selected.muscle_group}
                  </span>
                  <span className={`badge ${DIFFICULTY_COLOR[selected.difficulty] || 'badge-purple'}`}>
                    {selected.difficulty}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="btn btn-ghost" style={{ padding: '6px 10px' }}>✕</button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>{selected.description}</p>
          </div>
        </div>
      )}
    </div>
  )
}
