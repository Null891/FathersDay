import { useState, useRef, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { roomState } from './roomState'

// ── Photo pool ────────────────────────────────────────────────────────────────
// All served from public/photos/ — loaded on-demand, browser caches each one.
const PHOTOS = [
  'photo1.jpg', 'photo2.jpg', 'photo3.jpg',
  'IMG_0144.jpg', 'IMG_0225.jpg', 'IMG_0339.jpg', 'IMG_0766.jpg', 'IMG_0784.jpg',
  'IMG_1080.jpg', 'IMG_1260.jpg', 'IMG_1548.jpg',
  'IMG_2203.jpg', 'IMG_2314.jpg', 'IMG_2386.jpg', 'IMG_2603.jpg', 'IMG_2794.jpg',
  'IMG_2847.jpg', 'IMG_2965.jpg',
  'IMG_3704.jpg', 'IMG_3873.jpg',
  'IMG_4076.jpg',
  'IMG_5015.jpg', 'IMG_5745.jpg',
  'IMG_6015.jpg', 'IMG_6242.jpg', 'IMG_6447.jpg', 'IMG_6880.jpg', 'IMG_6985.jpg',
  'IMG_7141.jpg', 'IMG_7394.jpg', 'IMG_7464.jpg', 'IMG_7639.jpg', 'IMG_7679.jpg',
  'IMG_7752.jpg',
  'IMG_8466.jpg', 'IMG_8616.jpg', 'IMG_8871.jpg',
  'IMG_9334.jpg', 'IMG_9660.jpg', 'IMG_9772.jpg',
  'P1030437.jpg',
].map(f => `/photos/${f}`)

const CAPTION = {
  'recital':    'First Recital',
  'belt test':  'Black Belt Test',
  'usc':        'Going to America',
  'grandma':    'Dinner with Grandma',
  'fried rice': 'Taiwanese Kitchen',
  'desk':       'Clean Desk',
  'games':      'Game Night',
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Polaroid ──────────────────────────────────────────────────────────────────
// Floats above the letter panels at [0, 4.2, -5.0].
// Keyword changes trigger a fade-out → new photo → fade-in sequence.
// All animation is CSS transitions — zero per-frame React renders.
export default function Polaroids() {
  const [pol, setPol] = useState({
    visible: false,
    photo:   PHOTOS[0],
    caption: '',
    tilt:    2,
  })

  const kwRef      = useRef(null)
  const timerRef   = useRef(null)
  const FADE_MS    = 300   // must match CSS transition duration

  // Swap photo with a brief fade-out interstitial
  const showKeyword = useCallback((kw) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    // Fade out first
    setPol(p => ({ ...p, visible: false }))
    timerRef.current = setTimeout(() => {
      setPol({
        visible: true,
        photo:   pickRandom(PHOTOS),
        caption: CAPTION[kw] ?? kw,
        tilt:    (Math.random() - 0.5) * 9,
      })
      timerRef.current = null
    }, FADE_MS)
  }, [])

  const hideAll = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    setPol(p => ({ ...p, visible: false }))
  }, [])

  // Read roomState every frame — only fires React setState when keyword changes
  useFrame(() => {
    const kw = roomState.activeKeyword
    if (kw === kwRef.current) return
    kwRef.current = kw
    if (kw) showKeyword(kw)
    else     hideAll()
  })

  // Clear pending timeout on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <group position={[0, 4.2, -5.0]}>
      <Html transform center distanceFactor={6} zIndexRange={[60, 0]}>
        <div
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            width: '210px',
            background: '#f6f1e8',
            borderRadius: '3px',
            padding: '13px 13px 46px',
            boxShadow: '0 8px 44px rgba(0,0,0,0.70), 0 2px 8px rgba(0,0,0,0.35)',
            pointerEvents: 'none',
            userSelect: 'none',
            // CSS-driven entrance: opacity + upward drift
            opacity: pol.visible ? 1 : 0,
            transform: pol.visible
              ? `rotate(${pol.tilt}deg) translateY(0px)`
              : `rotate(${pol.tilt}deg) translateY(20px)`,
            transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS + 60}ms ease`,
          }}
        >
          {/* Photo area — square crop */}
          <div style={{
            width: '100%',
            aspectRatio: '1 / 1',
            overflow: 'hidden',
            background: '#d8d0c0',
          }}>
            <img
              src={pol.photo}
              alt={pol.caption}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 20%',
                display: 'block',
              }}
            />
          </div>

          {/* Handwritten-style caption in the white Polaroid border */}
          <p style={{
            margin: '10px 0 0',
            textAlign: 'center',
            fontFamily: '"Segoe Script", "Comic Sans MS", cursive',
            fontSize: '13px',
            color: '#3a2c2c',
            letterSpacing: '0.01em',
            lineHeight: 1.4,
          }}>
            {pol.caption}
          </p>
        </div>
      </Html>
    </group>
  )
}
