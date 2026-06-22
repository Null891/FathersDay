import { useState, useEffect, useRef, useCallback } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import { LETTER_HEADER, PANELS } from './letter'
import { roomState } from './roomState'

// ── Layout ───────────────────────────────────────────────────────────────────
const R     = 6.2
const THETA = 1.05                      // ~60°
const SIDE_X = R * Math.sin(THETA)      // ~5.38
const SIDE_Z = -R * Math.cos(THETA)     // ~-3.10
const PANEL_Y = 1.95

const LAYOUT = [
  { ...PANELS[0], position: [-SIDE_X, PANEL_Y, SIDE_Z], rotation: [0,  THETA, 0], delay: 600, panelIndex: 0 },
  { ...PANELS[1], position: [0,       PANEL_Y, -R    ], rotation: [0,  0,     0], delay: 0,   panelIndex: 1 },
  { ...PANELS[2], position: [ SIDE_X, PANEL_Y, SIDE_Z], rotation: [0, -THETA, 0], delay: 600, panelIndex: 2 },
]

const CJK  = '"Noto Serif TC", "Songti TC", "PingFang TC", Georgia, serif'

// ── Keyword highlighting ──────────────────────────────────────────────────────
// Sorted longest-first so multi-word phrases ('belt test', 'fried rice')
// match before their constituent words would.
const KEYWORD_TRIGGERS = ['belt test', 'fried rice', 'recital', 'grandma', 'games', 'desk', 'USC']
const KW_REGEX = new RegExp(
  `(${KEYWORD_TRIGGERS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
  'gi'
)

function withKeywords(text) {
  const parts = text.split(KW_REGEX)
  return parts.map((part, i) => {
    const kw = KEYWORD_TRIGGERS.find(k => k.toLowerCase() === part.toLowerCase())
    if (!kw) return part
    return (
      <span
        key={i}
        style={{
          color: '#d4af37',
          textDecoration: 'underline dotted rgba(212,175,55,0.5)',
          textUnderlineOffset: '3px',
          cursor: 'default',
          transition: 'color 0.18s, text-shadow 0.18s',
          borderRadius: '3px',
          padding: '0 1px',
        }}
        onMouseEnter={(e) => {
          roomState.activeKeyword = kw.toLowerCase()
          e.currentTarget.style.color = '#f5d060'
          e.currentTarget.style.textShadow = '0 0 10px rgba(245,208,96,0.75), 0 0 22px rgba(212,175,55,0.45)'
          e.currentTarget.style.textDecoration = 'underline solid rgba(245,208,96,0.7)'
        }}
        onMouseLeave={(e) => {
          roomState.activeKeyword = null
          e.currentTarget.style.color = '#d4af37'
          e.currentTarget.style.textShadow = ''
          e.currentTarget.style.textDecoration = 'underline dotted rgba(212,175,55,0.5)'
        }}
      >
        {part}
      </span>
    )
  })
}

// Physical size of each glass slab (world units)
const SLAB_W = 2.6
const SLAB_H = 3.6

const GOLD = {
  color: '#c9a22a',
  roughness: 0.14,
  metalness: 0.85,
  emissive: '#a07818',
  emissiveIntensity: 0.18,
}

// ── GlassPanelSlab ───────────────────────────────────────────────────────────
// Two frosted glass half-planes that unfold like a letter: left and right halves
// each start at ±90° (edge-on = invisible), GSAP rotates them to 0° (flat).
// Center panel unfolds first; side panels follow after their delay.
// A thin gold frame with corner accents rings the panel.
function GlassPanelSlab({ delay, onUnfoldComplete }) {
  const leftRef  = useRef()
  const rightRef = useRef()

  useEffect(() => {
    if (!leftRef.current || !rightRef.current) return

    leftRef.current.rotation.y  = -Math.PI / 2
    rightRef.current.rotation.y =  Math.PI / 2

    const tl = gsap.timeline({ delay: delay / 1000, onComplete: onUnfoldComplete })
    tl.to(leftRef.current.rotation,  { y: 0, duration: 1.3, ease: 'power3.out' })
      .to(rightRef.current.rotation, { y: 0, duration: 1.3, ease: 'power3.out' }, '<0.05')

    return () => tl.kill()
  }, [delay, onUnfoldComplete])

  // Shared glass props — each group gets its own material instance
  const glassMat = () => (
    <meshPhysicalMaterial
      transparent
      transmission={0.38}
      roughness={0.10}
      metalness={0}
      thickness={0.45}
      color="#c8bce0"
      ior={1.45}
      depthWrite={false}
    />
  )

  const HW = SLAB_W / 4   // half-width of each half-panel mesh (center is at origin, mesh offset by HW)

  return (
    <>
      {/* Left fold — pivots around x=0 (the center crease) */}
      <group ref={leftRef}>
        <mesh position={[-HW, 0, 0]}>
          <planeGeometry args={[SLAB_W / 2, SLAB_H]} />
          {glassMat()}
        </mesh>
      </group>

      {/* Right fold */}
      <group ref={rightRef}>
        <mesh position={[HW, 0, 0]}>
          <planeGeometry args={[SLAB_W / 2, SLAB_H]} />
          {glassMat()}
        </mesh>
      </group>

      {/* Gold frame — four thin bars */}
      <mesh position={[0,  SLAB_H / 2 + 0.025, 0.01]}>
        <boxGeometry args={[SLAB_W + 0.07, 0.046, 0.04]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <mesh position={[0, -SLAB_H / 2 - 0.025, 0.01]}>
        <boxGeometry args={[SLAB_W + 0.07, 0.046, 0.04]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <mesh position={[-SLAB_W / 2 - 0.025, 0, 0.01]}>
        <boxGeometry args={[0.046, SLAB_H + 0.07, 0.04]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <mesh position={[ SLAB_W / 2 + 0.025, 0, 0.01]}>
        <boxGeometry args={[0.046, SLAB_H + 0.07, 0.04]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>

      {/* Corner accent squares */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
        <mesh key={i} position={[sx * (SLAB_W / 2 + 0.025), sy * (SLAB_H / 2 + 0.025), 0.02]}>
          <boxGeometry args={[0.07, 0.07, 0.05]} />
          <meshStandardMaterial {...GOLD} />
        </mesh>
      ))}
    </>
  )
}

// ── Block ─────────────────────────────────────────────────────────────────────
// Each paragraph gets class "ink-para" for the CSS ink-bleed reveal animation.
// English blocks also parse keywords and wrap them in hover-able spans.
function Block({ lang, text }) {
  const base = { className: 'ink-para' }
  if (lang === 'greeting')
    return <p {...base} style={{ margin: '0 0 24px', fontSize: '20px', lineHeight: 1.6, color: '#f3ead2', fontFamily: 'Georgia, serif', letterSpacing: '0.02em' }}>{withKeywords(text)}</p>
  if (lang === 'zh')
    return <p {...base} style={{ margin: '0 0 22px', fontSize: '16px', lineHeight: 2.1, color: 'rgba(224,215,255,0.95)', fontFamily: CJK, letterSpacing: '0.03em', textAlign: 'left' }}>{text}</p>
  if (lang === 'signoff')
    return <p {...base} style={{ margin: '32px 0 4px', fontSize: '17px', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>{text}</p>
  if (lang === 'name')
    return <p {...base} style={{ margin: 0, fontSize: '26px', lineHeight: 1.3, color: '#d4af37', fontFamily: '"Snell Roundhand", "Segoe Script", Georgia, serif', fontStyle: 'italic' }}>{text}</p>
  return <p {...base} style={{ margin: '0 0 20px', fontSize: '15.5px', lineHeight: 1.9, color: 'rgba(255,255,255,0.88)', fontFamily: 'Georgia, serif', textAlign: 'left' }}>{withKeywords(text)}</p>
}

// ── Panel ─────────────────────────────────────────────────────────────────────
function Panel({ numeral, heading, blocks, position, rotation, delay, panelIndex }) {
  const [textReady, setTextReady] = useState(false)
  const scrollRef   = useRef()
  const progressRef = useRef()
  const cueRef      = useRef()

  const handleUnfoldComplete = useCallback(() => setTextReady(true), [])

  // Golden-hour scroll tracking + progress bar update (no React re-render needed)
  const onScroll = useCallback((e) => {
    const el = e.currentTarget
    const max = el.scrollHeight - el.clientHeight
    if (max > 0) {
      const frac = el.scrollTop / max
      roomState.panelScrolls[panelIndex] = frac
      roomState.scrollProgress = (
        roomState.panelScrolls[0] +
        roomState.panelScrolls[1] +
        roomState.panelScrolls[2]
      ) / 3
      if (progressRef.current) progressRef.current.style.width = `${frac * 100}%`
      if (cueRef.current) cueRef.current.style.opacity = frac > 0.015 ? '0' : '1'
    }
  }, [panelIndex])

  // Ink-bleed IntersectionObserver — set up once the HTML content is mounted
  useEffect(() => {
    if (!textReady || !scrollRef.current) return
    const root  = scrollRef.current
    const paras = root.querySelectorAll('.ink-para')
    if (!paras.length) return

    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('ink-reveal'); obs.unobserve(e.target) }
      }),
      { root, threshold: 0.05, rootMargin: '0px 0px -8px 0px' }
    )
    paras.forEach((p) => obs.observe(p))
    return () => obs.disconnect()
  }, [textReady])

  // Cursor spotlight — moves a radial gold gradient with the mouse
  const onMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--sx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`)
    e.currentTarget.style.setProperty('--sy', `${((e.clientY - r.top)  / r.height * 100).toFixed(1)}%`)
  }

  return (
    <group position={position} rotation={rotation}>
      <GlassPanelSlab delay={delay} onUnfoldComplete={handleUnfoldComplete} />

      <Html transform center distanceFactor={4.5} zIndexRange={[40, 0]}>
        <div style={{
          position: 'relative', width: '420px',
          opacity: textReady ? 1 : 0,
          transform: textReady ? 'none' : 'translateY(22px)',
          transition: 'opacity 0.9s ease, transform 0.9s ease',
          pointerEvents: textReady ? 'auto' : 'none',
        }}>
          {/* Top scroll-cue fade */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '28px', zIndex: 10, pointerEvents: 'none', background: 'linear-gradient(to bottom, rgba(10,7,18,0.8), transparent)' }} />

          <div ref={scrollRef} className="fd-scroll" onMouseMove={onMouseMove} onScroll={onScroll} style={{
            maxHeight: '580px', overflowY: 'auto', overflowX: 'hidden',
            padding: '40px 36px 44px', borderRadius: '14px',
            touchAction: 'pan-y', WebkitOverflowScrolling: 'touch', pointerEvents: 'auto',
            color: 'rgba(255,255,255,0.95)',
          }}>
            {/* Panel header */}
            <div style={{ textAlign: 'center', marginBottom: '26px' }}>
              <p style={{ margin: 0, fontSize: '11px', letterSpacing: '0.36em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.85)', fontFamily: 'system-ui, sans-serif' }}>{numeral}</p>
              <h3 style={{ margin: '10px 0 0', fontSize: '18px', fontWeight: 400, letterSpacing: '0.03em', color: 'rgba(255,255,255,0.93)', fontFamily: 'Georgia, serif' }}>{heading}</h3>
              <div style={{ height: '1px', margin: '16px auto 0', width: '48%', background: 'linear-gradient(to right, transparent, rgba(201,162,42,0.7), transparent)' }} />
            </div>
            {blocks.map((b, i) => <Block key={i} {...b} />)}
          </div>

          {/* Bottom fade */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '52px', zIndex: 10, borderRadius: '0 0 14px 14px', pointerEvents: 'none', background: 'linear-gradient(to bottom, transparent, rgba(10,7,18,0.95))' }} />

          {/* Reading progress bar — filled by onScroll via ref, no React state */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', borderRadius: '0 0 14px 14px', background: 'rgba(255,255,255,0.04)', zIndex: 11, overflow: 'hidden', pointerEvents: 'none' }}>
            <div ref={progressRef} style={{ height: '100%', width: '0%', background: 'linear-gradient(to right, rgba(201,162,42,0.5), #d4af37)', borderRadius: '0 0 0 14px', transition: 'width 0.15s ease' }} />
          </div>

          {/* Scroll cue — fades out once the reader starts scrolling */}
          <div ref={cueRef} style={{
            position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 12, pointerEvents: 'none', textAlign: 'center',
            opacity: textReady ? 1 : 0, transition: 'opacity 0.5s ease',
          }}>
            <div style={{ fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(201,162,42,0.7)', fontFamily: 'system-ui, sans-serif', marginBottom: '3px' }}>Scroll</div>
            <svg width="16" height="9" viewBox="0 0 16 9" fill="none" style={{ animation: 'fd-scrollcue 1.6s ease-in-out infinite', display: 'block', margin: '0 auto' }}>
              <path d="M1 1l7 6 7-6" stroke="rgba(201,162,42,0.8)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </Html>
    </group>
  )
}

// ── LetterPanels ──────────────────────────────────────────────────────────────
export default function LetterPanels() {
  const headerRef   = useRef()
  const [headerShown, setHeaderShown] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setHeaderShown(true), 300)
    return () => clearTimeout(t)
  }, [])

  useFrame(({ clock }) => {
    if (headerRef.current && headerShown)
      headerRef.current.position.y = 4.7 + Math.sin(clock.elapsedTime * 0.75) * 0.055
  })

  return (
    <group>
      {/* Global styles — injected once into the page head via drei Html portal */}
      <Html>
        <style>{`
          /* Custom scrollbar */
          .fd-scroll::-webkit-scrollbar { width: 6px; }
          .fd-scroll::-webkit-scrollbar-track { background: transparent; }
          .fd-scroll::-webkit-scrollbar-thumb { background: rgba(201,162,42,0.45); border-radius: 999px; }
          .fd-scroll::-webkit-scrollbar-thumb:hover { background: rgba(201,162,42,0.75); }
          .fd-scroll { scrollbar-width: thin; scrollbar-color: rgba(201,162,42,0.5) transparent; }

          /* Frosted glass panel + cursor spotlight (CSS custom props updated on mousemove) */
          .fd-scroll {
            --sx: 50%; --sy: 50%;
            background:
              radial-gradient(circle 190px at var(--sx) var(--sy),
                rgba(212,175,55,0.11) 0%, transparent 65%),
              linear-gradient(162deg,
                rgba(36,28,60,0.60),
                rgba(12,9,22,0.65));
            backdrop-filter: blur(22px);
            -webkit-backdrop-filter: blur(22px);
            border: 1px solid rgba(201,162,42,0.22);
            box-shadow:
              0 20px 56px rgba(0,0,0,0.72),
              inset 0 1px 0 rgba(255,255,255,0.08);
          }

          /* Ink-bleed reveal: blur→sharp, faint scale settle */
          @keyframes fd-ink-bleed {
            0%   { filter: blur(14px); opacity: 0.08; transform: scale(1.025); }
            45%  { filter: blur(5px);  opacity: 0.55; transform: scale(1.010); }
            100% { filter: blur(0px);  opacity: 1.00; transform: scale(1.000); }
          }

          .ink-para            { opacity: 0; filter: blur(14px); }
          .ink-para.ink-reveal { animation: fd-ink-bleed 1.15s ease-out forwards; }

          /* Stagger adjacent paragraphs so ink bleeds in sequence */
          .ink-para.ink-reveal:nth-child(2)  { animation-delay: 0.06s; }
          .ink-para.ink-reveal:nth-child(3)  { animation-delay: 0.12s; }
          .ink-para.ink-reveal:nth-child(4)  { animation-delay: 0.18s; }
          .ink-para.ink-reveal:nth-child(5)  { animation-delay: 0.24s; }
          .ink-para.ink-reveal:nth-child(6)  { animation-delay: 0.30s; }
          .ink-para.ink-reveal:nth-child(7)  { animation-delay: 0.36s; }
          .ink-para.ink-reveal:nth-child(n+8){ animation-delay: 0.42s; }

          /* Scroll-cue chevron bounce */
          @keyframes fd-scrollcue { 0%,100% { transform: translateY(0); opacity: 0.5 } 50% { transform: translateY(4px); opacity: 1 } }
        `}</style>
      </Html>

      {/* Floating celebratory header above the centre panel */}
      <group ref={headerRef} position={[0, 4.7, -6.0]}>
        <Html transform center distanceFactor={6.2} pointerEvents="none" zIndexRange={[30, 0]}>
          <div style={{
            width: '500px', textAlign: 'center', userSelect: 'none', pointerEvents: 'none',
            opacity: headerShown ? 1 : 0, transform: headerShown ? 'none' : 'translateY(-18px)',
            transition: 'opacity 1.4s ease, transform 1.4s ease',
          }}>
            {/* Wax seal */}
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 35% 32%, #c0392b 0%, #7b0000 100%)', border: '2.5px solid rgba(201,162,42,0.72)', boxShadow: '0 3px 14px rgba(0,0,0,0.55), inset 0 1px 3px rgba(255,255,255,0.12)', userSelect: 'none', pointerEvents: 'none' }}>
              <span style={{ fontFamily: '"Snell Roundhand","Segoe Script",Georgia,serif', fontStyle: 'italic', fontSize: '24px', color: 'rgba(201,162,42,0.95)', lineHeight: 1 }}>D</span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(201,162,42,0.85)', fontFamily: 'system-ui, sans-serif' }}>{LETTER_HEADER.date}</p>
            <h1 style={{ margin: '14px 0 4px', fontSize: '44px', fontWeight: 400, color: '#f3ead2', fontFamily: 'Georgia, serif', textShadow: '0 2px 40px rgba(201,162,42,0.45)' }}>{LETTER_HEADER.en}</h1>
            <h2 style={{ margin: 0, fontSize: '30px', fontWeight: 400, color: 'rgba(214,205,255,0.93)', fontFamily: CJK }}>{LETTER_HEADER.zh}</h2>
          </div>
        </Html>
      </group>

      {LAYOUT.map((p) => <Panel key={p.numeral} {...p} />)}
    </group>
  )
}
