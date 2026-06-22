import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import confetti from 'canvas-confetti'
import Museum from './Museum'
import Player from './Player'
import Checkpoint from './Checkpoint'
import GrandRoom from './GrandRoom'
import MusicPlayer from './MusicPlayer'
import Modal from './Modal'
import LoadingScreen from './LoadingScreen'
import Effects from './Effects'

export default function App() {
  const [activeQuote, setActiveQuote] = useState(null)
  const [locked, setLocked]   = useState(false)
  const [entered, setEntered] = useState(false)
  const [scene, setScene]     = useState('tunnel') // 'tunnel' | 'room'
  const [flash, setFlash]     = useState(false)     // transition light-burst
  const [roomHint, setRoomHint] = useState(false)
  const musicRef = useRef(null)
  const confettiFired = useRef(false)

  useEffect(() => {
    const onChange = () => setLocked(!!document.pointerLockElement)
    document.addEventListener('pointerlockchange', onChange)
    return () => document.removeEventListener('pointerlockchange', onChange)
  }, [])

  const handleEnter = () => {
    setEntered(true)
    musicRef.current?.play() // start the soundtrack on the entry gesture
  }

  // One-shot celebration confetti — only ever fires the first time the room opens.
  const fireConfetti = () => {
    if (confettiFired.current) return
    confettiFired.current = true
    const colors = ['#a78bfa', '#d4af37', '#f3ead2', '#ff9ec4', '#7c3aed']
    const burst = (opts) => confetti({ disableForReducedMotion: true, colors, ...opts })
    burst({ particleCount: 90, spread: 78, startVelocity: 46, origin: { x: 0.5, y: 0.62 } })
    setTimeout(() => burst({ particleCount: 55, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } }), 160)
    setTimeout(() => burst({ particleCount: 55, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } }), 320)
  }

  // Tunnel → Grand Room: burst of light hides the scene swap.
  const goToRoom = () => {
    if (scene !== 'tunnel') return
    document.exitPointerLock?.()
    setFlash(true)
    setTimeout(() => { setScene('room'); setRoomHint(true) }, 520) // swap at the peak
    setTimeout(() => setFlash(false), 1150)
    setTimeout(() => fireConfetti(), 900)                          // after the flash fades
    setTimeout(() => setRoomHint(false), 6500)
  }

  const inTunnel = scene === 'tunnel'

  return (
    <div className="w-screen h-screen block">
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 1.6, 1], fov: 70 }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        {inTunnel ? (
          <>
            <color attach="background" args={['#0a0a10']} />
            <fog attach="fog" args={['#0a0a10', 8, 60]} />
          </>
        ) : (
          <>
            <color attach="background" args={['#161226']} />
            <fog attach="fog" args={['#1b1631', 14, 46]} />
          </>
        )}

        <Suspense fallback={null}>
          {inTunnel && (
            <>
              <Player enabled={entered} />
              <Museum onExhibitClick={setActiveQuote} />
              <Checkpoint onTrigger={goToRoom} active={entered} />
            </>
          )}
          {scene === 'room' && <GrandRoom musicRef={musicRef} />}
        </Suspense>

        <Effects room={!inTunnel} />
      </Canvas>

      {/* Crosshair — only in the tunnel while the pointer is locked */}
      {entered && inTunnel && locked && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          pointerEvents: 'none', zIndex: 40, color: 'rgba(255,255,255,0.6)',
          fontSize: '16px', lineHeight: 1, textShadow: '0 0 6px rgba(0,0,0,0.8)', userSelect: 'none',
        }}>
          +
        </div>
      )}

      {/* "Click to look" hint when the cursor is free in the tunnel */}
      {entered && inTunnel && !locked && (
        <div style={{
          position: 'fixed', top: '22px', left: '50%', transform: 'translateX(-50%)',
          pointerEvents: 'none', zIndex: 40,
          padding: '8px 18px', borderRadius: '999px',
          background: 'rgba(15,10,30,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          fontSize: '11px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.5)',
          fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase',
        }}>
          Click to look around
        </div>
      )}

      {/* Room look hint — onboarding cues that fade out after a few seconds */}
      {scene === 'room' && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%',
          transform: `translateX(-50%) translateY(${roomHint ? '0' : '-10px'})`,
          pointerEvents: 'none', zIndex: 40,
          display: 'flex', alignItems: 'center', gap: '13px',
          padding: '10px 22px', borderRadius: '999px',
          background: 'rgba(20,14,38,0.55)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(167,139,250,0.22)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          fontSize: '10.5px', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.62)',
          fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase',
          opacity: roomHint ? 1 : 0, transition: 'opacity 1s ease, transform 1s ease',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 9l-3 3 3 3M16 9l3 3-3 3M5 12h14" />
            </svg>
            Drag to look
          </span>
          <span style={{ opacity: 0.3 }}>·</span>
          <span>Scroll the letters</span>
          <span style={{ opacity: 0.3 }}>·</span>
          <span style={{ color: 'rgba(212,175,55,0.9)' }}>Hover the gold words</span>
        </div>
      )}

      <MusicPlayer ref={musicRef} enabled={entered} />

      {activeQuote !== null && (
        <Modal quote={activeQuote} onClose={() => setActiveQuote(null)} />
      )}

      {!entered && <LoadingScreen onEnter={handleEnter} />}

      {/* Transition light-burst */}
      {flash && (
        <>
          <style>{`@keyframes fd-burst { 0% { opacity: 0 } 40% { opacity: 1 } 58% { opacity: 1 } 100% { opacity: 0 } }`}</style>
          <div style={{
            position: 'fixed', inset: 0, zIndex: 90, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 50% 50%, #fff6e6 0%, #e9ddff 35%, #b794ff 70%, rgba(124,58,237,0) 100%)',
            animation: 'fd-burst 1.15s ease-in-out forwards',
          }} />
        </>
      )}
    </div>
  )
}
