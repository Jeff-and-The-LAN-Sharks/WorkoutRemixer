import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/routines', label: 'Routines' },
  { to: '/exercises', label: 'Exercises' },
  { to: '/history', label: 'History' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: '56px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <Link to="/routines" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: 28, height: 28, background: 'var(--accent)',
          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, color: 'var(--text)' }}>
          Workout Remixer
        </span>
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
            textDecoration: 'none', transition: 'all 0.15s',
            color: pathname.startsWith(l.to) ? 'var(--text)' : 'var(--muted)',
            background: pathname.startsWith(l.to) ? 'var(--surface2)' : 'transparent',
          }}>
            {l.label}
          </Link>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user && (
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>
            {user.username}
          </span>
        )}
        <button className="btn btn-ghost" onClick={logout} style={{ padding: '6px 14px' }}>
          Logout
        </button>
      </div>
    </header>
  )
}
