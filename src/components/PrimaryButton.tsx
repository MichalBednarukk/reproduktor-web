import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { AppTheme } from '../game/types'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  theme: AppTheme
  children: ReactNode
}

export function PrimaryButton({ theme, children, ...props }: Props) {
  return (
    <button
      {...props}
      className="btn btn-primary"
      style={{
        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
        color: '#fff',
      }}
    >
      {children}
    </button>
  )
}
