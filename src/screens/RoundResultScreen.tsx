import { DarkCard } from '../components/DarkCard'
import { PrimaryButton } from '../components/PrimaryButton'
import { TopCornerActions } from '../components/TopCornerActions'
import type { RoundResultScreenProps } from './types'

const RESULT_EMOJI: Record<string, string> = {
  IMPOSTORS_CAUGHT: '👥🏆',
  IMPOSTORS_ESCAPED: '🥷🏆',
  IMPOSTOR_GUESSED_CORRECTLY: '🥷✅',
  IMPOSTOR_GUESSED_INCORRECTLY: '🥷❌',
}

export function RoundResultScreen({
  theme,
  themeKey,
  onThemeChange,
  onInfo,
  state,
  onNextRound,
  onExit,
}: RoundResultScreenProps) {
  const result = state.lastRoundResult

  if (!result) return null

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
        <h1 className="title">Wynik rundy</h1>
        <p className="giant-emoji">{RESULT_EMOJI[result.resultType]}</p>
        <p className="round-message">{result.resultMessage}</p>

        <DarkCard theme={theme}>
          <p className="hint-title">🔐 Tajne słowo</p>
          <h2 className="secret-word">{result.secretWord.word}</h2>
          <p className="hint-title">🥷 Reproduktorzy</p>
          <p className="impostor-list">
            {result.impostors.map((p) => `${p.avatarEmoji} ${p.name}`).join(', ')}
          </p>
        </DarkCard>

        <DarkCard theme={theme}>
          <h3>Tabela wyników</h3>
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
        <PrimaryButton theme={theme} onClick={onNextRound}>🔄 Następna runda</PrimaryButton>
      </footer>
    </div>
  )
}
