// Odpowiednik VotingScreen.kt.

import { useState } from 'react'
import { PlayerAvatar } from '../avatars/PlayerAvatar'
import { AppBackground, BottomBar, CloseButton, DarkCard, PrimaryButton, SecondaryButton, Spacer } from '../components/Basics'
import { ImpostorGuessDialog } from '../components/Dialogs'
import { TopCornerActions } from '../components/TopCornerActions'
import type { ScreenProps } from './types'
import { useExitGame } from './useExitGame'

export function VotingScreen({ game, theme, onSelectTheme, openRules }: ScreenProps) {
  const { players, settings } = game.state
  const requiredCount = settings.impostorCount
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showGuessDialog, setShowGuessDialog] = useState(false)
  const { openExitDialog, exitDialog } = useExitGame(game)

  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else if (next.size < requiredCount) next.add(id)
    setSelected(next)
  }

  return (
    <AppBackground>
      <div className="screen with-bottom-bar">
        <div className="scroll-area pad-24 center-items">
          <Spacer h={16} />
          <span className="emoji-48">🗳️</span>
          <Spacer h={8} />
          <h1 className="title-32">Głosowanie</h1>
          <Spacer h={8} />
          <p className="body-17 text-secondary">Kto był Reproduktorem?</p>
          <Spacer h={12} />
          <DarkCard padding={14} className="full-width">
            <p className="body-14 text-secondary center">
              Wskaż {requiredCount === 1 ? 'Reproduktora' : 'Reproduktorów'}: {requiredCount}  •  Zaznaczono:{' '}
              {selected.size}
            </p>
          </DarkCard>
          <Spacer h={16} />
          {players.map((player) => {
            const isSelected = selected.has(player.id)
            return (
              <button
                type="button"
                key={player.id}
                className={`vote-item ${isSelected ? 'selected' : ''}`}
                onClick={() => toggle(player.id)}
              >
                <span className="vote-avatar">
                  <PlayerAvatar avatar={player.avatarEmoji} size={60} mood={isSelected ? 'caught' : 'idle'} />
                </span>
                <span className="vote-name">{player.name}</span>
                {isSelected && <span className="check big">✓</span>}
              </button>
            )
          })}
          <Spacer h={16} />
        </div>
        <TopCornerActions side="start" theme={theme} onSelectTheme={onSelectTheme} onInfoClick={() => openRules()} />
        <CloseButton onClick={openExitDialog} />
        <BottomBar>
          <SecondaryButton onClick={() => setShowGuessDialog(true)}>🥷 Reproduktor zgaduje</SecondaryButton>
          <Spacer h={10} />
          <PrimaryButton disabled={selected.size !== requiredCount} onClick={() => game.submitVotes(selected)}>
            Sprawdź wynik ✓
          </PrimaryButton>
        </BottomBar>
      </div>
      {showGuessDialog && (
        <ImpostorGuessDialog
          players={players}
          onGuessResult={game.handleImpostorGuess}
          onDismiss={() => setShowGuessDialog(false)}
          dismissText="← Wróć do głosowania"
        />
      )}
      {exitDialog}
    </AppBackground>
  )
}
