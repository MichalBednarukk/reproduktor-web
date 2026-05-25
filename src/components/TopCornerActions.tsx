import { useState } from 'react'
import type { AppTheme, AppThemeKey } from '../game/types'
import { HelpButton } from './HelpButton'
import { SettingsDialog } from './SettingsDialog'

type Props = {
  theme: AppTheme
  selectedTheme: AppThemeKey
  onSelectTheme: (theme: AppThemeKey) => void
  onInfoClick: () => void
  side?: 'start' | 'end'
}

export function TopCornerActions({ theme, selectedTheme, onSelectTheme, onInfoClick, side = 'end' }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <div className={`corner-actions ${side}`}>
        <HelpButton theme={theme} onClick={onInfoClick} />
        <button className="corner-btn" style={{ background: theme.cardLight, color: theme.text }} onClick={() => setSettingsOpen(true)}>
          ⚙️
        </button>
      </div>
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        selectedTheme={selectedTheme}
        onSelectTheme={(key) => {
          onSelectTheme(key)
          setSettingsOpen(false)
        }}
      />
    </>
  )
}
