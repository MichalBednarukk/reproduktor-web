// Odpowiednik GameSettingsScreen.kt.

import type { ReactNode } from 'react'
import { AppBackground, BackArrow, BottomBar, DarkCard, PrimaryButton, Spacer, StepperControl } from '../components/Basics'
import { TopCornerActions } from '../components/TopCornerActions'
import { ROUND_DURATIONS } from '../game/gameEngine'
import { useBackHandler } from '../navigation/backHandler'
import type { ScreenProps } from './types'

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s === 0 ? `${m}:00` : `${m}:${String(s).padStart(2, '0')}`
}

export function GameSettingsScreen({ game, theme, onSelectTheme, openRules }: ScreenProps) {
  const { settings, players } = game.state
  const maxImpostors = Math.max(1, players.length - 2)
  const foundIdx = ROUND_DURATIONS.indexOf(settings.roundDurationSeconds)
  const durationIdx = foundIdx >= 0 ? foundIdx : 1

  useBackHandler(game.goToCategories)

  return (
    <AppBackground>
      <div className="screen with-bottom-bar">
        <div className="scroll-area pad-24">
          <Spacer h={16} />
          <div className="title-row">
            <BackArrow onClick={game.goToCategories} />
            <h1 className="title-30">⚙️ Ustawienia gry</h1>
          </div>
          <Spacer h={24} />

          <SettingCard title="🥷 Reproduktorzy" description="Ilu graczy ma odgadywać hasło?">
            <StepperControl
              value={String(settings.impostorCount)}
              onDecrement={() => game.updateSettings({ impostorCount: settings.impostorCount - 1 })}
              onIncrement={() => game.updateSettings({ impostorCount: settings.impostorCount + 1 })}
              canDecrement={settings.impostorCount > 1}
              canIncrement={settings.impostorCount < maxImpostors}
            />
          </SettingCard>
          <Spacer h={12} />

          <SettingCard title="⏱️ Czas rundy" description="Jak długo trwa każda runda?">
            <StepperControl
              value={formatDuration(settings.roundDurationSeconds)}
              onDecrement={() => game.updateSettings({ roundDurationSeconds: ROUND_DURATIONS[Math.max(0, durationIdx - 1)] })}
              onIncrement={() =>
                game.updateSettings({
                  roundDurationSeconds: ROUND_DURATIONS[Math.min(ROUND_DURATIONS.length - 1, durationIdx + 1)],
                })
              }
              canDecrement={durationIdx > 0}
              canIncrement={durationIdx < ROUND_DURATIONS.length - 1}
            />
          </SettingCard>
          <Spacer h={12} />

          <SettingCard title="🏆 Punkty do zwycięstwa" description="Ile punktów trzeba zdobyć?">
            <StepperControl
              value={String(settings.pointsToWin)}
              onDecrement={() => game.updateSettings({ pointsToWin: settings.pointsToWin - 1 })}
              onIncrement={() => game.updateSettings({ pointsToWin: settings.pointsToWin + 1 })}
              canDecrement={settings.pointsToWin > 3}
              canIncrement={settings.pointsToWin < 20}
            />
          </SettingCard>
          <Spacer h={12} />

          <SettingCard title="💡 Wskazówki" description="Osoby bez hasła dostają ogólną podpowiedź?">
            <label className="switch-row">
              <span className={settings.hintsEnabled ? 'switch-label on' : 'switch-label'}>
                {settings.hintsEnabled ? 'Włączone' : 'Wyłączone'}
              </span>
              <input
                type="checkbox"
                className="switch"
                role="switch"
                checked={settings.hintsEnabled}
                onChange={(e) => game.updateSettings({ hintsEnabled: e.target.checked })}
              />
            </label>
          </SettingCard>
          <Spacer h={16} />
        </div>
        <TopCornerActions side="end" theme={theme} onSelectTheme={onSelectTheme} onInfoClick={() => openRules()} />
        <BottomBar>
          <PrimaryButton onClick={game.startRound}>🎲 Losuj role</PrimaryButton>
        </BottomBar>
      </div>
    </AppBackground>
  )
}

function SettingCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <DarkCard>
      <h3 className="setting-title">{title}</h3>
      <p className="setting-description">{description}</p>
      {children}
    </DarkCard>
  )
}
