// Mutable singleton shared across all room components.
// Written by DOM scroll/click handlers, read each frame in useFrame loops.
// Avoids React state so animation stays off the render cycle.
export const roomState = {
  scrollProgress: 0,        // 0–1 average across all three panels
  panelScrolls:   [0, 0, 0],
  goldenHourT:    0,        // 0–1, ramps from 0.6 scroll onward
  season:         'dust',   // 'dust' | 'spring' | 'autumn' | 'winter'
  activeKeyword:  null,     // string | null — hovered keyword in letter text
  yawVelocity:    0,        // |rad/frame| written by RoomLook, read by WindChimes
}
