import type { ReactNode } from 'react'
import type { AppTheme } from '../game/types'

type Props = {
  theme: AppTheme
  children: ReactNode
  className?: string
}

export function DarkCard({ theme, children, className }: Props) {
  return (
    <section
      className={`dark-card ${className ?? ''}`.trim()}
      style={{
        background: theme.card,
        borderColor: theme.border,
      }}
    >
      {children}
    </section>
  )
}
