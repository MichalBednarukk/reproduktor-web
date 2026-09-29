// Konfetti nad całym ekranem (odpowiednik ui/components/Confetti.kt). Samo znika po ~4 s.

import { useState, type CSSProperties } from 'react'

const COLORS = ['#FFB547', '#FF5C8A', '#7C5CFF', '#35D0BA', '#FFE066', '#5AA9FF']

type Piece = { left: number; delay: number; duration: number; drift: number; spin: number; color: string; w: number; h: number }

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 700,
    duration: 2400 + Math.random() * 1600,
    drift: (Math.random() - 0.5) * 160,
    spin: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 720),
    color: COLORS[i % COLORS.length],
    w: 7 + Math.random() * 6,
    h: 10 + Math.random() * 8,
  }))
}

export function Confetti({ count = 70 }: { count?: number }) {
  const [pieces] = useState(() => makePieces(count))
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              width: p.w,
              height: p.h,
              background: p.color,
              animationDelay: `${p.delay}ms`,
              animationDuration: `${p.duration}ms`,
              '--drift': `${p.drift}px`,
              '--spin': `${p.spin}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
