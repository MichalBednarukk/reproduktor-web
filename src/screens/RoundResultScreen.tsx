// Odpowiednik RoundResultScreen.kt. Wynik odsłaniany etapami: „Reproduktorem był…” → duży avatar z miną
// + konfetti → hasło i tabela, w której punkty się nabijają. Stuknięcie pomija animację.

import { useEffect, useState } from 'react'
import { PlayerAvatar } from '../avatars/PlayerAvatar'
import { resultMood } from '../avatars/moods'
import { AnimatedScoreTable } from '../components/AnimatedScoreTable'
import { AppBackground, BottomBar, CloseButton, DarkCard, PrimaryButton, Spacer } from '../components/Basics'
import { Confetti } from '../components/Confetti'
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

/** Kiedy (ms od wejścia) zaczyna się etap: 1 = avatar, 2 = hasło i wiadomość, 3 = tabela liczy punkty. */
const STAGE_AT = [0, 1300, 2300, 3100]

export function RoundResultScreen({ game, theme, onSelectTheme, openRules }: ScreenProps) {
  const { players, lastRoundResult: result } = game.state
  const { openExitDialog, exitDialog } = useExitGame(game)
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timers = STAGE_AT.slice(1).map((at, i) => window.setTimeout(() => setStage((s) => Math.max(s, i + 1)), at))
    return () => timers.forEach(clearTimeout)
  }, [])

  const skip = () => setStage(3)
  const count = result?.impostors.length ?? 1
  const heroSize = count === 1 ? 170 : count === 2 ? 130 : 100

  return (
    <AppBackground>
      <div className="screen with-bottom-bar">
        <div className="scroll-area pad-24 center-items" onClick={stage < 3 ? skip : undefined}>
          <Spacer h={16} />
          <h1 className="title-32">Wynik rundy</h1>
          <Spacer h={16} />
          {result && (
            <>
              <p className="reveal-lead">
                {count === 1 ? 'Reproduktorem był' : 'Reproduktorami byli'}
                <span className={`reveal-dots ${stage >= 1 ? 'done' : ''}`}>
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </p>
              <Spacer h={8} />
              <div className={`avatar-row reveal-hero ${stage >= 1 ? 'shown' : ''}`}>
                {result.impostors.map((p) => (
                  <div key={p.id} className="avatar-person">
                    <PlayerAvatar
                      avatar={p.avatarEmoji}
                      size={heroSize}
                      mood={stage >= 1 ? resultMood(result, p.id) : 'sneaky'}
                      loop={stage >= 1}
                    />
                    <span className={count === 1 ? 'winner-single' : 'winner-list'}>{p.name}</span>
                  </div>
                ))}
              </div>
              <div className={`stage-block ${stage >= 2 ? 'shown' : ''}`}>
                <Spacer h={12} />
                <span className="emoji-64">{RESULT_EMOJI[result.resultType]}</span>
                <Spacer h={8} />
                <p className="result-message">{result.resultMessage}</p>
                <Spacer h={16} />
                <DarkCard className="full-width center-text">
                  <p className="body-13 text-muted">🔐 Tajne słowo</p>
                  <p className="result-word">{result.secretWord.word}</p>
                </DarkCard>
              </div>
              <Spacer h={16} />
              <div className={`stage-block full-width ${stage >= 2 ? 'shown' : ''}`}>
                <DarkCard className="full-width">
                  <h3 className="card-heading">Tabela wyników</h3>
                  <AnimatedScoreTable
                    players={players}
                    pointsDelta={result.pointsDelta}
                    moods={Object.fromEntries(players.map((p) => [p.id, resultMood(result, p.id)]))}
                    play={stage >= 3}
                  />
                </DarkCard>
              </div>
              {stage >= 1 && <Confetti />}
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
