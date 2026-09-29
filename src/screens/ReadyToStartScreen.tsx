// Odpowiednik ReadyToStartScreen.kt.

import { fitAvatarSize } from '../avatars/fitAvatarSize'
import { PlayerAvatar } from '../avatars/PlayerAvatar'
import { useElementSize } from '../platform/useElementSize'
import { AppBackground, CloseButton, PrimaryButton, Spacer } from '../components/Basics'
import type { ScreenProps } from './types'
import { useExitGame } from './useExitGame'

export function ReadyToStartScreen({ game }: ScreenProps) {
  const { openExitDialog, exitDialog } = useExitGame(game)
  const [measureCrowd, crowd] = useElementSize<HTMLDivElement>()
  const players = game.state.players

  return (
    <AppBackground>
      <div className="screen">
        <div className="centered-column ready-column">
          {/* Avatary zajmują wolne miejsce nad tytułem — tak duże, jak się zmieszczą (max 110 px). */}
          <div className="flex-1 ready-crowd" ref={measureCrowd}>
            {crowd.height > 0 && (
              <div className="avatar-row">
                {players.map((p) => (
                  <PlayerAvatar key={p.id} avatar={p.avatarEmoji} size={fitAvatarSize(players.length, crowd.width, crowd.height, 110)} mood="happy" loop />
                ))}
              </div>
            )}
          </div>
          <Spacer h={24} />
          <h1 className="ready-title">
            Wszyscy sprawdzili
            <br />
            swoje role!
          </h1>
          <Spacer h={12} />
          <p className="body-16 text-secondary center">Czas zaczynać!</p>
          <Spacer h={40} />
          <PrimaryButton onClick={game.startGameRound}>🚀 Rozpocznij grę</PrimaryButton>
        </div>
        <CloseButton onClick={openExitDialog} />
      </div>
      {exitDialog}
    </AppBackground>
  )
}
