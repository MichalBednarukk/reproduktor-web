// Odpowiednik TopCornerActions.kt + InfoButton.kt + SettingsButton.kt:
// ⓘ otwiera zasady gry, ⚙️ otwiera wybór kolorystyki.

import { useEffect, useRef, useState } from 'react'
import { THEMES, type AppColorTheme } from '../theme/themes'
import { AlertDialog } from './Dialogs'

type Props = {
  side: 'start' | 'end'
  theme: AppColorTheme
  onSelectTheme: (theme: AppColorTheme) => void
  onInfoClick: () => void
  onSettingsDialogVisibilityChanged?: (visible: boolean) => void
}

export function TopCornerActions({ side, theme, onSelectTheme, onInfoClick, onSettingsDialogVisibilityChanged }: Props) {
  const [showSettings, setShowSettings] = useState(false)
  // Motyw z chwili otwarcia — „Anuluj” przywraca go (wybór w dialogu działa od razu jako podgląd).
  const [themeAtOpen, setThemeAtOpen] = useState(theme)
  const visibilityCallback = useRef(onSettingsDialogVisibilityChanged)
  useEffect(() => {
    visibilityCallback.current = onSettingsDialogVisibilityChanged
  })
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    visibilityCallback.current?.(showSettings)
  }, [showSettings])

  const close = () => setShowSettings(false)
  const cancel = () => {
    onSelectTheme(themeAtOpen)
    setShowSettings(false)
  }

  return (
    <>
      <div className={`corner-actions ${side}`}>
        <button type="button" className="corner-btn" onClick={onInfoClick} aria-label="Zasady gry">
          ⓘ
        </button>
        <button type="button" className="corner-btn settings" onClick={() => {
            setThemeAtOpen(theme)
            setShowSettings(true)
          }}
          aria-label="Ustawienia"
        >
          ⚙️
        </button>
      </div>
      {showSettings && (
        <AlertDialog
          title="Ustawienia"
          text={
            <>
              <p className="settings-subtitle">Kolorystyka aplikacji</p>
              {THEMES.map((palette) => {
                const selected = palette.key === theme.key
                return (
                  <button
                    type="button"
                    key={palette.key}
                    className={`theme-option ${selected ? 'selected' : ''}`}
                    onClick={() => onSelectTheme(palette)}
                  >
                    <span className="theme-title">{palette.title}</span>
                    <span className="theme-description">{palette.description}</span>
                    <span className="theme-preview">
                      {palette.previewColors.map((color, i) => (
                        <span key={i} className="theme-dot" style={{ background: color }} />
                      ))}
                      {selected && <span className="theme-selected">Wybrano</span>}
                    </span>
                  </button>
                )
              })}
            </>
          }
          confirm={{ text: 'Zamknij', onClick: close, color: 'var(--text)' }}
          dismiss={{ text: 'Anuluj', onClick: cancel, color: 'var(--muted)' }}
          onDismissRequest={close}
        />
      )}
    </>
  )
}
