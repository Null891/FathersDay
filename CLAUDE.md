# FathersDay — CLAUDE.md

A 3D Father's Day gift website built by Derrick for his dad. The experience has two scenes:
1. **Tunnel** — a first-person walk-through museum with exhibit quotes
2. **Grand Room** — a dark marble rotunda with three scrollable letter panels and atmosphere effects

## Environment constraints — read this first

Every `npm` or `npx` command must be prefixed with the SSL workaround or it will fail:

| Shell | Command prefix |
|-------|---------------|
| PowerShell | `$env:NODE_OPTIONS = "--use-system-ca"; npm ...` |
| Bash | `NODE_OPTIONS="--use-system-ca" npm ...` |

Dev server: `npm run dev` — Vite 8, typically http://localhost:5173  
Build: `npm run build` — target dist/  
Lint: `npx eslint src/ --max-warnings=0`

## Tech stack

- **Vite 8** + **React 19** (JSX, hooks only — no class components)
- **Tailwind v4** (utility classes in App.jsx; most UI is inline styles inside R3F Html)
- **@react-three/fiber 9.6** + **@react-three/drei 10.7** + **three 0.184**
- **@react-three/postprocessing 3.0.4** + **postprocessing 6.39.1**
  - ChromaticAberration is exported as `yt` — import by named `ChromaticAberration` from the package, Vite resolves it
- **GSAP 3** — used for origami unfold animation on letter panels
- **canvas-confetti** — one-shot burst on first room entry (already done, do not re-trigger)

## Project structure

```
src/
  App.jsx            — scene state machine (tunnel ↔ room), confetti, music, flash transition
  GrandRoom.jsx      — Phase 1-4 room: RoomLook, AnimatedLighting, GodRays3D, Dome,
                       RippleFloor, Columns, LetterPanels, Atmosphere, RoomParticles, Polaroids
  LetterPanels.jsx   — three frosted-glass panels with GSAP origami unfold, ink-bleed reveal,
                       cursor spotlight, scroll tracking → roomState, keyword hover → Polaroids
  Atmosphere.jsx     — MemoryFrames + Balloons (MeshPhysicalMaterial iridescence, 2.2-unit strings)
  RoomParticles.jsx  — DustMotes (400 instanced) + constellation LineSegments + SeasonalParticles
                       + SeasonToggle (Html card in 3D space)
  Polaroids.jsx      — Polaroid photo card on keyword hover; 41-photo pool from /photos/
  Effects.jsx        — EffectComposer: Bloom, BrightnessContrast, HueSaturation, Vignette,
                       ChromaticAberration (room only)
  roomState.js       — mutable singleton shared between DOM and useFrame; no React overhead
  letter.js          — full letter content, 3 panels, bilingual pairs kept adjacent
  MusicPlayer.jsx    — 2D music player with 25 tracks (user-owned, do not modify)
  Museum.jsx         — tunnel scene (do not modify in grand-room phases)
  Player.jsx         — FPS controller for tunnel (do not modify)
  ...                — Checkpoint, Exhibit, Pedestal, Modal, LoadingScreen, constants, photos

public/
  photos/            — 77 family photos (IMG_xxxx.jpg etc.) served at /photos/
  thumbs/            — pre-existing thumbnails (UUID names)
source-media/
  photos/            — original full-res source files (119 MB total; not served directly)
```

## roomState.js — the cross-component bus

```js
export const roomState = {
  scrollProgress: 0,       // 0–1, average of three panel scrollTops
  panelScrolls:   [0,0,0], // per-panel scroll 0–1
  goldenHourT:    0,       // 0–1, ramps when scrollProgress > 0.6
  season:         'dust',  // 'dust' | 'spring' | 'autumn' | 'winter'
  activeKeyword:  null,    // string | null — written on keyword hover, read by Polaroids
}
```

DOM event handlers write to this object. `useFrame` loops read from it. No React state involved — zero render overhead.

## Key design decisions (do not change without reason)

- **No React state for animation data.** All per-frame values (light colors, particle positions, opacity lerps) live in refs and roomState. `useState` is only for UI state that must trigger DOM re-renders (panel unfold complete, season toggle active state, Polaroid visible/caption).
- **MeshReflectorMaterial floor** — uses a `DataTexture` ripple normal map animated via UV offset. Never re-upload texture data; only drift the offset.
- **Constellation lines** — `THREE.BufferGeometry` with pre-allocated `Float32Array`, `setDrawRange`, updated every 3rd frame. O(n²) check on 400 particles, hard-capped at 80 lines.
- **Balloons use iridescence, not transmission** — `MeshPhysicalMaterial` with `iridescence={0.55}` adds no extra render pass. Transmission would.
- **ChromaticAberration** — `radialModulation={true}` + `modulationOffset={0.45}` keeps the effect peripheral only. Fringing the center kills readability.
- **GodRays3D** — 7 additive-blended `DoubleSide` planes sharing one `MeshBasicMaterial`. Pure 3D, not postprocessing GodRays (avoids cross-component mesh ref coordination).
- **Polaroid animation** — CSS `transition: opacity, transform` only. `useFrame` detects keyword change and calls React `setState` once; CSS handles the 300ms fade.
- **Keyword parsing** — `text.split(/(belt test|fried rice|...)/gi)` — multi-word phrases listed first so they match before their component words could.
- **Bilingual pairs** in letter.js must never be split across panels. ZH block + EN block always adjacent.

## Performance rules

- Do not reintroduce lag. The room was previously laggy and was fixed.
- `InstancedMesh` for any repeated geometry (dust motes 400, seasonal particles 200×3, memory frames 4).
- Dispose imperative THREE objects in `useEffect(() => () => mat.dispose(), [mat])`.
- Avoid `THREE.MathUtils.damp` in too many nested loops — profile if adding new per-frame work.
- `Html` components (panels, season toggle, Polaroids) are CSS-rendered; keep them minimal.

## Build baseline

Clean build output (no errors, only the expected chunk-size warning for the three.js bundle):
```
dist/assets/index-*.js   ~1,330 kB │ gzip: ~375 kB
```
The chunk-size warning is expected and not a concern for this personal-use site.

---

## Phase completion status

### ✅ Phase 1 — Dark marble rotunda
- `RoomLook`: full 360° drag with damped head-turn, pitch clamped −20° to +34°
- `RippleFloor`: `MeshReflectorMaterial`, resolution 512, procedural `DataTexture` ripple normal map
- `Columns`: 8 fluted columns at r=8.5, entablature torus, cornice ledge
- `Dome`: BackSide sphere + oculus emissive ring + gold inner rim + void disc
- `Effects.jsx`: Bloom (threshold 0.30 room), BrightnessContrast, HueSaturation, Vignette, ChromaticAberration (radial, room-only)

### ✅ Phase 2 — Three letter panels
- Three `MeshPhysicalMaterial` frosted glass slabs (transmission 0.38) in a 120° arc
- GSAP origami unfold: left/right halves start at ±90° Y, tween to 0° on a staggered timeline
- Gold frame: 4 `boxGeometry` bars + 4 corner accent squares, metalness 0.85
- CSS `fd-ink-bleed` keyframe: blur(14px)→0, opacity 0→1, 1.15s, nth-child stagger 0.06s
- `IntersectionObserver` rooted on scrollable div for per-paragraph reveal
- Cursor spotlight: `--sx`/`--sy` CSS vars updated on `mousemove` → radial gold gradient
- Floating header above center panel, gentle sine bob in `useFrame`

### ✅ Phase 3 — Golden hour + atmosphere
- `AnimatedLighting`: uplights and moon shift color/intensity with `goldenHourT` via `THREE.Color.lerpColors`
- `GodRays3D`: 7 additive-blended planes from oculus [0,18,0], one shared material, slow Y rotation
- `DustMotes`: 400 instanced spheres, sine-noise drift, constellation `LineSegments` every 3rd frame, capped 80 lines
- `SeasonalParticles`: spring/autumn/winter instanced meshes, opacity crossfades via `THREE.MathUtils.damp`
- `SeasonToggle`: frosted-glass Html card at [7.8, 0.95, 0.5] in 3D space
- Balloons upgraded to `MeshPhysicalMaterial` iridescence, strings 2.2 units
- `MemoryOrbs` and `<Sparkles>` removed from Atmosphere

### ✅ Phase 4 — Interactive Polaroids (current)
- 7 keywords highlighted gold in letter text: `recital`, `belt test`, `USC`, `grandma`, `fried rice`, `desk`, `games`
- `withKeywords()` splits paragraph text via case-insensitive regex, wraps matches in `<span>` with hover handlers
- Hover writes `roomState.activeKeyword`; `useFrame` in `Polaroids.jsx` detects change
- Polaroid floats at [0, 4.2, −5.0] — 41-photo pool from `/photos/`, random pick per hover
- CSS `transition: opacity 300ms, transform 360ms` — fade out → new photo → fade in on keyword change
- White Polaroid frame (13px padding, 46px bottom border), square crop with `object-fit: cover`
- Handwritten-style caption (Segoe Script / Comic Sans fallback)

---

## Remaining phases

### ✅ Phase 5 — Audio + Gramophone
- **Light breathing** — `AnimatedLighting` uplights pulse at ~1.75 Hz (±6% intensity), simulating ambient music reactivity without requiring audio API access to MusicPlayer's private audio element
- **Wind chimes** — `WindChimes` component (in `Gramophone.jsx`) reads `roomState.yawVelocity` every frame; when a camera flick exceeds threshold (0.0035 rad/frame) and 580ms have passed since the last chime, synthesizes a pentatonic tone (C5/E5/G5/C6/E6) via `AudioContext.createOscillator()` + exponential gain decay — no audio files required
- **3D Gramophone** (`Gramophone.jsx`) — built from primitives: walnut-brown cabinet (box), spinning vinyl platter (cylinder, r=0.20, 0.85 rad/s), groove rings (tori), red center label, brass horn bell (open cone + rim ring), tone arm (box geometry); a small point light illuminates the horn from below. Positioned at [6.0, 0, -2.5] in the room, rotated −0.9 rad to face the center. **Click cabinet to play/pause** via `musicRef.current.toggle()`
- `musicRef` is now passed `App → GrandRoom → Gramophone`; `roomState.yawVelocity` written by `RoomLook`, read by `WindChimes`

### ✅ Phase 6 — Camera polish
- **DepthOfField** — added to `Effects.jsx` for room mode: `focusDistance=0.12`, `focalLength=0.018`, `bokehScale=2.2`, `height=480`. Keeps letter panels (~6 world units) sharp, blurs the far dome and close columns subtly
- **Momentum drag** — `RoomLook` now tracks `velYaw`/`velPitch` per frame; on pointer release, velocity decays at 0.88× per frame while being continuously added to `tYaw`/`tPitch`. Flicking the view produces a natural coast-and-stop. `roomState.yawVelocity` is written each frame for the wind-chime trigger

---

## Critical rules inherited from prior sessions

1. **Do not proceed to the next phase without the user confirming the current one is working.**
2. **Do not reintroduce lag.** The room had performance issues that were fixed.
3. **Bilingual pairs in letter.js must never be split across panels** — ZH block + EN block always adjacent.
4. **Confetti fires once.** The `confettiFired` ref in App.jsx guards it. Do not add additional triggers.
5. **Do not modify MusicPlayer.jsx** — it is user-owned. Phase 5 should only read its `ref`-exposed audio element.
6. **Apply the NODE_OPTIONS SSL workaround to every npm/npx command** or the command will fail with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`.
