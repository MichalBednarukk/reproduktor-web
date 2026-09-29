// Odpowiedniki: AppBackground.kt, DarkCard.kt, PrimaryButton.kt (Primary/Secondary/Danger),
// StepperControl.kt oraz powtarzające się elementy ekranów (✕, ←, dolny pasek).

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

export function AppBackground({ children }: { children: ReactNode }) {
  return <div className="app-bg">{children}</div>
}

type DarkCardProps = {
  children: ReactNode
  padding?: number
  radius?: number
  className?: string
  style?: CSSProperties
}

export function DarkCard({ children, padding = 20, radius = 24, className, style }: DarkCardProps) {
  return (
    <div className={`dark-card ${className ?? ''}`} style={{ padding, borderRadius: radius, ...style }}>
      {children}
    </div>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }

export const PrimaryButton = ({ children, ...props }: ButtonProps) => (
  <button type="button" {...props} className="btn btn-primary">
    {children}
  </button>
)

export const SecondaryButton = ({ children, ...props }: ButtonProps) => (
  <button type="button" {...props} className="btn btn-secondary">
    {children}
  </button>
)

export const DangerButton = ({ children, ...props }: ButtonProps) => (
  <button type="button" {...props} className="btn btn-danger">
    {children}
  </button>
)

type StepperProps = {
  value: string
  onDecrement: () => void
  onIncrement: () => void
  canDecrement: boolean
  canIncrement: boolean
}

export function StepperControl({ value, onDecrement, onIncrement, canDecrement, canIncrement }: StepperProps) {
  return (
    <div className="stepper">
      <button type="button" className="step-btn" disabled={!canDecrement} onClick={onDecrement} aria-label="Mniej">
        −
      </button>
      <span className="stepper-value">{value}</span>
      <button type="button" className="step-btn" disabled={!canIncrement} onClick={onIncrement} aria-label="Więcej">
        +
      </button>
    </div>
  )
}

export const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button type="button" className="icon-btn close-btn" onClick={onClick} aria-label="Wyjdź z gry">
    ✕
  </button>
)

export const BackArrow = ({ onClick }: { onClick: () => void }) => (
  <button type="button" className="icon-btn back-arrow" onClick={onClick} aria-label="Wstecz">
    ←
  </button>
)

/** Dolny pasek z przyciskami (Scaffold.bottomBar na Androidzie). */
export function BottomBar({ children, variant = 'divider' }: { children: ReactNode; variant?: 'divider' | 'translucent' }) {
  return (
    <div className={`bottom-bar ${variant}`}>
      <div className="bottom-bar-inner">{children}</div>
    </div>
  )
}

export const Spacer = ({ h }: { h: number }) => <div style={{ height: h, flexShrink: 0 }} />
