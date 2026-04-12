const DIFF_STARS = { beginner: 1, intermediate: 3, advanced: 5 }
const DIFF_COLOR = { beginner: 'var(--green)', intermediate: 'var(--yellow)', advanced: 'var(--red)' }

export default function Stars({ difficulty }) {
  const count = DIFF_STARS[difficulty] || 1
  const color = DIFF_COLOR[difficulty] || 'var(--green)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
          fill={i < count ? color : 'none'}
          stroke={i < count ? color : 'var(--muted2)'}
          strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  )
}
