import { Html } from '@react-three/drei'

const letter = [
  {
    label: 'I.',
    text: 'There are no words large enough for what you are to me — no sentence that fully captures the way your laughter fills a room, or how your presence alone has always been enough to make any place feel like home.',
  },
  {
    label: 'II.',
    text: 'You showed me how to be patient, how to be brave, how to find wonder in ordinary things. You stayed up late and got up early. You sacrificed in ways I am only now beginning to understand.',
  },
  {
    label: 'III.',
    text: 'I used to think strength was something loud. You showed me it is quiet — steady, reliable, always there. Thank you for every moment you gave me. Thank you for choosing, every single day, to show up.',
  },
]

export default function Pedestal({ position }) {
  return (
    <group position={position}>
      {/* Purple glow from the pedestal */}
      <pointLight position={[0, 1.2, 0]} intensity={10} distance={7} decay={2} color="#a78bfa" />

      {/* Shaft */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 1, 40]} />
        <meshStandardMaterial
          color="#0f0720"
          emissive="#7c3aed"
          emissiveIntensity={1.2}
          roughness={0.15}
          metalness={0.9}
        />
      </mesh>

      {/* Top cap */}
      <mesh position={[0, 1.04, 0]}>
        <cylinderGeometry args={[0.2, 0.12, 0.06, 40]} />
        <meshStandardMaterial
          color="#0f0720"
          emissive="#a78bfa"
          emissiveIntensity={2}
          roughness={0.05}
          metalness={1}
        />
      </mesh>

      {/* Glowing ring at base */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.32, 64]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#7c3aed"
          emissiveIntensity={2}
          transparent
          opacity={0.5}
          side={2}
        />
      </mesh>

      {/* Letter */}
      <Html
        position={[0, 2.5, 0]}
        center
        transform
        distanceFactor={4.5}
        occlude={false}
      >
        <div
          style={{
            width: '360px',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '36px 40px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
            fontFamily: "'Georgia', 'Times New Roman', serif",
            color: 'rgba(255,255,255,0.88)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {/* Header */}
          <p
            style={{
              fontSize: '10px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'rgba(167,139,250,0.8)',
              marginBottom: '24px',
              fontFamily: "'system-ui', sans-serif",
              fontWeight: 500,
            }}
          >
            Father's Day · 2026
          </p>

          {/* Sections */}
          {letter.map(({ label, text }) => (
            <div key={label} style={{ marginBottom: '20px' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '9px',
                  letterSpacing: '0.2em',
                  color: 'rgba(167,139,250,0.5)',
                  marginBottom: '6px',
                  fontFamily: "'system-ui', sans-serif",
                }}
              >
                {label}
              </span>
              <p
                style={{
                  fontSize: '13px',
                  lineHeight: '1.85',
                  color: 'rgba(255,255,255,0.75)',
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                {text}
              </p>
            </div>
          ))}

          {/* Divider */}
          <div
            style={{
              height: '1px',
              background: 'linear-gradient(to right, transparent, rgba(167,139,250,0.3), transparent)',
              margin: '24px 0 20px',
            }}
          />

          {/* Signature */}
          <p
            style={{
              textAlign: 'right',
              fontSize: '13px',
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.5)',
              margin: 0,
              letterSpacing: '0.03em',
            }}
          >
            I love you more than I know how to say.
          </p>
          <p
            style={{
              textAlign: 'right',
              fontSize: '11px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(167,139,250,0.6)',
              marginTop: '10px',
              fontFamily: "'system-ui', sans-serif",
            }}
          >
            Happy Father's Day
          </p>
        </div>
      </Html>
    </group>
  )
}
