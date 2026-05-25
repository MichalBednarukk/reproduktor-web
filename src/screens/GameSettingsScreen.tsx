import type { ReactNode } from 'react'
import { DarkCard } from '../components/DarkCard'
import { PrimaryButton } from '../components/PrimaryButton'
import { TopCornerActions } from '../components/TopCornerActions'
import type { SettingsScreenProps } from './types'

const ROUND_DURATIONS = [
  60, 120, 180, 300, 360, 420, 480, 540, 600, 660,
  720, 780, 840, 900, 960, 1020, 1080, 1140, 1200,
]

const formatDuration = (seconds: number) => {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return sec === 0 ? `${min}:00` : `${min}:${String(sec).padStart(2, '0')}`
}

export function GameSettingsScreen({
  theme,
  themeKey,
  onThemeChange,
  onInfo,
  state,
  onBack,
  onUpdateSettings,
  onStartRound,
}: SettingsScreenProps) {
  const maxImpostors = Math.max(1, state.players.length - 2)
  const durationIndex = Math.max(0, ROUND_DURATIONS.indexOf(state.settings.roundDurationSeconds))

  return (
    <div className="screen">
      <TopCornerActions theme={theme} selectedTheme={themeKey} onSelectTheme={onThemeChange} onInfoClick={onInfo} />

      <section className="screen-scroll with-bottom-bar">
        <div className="title-row">
          <button className="back-btn" onClick={onBack}>←</button>
          <h1 className="title">⚙️ Ustawienia gry</h1>
        </div>

        <SettingCard theme={theme} title="🥷 Reproduktorzy" description="Ilu graczy ma odgadywać hasło?">
          <Stepper
            value={String(state.settings.impostorCount)}
            minusDisabled={state.settings.impostorCount <= 1}
            plusDisabled={state.settings.impostorCount >= maxImpostors}
            onMinus={() => onUpdateSettings({ impostorCount: state.settings.impostorCount - 1 })}
            onPlus={() => onUpdateSettings({ impostorCount: state.settings.impostorCount + 1 })}
          />
        </SettingCard>

        <SettingCard theme={theme} title="⏱️ Czas rundy" description="Jak długo trwa każda runda?">
          <Stepper
            value={formatDuration(state.settings.roundDurationSeconds)}
            minusDisabled={durationIndex <= 0}
            plusDisabled={durationIndex >= ROUND_DURATIONS.length - 1}
            onMinus={() => onUpdateSettings({ roundDurationSeconds: ROUND_DURATIONS[Math.max(0, durationIndex - 1)] })}
            onPlus={() => onUpdateSettings({ roundDurationSeconds: ROUND_DURATIONS[Math.min(ROUND_DURATIONS.length - 1, durationIndex + 1)] })}
          />
        </SettingCard>

        <SettingCard theme={theme} title="🏆 Punkty do zwycięstwa" description="Ile punktów trzeba zdobyć?">
          <Stepper
            value={String(state.settings.pointsToWin)}
            minusDisabled={state.settings.pointsToWin <= 3}
            plusDisabled={state.settings.pointsToWin >= 20}
            onMinus={() => onUpdateSettings({ pointsToWin: state.settings.pointsToWin - 1 })}
            onPlus={() => onUpdateSettings({ pointsToWin: state.settings.pointsToWin + 1 })}
          />
        </SettingCard>

        <SettingCard theme={theme} title="💡 Wskazówki" description="Osoby bez hasła dostają ogólną podpowiedź?">
          <label className="switch-row">
            <span style={{ color: state.settings.hintsEnabled ? theme.secondary : theme.textMuted }}>
              {state.settings.hintsEnabled ? 'Włączone' : 'Wyłączone'}
            </span>
            <input
              type="checkbox"
              checked={state.settings.hintsEnabled}
              onChange={(e) => onUpdateSettings({ hintsEnabled: e.target.checked })}
            />
          </label>
        </SettingCard>
      </section>

      <footer className="bottom-bar" style={{ background: theme.gradientFrom, borderColor: theme.border }}>
        <PrimaryButton theme={theme} onClick={onStartRound}>🎲 Losuj role</PrimaryButton>
      </footer>
    </div>
  )
}

function SettingCard({
  theme,
  title,
  description,
  children,
}: {
  theme: SettingsScreenProps['theme']
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <DarkCard theme={theme} className="setting-card">
      <h3>{title}</h3>
      <p className="setting-description">{description}</p>
      {children}
    </DarkCard>
  )
}

function Stepper({
  value,
  minusDisabled,
  plusDisabled,
  onMinus,
  onPlus,
}: {
  value: string
  minusDisabled: boolean
  plusDisabled: boolean
  onMinus: () => void
  onPlus: () => void
}) {
  return (
    <div className="stepper">
      <button disabled={minusDisabled} onClick={onMinus}>−</button>
      <strong>{value}</strong>
      <button disabled={plusDisabled} onClick={onPlus}>+</button>
    </div>
  )
}
