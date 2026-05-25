import { useEffect, useMemo, useState } from 'react'
import { AppBackground } from './components/AppBackground'
import { ImpostorGuessDialog } from './components/ImpostorGuessDialog'
import { CategorySelectionScreen } from './screens/CategorySelectionScreen'
import { GameOverScreen } from './screens/GameOverScreen'
import { GameSettingsScreen } from './screens/GameSettingsScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { PassPhoneScreen } from './screens/PassPhoneScreen'
import { PlayersScreen } from './screens/PlayersScreen'
import { ReadyToStartScreen } from './screens/ReadyToStartScreen'
import { RevealRoleScreen } from './screens/RevealRoleScreen'
import { RoundResultScreen } from './screens/RoundResultScreen'
import { RoundScreen } from './screens/RoundScreen'
import { VotingScreen } from './screens/VotingScreen'
import {
  createInitialState,
  drawStartingPlayer,
  exitToStart,
  getWinners,
  goToNextRound,
  handleImpostorGuess,
  nextAvatarEmoji,
  resetGameKeepPlayers,
  startRound,
  submitVotes,
} from './game/gameEngine'
import type { AppThemeKey, Category, GameSettings, GameState, Player } from './game/types'
import { loadWords } from './game/wordPicker'
import { appStorage } from './storage/localStorage'
import { THEMES } from './theme/themes'
import './index.css'

const MAX_PLAYER_NAME_LENGTH = 30

type Overlay = null | 'onboarding'

function App() {
  const [themeKey, setThemeKey] = useState<AppThemeKey>(appStorage.loadTheme())
  const theme = THEMES[themeKey]

  const [categories, setCategories] = useState<Category[]>([])
  const [wordsByCategory, setWordsByCategory] = useState<Record<string, any[]>>({})

  const savedSettings = appStorage.loadSettings()
  const initialPlayers: Player[] = appStorage.loadPlayers().map((p) => ({
    id: crypto.randomUUID(),
    name: p.name,
    avatarEmoji: p.avatarEmoji,
    score: 0,
  }))

  const [state, setState] = useState<GameState>(createInitialState(initialPlayers, savedSettings ?? undefined))
  const [overlay, setOverlay] = useState<Overlay>(appStorage.hasSeenOnboarding() ? null : 'onboarding')
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [voteSet, setVoteSet] = useState<Set<string>>(new Set())
  const [guessDialogOpen, setGuessDialogOpen] = useState(false)
  const [guessDialogOrigin, setGuessDialogOrigin] = useState<'round' | 'voting'>('round')
  const [guessError, setGuessError] = useState('')

  useEffect(() => {
    loadWords().then(({ categories, wordsByCategory }) => {
      setCategories(categories)
      setWordsByCategory(wordsByCategory)
    })
  }, [])

  useEffect(() => {
    appStorage.saveTheme(themeKey)
  }, [themeKey])

  useEffect(() => {
    appStorage.saveSettings(state.settings)
  }, [state.settings])

  useEffect(() => {
    if (state.phase === 'GAME_ROUND') {
      setTimerSeconds(state.settings.roundDurationSeconds)
      setTimerRunning(true)
    }
  }, [state.phase, state.settings.roundDurationSeconds])

  useEffect(() => {
    if (!timerRunning || state.phase !== 'GAME_ROUND') return
    if (timerSeconds <= 0) {
      setTimerRunning(false)
      setState((prev) => ({ ...prev, phase: 'VOTING' }))
      return
    }

    const handle = setTimeout(() => setTimerSeconds((prev) => prev - 1), 1000)
    return () => clearTimeout(handle)
  }, [timerRunning, timerSeconds, state.phase])

  const winners = useMemo(() => getWinners(state), [state])

  const addPlayer = (name: string): { ok: boolean; message?: string } => {
    const trimmed = name.trim()
    if (trimmed.length === 0) return { ok: false, message: 'Wpisz imię gracza' }
    if (trimmed.length > MAX_PLAYER_NAME_LENGTH) {
      return { ok: false, message: `Imię może mieć maksymalnie ${MAX_PLAYER_NAME_LENGTH} znaków` }
    }
    if (state.players.length >= 12) return { ok: false, message: 'Maksymalnie 12 graczy' }
    if (state.players.some((p) => p.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase())) {
      return { ok: false, message: 'Gracz o tym imieniu już istnieje' }
    }

    const player: Player = {
      id: crypto.randomUUID(),
      name: trimmed,
      score: 0,
      avatarEmoji: nextAvatarEmoji(state.players),
    }

    const players = [...state.players, player]
    setState((prev) => ({
      ...prev,
      players,
      settings: {
        ...prev.settings,
        impostorCount: Math.min(prev.settings.impostorCount, Math.max(1, players.length - 2)),
      },
    }))
    appStorage.savePlayers(players)
    return { ok: true }
  }

  const removePlayer = (id: string) => {
    setState((prev) => {
      const players = prev.players.filter((p) => p.id !== id)
      appStorage.savePlayers(players)
      return {
        ...prev,
        players,
        settings: {
          ...prev.settings,
          impostorCount: Math.min(prev.settings.impostorCount, Math.max(1, players.length - 2)),
        },
      }
    })
  }

  const removeAllPlayers = () => {
    if (!window.confirm('Usunąć wszystkich graczy?')) return
    setState((prev) => ({ ...prev, players: [] }))
    appStorage.savePlayers([])
  }

  const updateSettings = (next: Partial<GameSettings>) => {
    setState((prev) => {
      const maxImpostors = Math.max(1, prev.players.length - 2)
      const merged = { ...prev.settings, ...next }
      merged.impostorCount = Math.max(1, Math.min(maxImpostors, merged.impostorCount))
      merged.pointsToWin = Math.max(3, Math.min(20, merged.pointsToWin))
      return { ...prev, settings: merged }
    })
  }

  const beginRoundFlow = () => {
    setState((prev) => startRound(prev, wordsByCategory))
  }

  const submitGuess = (playerId: string, isCorrect: boolean) => {
    setState((prev) => {
      const { nextState, accepted, error } = handleImpostorGuess(prev, playerId, isCorrect)
      if (!accepted) {
        setGuessError(error ?? 'Nie można zatwierdzić zgadywania.')
        return prev
      }
      setGuessError('')
      setGuessDialogOpen(false)
      setTimerRunning(false)
      return nextState
    })
  }

  const openGuessDialog = (origin: 'round' | 'voting') => {
    setGuessDialogOrigin(origin)
    setGuessError('')
    setGuessDialogOpen(true)
    if (origin === 'round') setTimerRunning(false)
  }

  const closeGuessDialog = () => {
    setGuessDialogOpen(false)
    setGuessError('')
    if (guessDialogOrigin === 'round' && state.phase === 'GAME_ROUND') {
      setTimerRunning(true)
    }
  }

  const phaseContent = () => {
    if (overlay === 'onboarding') {
      return (
        <OnboardingScreen
          theme={theme}
          themeKey={themeKey}
          onThemeChange={setThemeKey}
          onInfo={() => {}}
          onFinish={() => {
            appStorage.markOnboardingSeen()
            setOverlay(null)
          }}
        />
      )
    }

    switch (state.phase) {
      case 'SETUP_PLAYERS':
        return (
          <PlayersScreen
            theme={theme}
            themeKey={themeKey}
            onThemeChange={setThemeKey}
            onInfo={() => setOverlay('onboarding')}
            state={state}
            onAddPlayer={addPlayer}
            onRemovePlayer={removePlayer}
            onRemoveAllPlayers={removeAllPlayers}
            onNext={() => setState((prev) => ({ ...prev, phase: 'SETUP_CATEGORIES' }))}
          />
        )
      case 'SETUP_CATEGORIES':
        return (
          <CategorySelectionScreen
            theme={theme}
            themeKey={themeKey}
            onThemeChange={setThemeKey}
            onInfo={() => setOverlay('onboarding')}
            state={state}
            categories={categories}
            onToggle={(id) =>
              setState((prev) => {
                const selected = new Set(prev.selectedCategoryIds)
                if (selected.has(id)) selected.delete(id)
                else selected.add(id)
                return { ...prev, selectedCategoryIds: selected }
              })
            }
            onSelectAll={() => setState((prev) => ({ ...prev, selectedCategoryIds: new Set(categories.map((c) => c.id)) }))}
            onClearAll={() => setState((prev) => ({ ...prev, selectedCategoryIds: new Set() }))}
            onBack={() => setState((prev) => ({ ...prev, phase: 'SETUP_PLAYERS' }))}
            onNext={() => setState((prev) => ({ ...prev, phase: 'SETUP_SETTINGS' }))}
          />
        )
      case 'SETUP_SETTINGS':
        return (
          <GameSettingsScreen
            theme={theme}
            themeKey={themeKey}
            onThemeChange={setThemeKey}
            onInfo={() => setOverlay('onboarding')}
            state={state}
            onBack={() => setState((prev) => ({ ...prev, phase: 'SETUP_CATEGORIES' }))}
            onUpdateSettings={updateSettings}
            onStartRound={beginRoundFlow}
          />
        )
      case 'PASS_PHONE':
        return (
          <PassPhoneScreen
            theme={theme}
            themeKey={themeKey}
            onThemeChange={setThemeKey}
            onInfo={() => setOverlay('onboarding')}
            state={state}
            onConfirm={() => setState((prev) => ({ ...prev, phase: 'REVEAL_ROLE' }))}
            onExit={() => setState((prev) => exitToStart(prev))}
          />
        )
      case 'REVEAL_ROLE':
        return (
          <RevealRoleScreen
            theme={theme}
            themeKey={themeKey}
            onThemeChange={setThemeKey}
            onInfo={() => setOverlay('onboarding')}
            state={state}
            onContinue={() =>
              setState((prev) => {
                const nextIndex = prev.currentRevealIndex + 1
                if (nextIndex >= prev.players.length) {
                  return { ...prev, currentRevealIndex: nextIndex, phase: 'READY_TO_START' }
                }
                return { ...prev, currentRevealIndex: nextIndex, phase: 'PASS_PHONE' }
              })
            }
            onExit={() => setState((prev) => exitToStart(prev))}
          />
        )
      case 'READY_TO_START':
        return (
          <ReadyToStartScreen
            theme={theme}
            themeKey={themeKey}
            onThemeChange={setThemeKey}
            onInfo={() => setOverlay('onboarding')}
            onStart={() =>
              setState((prev) => ({
                ...prev,
                startingPlayer: drawStartingPlayer(prev.players),
                phase: 'GAME_ROUND',
              }))
            }
            onExit={() => setState((prev) => exitToStart(prev))}
          />
        )
      case 'GAME_ROUND':
        return (
          <RoundScreen
            theme={theme}
            themeKey={themeKey}
            onThemeChange={setThemeKey}
            onInfo={() => {
              setTimerRunning(false)
              setOverlay('onboarding')
            }}
            state={state}
            timerSeconds={timerSeconds}
            onOpenGuess={() => openGuessDialog('round')}
            onEndRound={() => {
              setTimerRunning(false)
              setState((prev) => ({ ...prev, phase: 'VOTING' }))
            }}
            onForceEnd={() => {
              setTimerRunning(false)
              setState((prev) => ({ ...prev, phase: 'GAME_OVER' }))
            }}
            onExit={() => {
              setTimerRunning(false)
              setState((prev) => exitToStart(prev))
            }}
          />
        )
      case 'VOTING':
        return (
          <VotingScreen
            theme={theme}
            themeKey={themeKey}
            onThemeChange={setThemeKey}
            onInfo={() => setOverlay('onboarding')}
            state={state}
            voteSet={voteSet}
            onToggleVote={(id) =>
              setVoteSet((prev) => {
                const next = new Set(prev)
                if (next.has(id)) next.delete(id)
                else if (next.size < state.settings.impostorCount) next.add(id)
                return next
              })
            }
            onSubmitVotes={() => {
              setState((prev) => submitVotes(prev, voteSet))
              setVoteSet(new Set())
            }}
            onOpenGuess={() => openGuessDialog('voting')}
            onExit={() => setState((prev) => exitToStart(prev))}
          />
        )
      case 'ROUND_RESULT':
        return (
          <RoundResultScreen
            theme={theme}
            themeKey={themeKey}
            onThemeChange={setThemeKey}
            onInfo={() => setOverlay('onboarding')}
            state={state}
            onNextRound={() => setState((prev) => goToNextRound(prev, wordsByCategory))}
            onExit={() => setState((prev) => exitToStart(prev))}
          />
        )
      case 'GAME_OVER':
        return (
          <GameOverScreen
            theme={theme}
            themeKey={themeKey}
            onThemeChange={setThemeKey}
            onInfo={() => setOverlay('onboarding')}
            state={state}
            winners={winners}
            onPlayAgain={() => setState((prev) => ({ ...resetGameKeepPlayers(prev), phase: 'SETUP_CATEGORIES' }))}
            onNewGame={() => setState((prev) => ({ ...resetGameKeepPlayers(prev), phase: 'SETUP_PLAYERS' }))}
          />
        )
      default:
        return null
    }
  }

  useEffect(() => {
    if (state.phase === 'SETUP_PLAYERS') {
      appStorage.savePlayers(state.players)
    }
  }, [state.players, state.phase])

  return (
    <AppBackground theme={theme}>
      {phaseContent()}
      <ImpostorGuessDialog
        open={guessDialogOpen}
        theme={theme}
        players={state.players}
        dismissText={guessDialogOrigin === 'round' ? '← Wróć do gry' : '← Wróć do głosowania'}
        error={guessError}
        onDismiss={closeGuessDialog}
        onSubmit={submitGuess}
      />
    </AppBackground>
  )
}

export default App
