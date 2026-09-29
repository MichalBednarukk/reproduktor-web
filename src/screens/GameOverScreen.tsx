// Odpowiednik GameOverScreen.kt. „Wstecz” nic nie robi (BackHandler { } na Androidzie).

import { AppBackground, BottomBar, DarkCard, PrimaryButton, SecondaryButton, Spacer } from '../components/Basics'
import { ScoreTable } from '../components/Dialogs'
import { TopCornerActions } from '../components/TopCornerActions'
import { useBackHandler } from '../navigation/backHandler'
import type { ScreenProps } from './types'

export function GameOverScreen({ game, theme, onSelectTheme, openRules }: ScreenProps) {
  const { players } = game.state
  const winners = game.getWinners()
  const maxScore = players.reduce((max, p) => Math.max(max, p.score), 0)
  const leaders = players.filter((p) => p.score === maxScore)
  const endedByPoints = winners.length > 0

  useBackHandler(() => {})

  const label = (list: typeof players) => list.map((p) => `${p.avatarEmoji} ${p.name}`).join('\n')

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
            <>
              <p className="body-17 text-secondary">{winners.length === 1 ? 'Wygrywa:' : 'Wygrywają:'}</p>
              <Spacer h={6} />
              <p className={winners.length === 1 ? 'winner-single' : 'winner-list'}>{label(winners)}</p>
            </>
          ) : (
            <>
              <p className="body-17 text-secondary">Aktualne wyniki</p>
              <Spacer h={8} />
              {maxScore > 0 ? (
                <>
                  <p className="body-14 text-muted">{leaders.length === 1 ? 'Najlepszy wynik:' : 'Remis na prowadzeniu:'}</p>
                  <Spacer h={4} />
                  <p className="winner-list">{label(leaders)}</p>
                </>
              ) : (
                <p className="body-15 text-muted center">Nikt nie zdobył jeszcze punktów.</p>
              )}
            </>
          )}
          <Spacer h={32} />
          <DarkCard className="full-width">
            <h3 className="card-heading">Finalna tabela wyników</h3>
            <ScoreTable players={players} showAvatars />
          </DarkCard>
          <Spacer h={16} />
        </div>
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
