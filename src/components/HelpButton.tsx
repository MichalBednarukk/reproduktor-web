import type { AppTheme } from '../game/types'

type Props = {
  theme: AppTheme
  onClick: () => void
}

export function HelpButton({ theme, onClick }: Props) {
  return (
    <button className="corner-btn" onClick={onClick} style={{ background: theme.cardLight, color: theme.text }}>
      i
    </button>
  )
}
