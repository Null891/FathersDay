import { useEffect, useState } from 'react'

export default function Modal({ quote, onClose }) {
  const [visible, setVisible] = useState(false)

  // Micro-delay so the CSS transition has a frame to start from
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 220)
  }

  const backdrop = {
    position: 'fixed', inset: 0, zIndex: 60,
    background: 'rgba(0,0,0,0.55)',
    transition: 'opacity 0.22s ease',
    opacity: visible ? 1 : 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  const card = {
    position: 'relative',
    width: '480px',
    maxWidth: 'calc(100vw - 48px)',
    background: 'rgba(13, 8, 28, 0.78)',
    backdropFilter: 'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '22px',
    padding: '40px 44px 36px',
    boxShadow: '0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)',
    transition: 'opacity 0.22s ease, transform 0.22s ease',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.96)',
    fontFamily: 'system-ui, sans-serif',
    color: 'rgba(255,255,255,0.85)',
  }

  return (
    <div style={backdrop} onClick={handleClose}>
      {/* Stop click-through on the card itself */}
      <div style={card} onClick={(e) => e.stopPropagation()}>

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <span style={{
            fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'rgba(167,139,250,0.75)', fontWeight: 500,
          }}>
            A Memory
          </span>
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '50%', width: '30px', height: '30px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
              fontSize: '14px', lineHeight: 1,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(to right, rgba(167,139,250,0.4), transparent)',
          marginBottom: '28px',
        }} />

        {/* Quote mark */}
        <div style={{ fontSize: '48px', lineHeight: 1, color: 'rgba(167,139,250,0.25)', marginBottom: '8px', fontFamily: 'Georgia, serif' }}>
          ❝
        </div>

        {/* Caption */}
        <p style={{
          margin: 0,
          fontSize: '16px',
          lineHeight: '1.75',
          color: quote ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.25)',
          fontFamily: 'Georgia, Times New Roman, serif',
          fontStyle: quote ? 'normal' : 'italic',
          letterSpacing: '0.01em',
          minHeight: '60px',
        }}>
          {quote || 'No caption yet — add one in src/photos.js'}
        </p>

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          paddingTop: '18px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'rgba(167,139,250,0.5)', textTransform: 'uppercase' }}>
            Father's Day · 2026
          </span>
        </div>
      </div>
    </div>
  )
}
