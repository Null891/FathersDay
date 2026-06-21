import { useRef, useState, useEffect } from 'react'

const TRACKS = [
  { title: 'Faded',                      artist: 'Alan Walker',                    src: '/track01.mp3' },
  { title: '7 Rings',                     artist: 'Ariana Grande',                  src: '/track02.mp3' },
  { title: 'Eastside (Acoustic)',          artist: 'benny blanco, Halsey & Khalid',  src: '/track03.mp3' },
  { title: 'Interstellar Main Theme',      artist: 'Hans Zimmer',                    src: '/track04.mp3' },
  { title: 'A Little Bit Yours',           artist: 'JP Saxe',                        src: '/track05.mp3' },
  { title: 'Lemon (Cover)',               artist: 'Raon Lee',                       src: '/track06.mp3' },
  { title: 'Praeludium & Allegro',         artist: 'Kreisler · Ko & Aoki',           src: '/track07.mp3' },
  { title: 'Fingers Crossed',             artist: 'Lauren Spencer Smith',           src: '/track08.mp3' },
  { title: 'Flowers',                     artist: 'Lauren Spencer-Smith',           src: '/track09.mp3' },
  { title: 'Experience',                  artist: 'Ludovico Einaudi',               src: '/track10.mp3' },
  { title: 'Flowers',                     artist: 'Miley Cyrus',                    src: '/track11.mp3' },
  { title: 'Midnight Sky',                artist: 'Miley Cyrus',                    src: '/track12.mp3' },
  { title: 'Can You Hear The Music',      artist: 'Oppenheimer OST · Pietschmann',  src: '/track13.mp3' },
  { title: 'あぶく',                       artist: 'ヨルシカ',                        src: '/track14.mp3' },
  { title: '告白氣球 Love Confession',     artist: '周杰倫 Jay Chou',                 src: '/track15.mp3' },
  { title: '不該',                         artist: '周杰倫 Jay Chou × aMEI',          src: '/track16.mp3' },
  { title: '尋人啟事',                     artist: 'LaLa 徐佳瑩',                    src: '/track17.mp3' },
  { title: '最初的記憶',                   artist: 'LaLa 徐佳瑩',                    src: '/track18.mp3' },
  { title: '你敢不敢',                     artist: 'LaLa 徐佳瑩',                    src: '/track19.mp3' },
  { title: '不曾回來過',                   artist: '李千娜 Nana Lee',                 src: '/track20.mp3' },
  { title: '心花開',                       artist: '李千娜 Nana Lee',                 src: '/track21.mp3' },
  { title: '愛到站了',                     artist: '李千娜 Nana Lee',                 src: '/track22.mp3' },
  { title: '打勾勾',                       artist: '李千娜 Nana Lee',                 src: '/track23.mp3' },
  { title: '說實話',                       artist: '李千娜 Nana Lee',                 src: '/track24.mp3' },
  { title: 'Lemon',                       artist: '米津玄師 Kenshi Yonezu',           src: '/track25.mp3' },
  { title: 'IRIS OUT',                    artist: '米津玄師 Kenshi Yonezu',           src: '/track26.mp3' },
  { title: 'ピースサイン (Peace Sign)',    artist: '米津玄師 Kenshi Yonezu',           src: '/track27.mp3' },
]

function fmt(s) {
  if (!s || isNaN(s)) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

function IconPrev() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
    </svg>
  )
}
function IconNext() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 18l8.5-6L6 6v12zm2.5-6 5.5 4V8l-5.5 4zm7-6h2v12h-2z" />
    </svg>
  )
}
function IconPlay() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}
function IconPause() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  )
}

export default function MusicPlayer() {
  const audioRef   = useRef(null)
  const playingRef = useRef(false)

  const [current,   setCurrent]   = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [duration,  setDuration]  = useState(0)

  useEffect(() => {
    const a = new Audio()
    audioRef.current = a
    a.addEventListener('timeupdate',     () => setProgress(a.currentTime))
    a.addEventListener('loadedmetadata', () => setDuration(a.duration || 0))
    a.addEventListener('ended',          () => setCurrent(c => (c + 1) % TRACKS.length))
    return () => { a.pause(); a.src = '' }
  }, [])

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

  const togglePlay = () => {
    const a = audioRef.current
    if (!a) return
    if (playingRef.current) {
      a.pause(); playingRef.current = false; setIsPlaying(false)
    } else {
      a.play().catch(() => { playingRef.current = false; setIsPlaying(false) })
      playingRef.current = true; setIsPlaying(true)
    }
  }

  const skip = (dir) => setCurrent(c => (c + dir + TRACKS.length) % TRACKS.length)

  const seek = (e) => {
    const a = audioRef.current
    if (!a || !duration) return
    const rect  = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    a.currentTime = ratio * duration
    setProgress(a.currentTime)
  }

  const pct = duration ? (progress / duration) * 100 : 0
  const track = TRACKS[current]

  return (
    <div style={{
      position: 'fixed', bottom: '28px', left: '50%',
      transform: 'translateX(-50%)', zIndex: 50,
      width: '360px',
      background: 'rgba(15, 10, 30, 0.65)',
      backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: '20px', padding: '20px 24px 18px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)',
      userSelect: 'none',
    }}>
      {/* Track info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{ minWidth: 0, flex: 1, paddingRight: '12px' }}>
          <p style={{
            margin: 0, fontSize: '13px', fontWeight: 500,
            color: 'rgba(255,255,255,0.90)', fontFamily: 'system-ui, sans-serif',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {track.title}
          </p>
          <p style={{
            margin: '3px 0 0', fontSize: '11px', fontFamily: 'system-ui, sans-serif',
            color: 'rgba(167,139,250,0.7)', letterSpacing: '0.03em',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {track.artist}
          </p>
        </div>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.22)', fontFamily: 'system-ui, sans-serif', letterSpacing: '0.08em', flexShrink: 0, paddingTop: '1px' }}>
          {current + 1}&thinsp;/&thinsp;{TRACKS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div onClick={seek} style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', cursor: 'pointer', marginBottom: '6px', position: 'relative' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(to right, #7c3aed, #a78bfa)', borderRadius: '999px', transition: 'width 0.1s linear' }} />
        <div style={{ position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%, -50%)', width: '10px', height: '10px', borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 6px #a78bfa' }} />
      </div>

      {/* Time */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', fontFamily: 'system-ui, sans-serif' }}>{fmt(progress)}</span>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', fontFamily: 'system-ui, sans-serif' }}>{fmt(duration)}</span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px' }}>
        <button onClick={() => skip(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.40)', padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.40)'}>
          <IconPrev />
        </button>

        <button onClick={togglePlay} style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          boxShadow: '0 0 18px rgba(124,58,237,0.5)', transition: 'transform 0.1s, box-shadow 0.1s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.07)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(124,58,237,0.75)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = '0 0 18px rgba(124,58,237,0.5)' }}>
          {isPlaying ? <IconPause /> : <IconPlay />}
        </button>

        <button onClick={() => skip(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.40)', padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.40)'}>
          <IconNext />
        </button>
      </div>
    </div>
  )
}
