// Odpowiednik GameRoundScreen.kt.
// Timer pauzuje się przy: zgadywaniu, tabeli wyników, potwierdzeniu końca rundy/gry, ustawieniach i zasadach gry.
// Dialog wyjścia (✕) NIE pauzuje timera — tak jak na Androidzie.

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { PlayerAvatar } from '../avatars/PlayerAvatar'
import { AppBackground, CloseButton, DarkCard, PrimaryButton, SecondaryButton, Spacer } from '../components/Basics'
import { AlertDialog, ExitGameDialog, ImpostorGuessDialog, PlayerPickerDialog, ScoreTable } from '../components/Dialogs'
import { TopCornerActions } from '../components/TopCornerActions'
import type { Player } from '../game/types'
import { BACK_PRIORITY_DIALOG, useBackHandler } from '../navigation/backHandler'
import { PeekReveal } from './RevealRoleScreen'
import type { ScreenProps } from './types'

type RoundDialog = 'none' | 'scoreTable' | 'forceEnd' | 'exitGame' | 'endRoundConfirm' | 'rolePicker'

const STARTER_BANNER_MS = 10_000

export function GameRoundScreen({ game, theme, onSelectTheme, openRules }: ScreenProps) {
  const { state, timerSeconds } = game
  const guessOpen = state.phase === 'IMPOSTOR_GUESS'
  const [activeDialog, setActiveDialog] = useState<RoundDialog>('none')
  // „Sprawdź rolę”: gracz wybiera siebie i podgląda rolę pod zasłoną (timer stoi).
  const [checkingPlayer, setCheckingPlayer] = useState<Player | null>(null)
  const closeRoleCheck = () => {
    setCheckingPlayer(null)
    if (state.phase === 'GAME_ROUND') game.resumeTimer()
  }
  useBackHandler(closeRoleCheck, checkingPlayer !== null, BACK_PRIORITY_DIALOG)

  // Baner startującego gracza — znika po 10 s, wraca przy nowej rundzie.
  const bannerKey = `${state.roundNumber}:${state.startingPlayer?.id ?? ''}`
  const [hiddenBannerKey, setHiddenBannerKey] = useState<string | null>(null)
  const showStarterBanner = hiddenBannerKey !== bannerKey && state.startingPlayer !== null
  useEffect(() => {
    const handle = window.setTimeout(() => setHiddenBannerKey(bannerKey), STARTER_BANNER_MS)
    return () => window.clearTimeout(handle)
  }, [bannerKey])

  const openDialog = (dialog: RoundDialog) => {
    if (dialog === 'scoreTable' || dialog === 'forceEnd' || dialog === 'endRoundConfirm' || dialog === 'rolePicker') game.pauseTimer()
    setActiveDialog(dialog)
  }

  const closeAndResume = () => {
    setActiveDialog('none')
    game.resumeTimer()
  }

  useBackHandler(() => {
    if (guessOpen) game.cancelImpostorGuess()
    else setActiveDialog('exitGame')
  })

  const minutes = Math.floor(timerSeconds / 60)
  const seconds = timerSeconds % 60
  const timerClass = timerSeconds <= 10 ? 'danger' : timerSeconds <= 30 ? 'warning' : ''

  return (
    <AppBackground>
      <div className="screen">
        <div className="round-column">
          <Spacer h={16} />
          <p className="body-17 text-secondary">Runda {state.roundNumber}</p>
          <Spacer h={8} />
          <span className="emoji-36">⏱️</span>
          <Spacer h={4} />
          <p className={`round-timer ${timerClass}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </p>
          <Spacer h={24} />
          <DarkCard className="full-width">
            <p className="body-15 text-secondary center">
              Mówcie po kolei słowa kojarzące się z tajnym hasłem.
              <br />
              Nie zdradzajcie go wprost!
            </p>
          </DarkCard>
          <div className={`starter-banner ${showStarterBanner ? 'visible' : ''}`}>
            <div className="starter-banner-inner">
              {state.startingPlayer && (
                <>
                  <Spacer h={12} />
                  <DarkCard className="full-width">
                    <div className="starter-content">
                      <p className="body-12 text-muted">Rundę zaczyna</p>
                      <Spacer h={6} />
                      <PlayerAvatar avatar={state.startingPlayer.avatarEmoji} size={150} mood="happy" loop />
                      <Spacer h={4} />
                      <p className="starter-name">{state.startingPlayer.name}</p>
                      <Spacer h={6} />
                      <p className="body-13 text-secondary center">To Ty podajesz pierwsze skojarzenie.</p>
                    </div>
                  </DarkCard>
                </>
              )}
            </div>
          </div>
          <div className="flex-1" />
          <PrimaryButton onClick={game.openImpostorGuess}>🥷 Reproduktor zgaduje</PrimaryButton>
          <Spacer h={10} />
          <SecondaryButton onClick={() => openDialog('endRoundConfirm')}>🗳️ Zakończ rundę i głosuj</SecondaryButton>
          <Spacer h={16} />
          <div className="round-small-buttons">
            <button type="button" className="small-outline" onClick={() => openDialog('scoreTable')}>
              📊 Tabela
            </button>
            <button type="button" className="small-outline" onClick={() => openDialog('rolePicker')}>
              👁 Sprawdź rolę
            </button>
            <button type="button" className="small-outline danger" onClick={() => openDialog('forceEnd')}>
              🏁 Koniec
            </button>
          </div>
          <Spacer h={8} />
        </div>
        <TopCornerActions
          side="start"
          theme={theme}
          onSelectTheme={onSelectTheme}
          onInfoClick={() => {
            const wasRunning = state.phase === 'GAME_ROUND'
            if (wasRunning) game.pauseTimer()
            openRules(() => {
              if (wasRunning) game.resumeTimer()
            })
          }}
          onSettingsDialogVisibilityChanged={(visible) => {
            if (state.phase !== 'GAME_ROUND') return
            if (visible) game.pauseTimer()
            else if (activeDialog === 'none') game.resumeTimer()
          }}
        />
        <CloseButton onClick={() => setActiveDialog('exitGame')} />
      </div>

      {guessOpen && (
        <ImpostorGuessDialog
          players={state.players}
          onGuessResult={game.handleImpostorGuess}
          onDismiss={game.cancelImpostorGuess}
          dismissText="← Wróć do gry"
        />
      )}

      {activeDialog === 'rolePicker' && (
        <PlayerPickerDialog
          title="👁 Kto sprawdza rolę?"
          subtitle="Wybierz siebie. Pozostali niech nie patrzą na ekran."
          players={state.players}
          onPick={(player) => {
            setActiveDialog('none')
            setCheckingPlayer(player)
          }}
          onDismiss={closeAndResume}
        />
      )}

      {checkingPlayer &&
        createPortal(
          <div className="role-check-overlay">
            <PeekReveal
              key={checkingPlayer.id}
              playerName={checkingPlayer.name}
              avatar={checkingPlayer.avatarEmoji}
              playerIdx={state.players.findIndex((p) => p.id === checkingPlayer.id) + 1}
              playerCount={state.players.length}
              isImpostor={state.currentImpostorIds.has(checkingPlayer.id)}
              word={state.currentSecretWord?.word ?? '?'}
              hint={state.currentImpostorHints[checkingPlayer.id] ?? ''}
              hintsEnabled={state.settings.hintsEnabled}
              isAdvancing={false}
              onExitGame={closeRoleCheck}
              onContinue={closeRoleCheck}
              continueLabel="← Wróć do gry"
            />
          </div>,
          document.body,
        )}

      {activeDialog === 'scoreTable' && (
        <AlertDialog
          title="📊 Tabela wyników"
          text={<ScoreTable players={state.players} showAvatars />}
          confirm={{ text: 'Wróć do gry', onClick: closeAndResume }}
          onDismissRequest={closeAndResume}
        />
      )}

      {activeDialog === 'endRoundConfirm' && (
        <AlertDialog
          title="Zakończyć rundę?"
          text="Możesz przejść do głosowania albo wrócić do gry i kontynuować odliczanie."
          confirm={{
            text: 'Przejdź do głosowania',
            color: 'var(--secondary)',
            onClick: () => {
              setActiveDialog('none')
              game.endRoundEarly()
            },
          }}
          dismiss={{ text: 'Wróć do gry', onClick: closeAndResume }}
          onDismissRequest={closeAndResume}
        />
      )}

      {activeDialog === 'forceEnd' && (
        <AlertDialog
          title="Zakończyć rozgrywkę?"
          text="Obecna runda zostanie przerwana, a na ekranie pojawią się aktualne wyniki."
          confirm={{
            text: 'Zakończ',
            color: 'var(--error)',
            onClick: () => {
              setActiveDialog('none')
              game.forceEndGame()
            },
          }}
          dismiss={{ text: 'Wróć do gry', onClick: closeAndResume }}
          onDismissRequest={closeAndResume}
        />
      )}

      {activeDialog === 'exitGame' && (
        <ExitGameDialog
          onDismiss={() => {
            setActiveDialog('none')
            if (state.phase === 'GAME_ROUND') game.resumeTimer()
          }}
          onConfirm={() => {
            setActiveDialog('none')
            game.exitToStart()
          }}
        />
      )}
    </AppBackground>
  )
}
