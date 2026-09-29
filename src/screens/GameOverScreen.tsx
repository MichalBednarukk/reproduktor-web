// Odpowiednik GameOverScreen.kt: podium 1-2-3, konfetti, nagrody i tabela. „Wstecz” nic nie robi (BackHandler { } na Androidzie).

import { AwardsList } from '../components/AwardsList'
import { AppBackground, BottomBar, DarkCard, PrimaryButton, SecondaryButton, Spacer } from '../components/Basics'
import { Confetti } from '../components/Confetti'
import { ScoreTable } from '../components/Dialogs'
import { Podium } from '../components/Podium'
import { TopCornerActions } from '../components/TopCornerActions'
import { useBackHandler } from '../navigation/backHandler'
import { computeAwards } from '../game/awards'
import type { ScreenProps } from './types'

export function GameOverScreen({ game, theme, onSelectTheme, openRules }: ScreenProps) {
  const { players } = game.state
  const winners = game.getWinners()
  const maxScore = players.reduce((max, p) => Math.max(max, p.score), 0)
  const leaders = players.filter((p) => p.score === maxScore)
  const endedByPoints = winners.length > 0

  useBackHandler(() => {})

  const winnerIds = new Set(winners.map((p) => p.id))
  const awards = computeAwards(players, game.state.roundHistory)

  return (
    <AppBackground>
      <div className="screen with-bottom-bar">
        <div className="scroll-area pad-24 center-items">
          <Spacer h={24} />
          <span className="emoji-88">{endedByPoints ? '🏆' : '🏁'}</span>
          <Spacer h={16} />
          <h1 className="title-36">{endedByPoints ? 'KONIEC GRY!' : 'Koniec rozgrywki'}</h1>
          <Spacer h={16} />
          {endedByPoints ? (
            <p className="body-17 text-secondary">
              {winners.length === 1 ? `Wygrywa ${winners[0].name}!` : `Wygrywają: ${winners.map((p) => p.name).join(', ')}!`}
            </p>
          ) : (
            <p className="body-17 text-secondary">
              {maxScore > 0 ? (leaders.length === 1 ? 'Najlepszy wynik' : 'Remis na prowadzeniu') : 'Nikt nie zdobył jeszcze punktów.'}
            </p>
          )}
          {maxScore > 0 && (
            <>
              <Spacer h={20} />
              <Podium players={players} />
            </>
          )}
          {awards.length > 0 && (
            <>
              <Spacer h={24} />
              <DarkCard className="full-width">
                <h3 className="card-heading">🏅 Nagrody</h3>
                <AwardsList awards={awards} />
              </DarkCard>
            </>
          )}
          <Spacer h={16} />
          <DarkCard className="full-width">
            <h3 className="card-heading">Finalna tabela wyników</h3>
            <ScoreTable
              players={players}
              moods={Object.fromEntries(players.map((p) => [p.id, winnerIds.has(p.id) ? 'win' : endedByPoints ? 'sad' : 'idle']))}
              showAvatars
            />
          </DarkCard>
          <Spacer h={16} />
        </div>
        {endedByPoints && <Confetti count={90} />}
        <TopCornerActions side="end" theme={theme} onSelectTheme={onSelectTheme} onInfoClick={() => openRules()} />
        <BottomBar>
          <PrimaryButton
            onClick={() => {
              game.resetGameKeepPlayers()
              game.goToCategories()
            }}
          >
            🔄 Zagraj ponownie
          </PrimaryButton>
          <Spacer h={10} />
          <SecondaryButton onClick={game.resetGameKeepPlayers}>🆕 Nowa gra</SecondaryButton>
        </BottomBar>
      </div>
    </AppBackground>
  )
}
