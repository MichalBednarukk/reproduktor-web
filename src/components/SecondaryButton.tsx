import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { AppTheme } from '../game/types'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  theme: AppTheme
  children: ReactNode
}

export function SecondaryButton({ theme, children, ...props }: Props) {
  return (
    <button
      {...props}
      className="btn btn-secondary"
      style={{
        background: theme.cardLight,
        borderColor: theme.border,
        color: theme.text,
      }}
    >
      {children}
    </button>
  )
}
