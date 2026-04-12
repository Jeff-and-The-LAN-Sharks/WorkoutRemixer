import { useState, useEffect, useRef } from 'react'
import api from '../api/client'

const MEALS = {
  healthy: [
    { name: 'Grilled Salmon & Veggies', calories: 420, protein: 42, carbs: 18, fat: 22, video_id: 'RMgQkEV5tPE', desc: 'Omega-3 rich salmon with roasted broccoli and asparagus. High protein, anti-inflammatory.' },
    { name: 'Chicken & Brown Rice Bowl', calories: 520, protein: 48, carbs: 52, fat: 10, video_id: 'oT2NMrLBa9I', desc: 'Lean chicken breast over brown rice with steamed vegetables. The classic muscle-building meal.' },
    { name: 'Quinoa Power Bowl', calories: 380, protein: 18, carbs: 55, fat: 12, video_id: 'BGEBpbOLQS0', desc: 'Quinoa topped with roasted chickpeas, avocado, cucumber and lemon tahini dressing.' },
    { name: 'Greek Yogurt Parfait', calories: 280, protein: 22, carbs: 35, fat: 6, video_id: 'hVCioKPvT1A', desc: 'Layered Greek yogurt with berries, granola and honey. High protein breakfast or snack.' },
    { name: 'Tuna Avocado Wrap', calories: 350, protein: 32, carbs: 28, fat: 14, video_id: 'B7_DFxwi5wI', desc: 'Whole wheat wrap with tuna, avocado, spinach and tomato. Great post-workout meal.' },
    { name: 'Overnight Oats', calories: 310, protein: 12, carbs: 52, fat: 8, video_id: 'dHBFXBLONeo', desc: 'Oats soaked overnight with chia seeds, almond milk and fresh fruit. Easy meal prep breakfast.' },
    { name: 'Turkey Veggie Stir Fry', calories: 440, protein: 38, carbs: 30, fat: 16, video_id: 'T09y_Ik-dVk', desc: 'Lean turkey mince stir fried with colourful vegetables in a light soy and ginger sauce.' },
    { name: 'Sweet Potato & Black Bean Bowl', calories: 490, protein: 16, carbs: 78, fat: 10, video_id: 'mF9oV7TYMNk', desc: 'Roasted sweet potato with black beans, corn, avocado and chipotle lime dressing.' },
  ],
  keto: [
    { name: 'Bacon & Egg Breakfast', calories: 480, protein: 32, carbs: 2, fat: 38, video_id: 'LkAlVaGpvVY', desc: 'Crispy bacon with fried eggs and avocado. Zero carb, high fat keto breakfast staple.' },
    { name: 'Keto Cauliflower Fried Rice', calories: 320, protein: 18, carbs: 8, fat: 24, video_id: 'MFDhHb1O-ow', desc: 'Riced cauliflower stir fried with eggs, soy sauce and sesame oil. Tastes just like the real thing.' },
    { name: 'Avocado Chicken Salad', calories: 510, protein: 40, carbs: 6, fat: 36, video_id: 'fS85XC0xf6E', desc: 'Shredded chicken mixed with avocado, mayo, celery and herbs. Served in lettuce cups.' },
    { name: 'Ribeye Steak & Butter', calories: 680, protein: 52, carbs: 0, fat: 50, video_id: 'V8Yf1PFEM2A', desc: 'Pan-seared ribeye finished with herb butter and garlic. The ultimate keto power meal.' },
    { name: 'Keto Zucchini Noodles', calories: 290, protein: 24, carbs: 9, fat: 18, video_id: 'OZb_QfJNuTM', desc: 'Spiralized zucchini with creamy pesto, chicken and cherry tomatoes. Low carb pasta alternative.' },
    { name: 'Cheese-Stuffed Peppers', calories: 410, protein: 28, carbs: 10, fat: 30, video_id: 'JcQjK-AiYlw', desc: 'Bell peppers stuffed with seasoned ground beef, cream cheese and cheddar. Baked until golden.' },
  ],
  carnivore: [
    { name: 'Ribeye Steak', calories: 720, protein: 58, carbs: 0, fat: 54, video_id: 'V8Yf1PFEM2A', desc: 'A thick-cut ribeye cooked in its own fat. Salt and pepper only. The cornerstone of carnivore.' },
    { name: 'Ground Beef Bowl', calories: 560, protein: 48, carbs: 0, fat: 40, video_id: 'rHSC7nrXLj8', desc: 'Seasoned ground beef cooked in tallow. Simple, nutrient-dense, and satisfying.' },
    { name: 'Lamb Chops', calories: 620, protein: 44, carbs: 0, fat: 48, video_id: 'mTXbMvJ2oqQ', desc: 'Thick lamb chops seared in a cast iron pan with salt. Rich in zinc, iron and B12.' },
    { name: 'Chicken Thighs', calories: 420, protein: 38, carbs: 0, fat: 30, video_id: 'NcIF9QKCxwg', desc: 'Skin-on chicken thighs roasted until crispy. Higher fat than breasts, preferred on carnivore.' },
    { name: 'Pork Belly', calories: 590, protein: 32, carbs: 0, fat: 50, video_id: 'CBlX1e5_Cms', desc: 'Slow-roasted pork belly with crispy crackling. High fat, high flavour carnivore favourite.' },
    { name: 'Beef Liver & Bacon', calories: 380, protein: 44, carbs: 4, fat: 20, video_id: 'nJCHbG7Kd18', desc: 'Sliced beef liver pan-fried with bacon. The most nutrient-dense food on the planet.' },
  ],
}

const TAB_STYLES = {
  healthy: { color: 'var(--green)', bg: 'rgba(34,211,160,0.1)', label: '🥗 Healthy' },
  keto: { color: 'var(--accent)', bg: 'rgba(124,110,245,0.1)', label: '🥑 Keto' },
  carnivore: { color: 'var(--red)', bg: 'rgba(245,101,101,0.1)', label: '🥩 Carnivore' },
}

function MealCard({ meal, onAdd }) {
  const [showVideo, setShowVideo] = useState(false)
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden', padding: 0 }}>
      {/* Thumbnail */}
      <div style={{ position: 'relative', paddingBottom: '52%', background: '#000', cursor: 'pointer' }} onClick={() => setShowVideo(true)}>
        <img src={`https://img.youtube.com/vi/${meal.video_id}/mqdefault.jpg`} alt={meal.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.style.display = 'none' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(124,110,245,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{meal.name}</h3>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--yellow)', flexShrink: 0, marginLeft: 8 }}>{meal.calories} kcal</span>
        </div>

        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{meal.desc}</p>

        {/* Macros */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ label: 'Protein', val: `${meal.protein}g`, color: 'var(--green)' },
            { label: 'Carbs', val: `${meal.carbs}g`, color: 'var(--accent)' },
            { label: 'Fat', val: `${meal.fat}g`, color: 'var(--yellow)' }].map(m => (
            <div key={m.label} style={{ textAlign: 'center', flex: 1, background: 'var(--surface2)', borderRadius: 8, padding: '6px 4px' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.val}</p>
              <p style={{ fontSize: 10, color: 'var(--muted2)' }}>{m.label}</p>
            </div>
          ))}
        </div>

        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 12, padding: '6px' }}
          onClick={() => onAdd(meal.calories)}>
          + Add to today's calories
        </button>
      </div>

      {/* Video modal */}
      {showVideo && (
        <div className="modal-overlay" onClick={() => setShowVideo(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 640, background: 'var(--surface)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ position: 'relative', paddingBottom: '56.25%' }}>
              <iframe src={`https://www.youtube.com/embed/${meal.video_id}?autoplay=1&rel=0`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; encrypted-media" allowFullScreen/>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 15 }}>{meal.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{meal.calories} kcal · {meal.protein}g protein</p>
              </div>
              <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => setShowVideo(false)}>✕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Food() {
  const [tab, setTab] = useState('healthy')
  const [todayLog, setTodayLog] = useState({ calories: 0, water_ml: 0 })
  const [customCal, setCustomCal] = useState('')
  const [customName, setCustomName] = useState('')
  const [savingCal, setSavingCal] = useState(false)
  const [savingWater, setSavingWater] = useState(false)

  const WATER_TARGET = 2000
  const CAL_TARGET = 2000
  const glasses = Math.round(todayLog.water_ml / 250)

  useEffect(() => {
    api.get('/health/today').then(r => setTodayLog(r.data))
  }, [])

  const addCalories = async (kcal) => {
    const newCal = (todayLog.calories || 0) + kcal
    setSavingCal(true)
    try {
      const r = await api.post('/health/calories', { calories: newCal })
      setTodayLog(r.data)
    } finally { setSavingCal(false) }
  }

  const addWater = async (ml) => {
    const newWater = (todayLog.water_ml || 0) + ml
    setSavingWater(true)
    try {
      const r = await api.post('/health/water', { water_ml: newWater })
      setTodayLog(r.data)
    } finally { setSavingWater(false) }
  }

  const resetCalories = async () => {
    const r = await api.post('/health/calories', { calories: 0 })
    setTodayLog(r.data)
  }

  const resetWater = async () => {
    const r = await api.post('/health/water', { water_ml: 0 })
    setTodayLog(r.data)
  }

  const handleCustomCal = async (e) => {
    e.preventDefault()
    if (!customCal) return
    await addCalories(parseInt(customCal))
    setCustomCal('')
    setCustomName('')
  }

  const calPct = Math.min(100, ((todayLog.calories || 0) / CAL_TARGET) * 100)
  const waterPct = Math.min(100, ((todayLog.water_ml || 0) / WATER_TARGET) * 100)

  return (
    <div className="page">
      <h1 className="page-title">Nutrition</h1>
      <p className="page-sub">Healthy meal ideas with recipes, calorie tracking and daily water intake.</p>

      {/* ── Daily Trackers ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>

        {/* Calorie tracker */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🔥</span>
              <p style={{ fontSize: 14, fontWeight: 600 }}>Calories Today</p>
            </div>
            <button onClick={resetCalories} style={{ fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Reset</button>
          </div>

          {/* Ring */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
              <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="40" cy="40" r="32" fill="none" stroke="var(--surface2)" strokeWidth="7"/>
                <circle cx="40" cy="40" r="32" fill="none"
                  stroke={(todayLog.calories||0) > CAL_TARGET ? 'var(--red)' : 'var(--yellow)'}
                  strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*32}`}
                  strokeDashoffset={`${2*Math.PI*32*(1-calPct/100)}`}
                  style={{ transition: 'stroke-dashoffset 0.5s' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1 }}>{Math.round(calPct)}%</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: (todayLog.calories||0) > CAL_TARGET ? 'var(--red)' : 'var(--yellow)', lineHeight: 1 }}>
                {todayLog.calories || 0}
              </p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>of {CAL_TARGET} kcal goal</p>
              <p style={{ fontSize: 12, color: 'var(--green)', marginTop: 2 }}>
                {Math.max(0, CAL_TARGET - (todayLog.calories||0))} remaining
              </p>
            </div>
          </div>

          {/* Custom add */}
          <form onSubmit={handleCustomCal} style={{ display: 'flex', gap: 6 }}>
            <input className="input" placeholder="kcal" type="number" min="1" value={customCal}
              onChange={e => setCustomCal(e.target.value)}
              style={{ width: 80, padding: '7px 10px', fontSize: 13 }}/>
            <button type="submit" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: 12, flex: 1, justifyContent: 'center' }} disabled={savingCal}>
              + Add
            </button>
          </form>
        </div>

        {/* Water tracker */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>💧</span>
              <p style={{ fontSize: 14, fontWeight: 600 }}>Water Today</p>
            </div>
            <button onClick={resetWater} style={{ fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Reset</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
              <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="40" cy="40" r="32" fill="none" stroke="var(--surface2)" strokeWidth="7"/>
                <circle cx="40" cy="40" r="32" fill="none" stroke="var(--green)"
                  strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*32}`}
                  strokeDashoffset={`${2*Math.PI*32*(1-waterPct/100)}`}
                  style={{ transition: 'stroke-dashoffset 0.5s' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{glasses}/8</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--green)', lineHeight: 1 }}>
                {todayLog.water_ml || 0}
                <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}> ml</span>
              </p>
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>of {WATER_TARGET}ml daily goal</p>
            </div>
          </div>

          {/* Glass buttons */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[250, 500, 750].map(ml => (
              <button key={ml} className="btn btn-green" style={{ flex: 1, justifyContent: 'center', padding: '7px 4px', fontSize: 12 }}
                onClick={() => addWater(ml)} disabled={savingWater}>
                +{ml}ml
              </button>
            ))}
          </div>

          {/* Glasses visual */}
          <div style={{ display: 'flex', gap: 4, marginTop: 12, flexWrap: 'wrap' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ width: 26, height: 26, borderRadius: 6, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i < glasses ? 'rgba(34,211,160,0.15)' : 'var(--surface2)', border: `1px solid ${i < glasses ? 'var(--green)' : 'var(--border)'}`, transition: 'all 0.3s' }}>
                {i < glasses ? '💧' : ''}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Meal Tabs ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {Object.entries(TAB_STYLES).map(([key, style]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 500,
            cursor: 'pointer', border: 'none', fontFamily: 'Inter, sans-serif',
            background: tab === key ? style.color : 'var(--surface2)',
            color: tab === key ? 'white' : 'var(--muted)',
            transition: 'all 0.15s',
          }}>{style.label}</button>
        ))}
      </div>

      {/* Diet description */}
      {tab === 'keto' && (
        <div style={{ background: 'rgba(124,110,245,0.08)', border: '1px solid rgba(124,110,245,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--accent)' }}>Keto Diet</strong> — Very low carb (under 20g/day), high fat. Forces your body into ketosis where it burns fat for fuel instead of carbs. Great for weight loss and mental clarity.
        </div>
      )}
      {tab === 'carnivore' && (
        <div style={{ background: 'rgba(245,101,101,0.08)', border: '1px solid rgba(245,101,101,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--red)' }}>Carnivore Diet</strong> — Animal products only: meat, fish, eggs and dairy. Zero carbs. Advocates report reduced inflammation, improved digestion and body composition.
        </div>
      )}

      {/* Meal grid */}
      <div className="grid-3">
        {MEALS[tab].map((meal, i) => (
          <MealCard key={i} meal={meal} onAdd={addCalories} />
        ))}
      </div>
    </div>
  )
}
