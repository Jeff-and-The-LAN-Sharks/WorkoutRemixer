import { useState, useEffect } from 'react'
import api from '../api/client'

const MEALS = {
  healthy: [
    { name: 'Grilled Salmon & Veggies', emoji: '🐟', cal: 420, protein: 42, carbs: 18, fat: 22,
      recipe: 'grilled salmon asparagus broccoli recipe',
      desc: 'Omega-3 rich salmon fillet with roasted broccoli and asparagus. Season with lemon, garlic and olive oil. Grill or bake at 200°C for 15 mins.' },
    { name: 'Chicken & Brown Rice Bowl', emoji: '🍗', cal: 520, protein: 48, carbs: 52, fat: 10,
      recipe: 'chicken breast brown rice meal prep recipe',
      desc: 'Lean chicken breast marinated in herbs, served over fluffy brown rice with steamed greens. The classic muscle-building meal prep staple.' },
    { name: 'Quinoa Power Bowl', emoji: '🥗', cal: 380, protein: 18, carbs: 55, fat: 12,
      recipe: 'quinoa chickpea bowl recipe healthy',
      desc: 'Cooked quinoa topped with roasted chickpeas, avocado, cucumber, cherry tomatoes and a lemon tahini dressing. Meal prep 4 servings at once.' },
    { name: 'Greek Yogurt Parfait', emoji: '🥛', cal: 280, protein: 22, carbs: 35, fat: 6,
      recipe: 'greek yogurt parfait granola berries recipe',
      desc: 'Layer full-fat Greek yogurt with mixed berries, crunchy granola and a drizzle of honey. High protein breakfast ready in 2 minutes.' },
    { name: 'Tuna Avocado Wrap', emoji: '🥙', cal: 350, protein: 32, carbs: 28, fat: 14,
      recipe: 'tuna avocado whole wheat wrap recipe',
      desc: 'Mix canned tuna with avocado, lime juice and seasoning. Wrap in a whole wheat tortilla with spinach, tomato and red onion.' },
    { name: 'Overnight Oats', emoji: '🥣', cal: 310, protein: 12, carbs: 52, fat: 8,
      recipe: 'overnight oats chia seeds recipe meal prep',
      desc: 'Combine oats, chia seeds, almond milk and maple syrup the night before. Top with fresh fruit in the morning. Zero cook time.' },
    { name: 'Turkey Veggie Stir Fry', emoji: '🥦', cal: 440, protein: 38, carbs: 30, fat: 16,
      recipe: 'turkey mince stir fry vegetables soy ginger recipe',
      desc: 'Lean turkey mince cooked with bell peppers, broccoli, snap peas and bok choy in a soy-ginger sauce. Serve over cauliflower rice.' },
    { name: 'Sweet Potato Black Bean Bowl', emoji: '🍠', cal: 490, protein: 16, carbs: 78, fat: 10,
      recipe: 'sweet potato black bean bowl chipotle recipe',
      desc: 'Roasted sweet potato cubes with seasoned black beans, corn, avocado and a smoky chipotle lime dressing. Vegan and meal-prep friendly.' },
    { name: 'Baked Egg Muffins', emoji: '🥚', cal: 220, protein: 18, carbs: 6, fat: 14,
      recipe: 'baked egg muffins vegetables protein meal prep',
      desc: 'Whisk eggs with diced vegetables, feta and herbs. Pour into a muffin tin and bake at 180°C for 20 mins. Makes 12 — perfect for the week.' },
    { name: 'Lentil Soup', emoji: '🍲', cal: 360, protein: 20, carbs: 54, fat: 6,
      recipe: 'red lentil soup healthy recipe',
      desc: 'Red lentils simmered with tomatoes, cumin, turmeric and spinach. High in plant protein and fibre. Batch cook and freeze portions.' },
  ],
  keto: [
    { name: 'Bacon & Egg Breakfast', emoji: '🥓', cal: 480, protein: 32, carbs: 2, fat: 38,
      recipe: 'keto bacon eggs avocado breakfast recipe',
      desc: 'Crispy streaky bacon with fried eggs cooked in butter and half an avocado. Essentially zero carbs. The classic keto morning plate.' },
    { name: 'Cauliflower Fried Rice', emoji: '🍚', cal: 320, protein: 18, carbs: 8, fat: 24,
      recipe: 'keto cauliflower fried rice recipe',
      desc: 'Rice cauliflower in a food processor, stir fry with eggs, spring onion, soy sauce and sesame oil. Tastes remarkably like real fried rice.' },
    { name: 'Avocado Chicken Salad', emoji: '🥑', cal: 510, protein: 40, carbs: 6, fat: 36,
      recipe: 'avocado chicken salad lettuce wraps keto recipe',
      desc: 'Shredded rotisserie chicken mixed with mashed avocado, mayo, celery, lemon and herbs. Serve in lettuce cups for a zero-carb wrap.' },
    { name: 'Ribeye Steak & Herb Butter', emoji: '🥩', cal: 680, protein: 52, carbs: 0, fat: 50,
      recipe: 'ribeye steak cast iron herb butter recipe',
      desc: 'Season generously with salt. Sear in a screaming hot cast iron pan 2 mins each side. Rest with compound herb butter. Perfect every time.' },
    { name: 'Zucchini Noodles Pesto', emoji: '🍝', cal: 290, protein: 24, carbs: 9, fat: 18,
      recipe: 'zucchini noodles zoodles pesto chicken keto recipe',
      desc: 'Spiralize zucchini and toss with homemade basil pesto, grilled chicken strips and cherry tomatoes. A satisfying low-carb pasta replacement.' },
    { name: 'Cheese-Stuffed Peppers', emoji: '🫑', cal: 410, protein: 28, carbs: 10, fat: 30,
      recipe: 'stuffed bell peppers ground beef cheese keto recipe',
      desc: 'Halved bell peppers filled with seasoned ground beef, cream cheese, cheddar and jalapeño. Bake at 190°C for 25 minutes until golden.' },
    { name: 'Keto Egg Salad', emoji: '🥗', cal: 340, protein: 22, carbs: 2, fat: 28,
      recipe: 'keto egg salad mayonnaise mustard recipe',
      desc: 'Hard-boiled eggs chopped with full-fat mayo, Dijon mustard, celery and chives. Serve in lettuce cups or on cucumber slices.' },
    { name: 'Bacon-Wrapped Asparagus', emoji: '🌿', cal: 260, protein: 14, carbs: 4, fat: 22,
      recipe: 'bacon wrapped asparagus baked keto recipe',
      desc: 'Bundle 4–5 asparagus spears, wrap tightly with a strip of bacon. Bake at 200°C for 20 mins until crispy. Simple and delicious side.' },
  ],
  carnivore: [
    { name: 'Ribeye Steak', emoji: '🥩', cal: 720, protein: 58, carbs: 0, fat: 54,
      recipe: 'perfect ribeye steak recipe cast iron',
      desc: 'Thick-cut ribeye, salt only. Cast iron screaming hot. Sear 3 mins each side, baste with butter, rest 5 mins. The purist carnivore meal.' },
    { name: 'Ground Beef Bowl', emoji: '🍖', cal: 560, protein: 48, carbs: 0, fat: 40,
      recipe: 'ground beef bowl carnivore recipe',
      desc: '80/20 ground beef cooked in a dry pan until browned. Salt only. High fat ratio keeps you satiated for hours. Simple and effective.' },
    { name: 'Lamb Chops', emoji: '🫀', cal: 620, protein: 44, carbs: 0, fat: 48,
      recipe: 'pan seared lamb chops recipe',
      desc: 'Thick lamb loin chops seared in tallow for 4 mins each side. Rich in zinc, iron, B12 and fat-soluble vitamins. One of the most nutrient-dense meats.' },
    { name: 'Crispy Chicken Thighs', emoji: '🍗', cal: 420, protein: 38, carbs: 0, fat: 30,
      recipe: 'crispy skin chicken thighs oven recipe',
      desc: 'Bone-in, skin-on chicken thighs roasted at 220°C for 40 mins until skin is crackling crispy. Higher fat content than breasts — preferred on carnivore.' },
    { name: 'Slow Roasted Pork Belly', emoji: '🐷', cal: 590, protein: 32, carbs: 0, fat: 50,
      recipe: 'pork belly crispy crackling recipe',
      desc: 'Score the skin deeply. Slow roast at 150°C for 2.5 hours then blast at 240°C for 20 mins for perfect crackling. Zero seasoning needed.' },
    { name: 'Beef Liver & Bacon', emoji: '❤️', cal: 380, protein: 44, carbs: 4, fat: 20,
      recipe: 'beef liver bacon pan fried recipe',
      desc: 'Slice liver thin, soak in milk 30 mins to reduce bitterness. Pan fry with bacon in butter 2 mins per side. Most nutrient-dense food on Earth.' },
    { name: 'Brisket', emoji: '🥓', cal: 650, protein: 50, carbs: 0, fat: 48,
      recipe: 'smoked beef brisket recipe',
      desc: 'Flat-cut brisket rubbed with salt, cooked low and slow at 120°C for 8 hours until fork tender. Shred and serve with rendered fat.' },
    { name: 'Salmon Fillet', emoji: '🐟', cal: 410, protein: 42, carbs: 0, fat: 26,
      recipe: 'pan seared salmon fillet butter recipe',
      desc: 'Skin-on salmon fillet, salt only. Sear skin-side down in butter for 4 mins, flip 2 mins. Fatty fish is well accepted on carnivore for omega-3s.' },
  ],
}

const TAB_CONFIG = {
  healthy:   { label: '🥗 Healthy',   color: 'var(--green)', bg: 'rgba(34,211,160,0.15)',   desc: null },
  keto:      { label: '🥑 Keto',      color: 'var(--accent)', bg: 'rgba(124,110,245,0.15)', desc: 'Very low carb (under 20g/day), high fat. Forces your body into ketosis where it burns fat for fuel instead of carbohydrates.' },
  carnivore: { label: '🥩 Carnivore', color: 'var(--red)',   bg: 'rgba(245,101,101,0.15)',  desc: 'Animal products only — meat, fish, eggs and dairy. Zero carbs. Advocates report reduced inflammation and improved body composition.' },
}

const MACRO_COLORS = { Protein: 'var(--green)', Carbs: 'var(--accent)', Fat: 'var(--yellow)' }

function MealCard({ meal, onAdd }) {
  const openRecipe = () => {
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(meal.recipe)}`, '_blank')
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden', transition: 'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = '' }}
    >
      {}
      <div style={{
        margin: '-20px -20px 0', padding: '24px 20px 20px',
        background: 'linear-gradient(135deg, var(--surface2), var(--surface3))',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <span style={{ fontSize: 36, lineHeight: 1 }}>{meal.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>{meal.name}</h3>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--yellow)', fontFamily: "'Space Grotesk', sans-serif" }}>
            {meal.cal} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted)' }}>kcal</span>
          </span>
        </div>
      </div>

      {}
      <div style={{ display: 'flex', gap: 6 }}>
        {[['Protein', meal.protein], ['Carbs', meal.carbs], ['Fat', meal.fat]].map(([label, val]) => (
          <div key={label} style={{ flex: 1, textAlign: 'center', background: 'var(--surface2)', borderRadius: 8, padding: '6px 4px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: MACRO_COLORS[label] }}>{val}g</p>
            <p style={{ fontSize: 10, color: 'var(--muted2)' }}>{label}</p>
          </div>
        ))}
      </div>

      {}
      <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, flex: 1 }}>{meal.desc}</p>

      {}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost" onClick={openRecipe}
          style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '7px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Watch Recipe
        </button>
        <button className="btn btn-green" onClick={() => onAdd(meal.cal)}
          style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '7px' }}>
          + Log Calories
        </button>
      </div>
    </div>
  )
}

export default function Food() {
  const [tab, setTab] = useState('healthy')
  const [todayLog, setTodayLog] = useState({ calories: 0, water_ml: 0 })
  const [customCal, setCustomCal] = useState('')
  const [savingCal, setSavingCal] = useState(false)
  const [savingWater, setSavingWater] = useState(false)

  const CAL_TARGET = 2000
  const WATER_TARGET = 2000
  const glasses = Math.round((todayLog.water_ml || 0) / 250)

  useEffect(() => {
    api.get('/health/today').then(r => setTodayLog(r.data)).catch(() => {})
  }, [])

  const updateCal = async (newCal) => {
    setSavingCal(true)
    try { const r = await api.post('/health/calories', { calories: newCal }); setTodayLog(r.data) }
    finally { setSavingCal(false) }
  }

  const addWater = async (ml) => {
    setSavingWater(true)
    try { const r = await api.post('/health/water', { water_ml: (todayLog.water_ml || 0) + ml }); setTodayLog(r.data) }
    finally { setSavingWater(false) }
  }

  const handleCustomCal = async (e) => {
    e.preventDefault()
    if (!customCal) return
    await updateCal((todayLog.calories || 0) + parseInt(customCal))
    setCustomCal('')
  }

  const calPct = Math.min(100, ((todayLog.calories || 0) / CAL_TARGET) * 100)
  const waterPct = Math.min(100, ((todayLog.water_ml || 0) / WATER_TARGET) * 100)
  const calColor = (todayLog.calories || 0) > CAL_TARGET ? 'var(--red)' : 'var(--yellow)'

  return (
    <div className="page">
      <h1 className="page-title">Nutrition</h1>
      <p className="page-sub">Healthy meal ideas with recipes, calorie tracking and daily water intake.</p>

      {}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>

        {}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>🔥</span>
              <p style={{ fontSize: 14, fontWeight: 600 }}>Calories Today</p>
            </div>
            <button onClick={() => updateCal(0)} style={{ fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Reset</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16 }}>
            {}
            <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
              <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="44" cy="44" r="36" fill="none" stroke="var(--surface2)" strokeWidth="8"/>
                <circle cx="44" cy="44" r="36" fill="none" stroke={calColor} strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*36}`}
                  strokeDashoffset={`${2*Math.PI*36*(1-calPct/100)}`}
                  style={{ transition: 'all 0.6s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: calColor, lineHeight: 1 }}>{Math.round(calPct)}%</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: calColor, lineHeight: 1 }}>{todayLog.calories || 0}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>of {CAL_TARGET} kcal goal</p>
              <p style={{ fontSize: 12, color: (todayLog.calories||0) > CAL_TARGET ? 'var(--red)' : 'var(--green)', marginTop: 2, fontWeight: 500 }}>
                {(todayLog.calories||0) > CAL_TARGET ? `${(todayLog.calories||0) - CAL_TARGET} over` : `${CAL_TARGET - (todayLog.calories||0)} remaining`}
              </p>
            </div>
          </div>

          <form onSubmit={handleCustomCal} style={{ display: 'flex', gap: 8 }}>
            <input className="input" type="number" min="1" placeholder="Add kcal…"
              value={customCal} onChange={e => setCustomCal(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}/>
            <button type="submit" className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: 13 }} disabled={!customCal || savingCal}>
              + Add
            </button>
          </form>
        </div>

        {}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>💧</span>
              <p style={{ fontSize: 14, fontWeight: 600 }}>Water Today</p>
            </div>
            <button onClick={() => api.post('/health/water', { water_ml: 0 }).then(r => setTodayLog(r.data))} style={{ fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Reset</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16 }}>
            <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
              <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="44" cy="44" r="36" fill="none" stroke="var(--surface2)" strokeWidth="8"/>
                <circle cx="44" cy="44" r="36" fill="none" stroke="var(--green)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*36}`}
                  strokeDashoffset={`${2*Math.PI*36*(1-waterPct/100)}`}
                  style={{ transition: 'all 0.6s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>{glasses}/8</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--green)', lineHeight: 1 }}>{todayLog.water_ml || 0}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)' }}> ml</span></p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>of {WATER_TARGET}ml daily goal</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {[['Glass (250ml)', 250], ['Half L (500ml)', 500], ['Bottle (750ml)', 750]].map(([label, ml]) => (
              <button key={ml} className="btn btn-green" onClick={() => addWater(ml)} disabled={savingWater}
                style={{ flex: 1, justifyContent: 'center', padding: '7px 4px', fontSize: 11, flexDirection: 'column', gap: 2, height: 'auto', lineHeight: 1.3 }}>
                <span style={{ fontSize: 13 }}>+{ml}ml</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ width: 28, height: 28, borderRadius: 7, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i < glasses ? 'rgba(34,211,160,0.15)' : 'var(--surface2)', border: `1px solid ${i < glasses ? 'var(--green)' : 'var(--border)'}`, transition: 'all 0.3s' }}>
                {i < glasses ? '💧' : ''}
              </div>
            ))}
          </div>
        </div>
      </div>

      {}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {Object.entries(TAB_CONFIG).map(([key, cfg]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500,
            cursor: 'pointer', border: `1px solid ${tab === key ? cfg.color : 'var(--border)'}`,
            background: tab === key ? cfg.bg : 'transparent',
            color: tab === key ? cfg.color : 'var(--muted)',
            fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
          }}>{cfg.label}</button>
        ))}
      </div>

      {}
      {TAB_CONFIG[tab].desc && (
        <div style={{ background: TAB_CONFIG[tab].bg, border: `1px solid ${TAB_CONFIG[tab].color}33`, borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
          <strong style={{ color: TAB_CONFIG[tab].color }}>{tab.charAt(0).toUpperCase() + tab.slice(1)} Diet — </strong>
          {TAB_CONFIG[tab].desc}
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          {MEALS[tab].length} meals • Click <strong style={{ color: 'var(--text)' }}>Watch Recipe</strong> to open YouTube tutorial
        </p>
      </div>

      <div className="grid-3">
        {MEALS[tab].map((meal, i) => (
          <MealCard key={i} meal={meal} onAdd={(cal) => updateCal((todayLog.calories || 0) + cal)} />
        ))}
      </div>
    </div>
  )
}
