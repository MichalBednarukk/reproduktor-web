import type { ReactNode } from 'react'
import type { AppTheme } from '../game/types'

type Props = {
  theme: AppTheme
  children: ReactNode
}

export function AppBackground({ theme, children }: Props) {
  return (
    <main
      className="app-shell"
      style={{
        background: `linear-gradient(180deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
      }}
    >
      {children}
    </main>
  )
}
