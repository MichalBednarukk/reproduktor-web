// Odpowiednik RoundResultScreen.kt.

import { AppBackground, BottomBar, CloseButton, DarkCard, PrimaryButton, Spacer } from '../components/Basics'
import { ScoreTable } from '../components/Dialogs'
import { TopCornerActions } from '../components/TopCornerActions'
import type { ResultType } from '../game/types'
import type { ScreenProps } from './types'
import { useExitGame } from './useExitGame'

const RESULT_EMOJI: Record<ResultType, string> = {
  IMPOSTORS_CAUGHT: '👥🏆',
  IMPOSTORS_PARTIALLY_CAUGHT: '👥🥷',
  IMPOSTORS_ESCAPED: '🥷🏆',
  IMPOSTOR_GUESSED_CORRECTLY: '🥷✅',
  IMPOSTOR_GUESSED_INCORRECTLY: '🥷❌',
}

export function RoundResultScreen({ game, theme, onSelectTheme, openRules }: ScreenProps) {
  const { players, lastRoundResult: result } = game.state
  const { openExitDialog, exitDialog } = useExitGame(game)

  return (
    <AppBackground>
      <div className="screen with-bottom-bar">
        <div className="scroll-area pad-24 center-items">
          <Spacer h={16} />
          <h1 className="title-32">Wynik rundy</h1>
          <Spacer h={24} />
          {result && (
            <>
              <span className="emoji-64">{RESULT_EMOJI[result.resultType]}</span>
              <Spacer h={12} />
              <p className="result-message">{result.resultMessage}</p>
              <Spacer h={20} />
              <DarkCard className="full-width">
                <p className="body-13 text-muted">🔐 Tajne słowo</p>
                <p className="result-word">{result.secretWord.word}</p>
                <Spacer h={12} />
                <p className="body-13 text-muted">🥷 Reproduktorzy</p>
                <p className="result-impostors">
                  {result.impostors.map((p) => `${p.avatarEmoji} ${p.name}`).join(', ')}
                </p>
              </DarkCard>
              <Spacer h={16} />
              <DarkCard className="full-width">
                <h3 className="card-heading">Tabela wyników</h3>
                <ScoreTable players={players} pointsDelta={result.pointsDelta} showAvatars />
              </DarkCard>
            </>
          )}
          <Spacer h={16} />
        </div>
        <TopCornerActions side="start" theme={theme} onSelectTheme={onSelectTheme} onInfoClick={() => openRules()} />
        <CloseButton onClick={openExitDialog} />
        <BottomBar>
          <PrimaryButton onClick={game.goToNextRound}>🔄 Następna runda</PrimaryButton>
        </BottomBar>
      </div>
      {exitDialog}
    </AppBackground>
  )
}
