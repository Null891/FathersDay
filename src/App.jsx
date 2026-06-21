import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Museum from './Museum'
import Player from './Player'
import MusicPlayer from './MusicPlayer'
import Modal from './Modal'

export default function App() {
  const [activeQuote, setActiveQuote] = useState(null)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    const onChange = () => setLocked(!!document.pointerLockElement)
    document.addEventListener('pointerlockchange', onChange)
    return () => document.removeEventListener('pointerlockchange', onChange)
  }, [])

  return (
    <div className="w-screen h-screen block">
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 1.7, 6], fov: 75 }}
      >
        <color attach="background" args={['#0f172a']} />
        <Player />
        <Museum onExhibitClick={setActiveQuote} />
      </Canvas>

      {/* Crosshair — only visible while pointer is locked */}
      {locked && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none', zIndex: 40,
          color: 'rgba(255,255,255,0.65)',
          fontSize: '18px', lineHeight: 1,
          textShadow: '0 0 6px rgba(0,0,0,0.8)',
          userSelect: 'none',
        }}>
          +
        </div>
      )}

      <MusicPlayer />

      {activeQuote !== null && (
        <Modal quote={activeQuote} onClose={() => setActiveQuote(null)} />
      )}
    </div>
  )
}
