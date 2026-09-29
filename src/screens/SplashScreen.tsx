// Odpowiednik SplashScreen.kt: animowane logo przez ~1,9 s, potem onboarding (pierwsze uruchomienie) albo Gracze.

import { useEffect } from 'react'

const SPLASH_DURATION_MS = 1900

export function SplashScreen({ onFinished }: { onFinished: () => void }) {
  useEffect(() => {
    const handle = window.setTimeout(onFinished, SPLASH_DURATION_MS)
    return () => window.clearTimeout(handle)
  }, [onFinished])

  return (
    <div className="screen splash">
      <div className="splash-logo">
        <ReproduktorLogo animated />
      </div>
      <h1 className="splash-title">REPRODUKTOR</h1>
    </div>
  )
}

// Punkt na łuku w układzie Compose drawArc: 0° = godzina 3, kąty zgodnie z ruchem wskazówek.
function arcPoint(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return `${(cx + r * Math.cos(rad)).toFixed(3)},${(cy + r * Math.sin(rad)).toFixed(3)}`
}

const WAVES = [
  { r: 13, color: '#29D3C2', alpha: 0.85, width: 3.5 },
  { r: 22, color: '#6C63FF', alpha: 0.62, width: 3.0 },
  { r: 31, color: '#29D3C2', alpha: 0.42, width: 2.5 },
]

/** Znak aplikacji (ReproduktorLogo z SplashScreen.kt) w układzie 100×100. */
export function ReproduktorLogo({ animated = false }: { animated?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <defs>
        <radialGradient id="logo-glow" cx="43" cy="50" r="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6C63FF" stopOpacity="0.33" />
          <stop offset="0.5" stopColor="#6C63FF" stopOpacity="0.10" />
          <stop offset="1" stopColor="#6C63FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="43" cy="50" r="48" fill="url(#logo-glow)" />
      <g className={animated ? 'logo-waves' : undefined}>
        {WAVES.map((w) => (
          <path
            key={w.r}
            d={`M ${arcPoint(74, 48, w.r, -54)} A ${w.r} ${w.r} 0 0 1 ${arcPoint(74, 48, w.r, 54)}`}
            fill="none"
            stroke={w.color}
            strokeOpacity={w.alpha}
            strokeWidth={w.width}
            strokeLinecap="round"
          />
        ))}
      </g>
      <path
        fillRule="evenodd"
        fill="#F5F7FF"
        d="M12,4 L12,96 L26,96 L26,55 L40,55 L60,96 L74,96 L54,53 Q70,49 70,32 Q70,4 46,4 Z
           M26,14 L44,14 Q60,14 60,32 Q60,50 44,50 L26,50 Z"
      />
    </svg>
  )
}
