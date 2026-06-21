import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Museum from './Museum'
import Player from './Player'
import MusicPlayer from './MusicPlayer'
import Modal from './Modal'
import LoadingScreen from './LoadingScreen'
import Effects from './Effects'

export default function App() {
  const [activeQuote, setActiveQuote] = useState(null)
  const [locked, setLocked]   = useState(false)
  const [entered, setEntered] = useState(false)
  const musicRef = useRef(null)

  useEffect(() => {
    const onChange = () => setLocked(!!document.pointerLockElement)
    document.addEventListener('pointerlockchange', onChange)
    return () => document.removeEventListener('pointerlockchange', onChange)
  }, [])

  const handleEnter = () => {
    setEntered(true)
    musicRef.current?.play() // start the soundtrack on the entry gesture
  }

  return (
    <div className="w-screen h-screen block">
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 1.6, 1], fov: 70 }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#0a0a10']} />
        <fog attach="fog" args={['#0a0a10', 8, 60]} />
        <Suspense fallback={null}>
          <Player enabled={entered} />
          <Museum onExhibitClick={setActiveQuote} />
        </Suspense>
        <Effects />
      </Canvas>

      {/* Crosshair — only while the pointer is locked */}
      {entered && locked && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          pointerEvents: 'none', zIndex: 40, color: 'rgba(255,255,255,0.6)',
          fontSize: '16px', lineHeight: 1, textShadow: '0 0 6px rgba(0,0,0,0.8)', userSelect: 'none',
        }}>
          +
        </div>
      )}

      {/* "Click to look" hint when the cursor is free post-entry */}
      {entered && !locked && (
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

      <MusicPlayer ref={musicRef} enabled={entered} />

      {activeQuote !== null && (
        <Modal quote={activeQuote} onClose={() => setActiveQuote(null)} />
      )}

      {!entered && <LoadingScreen onEnter={handleEnter} />}
    </div>
  )
}
