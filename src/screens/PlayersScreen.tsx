// Odpowiednik PlayersScreen.kt.

import { useState } from 'react'
import { AppBackground, BottomBar, DarkCard, PrimaryButton, SecondaryButton, Spacer } from '../components/Basics'
import { PlayerAvatar } from '../avatars/PlayerAvatar'
import { AlertDialog } from '../components/Dialogs'
import { TopCornerActions } from '../components/TopCornerActions'
import { MAX_PLAYER_NAME_LENGTH, MAX_PLAYERS, MIN_PLAYERS } from '../game/gameEngine'
import type { ScreenProps } from './types'

export function PlayersScreen({ game, theme, onSelectTheme, openRules }: ScreenProps) {
  const { players } = game.state
  const [inputText, setInputText] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [showRemoveAll, setShowRemoveAll] = useState(false)

  const tryAdd = () => {
    const cleaned = inputText.trim()
    if (cleaned.length > MAX_PLAYER_NAME_LENGTH) {
      setErrorMsg(`Imię może mieć maksymalnie ${MAX_PLAYER_NAME_LENGTH} znaków`)
      return
    }
    if (game.addPlayer(cleaned)) {
      setInputText('')
      setErrorMsg('')
      return
    }
    if (!cleaned) setErrorMsg('Wpisz imię gracza')
    else if (players.some((p) => p.name.toLocaleLowerCase() === cleaned.toLocaleLowerCase()))
      setErrorMsg('Gracz o tym imieniu już istnieje')
    else if (players.length >= MAX_PLAYERS) setErrorMsg(`Maksymalnie ${MAX_PLAYERS} graczy`)
    else setErrorMsg('Nie można dodać gracza')
  }

  const canContinue = players.length >= MIN_PLAYERS

  return (
    <AppBackground>
      <div className="screen with-bottom-bar">
        <div className="scroll-area pad-24">
          <Spacer h={16} />
          <div className="players-header">
            <div className="players-title">
              <h1 className="title-36 ellipsis">🎮 Gracze</h1>
              <p className="body-15 text-secondary">Kto gra dzisiaj?</p>
            </div>
            {players.length > 0 && (
              <button type="button" className="text-btn remove-all" onClick={() => setShowRemoveAll(true)}>
                Usuń wszystkich
              </button>
            )}
          </div>
          <Spacer h={20} />
          <DarkCard padding={12} radius={20}>
            <form
              className="player-input-row"
              onSubmit={(e) => {
                e.preventDefault()
                tryAdd()
              }}
            >
              <input
                className="player-input"
                value={inputText}
                maxLength={MAX_PLAYER_NAME_LENGTH}
                placeholder="Wpisz imię gracza"
                enterKeyHint="done"
                autoComplete="off"
                onChange={(e) => {
                  setInputText(e.target.value.slice(0, MAX_PLAYER_NAME_LENGTH))
                  setErrorMsg('')
                }}
              />
              <button type="submit" className="add-btn" aria-label="Dodaj gracza">
                +
              </button>
            </form>
          </DarkCard>
          <p className="char-counter">
            {inputText.length}/{MAX_PLAYER_NAME_LENGTH} znaków
          </p>
          {errorMsg && <p className="input-error">{errorMsg}</p>}
          <Spacer h={16} />
          {players
            .slice()
            .reverse()
            .map((player) => (
              <DarkCard key={player.id} padding={4} radius={20} className="player-card">
                <div className="player-row">
                  <span className="player-avatar">
                    <PlayerAvatar avatar={player.avatarEmoji} size={44} />
                  </span>
                  <span className="player-name">{player.name}</span>
                  <button
                    type="button"
                    className="icon-btn remove-player"
                    onClick={() => game.removePlayer(player.id)}
                    aria-label={`Usuń ${player.name}`}
                  >
                    ✕
                  </button>
                </div>
              </DarkCard>
            ))}
          <Spacer h={16} />
        </div>
        <TopCornerActions side="end" theme={theme} onSelectTheme={onSelectTheme} onInfoClick={() => openRules()} />
        <BottomBar>
          {!canContinue && <p className="bottom-hint">Dodaj co najmniej {MIN_PLAYERS} graczy, aby kontynuować</p>}
          <PrimaryButton disabled={!canContinue} onClick={game.goToCategories}>
            Dalej →
          </PrimaryButton>
          <Spacer h={10} />
          <SecondaryButton onClick={() => openRules()}>Zasady gry</SecondaryButton>
        </BottomBar>
      </div>
      {showRemoveAll && (
        <AlertDialog
          title="Usunąć wszystkich graczy?"
          text="Ta akcja usunie całą listę graczy z tego urządzenia."
          confirm={{
            text: 'Usuń',
            color: 'var(--error)',
            onClick: () => {
              setShowRemoveAll(false)
              game.removeAllPlayers()
            },
          }}
          dismiss={{ text: 'Anuluj', onClick: () => setShowRemoveAll(false) }}
          onDismissRequest={() => setShowRemoveAll(false)}
        />
      )}
    </AppBackground>
  )
}
