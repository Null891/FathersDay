import { useRef, useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react'

// track18 / track19 sources were lost and never made it into /public, so they
// are intentionally omitted — referencing them would 404 on load.
const TRACKS = [
  { title: 'Faded',                     artist: 'Alan Walker',                   src: '/track01.mp3' },
  { title: '7 Rings',                   artist: 'Ariana Grande',                 src: '/track02.mp3' },
  { title: 'Eastside (Acoustic)',       artist: 'benny blanco, Halsey & Khalid', src: '/track03.mp3' },
  { title: 'Interstellar Main Theme',   artist: 'Hans Zimmer',                   src: '/track04.mp3' },
  { title: 'A Little Bit Yours',        artist: 'JP Saxe',                       src: '/track05.mp3' },
  { title: 'Lemon (Cover)',             artist: 'Raon Lee',                      src: '/track06.mp3' },
  { title: 'Praeludium & Allegro',      artist: 'Kreisler · Ko & Aoki',          src: '/track07.mp3' },
  { title: 'Fingers Crossed',           artist: 'Lauren Spencer Smith',          src: '/track08.mp3' },
  { title: 'Flowers',                   artist: 'Lauren Spencer-Smith',          src: '/track09.mp3' },
  { title: 'Experience',                artist: 'Ludovico Einaudi',              src: '/track10.mp3' },
  { title: 'Flowers',                   artist: 'Miley Cyrus',                   src: '/track11.mp3' },
  { title: 'Midnight Sky',              artist: 'Miley Cyrus',                   src: '/track12.mp3' },
  { title: 'Can You Hear The Music',    artist: 'Oppenheimer · Pietschmann',     src: '/track13.mp3' },
  { title: 'あぶく',                     artist: 'ヨルシカ',                       src: '/track14.mp3' },
  { title: '告白氣球',                   artist: '周杰倫 Jay Chou',                src: '/track15.mp3' },
  { title: '不該',                       artist: '周杰倫 × aMEI',                  src: '/track16.mp3' },
  { title: '尋人啟事',                   artist: 'LaLa 徐佳瑩',                   src: '/track17.mp3' },
  { title: '不曾回來過',                 artist: '李千娜 Nana Lee',               src: '/track20.mp3' },
  { title: '心花開',                     artist: '李千娜 Nana Lee',               src: '/track21.mp3' },
  { title: '愛到站了',                   artist: '李千娜 Nana Lee',               src: '/track22.mp3' },
  { title: '打勾勾',                     artist: '李千娜 Nana Lee',               src: '/track23.mp3' },
  { title: '說實話',                     artist: '李千娜 Nana Lee',               src: '/track24.mp3' },
  { title: 'Lemon',                     artist: '米津玄師 Kenshi Yonezu',         src: '/track25.mp3' },
  { title: 'IRIS OUT',                  artist: '米津玄師 Kenshi Yonezu',         src: '/track26.mp3' },
  { title: 'ピースサイン',               artist: '米津玄師 Kenshi Yonezu',         src: '/track27.mp3' },
]

function fmt(s) {
  if (!s || isNaN(s)) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

const IconPrev = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
const IconNext = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm9.5-12h2v12h-2z" /></svg>
const IconPlay = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
const IconPause = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>

const MusicPlayer = forwardRef(function MusicPlayer({ enabled = true }, ref) {
  const audioRef   = useRef(null)
  const playingRef = useRef(false)
  const failRef    = useRef(0) // consecutive load failures — stop auto-skip if all fail

  const [current,   setCurrent]   = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [duration,  setDuration]  = useState(0)
  const [error,     setError]     = useState(false)
  const [hovered,   setHovered]   = useState(false)

  // Single audio element for the whole session
  useEffect(() => {
    const a = new Audio()
    a.preload = 'metadata'
    audioRef.current = a

    const onTime = () => setProgress(a.currentTime)
    const onMeta = () => { setDuration(a.duration || 0); failRef.current = 0; setError(false) }
    const onEnd  = () => setCurrent(c => (c + 1) % TRACKS.length)
    const onErr  = () => {
      setError(true)
      // Auto-skip past a broken file, but only if not every track is failing
      if (failRef.current < TRACKS.length - 1) {
        failRef.current += 1
        setCurrent(c => (c + 1) % TRACKS.length)
      }
    }
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('ended', onEnd)
    a.addEventListener('error', onErr)
    return () => { a.pause(); a.src = '' }
  }, [])

  // Load track whenever the index changes; resume playing if we were playing
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.src = TRACKS[current].src
    a.load()
    setProgress(0)
    setDuration(0)
    if (playingRef.current) {
      a.play().catch(() => { playingRef.current = false; setIsPlaying(false) })
    }
  }, [current])

  const play = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    a.play()
      .then(() => { playingRef.current = true; setIsPlaying(true) })
      .catch(() => { playingRef.current = false; setIsPlaying(false) })
  }, [])

  const pause = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    a.pause(); playingRef.current = false; setIsPlaying(false)
  }, [])

  const toggle = useCallback(() => { playingRef.current ? pause() : play() }, [play, pause])
  const skip   = useCallback((dir) => setCurrent(c => (c + dir + TRACKS.length) % TRACKS.length), [])

  // Let App start playback from the "Enter" click (a valid autoplay gesture)
  useImperativeHandle(ref, () => ({ play, pause, toggle, next: () => skip(1), prev: () => skip(-1) }),
    [play, pause, toggle, skip])

  // Keyboard controls work even while the pointer is locked, so the player is
  // always controllable without first pressing Esc to free the cursor.
  useEffect(() => {
    if (!enabled) return
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'KeyK') { e.preventDefault(); toggle() }
      else if (e.code === 'ArrowRight' || e.code === 'KeyN') skip(1)
      else if (e.code === 'ArrowLeft'  || e.code === 'KeyP') skip(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled, toggle, skip])

  const seek = (e) => {
    const a = audioRef.current
    if (!a || !duration) return
    const rect  = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    a.currentTime = ratio * duration
    setProgress(a.currentTime)
  }

  const pct   = duration ? (progress / duration) * 100 : 0
  const track = TRACKS[current]

  const ghostBtn = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    cursor: 'pointer', color: 'rgba(255,255,255,0.55)',
    width: '40px', height: '40px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'color 0.15s, background 0.15s',
  }

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed', bottom: '24px', right: '24px',
        zIndex: 50, width: '320px',
        opacity: hovered || isPlaying ? 1 : 0.6, transition: 'opacity 0.4s ease',
        background: 'linear-gradient(160deg, rgba(28,20,48,0.78), rgba(12,9,22,0.82))',
        backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid rgba(167,139,250,0.16)', borderRadius: '20px',
        padding: '16px 20px 14px',
        boxShadow: '0 18px 50px rgba(0,0,0,0.6), 0 0 40px rgba(124,58,237,0.10), inset 0 1px 0 rgba(255,255,255,0.08)',
        userSelect: 'none', pointerEvents: 'auto',
      }}
    >
      <style>{`
        @keyframes mp-eq { 0%,100% { transform: scaleY(0.35) } 50% { transform: scaleY(1) } }
      `}</style>

      {/* Track info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ minWidth: 0, flex: 1, paddingRight: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Now-playing equalizer */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px', flexShrink: 0, opacity: isPlaying && !error ? 1 : 0.25 }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: '3px', height: '14px', borderRadius: '2px',
                background: 'linear-gradient(to top, #7c3aed, #a78bfa)',
                transformOrigin: 'bottom',
                animation: isPlaying && !error ? `mp-eq ${0.7 + i * 0.18}s ease-in-out infinite` : 'none',
                transform: isPlaying && !error ? undefined : 'scaleY(0.35)',
              }} />
            ))}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.92)', fontFamily: 'system-ui, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {error ? 'Track unavailable' : track.title}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'rgba(167,139,250,0.7)', fontFamily: 'system-ui, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {error ? 'Skipping…' : track.artist}
            </p>
          </div>
        </div>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.22)', fontFamily: 'system-ui, sans-serif', letterSpacing: '0.08em', flexShrink: 0, paddingTop: '1px' }}>
          {current + 1}&thinsp;/&thinsp;{TRACKS.length}
        </span>
      </div>

      {/* Progress */}
      <div onClick={seek} style={{ height: '10px', display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '4px' }}>
        <div style={{ height: '3px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', position: 'relative' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(to right, #7c3aed, #a78bfa)', borderRadius: '999px' }} />
          <div style={{ position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%, -50%)', width: '9px', height: '9px', borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 6px #a78bfa' }} />
        </div>
      </div>

      {/* Time */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', fontFamily: 'system-ui, sans-serif' }}>{fmt(progress)}</span>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', fontFamily: 'system-ui, sans-serif' }}>{fmt(duration)}</span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        <button onClick={() => skip(-1)} style={ghostBtn}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}>
          <IconPrev />
        </button>

        <button onClick={toggle} style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          boxShadow: '0 0 18px rgba(124,58,237,0.5)', transition: 'transform 0.1s, box-shadow 0.1s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.07)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(124,58,237,0.75)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = '0 0 18px rgba(124,58,237,0.5)' }}>
          {isPlaying ? <IconPause /> : <IconPlay />}
        </button>

        <button onClick={() => skip(1)} style={ghostBtn}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}>
          <IconNext />
        </button>
      </div>

      {/* Shortcut hint */}
      <p style={{ textAlign: 'center', margin: '12px 0 0', fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.22)', fontFamily: 'system-ui, sans-serif' }}>
        SPACE PLAY/PAUSE · ← → SKIP
      </p>
    </div>
  )
})

export default MusicPlayer
