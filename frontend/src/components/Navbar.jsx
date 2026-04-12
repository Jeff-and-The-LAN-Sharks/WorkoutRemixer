import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LINKS = [
  { to: '/home',      label: 'Home' },
  { to: '/routines',  label: 'Routines' },
  { to: '/exercises', label: 'Exercises' },
  { to: '/food',      label: 'Nutrition' },
  { to: '/history',   label: 'History' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  const isActive = (to) => to === '/home' ? pathname === '/home' : pathname.startsWith(to)

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: 56, borderBottom: '1px solid var(--border)',
      background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 50,
    }}>
      <Link to="/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>
          Workout Remixer
        </span>
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {LINKS.map(l => (
          <Link key={l.to} to={l.to} style={{
            padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
            textDecoration: 'none', transition: 'all 0.15s',
            color: isActive(l.to) ? 'var(--text)' : 'var(--muted)',
            background: isActive(l.to) ? 'var(--surface2)' : 'transparent',
          }}>{l.label}</Link>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user && (
          <Link to="/profile" style={{
            display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
            padding: '5px 10px', borderRadius: 20,
            background: pathname === '/profile' ? 'var(--surface2)' : 'transparent',
            border: '1px solid var(--border)', transition: 'all 0.15s',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'white',
            }}>
              {user.username?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{user.username}</span>
          </Link>
        )}
        <button className="btn btn-ghost" onClick={logout} style={{ padding: '6px 14px', fontSize: 13 }}>Logout</button>
      </div>
    </header>
  )
}
