import { useEffect, useState, useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { LETTER_HEADER, PANELS } from './letter'

// Three floating glass panels, angled on an arc to face the reader who stands
// at the room's centre looking toward -Z. Each panel scrolls independently
// (mouse wheel / touch) — no pagination. Content is split by theme in letter.js.
//
// Arc geometry: panels sit on a circle of radius R around the camera. A panel
// at azimuth θ is rotated by +θ about Y so its face points back at the reader.
const R = 6.2
const THETA = 1.05 // ≈ 60°
const SIDE_X = R * Math.sin(THETA)   // ≈ 5.38
const SIDE_Z = -R * Math.cos(THETA)  // ≈ -3.10
const PANEL_Y = 1.95

const LAYOUT = [
  { ...PANELS[0], position: [-SIDE_X, PANEL_Y, SIDE_Z], rotation: [0,  THETA, 0], delay: 380 },
  { ...PANELS[1], position: [0,       PANEL_Y, -R],      rotation: [0,  0,     0], delay: 200 },
  { ...PANELS[2], position: [ SIDE_X, PANEL_Y, SIDE_Z], rotation: [0, -THETA, 0], delay: 380 },
]

const CJK = '"Noto Serif TC", "Songti TC", "PingFang TC", Georgia, serif'

function Block({ lang, text }) {
  if (lang === 'greeting')
    return <p style={{ margin: '0 0 24px', fontSize: '20px', lineHeight: 1.6, color: '#f3ead2', fontFamily: 'Georgia, serif', letterSpacing: '0.02em' }}>{text}</p>
  if (lang === 'zh')
    return <p style={{ margin: '0 0 22px', fontSize: '16px', lineHeight: 2.1, color: 'rgba(224,215,255,0.95)', fontFamily: CJK, letterSpacing: '0.03em', textAlign: 'left' }}>{text}</p>
  if (lang === 'signoff')
    return <p style={{ margin: '32px 0 4px', fontSize: '17px', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'left' }}>{text}</p>
  if (lang === 'name')
    return <p style={{ margin: 0, fontSize: '26px', lineHeight: 1.3, color: '#d4af37', fontFamily: '"Snell Roundhand", "Segoe Script", Georgia, serif', fontStyle: 'italic', textAlign: 'left' }}>{text}</p>
  return <p style={{ margin: '0 0 20px', fontSize: '15.5px', lineHeight: 1.9, color: 'rgba(255,255,255,0.88)', fontFamily: 'Georgia, serif', textAlign: 'left' }}>{text}</p>
}

function Panel({ numeral, heading, blocks, position, rotation, delay }) {
  const [shown, setShown] = useState(false)
  const groupRef = useRef()
  
  useEffect(() => { 
    const t = setTimeout(() => setShown(true), delay)
    return () => clearTimeout(t) 
  }, [delay])

  useFrame((state) => {
    if (groupRef.current && shown) {
      // Gentle vertical float animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.7 + position[0]) * 0.04
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <Html transform center distanceFactor={4.5} zIndexRange={[40, 0]}>
        <div style={{
          position: 'relative', width: '420px',
          opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(25px)',
          transition: 'opacity 1.2s ease, transform 1.2s ease',
        }}>
          {/* Top fade cue to show scrollability upwards if scrolled */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 0, height: '32px', zIndex: 10,
            borderRadius: '24px 24px 0 0', pointerEvents: 'none',
            background: 'linear-gradient(to bottom, rgba(18,14,32,0.9), rgba(18,14,32,0))',
          }} />

          <div className="fd-scroll" style={{
            maxHeight: '580px', overflowY: 'auto', overflowX: 'hidden',
            padding: '42px 38px 46px', borderRadius: '24px',
            background: 'linear-gradient(160deg, rgba(46,38,76,0.5), rgba(18,14,32,0.55))',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(167,139,250,0.35)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 80px rgba(124,58,237,0.18), inset 0 1px 0 rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.95)',
            touchAction: 'pan-y', WebkitOverflowScrolling: 'touch', pointerEvents: 'auto',
          }}>
            {/* Panel header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <p style={{ margin: 0, fontSize: '11px', letterSpacing: '0.36em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.9)', fontFamily: 'system-ui, sans-serif' }}>{numeral}</p>
              <h3 style={{ margin: '10px 0 0', fontSize: '18px', fontWeight: 400, letterSpacing: '0.03em', color: 'rgba(255,255,255,0.95)', fontFamily: 'Georgia, serif' }}>{heading}</h3>
              <div style={{ height: '1px', margin: '18px auto 0', width: '50%', background: 'linear-gradient(to right, transparent, rgba(167,139,250,0.6), transparent)' }} />
            </div>
            {blocks.map((b, i) => <Block key={i} {...b} />)}
          </div>
          {/* Bottom fade so it reads as scrollable */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: '56px', zIndex: 10,
            borderRadius: '0 0 24px 24px', pointerEvents: 'none',
            background: 'linear-gradient(to bottom, rgba(18,14,32,0), rgba(18,14,32,0.95))',
          }} />
        </div>
      </Html>
    </group>
  )
}

export default function LetterPanels() {
  const [shown, setShown] = useState(false)
  const headerRef = useRef()
  
  useEffect(() => { 
    const t = setTimeout(() => setShown(true), 120)
    return () => clearTimeout(t) 
  }, [])

  useFrame((state) => {
    if (headerRef.current && shown) {
      headerRef.current.position.y = 4.7 + Math.sin(state.clock.elapsedTime * 0.8) * 0.05
    }
  })

  return (
    <group>
      {/* Scoped scrollbar styling for the panels */}
      <Html><style>{`
        .fd-scroll::-webkit-scrollbar { width: 8px; }
        .fd-scroll::-webkit-scrollbar-track { background: transparent; margin: 24px 0; }
        .fd-scroll::-webkit-scrollbar-thumb { background: rgba(167,139,250,0.5); border-radius: 999px; }
        .fd-scroll::-webkit-scrollbar-thumb:hover { background: rgba(167,139,250,0.8); }
        .fd-scroll { scrollbar-width: thin; scrollbar-color: rgba(167,139,250,0.6) transparent; }
      `}</style></Html>

      {/* Floating celebratory header above the centre panel */}
      <group ref={headerRef} position={[0, 4.7, -6.0]}>
        <Html transform center distanceFactor={6.2} pointerEvents="none" zIndexRange={[30, 0]}>
          <div style={{
            width: '500px', textAlign: 'center', userSelect: 'none', pointerEvents: 'none',
            opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(-20px)',
            transition: 'opacity 1.4s ease, transform 1.4s ease',
          }}>
            <p style={{ margin: 0, fontSize: '13px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.9)', fontFamily: 'system-ui, sans-serif' }}>{LETTER_HEADER.date}</p>
            <h1 style={{ margin: '14px 0 4px', fontSize: '44px', fontWeight: 400, color: '#f3ead2', fontFamily: 'Georgia, serif', textShadow: '0 2px 36px rgba(124,58,237,0.6)' }}>{LETTER_HEADER.en}</h1>
            <h2 style={{ margin: 0, fontSize: '30px', fontWeight: 400, color: 'rgba(214,205,255,0.95)', fontFamily: CJK }}>{LETTER_HEADER.zh}</h2>
          </div>
        </Html>
      </group>

      {LAYOUT.map((p) => <Panel key={p.numeral} {...p} />)}
    </group>
  )
}
