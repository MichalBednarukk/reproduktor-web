import type { AppTheme, AppThemeKey } from '../game/types'
import { THEMES } from '../theme/themes'

type Props = {
  open: boolean
  onClose: () => void
  theme: AppTheme
  selectedTheme: AppThemeKey
  onSelectTheme: (theme: AppThemeKey) => void
}

export function SettingsDialog({ open, onClose, theme, selectedTheme, onSelectTheme }: Props) {
  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ background: theme.card }}>
        <h3 style={{ color: theme.text }}>Ustawienia</h3>
        <p style={{ color: theme.textSecondary }}>Motyw kolorystyczny</p>
        <div className="theme-list">
          {(Object.keys(THEMES) as AppThemeKey[]).map((key) => {
            const item = THEMES[key]
            const active = key === selectedTheme
            return (
              <button
                key={key}
                className={`theme-item ${active ? 'active' : ''}`}
                onClick={() => onSelectTheme(key)}
                style={{ borderColor: active ? item.secondary : theme.border }}
              >
                <span>{item.name}</span>
                <span
                  className="theme-preview"
                  style={{ background: `linear-gradient(90deg, ${item.gradientFrom}, ${item.gradientTo})` }}
                />
              </button>
            )
          })}
        </div>
        <button className="btn btn-secondary" onClick={onClose} style={{ background: theme.cardLight, borderColor: theme.border, color: theme.text }}>
          Zamknij
        </button>
      </div>
    </div>
  )
}
