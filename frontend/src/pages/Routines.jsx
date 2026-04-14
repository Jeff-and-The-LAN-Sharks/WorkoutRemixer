import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function Routines() {
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/routines').then(r => setRoutines(r.data)).finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const res = await api.post('/routines', form)
      navigate(`/routines/${res.data.id}`)
    } catch {
      alert('Failed to create routine')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this routine?')) return
    await api.delete(`/routines/${id}`)
    setRoutines(r => r.filter(x => x.id !== id))
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 className="page-title">My Routines</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>Build and manage your workout routines.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Routine
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px' }}>Loading…</p>
      ) : routines.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <p>No routines yet — create your first one!</p>
        </div>
      ) : (
        <div className="grid-2">
          {routines.map(r => (
            <div key={r.id} style={{ position: 'relative' }}>
              <Link to={`/routines/${r.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div
                  className="card"
                  style={{ cursor: 'pointer', transition: 'border-color 0.15s, transform 0.15s', paddingRight: 56 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = '' }}
                >
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>{r.name}</h3>
                  {r.description && (
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                      {r.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {r.exercises.length} exercise{r.exercises.length !== 1 ? 's' : ''}
                    </span>
                    {r.exercises.length > 0 && (
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {[...new Set(r.exercises.map(e => e.muscle_group))].slice(0, 3).map(mg => (
                          <span key={mg} className="badge badge-purple">{mg}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>

              {/* Delete button outside the Link */}
              <button
                className="btn btn-danger"
                style={{ position: 'absolute', top: 16, right: 16, padding: '5px 10px', zIndex: 1 }}
                onClick={() => handleDelete(r.id)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Create Routine</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Routine name</label>
                <input
                  className="input" autoFocus
                  placeholder="e.g. Push Day, Leg Day…"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <textarea
                  className="input"
                  placeholder="What's this routine for?"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || !form.name.trim()}>
                  {saving ? 'Creating…' : 'Create & Edit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}