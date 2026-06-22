import { useEffect, useState, useMemo } from 'react'
import { useProgress } from '@react-three/drei'

export default function LoadingScreen({ onEnter }) {
  const { active, progress, loaded, total } = useProgress()
  const [started, setStarted] = useState(false)
  const [ready,   setReady]   = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [gone,    setGone]    = useState(false)

  // Mark that loading has actually begun (textures register with the manager)
  useEffect(() => {
    if (total > 0 || active) setStarted(true)
  }, [total, active])

  // Ready when the loading manager reports 100% after work began…
  useEffect(() => {
    if (started && progress >= 100) {
      const t = setTimeout(() => setReady(true), 250)
      return () => clearTimeout(t)
    }
  }, [started, progress])

  // …with a safety fallback so a stalled/broken asset never traps the user.
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 15000)
    return () => clearTimeout(t)
  }, [])

  // Ambient particles drifting upward behind the title — pure CSS transforms.
  const particles = useMemo(() => Array.from({ length: 20 }, () => ({
    left:  Math.random() * 100,
    size:  1.5 + Math.random() * 3,
    delay: -Math.random() * 14,
    dur:   10 + Math.random() * 10,
    drift: (Math.random() - 0.5) * 50,
    op:    0.12 + Math.random() * 0.30,
  })), [])

  const handleEnter = () => {
    if (!ready || leaving) return
    onEnter()                          // fire now, while the click gesture is fresh (unlocks audio)
    setLeaving(true)                   // then fade ourselves out
    setTimeout(() => setGone(true), 700)
  }

  const pct = Math.min(100, Math.round(progress))

  if (gone) return null

  return (
    <div
      onClick={handleEnter}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 40%, #1a1330 0%, #0b0a14 70%)',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        cursor: ready ? 'pointer' : 'default',
        opacity: leaving ? 0 : 1,
        transition: 'opacity 0.7s ease',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes ls-pulse { 0%,100% { opacity: .5 } 50% { opacity: 1 } }
        @keyframes ls-rise  { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
        @keyframes ls-float {
          0%   { transform: translateY(0)      translateX(0);              opacity: 0; }
          12%  { opacity: var(--op); }
          88%  { opacity: var(--op); }
          100% { transform: translateY(-108vh) translateX(var(--drift));   opacity: 0; }
        }
        @keyframes ls-shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
      `}</style>

      {/* Ambient drifting particles */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {particles.map((p, i) => (
          <span key={i} style={{
            position: 'absolute', bottom: '-6px', left: `${p.left}%`,
            width: `${p.size}px`, height: `${p.size}px`, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.9), rgba(167,139,250,0.35))',
            boxShadow: '0 0 6px rgba(212,175,55,0.5)',
            '--op': p.op, '--drift': `${p.drift}px`,
            animation: `ls-float ${p.dur}s linear ${p.delay}s infinite`,
          }} />
        ))}
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Eyebrow */}
      <p style={{
        fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase',
        color: 'rgba(167,139,250,0.8)', margin: 0,
      }}>
        Father's Day · 2026
      </p>

      {/* Title */}
      <h1 style={{
        fontFamily: 'Georgia, serif', fontWeight: 400,
        fontSize: '40px', letterSpacing: '0.01em',
        margin: '18px 0 6px',
        background: 'linear-gradient(100deg, rgba(255,255,255,0.92) 28%, #f6e7b4 44%, #d4af37 50%, #f6e7b4 56%, rgba(255,255,255,0.92) 72%)',
        backgroundSize: '220% auto',
        WebkitBackgroundClip: 'text', backgroundClip: 'text',
        WebkitTextFillColor: 'transparent', color: 'transparent',
        animation: 'ls-shimmer 7s linear infinite',
      }}>
        A Gallery of Memories
      </h1>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
        For Dad, with love
      </p>

      {/* Progress / Enter */}
      <div style={{ marginTop: '48px', height: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {!ready ? (
          <>
            <div style={{ width: '260px', height: '2px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: 'linear-gradient(to right, #7c3aed, #a78bfa)',
                borderRadius: '999px', transition: 'width 0.3s ease',
              }} />
            </div>
            <p style={{ marginTop: '14px', fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', animation: 'ls-pulse 1.6s ease-in-out infinite' }}>
              {started ? `LOADING ${pct}%  ·  ${loaded}/${total}` : 'PREPARING…'}
            </p>
          </>
        ) : (
          <div style={{ animation: 'ls-rise 0.6s ease both', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              onClick={handleEnter}
              style={{
                padding: '14px 38px', borderRadius: '999px',
                background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                color: '#fff', border: 'none', cursor: 'pointer',
                fontSize: '14px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
                boxShadow: '0 0 30px rgba(124,58,237,0.5)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 44px rgba(124,58,237,0.75)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = '0 0 30px rgba(124,58,237,0.5)' }}
            >
              Enter the Gallery
            </button>
            <p style={{ marginTop: '18px', fontSize: '11px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)' }}>
              CLICK TO LOOK AROUND  ·  WASD TO WALK  ·  ESC TO FREE CURSOR
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
