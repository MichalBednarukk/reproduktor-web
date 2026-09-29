// Odpowiednik PassPhoneScreen.kt.

import { PlayerAvatar } from '../avatars/PlayerAvatar'
import { AppBackground, CloseButton, DarkCard, PrimaryButton, Spacer } from '../components/Basics'
import { AutoResizeText } from '../components/AutoResizeText'
import type { ScreenProps } from './types'
import { useExitGame } from './useExitGame'

export function PassPhoneScreen({ game }: ScreenProps) {
  const { players, currentRevealIndex } = game.state
  const current = players[currentRevealIndex]
  const { openExitDialog, exitDialog } = useExitGame(game)

  return (
    <AppBackground>
      <div className="screen">
        <div className="centered-column pad-32">
          {current ? <PlayerAvatar avatar={current.avatarEmoji} size={110} mood="happy" /> : <span className="emoji-88">📱</span>}
          <Spacer h={20} />
          <DarkCard padding={24} radius={28} className="full-width">
            <p className="body-16 text-secondary center">Przekaż telefon do</p>
            <Spacer h={12} />
            <AutoResizeText
              text={current?.name.trim() ?? '?'}
              maxFontSize={38}
              minFontSize={20}
              maxLines={2}
              lineHeightMultiplier={1.2}
              className="name-text"
            />
            <Spacer h={10} />
            <p className="body-13 text-muted center ellipsis">
              Gracz {currentRevealIndex + 1} z {players.length}
            </p>
          </DarkCard>
          <Spacer h={32} />
          <PrimaryButton onClick={game.confirmPassPhone}>Kontynuuj</PrimaryButton>
        </div>
        <CloseButton onClick={openExitDialog} />
      </div>
      {exitDialog}
    </AppBackground>
  )
}
