// Odpowiednik ReadyToStartScreen.kt.

import { PlayerAvatar } from '../avatars/PlayerAvatar'
import { AppBackground, CloseButton, PrimaryButton, Spacer } from '../components/Basics'
import type { ScreenProps } from './types'
import { useExitGame } from './useExitGame'

export function ReadyToStartScreen({ game }: ScreenProps) {
  const { openExitDialog, exitDialog } = useExitGame(game)

  return (
    <AppBackground>
      <div className="screen">
        <div className="centered-column pad-32">
          <div className="avatar-row">
            {game.state.players.map((p) => (
              <PlayerAvatar key={p.id} avatar={p.avatarEmoji} size={game.state.players.length > 6 ? 64 : game.state.players.length > 4 ? 88 : 110} mood="happy" loop />
            ))}
          </div>
          <Spacer h={32} />
          <h1 className="ready-title">
            Wszyscy sprawdzili
            <br />
            swoje role!
          </h1>
          <Spacer h={12} />
          <p className="body-16 text-secondary center">Czas zaczynać!</p>
          <Spacer h={56} />
          <PrimaryButton onClick={game.startGameRound}>🚀 Rozpocznij grę</PrimaryButton>
        </div>
        <CloseButton onClick={openExitDialog} />
      </div>
      {exitDialog}
    </AppBackground>
  )
}
