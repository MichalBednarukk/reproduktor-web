import { DarkCard } from '../components/DarkCard'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'
import { TopCornerActions } from '../components/TopCornerActions'
import type { GameOverScreenProps } from './types'

export function GameOverScreen({
  theme,
  themeKey,
  onThemeChange,
  onInfo,
  state,
  winners,
  onPlayAgain,
  onNewGame,
}: GameOverScreenProps) {
  const maxScore = Math.max(...state.players.map((p) => p.score), 0)
  const leaders = state.players.filter((p) => p.score === maxScore)
  const endedByPoints = winners.length > 0

  return (
    <div className="screen">
      <TopCornerActions theme={theme} selectedTheme={themeKey} onSelectTheme={onThemeChange} onInfoClick={onInfo} />

      <section className="screen-scroll with-bottom-bar">
        <p className="giant-emoji">{endedByPoints ? '🏆' : '🏁'}</p>
        <h1 className="title">{endedByPoints ? 'KONIEC GRY!' : 'Koniec rozgrywki'}</h1>

        {endedByPoints ? (
          <>
            <p className="subtitle">{winners.length === 1 ? 'Wygrywa:' : 'Wygrywają:'}</p>
            <p className="winners">{winners.map((p) => `${p.avatarEmoji} ${p.name}`).join('\n')}</p>
          </>
        ) : (
          <>
            <p className="subtitle">Aktualne wyniki</p>
            {maxScore > 0 ? (
              <p className="winners">{leaders.map((p) => `${p.avatarEmoji} ${p.name}`).join('\n')}</p>
            ) : (
              <p className="hint">Nikt nie zdobył jeszcze punktów.</p>
            )}
          </>
        )}

        <DarkCard theme={theme}>
          <h3>Finalna tabela wyników</h3>
          {state.players
            .slice()
            .sort((a, b) => b.score - a.score)
            .map((p) => (
              <div key={p.id} className="score-row">
                <span>{p.avatarEmoji} {p.name}</span>
                <strong>{p.score}</strong>
              </div>
            ))}
        </DarkCard>
      </section>

      <footer className="bottom-bar" style={{ background: theme.gradientFrom, borderColor: theme.border }}>
        <PrimaryButton theme={theme} onClick={onPlayAgain}>🔄 Zagraj ponownie</PrimaryButton>
        <SecondaryButton theme={theme} onClick={onNewGame}>🆕 Nowa gra</SecondaryButton>
      </footer>
    </div>
  )
}
