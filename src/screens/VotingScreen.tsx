import { DarkCard } from '../components/DarkCard'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'
import { TopCornerActions } from '../components/TopCornerActions'
import type { VotingScreenProps } from './types'

export function VotingScreen({
  theme,
  themeKey,
  onThemeChange,
  onInfo,
  state,
  voteSet,
  onToggleVote,
  onSubmitVotes,
  onOpenGuess,
  onExit,
}: VotingScreenProps) {
  const required = state.settings.impostorCount

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
        <p className="giant-emoji">🗳️</p>
        <h1 className="title">Głosowanie</h1>
        <p className="subtitle">Kto był Reproduktorem?</p>

        <DarkCard theme={theme}>
          <p className="center-text">
            Wskaż {required === 1 ? 'Reproduktora' : 'Reproduktorów'}: {required} • Zaznaczono: {voteSet.size}
          </p>
        </DarkCard>

        {state.players.map((player) => {
          const selected = voteSet.has(player.id)
          return (
            <button
              key={player.id}
              className={`vote-item ${selected ? 'selected' : ''}`}
              onClick={() => onToggleVote(player.id)}
              style={{ borderColor: selected ? theme.primary : theme.border, background: selected ? `${theme.primary}22` : theme.card }}
            >
              <span className="avatar">{player.avatarEmoji}</span>
              <span className="player-name">{player.name}</span>
              {selected && <span className="check">✓</span>}
            </button>
          )
        })}
      </section>

      <footer className="bottom-bar" style={{ background: theme.gradientFrom, borderColor: theme.border }}>
        <SecondaryButton theme={theme} onClick={onOpenGuess}>🥷 Reproduktor zgaduje</SecondaryButton>
        <PrimaryButton theme={theme} disabled={voteSet.size !== required} onClick={onSubmitVotes}>Sprawdź wynik ✓</PrimaryButton>
      </footer>
    </div>
  )
}
