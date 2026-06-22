import { useEffect, useState } from 'react'
import { Html } from '@react-three/drei'
import { LETTER_HEADER, PANELS } from './letter'

// Three floating glass panels, angled on an arc to face the reader who stands
// at the room's centre looking toward -Z. Each panel scrolls independently
// (mouse wheel / touch) — no pagination. Content is split by theme in letter.js.
//
// Arc geometry: panels sit on a circle of radius R around the camera. A panel
// at azimuth θ is rotated by +θ about Y so its face points back at the reader.
const R = 5.2
const THETA = 0.908 // ≈ 52° — within the ±112° look range, easy to face head-on
const SIDE_X = R * Math.sin(THETA)   // ≈ 4.10
const SIDE_Z = -R * Math.cos(THETA)  // ≈ -3.20
const PANEL_Y = 1.75

const LAYOUT = [
  { ...PANELS[0], position: [-SIDE_X, PANEL_Y, SIDE_Z], rotation: [0,  THETA, 0], delay: 380 },
  { ...PANELS[1], position: [0,       PANEL_Y, -R],      rotation: [0,  0,     0], delay: 200 },
  { ...PANELS[2], position: [ SIDE_X, PANEL_Y, SIDE_Z], rotation: [0, -THETA, 0], delay: 380 },
]

const CJK = '"Noto Serif TC", "Songti TC", "PingFang TC", Georgia, serif'

function Block({ lang, text }) {
  if (lang === 'greeting')
    return <p style={{ margin: '0 0 22px', fontSize: '19px', lineHeight: 1.6, color: '#f1e7d0', fontFamily: 'Georgia, serif', letterSpacing: '0.02em' }}>{text}</p>
  if (lang === 'zh')
    return <p style={{ margin: '0 0 20px', fontSize: '15.5px', lineHeight: 2.0, color: 'rgba(214,205,255,0.92)', fontFamily: CJK, letterSpacing: '0.03em', textAlign: 'left' }}>{text}</p>
  if (lang === 'signoff')
    return <p style={{ margin: '28px 0 2px', fontSize: '16px', lineHeight: 1.6, color: 'rgba(255,255,255,0.82)', fontFamily: 'Georgia, serif', fontStyle: 'italic', textAlign: 'left' }}>{text}</p>
  if (lang === 'name')
    return <p style={{ margin: 0, fontSize: '24px', lineHeight: 1.3, color: '#d4af37', fontFamily: '"Snell Roundhand", "Segoe Script", Georgia, serif', fontStyle: 'italic', textAlign: 'left' }}>{text}</p>
  return <p style={{ margin: '0 0 18px', fontSize: '15px', lineHeight: 1.85, color: 'rgba(255,255,255,0.82)', fontFamily: 'Georgia, serif', textAlign: 'left' }}>{text}</p>
}

function Panel({ numeral, heading, blocks, position, rotation, delay }) {
  const [shown, setShown] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShown(true), delay); return () => clearTimeout(t) }, [delay])

  return (
    <Html transform position={position} rotation={rotation} center distanceFactor={5.5} zIndexRange={[40, 0]}>
      <div style={{
        position: 'relative', width: '380px',
        opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(20px)',
        transition: 'opacity 1.1s ease, transform 1.1s ease',
      }}>
        <div className="fd-scroll" style={{
          maxHeight: '540px', overflowY: 'auto', overflowX: 'hidden',
          padding: '34px 34px 40px', borderRadius: '22px',
          background: 'linear-gradient(160deg, rgba(46,38,76,0.62), rgba(18,14,32,0.66))',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(167,139,250,0.30)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 70px rgba(124,58,237,0.16), inset 0 1px 0 rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.92)',
          touchAction: 'pan-y', WebkitOverflowScrolling: 'touch',
        }}>
          {/* Panel header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <p style={{ margin: 0, fontSize: '11px', letterSpacing: '0.34em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.85)', fontFamily: 'system-ui, sans-serif' }}>{numeral}</p>
            <h3 style={{ margin: '8px 0 0', fontSize: '17px', fontWeight: 400, letterSpacing: '0.02em', color: 'rgba(255,255,255,0.9)', fontFamily: 'Georgia, serif' }}>{heading}</h3>
            <div style={{ height: '1px', margin: '16px auto 0', width: '55%', background: 'linear-gradient(to right, transparent, rgba(167,139,250,0.5), transparent)' }} />
          </div>
          {blocks.map((b, i) => <Block key={i} {...b} />)}
        </div>
        {/* "more below" fade so it reads as scrollable */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: '46px',
          borderRadius: '0 0 22px 22px', pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(18,14,32,0), rgba(18,14,32,0.66))',
        }} />
      </div>
    </Html>
  )
}

export default function LetterPanels() {
  const [shown, setShown] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShown(true), 120); return () => clearTimeout(t) }, [])

  return (
    <group>
      {/* Scoped scrollbar styling for the panels */}
      <Html><style>{`
        .fd-scroll::-webkit-scrollbar { width: 7px; }
        .fd-scroll::-webkit-scrollbar-track { background: transparent; }
        .fd-scroll::-webkit-scrollbar-thumb { background: rgba(167,139,250,0.35); border-radius: 999px; }
        .fd-scroll::-webkit-scrollbar-thumb:hover { background: rgba(167,139,250,0.6); }
        .fd-scroll { scrollbar-width: thin; scrollbar-color: rgba(167,139,250,0.4) transparent; }
      `}</style></Html>

      {/* Floating celebratory header above the centre panel */}
      <Html transform position={[0, 3.95, -5.4]} center distanceFactor={7} pointerEvents="none" zIndexRange={[30, 0]}>
        <div style={{
          width: '440px', textAlign: 'center', userSelect: 'none', pointerEvents: 'none',
          opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(-14px)',
          transition: 'opacity 1.4s ease, transform 1.4s ease',
        }}>
          <p style={{ margin: 0, fontSize: '12px', letterSpacing: '0.34em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.85)', fontFamily: 'system-ui, sans-serif' }}>{LETTER_HEADER.date}</p>
          <h1 style={{ margin: '12px 0 2px', fontSize: '40px', fontWeight: 400, color: '#f3ead2', fontFamily: 'Georgia, serif', textShadow: '0 2px 30px rgba(124,58,237,0.5)' }}>{LETTER_HEADER.en}</h1>
          <h2 style={{ margin: 0, fontSize: '27px', fontWeight: 400, color: 'rgba(214,205,255,0.92)', fontFamily: CJK }}>{LETTER_HEADER.zh}</h2>
        </div>
      </Html>

      {LAYOUT.map((p) => <Panel key={p.numeral} {...p} />)}
    </group>
  )
}
