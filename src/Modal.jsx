import { useEffect, useState, useCallback, useRef } from 'react'

export default function Modal({ quote, onClose }) {
  const [visible, setVisible] = useState(false)
  const containerRef = useRef(null)

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 300) // Slightly longer for smoother exit
  }, [onClose])

  // Micro-delay so the CSS transition has a frame to start from
  // Also bind keyboard events for fast closing
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    
    // Force focus onto our modal container so the browser doesn't lose keyboard 
    // focus when exiting pointer lock.
    if (containerRef.current) {
      containerRef.current.focus()
    }
    
    const handleKeyDown = (e) => {
      if (['Escape', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault()
        e.stopPropagation()
        handleClose()
      }
    }
    
    // Listening on window is fine, but focus is required to receive keys at all.
    window.addEventListener('keydown', handleKeyDown, true) // use capture phase to guarantee interception
    
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [handleClose])

  const { text, date } = quote || { text: 'No caption yet — add one in src/photos.js', date: "Father's Day · 2026" }

  const backdrop = {
    position: 'fixed', inset: 0, zIndex: 60,
    background: 'rgba(10, 10, 15, 0.75)', // Darker, richer backdrop
    backdropFilter: 'blur(12px)', // Increased blur for better aesthetics
    WebkitBackdropFilter: 'blur(12px)',
    transition: 'opacity 0.3s ease-in-out',
    opacity: visible ? 1 : 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    outline: 'none', // hide focus ring
  }

  const card = {
    position: 'relative',
    width: '520px',
    maxWidth: 'calc(100vw - 48px)',
    background: 'linear-gradient(145deg, rgba(30, 25, 20, 0.9), rgba(15, 12, 10, 0.95))', // Warm dark gradient
    border: '1px solid rgba(212, 175, 55, 0.3)', // Gold tint border
    borderRadius: '16px', // Slightly sharper corners for a framed look
    padding: '48px 56px 40px',
    boxShadow: '0 30px 60px -12px rgba(0,0,0,0.85), 0 0 70px rgba(212,175,55,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
    transition: 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
    fontFamily: 'system-ui, sans-serif',
    color: 'rgba(255, 255, 255, 0.9)',
  }

  return (
    <div 
      ref={containerRef} 
      tabIndex={-1} 
      style={backdrop} 
      onClick={handleClose}
    >
      <div style={card} onClick={(e) => e.stopPropagation()}>
        
        {/* Top Gold Bar */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '40%', height: '3px', background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.8), transparent)',
          borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px'
        }} />

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D4AF37', boxShadow: '0 0 10px rgba(212, 175, 55, 0.6)' }} />
             <span style={{
               fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase',
               color: 'rgba(212, 175, 55, 0.9)', fontWeight: 600,
             }}>
               Cherished Memory
             </span>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
              fontSize: '16px', lineHeight: 1,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)'; e.currentTarget.style.color = '#D4AF37'; e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          >
            ✕
          </button>
        </div>

        {/* Quote mark */}
        <div style={{ 
          fontSize: '64px', lineHeight: 0.8, color: 'rgba(212, 175, 55, 0.3)', 
          fontFamily: 'Georgia, serif', marginBottom: '16px' 
        }}>
          ❝
        </div>

        {/* Caption */}
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '18px',
          lineHeight: '1.8',
          color: text ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)',
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontStyle: text ? 'normal' : 'italic',
          letterSpacing: '0.02em',
          minHeight: '80px',
          fontWeight: 300,
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          {text || 'A beautiful moment captured in time.'}
        </p>

        {/* Footer */}
        <div style={{
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{
            height: '1px', flex: 1, marginRight: '24px',
            background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3))'
          }} />
          <span style={{ 
            fontSize: '12px', letterSpacing: '0.15em', 
            color: 'rgba(212, 175, 55, 0.8)', textTransform: 'uppercase',
            fontWeight: 500, fontFamily: 'system-ui, sans-serif'
          }}>
            {date || "Happy Father's Day"}
          </span>
        </div>
      </div>
    </div>
  )
}
