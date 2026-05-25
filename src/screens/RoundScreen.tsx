import { DarkCard } from '../components/DarkCard'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'
import { TopCornerActions } from '../components/TopCornerActions'
import type { RoundScreenProps } from './types'

const fmt = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function RoundScreen({
  theme,
  themeKey,
  onThemeChange,
  onInfo,
  state,
  timerSeconds,
  onOpenGuess,
  onEndRound,
  onForceEnd,
  onExit,
}: RoundScreenProps) {
  const timerColor = timerSeconds <= 10 ? theme.error : timerSeconds <= 30 ? theme.warning : theme.text

  return (
    <div className="screen">
      <TopCornerActions
        theme={theme}
        selectedTheme={themeKey}
        onSelectTheme={onThemeChange}
        onInfoClick={onInfo}
        side="start"
      />
      <button className="close-btn" onClick={onExit}>✕</button>

      <section className="screen-scroll with-bottom-bar">
        <p className="subtitle">Runda {state.roundNumber}</p>
        <p className="giant-emoji">⏱️</p>
        <p className="timer" style={{ color: timerColor }}>{fmt(timerSeconds)}</p>

        <DarkCard theme={theme}>
          <p className="center-text">Mówcie po kolei słowa kojarzące się z tajnym hasłem. Nie zdradzajcie go wprost!</p>
        </DarkCard>

        {state.startingPlayer && (
          <DarkCard theme={theme}>
            <p className="hint">Rundę zaczyna</p>
            <p className="avatar large">{state.startingPlayer.avatarEmoji}</p>
            <h3 className="center-text" style={{ color: theme.secondary }}>{state.startingPlayer.name}</h3>
            <p className="hint">To Ty podajesz pierwsze skojarzenie.</p>
          </DarkCard>
        )}
      </section>

      <footer className="bottom-bar" style={{ background: theme.gradientFrom, borderColor: theme.border }}>
        <PrimaryButton theme={theme} onClick={onOpenGuess}>🥷 Reproduktor zgaduje</PrimaryButton>
        <SecondaryButton theme={theme} onClick={onEndRound}>🗳️ Zakończ rundę i głosuj</SecondaryButton>
        <button className="btn danger-outline" onClick={onForceEnd} style={{ borderColor: `${theme.error}66`, color: theme.error }}>🏁 Koniec</button>
      </footer>
    </div>
  )
}
