import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/client'

const DIFFICULTY_COLOR = { beginner: 'badge-green', intermediate: 'badge-yellow', advanced: 'badge-red' }

export default function RoutineDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [routine, setRoutine] = useState(null)
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ exercise_id: '', sets: 3, target_reps: 10, rest_seconds: 60 })
  const [saving, setSaving] = useState(false)

  const load = () =>
    Promise.all([api.get(`/routines/${id}`), api.get('/exercises')])
      .then(([r, e]) => { setRoutine(r.data); setExercises(e.data) })
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [id])

  const saveEdit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put(`/routines/${id}`, editForm)
      setRoutine(res.data)
      setEditing(false)
    } finally { setSaving(false) }
  }

  const addExercise = async (e) => {
    e.preventDefault()
    if (!addForm.exercise_id) return
    setSaving(true)
    try {
      await api.post(`/routines/${id}/exercises`, {
        exercise_id: parseInt(addForm.exercise_id),
        sets: parseInt(addForm.sets),
        target_reps: parseInt(addForm.target_reps),
        rest_seconds: parseInt(addForm.rest_seconds),
        order_index: routine.exercises.length,
      })
      const res = await api.get(`/routines/${id}`)
      setRoutine(res.data)
      setShowAddModal(false)
      setAddForm({ exercise_id: '', sets: 3, target_reps: 10, rest_seconds: 60 })
    } finally { setSaving(false) }
  }

  const removeExercise = async (routineExerciseId) => {
    if (!confirm('Remove this exercise?')) return
    await api.delete(`/routines/${id}/exercises/${routineExerciseId}`)
    setRoutine(r => ({ ...r, exercises: r.exercises.filter(e => e.id !== routineExerciseId) }))
  }

  if (loading) return <div className="page"><p style={{ color: 'var(--muted)' }}>Loading…</p></div>
  if (!routine) return <div className="page"><p style={{ color: 'var(--red)' }}>Routine not found</p></div>

  const alreadyAdded = new Set(routine.exercises.map(e => e.exercise_id))
  const availableExercises = exercises.filter(e => !alreadyAdded.has(e.id))

  return (
    <div className="page">
      {}
      <div style={{ marginBottom: '20px' }}>
        <Link to="/routines" style={{ color: 'var(--muted)', fontSize: '13px', textDecoration: 'none' }}>
          ← Routines
        </Link>
      </div>

      {}
      {editing ? (
        <form onSubmit={saveEdit} style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              className="input" autoFocus style={{ maxWidth: 300 }}
              value={editForm.name}
              onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
            />
            <input
              className="input" style={{ maxWidth: 400 }}
              placeholder="Description"
              value={editForm.description}
              onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
            />
            <button type="submit" className="btn btn-primary" disabled={saving}>Save</button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="page-title">{routine.name}</h1>
            {routine.description && <p className="page-sub" style={{ marginBottom: 0 }}>{routine.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-ghost" onClick={() => { setEditForm({ name: routine.name, description: routine.description }); setEditing(true) }}>
              Edit
            </button>
            <button className="btn btn-green" onClick={() => navigate(`/workout/${id}`)} disabled={routine.exercises.length === 0}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Start Workout
            </button>
          </div>
        </div>
      )}

      {}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600 }}>
          Exercises <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '14px' }}>({routine.exercises.length})</span>
        </h2>
        <button className="btn btn-primary" style={{ padding: '7px 14px' }} onClick={() => setShowAddModal(true)}>
          + Add Exercise
        </button>
      </div>

      {routine.exercises.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <p>No exercises yet — add some to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {routine.exercises.map((ex, i) => (
            <div key={ex.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'var(--surface2)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', color: 'var(--muted)', flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600 }}>{ex.exercise_name}</span>
                  <span className="badge badge-purple">{ex.muscle_group}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {[
                    { label: 'Sets', value: ex.sets },
                    { label: 'Reps', value: ex.target_reps },
                    { label: 'Rest', value: `${ex.rest_seconds}s` },
                  ].map(({ label, value }) => (
                    <span key={label} style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{value}</span> {label}
                    </span>
                  ))}
                </div>
              </div>
              <button className="btn btn-danger" style={{ padding: '5px 10px' }} onClick={() => removeExercise(ex.id)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h2 className="modal-title">Add Exercise to Routine</h2>
            <form onSubmit={addExercise}>
              <div className="form-group">
                <label className="form-label">Exercise</label>
                <select
                  className="input"
                  value={addForm.exercise_id}
                  onChange={e => setAddForm(p => ({ ...p, exercise_id: e.target.value }))}
                >
                  <option value="">Select an exercise…</option>
                  {availableExercises.map(e => (
                    <option key={e.id} value={e.id}>{e.name} — {e.muscle_group}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Sets', key: 'sets', min: 1, max: 10 },
                  { label: 'Target Reps', key: 'target_reps', min: 1, max: 100 },
                  { label: 'Rest (sec)', key: 'rest_seconds', min: 0, max: 300 },
                ].map(({ label, key, min, max }) => (
                  <div className="form-group" key={key}>
                    <label className="form-label">{label}</label>
                    <input
                      className="input" type="number" min={min} max={max}
                      value={addForm[key]}
                      onChange={e => setAddForm(p => ({ ...p, [key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || !addForm.exercise_id}>
                  {saving ? 'Adding…' : 'Add Exercise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
