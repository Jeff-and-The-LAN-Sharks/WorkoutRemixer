import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary',        sub: 'Little or no exercise',        factor: 1.2 },
  { value: 'light',     label: 'Lightly Active',   sub: '1–3 days/week',                factor: 1.375 },
  { value: 'moderate',  label: 'Moderately Active', sub: '3–5 days/week',               factor: 1.55 },
  { value: 'very',      label: 'Very Active',       sub: '6–7 days/week',               factor: 1.725 },
  { value: 'extra',     label: 'Extra Active',      sub: 'Physical job + daily training', factor: 1.9 },
]

function calcBMI(wkg, hcm) {
  if (!wkg || !hcm) return null
  return wkg / Math.pow(hcm / 100, 2)
}

function bmiInfo(bmi) {
  if (!bmi) return null
  if (bmi < 18.5) return { label: 'Underweight', color: '#60a5fa', pct: (bmi / 40) * 100 }
  if (bmi < 25)   return { label: 'Normal weight', color: 'var(--green)', pct: (bmi / 40) * 100 }
  if (bmi < 30)   return { label: 'Overweight', color: 'var(--yellow)', pct: (bmi / 40) * 100 }
  return                  { label: 'Obese', color: 'var(--red)', pct: Math.min(100, (bmi / 40) * 100) }
}

function calcTDEE(wkg, hcm, age, gender, activity) {
  if (!wkg || !hcm || !age) return null
  const bmr = gender === 'female'
    ? (10 * wkg) + (6.25 * hcm) - (5 * age) - 161
    : (10 * wkg) + (6.25 * hcm) - (5 * age) + 5
  const factor = ACTIVITY_LEVELS.find(a => a.value === activity)?.factor || 1.55
  return Math.round(bmr * factor)
}

function Ring({ pct, color, size = 100, stroke = 8, children }) {
  const r = (size / 2) - stroke
  const circ = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface2)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - Math.min(1, (pct||0) / 100))}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  )
}

const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
const fmtDuration = (s) => s >= 60 ? `${Math.floor(s/60)}m ${s%60 > 0 ? s%60+'s' : ''}`.trim() : `${s}s`

export default function Profile() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [healthHistory, setHealthHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [historyTab, setHistoryTab] = useState('workouts')

  const [form, setForm] = useState({
    height_cm: '', weight_kg: '', age: '', gender: 'male', activity_level: 'moderate'
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    Promise.all([
      api.get('/profile'),
      api.get('/sessions'),
      api.get('/health/history'),
    ]).then(([p, s, h]) => {
      const pr = p.data
      setForm({
        height_cm: pr.height_cm ?? '',
        weight_kg: pr.weight_kg ?? '',
        age: pr.age ?? '',
        gender: pr.gender ?? 'male',
        activity_level: pr.activity_level ?? 'moderate',
      })
      setSessions(s.data.filter(x => x.completed))
      setHealthHistory(h.data)
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/profile', {
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender,
        activity_level: form.activity_level,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally { setSaving(false) }
  }

  
  const bmi = calcBMI(form.weight_kg, form.height_cm)
  const bmiData = bmiInfo(bmi)
  const maintenance = calcTDEE(form.weight_kg, form.height_cm, form.age, form.gender, form.activity_level)
  const deficit = maintenance ? maintenance - 500 : null
  const surplus = maintenance ? maintenance + 300 : null

  const totalReps = sessions.reduce((a, s) => a + s.sets.reduce((b, x) => b + x.reps_completed, 0), 0)
  const totalSets = sessions.reduce((a, s) => a + s.sets.length, 0)
  const avgFormScore = sessions.length
    ? Math.round(sessions.reduce((a, s) => {
        if (!s.sets.length) return a
        return a + s.sets.reduce((b, x) => b + x.form_score, 0) / s.sets.length
      }, 0) / sessions.length)
    : null

  if (loading) return <div className="page"><p style={{ color: 'var(--muted)' }}>Loading profile…</p></div>

  return (
    <div className="page">

      {}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, fontWeight: 700, color: 'white', fontFamily: "'Space Grotesk', sans-serif",
        }}>
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
            {user?.username}
          </h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            <span className="badge badge-purple">{sessions.length} workouts</span>
            {form.height_cm && <span className="badge badge-green">{form.height_cm} cm</span>}
            {form.weight_kg && <span className="badge badge-yellow">{form.weight_kg} kg</span>}
            {bmi && <span className={`badge ${bmiData?.label === 'Normal weight' ? 'badge-green' : bmiData?.label === 'Underweight' ? 'badge-purple' : 'badge-yellow'}`}>BMI {bmi.toFixed(1)}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, marginBottom: 32, alignItems: 'start' }}>

        {}
        <div className="card">
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Personal Info</h2>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input className="input" type="number" placeholder="e.g. 175"
                  value={form.height_cm} onChange={e => set('height_cm', e.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input className="input" type="number" placeholder="e.g. 75"
                  value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input className="input" type="number" placeholder="e.g. 25"
                  value={form.age} onChange={e => set('age', e.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">Biological Sex</label>
                <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Activity Level</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ACTIVITY_LEVELS.map(a => (
                  <label key={a.value} style={{
                    display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                    padding: '9px 12px', borderRadius: 10, transition: 'all 0.15s',
                    background: form.activity_level === a.value ? 'rgba(124,110,245,0.1)' : 'var(--surface2)',
                    border: `1px solid ${form.activity_level === a.value ? 'var(--accent)' : 'var(--border)'}`,
                  }}>
                    <input type="radio" name="activity" value={a.value}
                      checked={form.activity_level === a.value}
                      onChange={e => set('activity_level', e.target.value)}
                      style={{ accentColor: 'var(--accent)', flexShrink: 0 }}/>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500 }}>{a.label}</p>
                      <p style={{ fontSize: 11, color: 'var(--muted)' }}>{a.sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}
              style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: 8,
                background: saved ? 'var(--green)' : undefined }}>
              {saved ? '✓ Profile Saved!' : saving ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>

        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {(!form.height_cm || !form.weight_kg || !form.age) && (
            <div style={{ background: 'rgba(124,110,245,0.08)', border: '1px solid rgba(124,110,245,0.2)', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: 'var(--muted)' }}>
              💡 Fill in your height, weight and age on the left to see your BMI and calorie targets.
            </div>
          )}

          {}
          {bmi && (
            <div className="card">
              <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Body Mass Index (BMI)</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <Ring pct={bmiData?.pct} color={bmiData?.color} size={110} stroke={9}>
                  <span style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: bmiData?.color, lineHeight: 1 }}>
                    {bmi.toFixed(1)}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>BMI</span>
                </Ring>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 22, fontWeight: 700, color: bmiData?.color, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 8 }}>
                    {bmiData?.label}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {[
                      { range: 'Under 18.5', label: 'Underweight', color: '#60a5fa' },
                      { range: '18.5 – 24.9', label: 'Normal', color: 'var(--green)' },
                      { range: '25 – 29.9', label: 'Overweight', color: 'var(--yellow)' },
                      { range: '30+', label: 'Obese', color: 'var(--red)' },
                    ].map(r => (
                      <div key={r.label} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flexShrink: 0 }}/>
                        <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 80 }}>{r.range}</span>
                        <span style={{ fontSize: 12, color: r.label === bmiData?.label ? r.color : 'var(--muted2)', fontWeight: r.label === bmiData?.label ? 600 : 400 }}>{r.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {}
          {maintenance && (
            <div className="card">
              <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Daily Calorie Targets</h2>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
                Based on Mifflin-St Jeor formula with your {ACTIVITY_LEVELS.find(a=>a.value===form.activity_level)?.label?.toLowerCase()} activity level.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                {[
                  { label: 'Calorie Deficit', value: deficit, sub: '−500 kcal · lose ~0.5kg/week', color: 'var(--green)', ring: 65, icon: '📉' },
                  { label: 'Maintenance Calories', value: maintenance, sub: 'Stay at your current weight', color: 'var(--accent)', ring: 80, icon: '⚖️' },
                  { label: 'Calorie Surplus', value: surplus, sub: '+300 kcal · lean muscle gain', color: 'var(--yellow)', ring: 90, icon: '📈' },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '14px 16px',
                  }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 2 }}>{item.label}</p>
                      <p style={{ fontSize: 12, color: 'var(--muted2)' }}>{item.sub}</p>
                    </div>
                    <p style={{ fontSize: 24, fontWeight: 800, color: item.color, fontFamily: "'Space Grotesk', sans-serif", textAlign: 'right' }}>
                      {item.value?.toLocaleString()}
                      <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--muted)' }}> kcal</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {}
          {sessions.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Workout Summary</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { label: 'Workouts', value: sessions.length, color: 'var(--accent)' },
                  { label: 'Total Sets', value: totalSets, color: 'var(--green)' },
                  { label: 'Total Reps', value: totalReps, color: 'var(--yellow)' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center', background: 'var(--surface2)', borderRadius: 10, padding: '12px 8px' }}>
                    <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: s.color, lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[
          { key: 'workouts', label: '🏋️ Workout History' },
          { key: 'nutrition', label: '🥗 Nutrition History' },
        ].map(t => (
          <button key={t.key} onClick={() => setHistoryTab(t.key)} style={{
            padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 500,
            cursor: 'pointer', border: `1px solid ${historyTab === t.key ? 'var(--accent)' : 'var(--border)'}`,
            background: historyTab === t.key ? 'rgba(124,110,245,0.1)' : 'transparent',
            color: historyTab === t.key ? 'var(--accent)' : 'var(--muted)',
            fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      {}
      {historyTab === 'workouts' && (
        sessions.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p>No workouts yet — start a routine!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sessions.map(s => {
              const totalRepsSession = s.sets.reduce((a, x) => a + x.reps_completed, 0)
              const avgForm = s.sets.length ? Math.round(s.sets.reduce((a,x)=>a+x.form_score,0)/s.sets.length) : 0
              return (
                <div key={s.id} className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {}
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${avgForm >= 80 ? 'var(--green)' : avgForm >= 60 ? 'var(--yellow)' : 'var(--red)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                      color: avgForm >= 80 ? 'var(--green)' : avgForm >= 60 ? 'var(--yellow)' : 'var(--red)',
                    }}>
                      {avgForm > 0 ? avgForm : '—'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>{fmtDate(s.started_at)}</p>
                        <span className="badge badge-green">Completed</span>
                      </div>
                      <div style={{ display: 'flex', gap: 14 }}>
                        {[
                          { label: 'Duration', val: fmtDuration(s.duration_seconds) },
                          { label: 'Sets', val: s.sets.length },
                          { label: 'Reps', val: totalRepsSession },
                        ].map(({ label, val }) => (
                          <span key={label} style={{ fontSize: 12, color: 'var(--muted)' }}>
                            <span style={{ color: 'var(--text)', fontWeight: 500 }}>{val}</span> {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {s.sets.length > 0 && (
                    <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {[...new Map(s.sets.map(x => [x.exercise_name, x])).values()].map(set => (
                        <span key={set.exercise_name} className="badge badge-purple">{set.exercise_name}</span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}

      {}
      {historyTab === 'nutrition' && (
        healthHistory.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/>
            </svg>
            <p>No nutrition logs yet — track your food and water on the Nutrition page!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {healthHistory.map(log => {
              const glasses = Math.round(log.water_ml / 250)
              const calPct = Math.min(100, (log.calories / 2000) * 100)
              const waterPct = Math.min(100, (log.water_ml / 2000) * 100)
              return (
                <div key={log.id} className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ minWidth: 90 }}>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>
                        {new Date(log.log_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    {}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>🔥 Calories</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: log.calories > 2000 ? 'var(--red)' : 'var(--yellow)' }}>
                          {log.calories} kcal
                        </span>
                      </div>
                      <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: log.calories > 2000 ? 'var(--red)' : 'var(--yellow)', borderRadius: 3, width: `${calPct}%`, transition: 'width 0.5s' }}/>
                      </div>
                    </div>

                    {}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>💧 Water</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>
                          {glasses}/8 glasses
                        </span>
                      </div>
                      <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'var(--green)', borderRadius: 3, width: `${waterPct}%`, transition: 'width 0.5s' }}/>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
