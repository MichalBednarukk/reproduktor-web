// Odpowiednik GameViewModel.kt: trzyma stan gry, timer rundy i bazę haseł.
// Metody mają te same nazwy co w ViewModelu, żeby łatwo przenosić zmiany między platformami.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as engine from './gameEngine'
import type { Category, GameSettings, GameState, SecretWord } from './types'
import { loadWords } from './wordPicker'
import { appStorage } from '../storage/localStorage'

export type WordsStatus = 'loading' | 'ready' | 'error'

export function useGame() {
  const [state, setStateRaw] = useState<GameState>(() => engine.createInitialState(appStorage.loadPlayers()))
  const stateRef = useRef(state)

  /** Aktualizuje stan synchronicznie (jak MutableStateFlow), więc metody mogą zwracać wynik od razu. */
  const commit = useCallback((next: GameState) => {
    stateRef.current = next
    setStateRaw(next)
  }, [])

  // ── Baza haseł ────────────────────────────────────────────────────────────

  const [categories, setCategories] = useState<Category[]>([])
  const [wordsByCategory, setWordsByCategory] = useState<Record<string, SecretWord[]>>({})
  const [wordsStatus, setWordsStatus] = useState<WordsStatus>('loading')

  const fetchWords = useCallback(() => {
    loadWords()
      .then((data) => {
        setCategories(data.categories)
        setWordsByCategory(data.wordsByCategory)
        setWordsStatus('ready')
      })
      .catch(() => setWordsStatus('error'))
  }, [])

  useEffect(fetchWords, [fetchWords])

  const retryWords = useCallback(() => {
    setWordsStatus('loading')
    fetchWords()
  }, [fetchWords])

  // ── Timer ─────────────────────────────────────────────────────────────────
  // Liczymy od znacznika końca (deadline), więc throttling kart w tle nie spowalnia odliczania.

  const [timerSeconds, setTimerSeconds] = useState(0)
  const deadlineRef = useRef<number | null>(null)
  const remainingMsRef = useRef(0)

  const stopTimer = useCallback(() => {
    if (deadlineRef.current !== null) {
      remainingMsRef.current = Math.max(0, deadlineRef.current - Date.now())
    }
    deadlineRef.current = null
  }, [])

  const runTimer = useCallback((ms: number) => {
    remainingMsRef.current = ms
    deadlineRef.current = Date.now() + ms
    setTimerSeconds(Math.ceil(ms / 1000))
  }, [])

  useEffect(() => {
    const tick = () => {
      const deadline = deadlineRef.current
      if (deadline === null) return
      const left = deadline - Date.now()
      if (left <= 0) {
        deadlineRef.current = null
        remainingMsRef.current = 0
        setTimerSeconds(0)
        commit({ ...stateRef.current, phase: 'VOTING' })
      } else {
        setTimerSeconds(Math.ceil(left / 1000))
      }
    }
    const handle = window.setInterval(tick, 200)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(handle)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [commit])

  const pauseTimer = stopTimer

  const resumeTimer = useCallback(() => {
    if (deadlineRef.current !== null || remainingMsRef.current <= 0) return
    runTimer(remainingMsRef.current)
  }, [runTimer])

  // ── Metody jak w GameViewModel ────────────────────────────────────────────

  const actions = useMemo(() => {
    const get = () => stateRef.current
    const persistPlayers = (next: GameState) => appStorage.savePlayers(next.players)
    const setPhase = (phase: GameState['phase']) => commit({ ...get(), phase })

    return {
      addPlayer(name: string): boolean {
        const next = engine.addPlayer(get(), name)
        if (!next) return false
        commit(next)
        persistPlayers(next)
        return true
      },
      removePlayer(playerId: string) {
        const next = engine.removePlayer(get(), playerId)
        commit(next)
        persistPlayers(next)
      },
      movePlayer(from: number, to: number) {
        const next = engine.movePlayer(get(), from, to)
        commit(next)
        persistPlayers(next)
      },
      removeAllPlayers() {
        commit({ ...get(), players: [] })
        appStorage.clearPlayers()
      },

      goToPlayers: () => setPhase('SETUP_PLAYERS'),
      goToCategories: () => setPhase('SETUP_CATEGORIES'),
      goToSettings: () => setPhase('SETUP_SETTINGS'),

      toggleCategory(categoryId: string) {
        const selected = new Set(get().selectedCategoryIds)
        if (selected.has(categoryId)) selected.delete(categoryId)
        else selected.add(categoryId)
        commit({ ...get(), selectedCategoryIds: selected })
      },
      selectAllCategories: () => commit({ ...get(), selectedCategoryIds: new Set(categories.map((c) => c.id)) }),
      clearAllCategories: () => commit({ ...get(), selectedCategoryIds: new Set() }),

      updateSettings: (next: Partial<GameSettings>) => commit(engine.updateSettings(get(), next)),

      startRound: () => commit(engine.startRound(get(), wordsByCategory)),
      confirmPassPhone: () => setPhase('REVEAL_ROLE'),
      revealAndContinue: () => commit(engine.revealAndContinue(get())),

      startGameRound() {
        runTimer(get().settings.roundDurationSeconds * 1000)
        commit(engine.startGameRound(get()))
      },
      pauseTimer,
      resumeTimer,
      endRoundEarly() {
        stopTimer()
        setPhase('VOTING')
      },
      forceEndGame() {
        stopTimer()
        setPhase('GAME_OVER')
      },

      openImpostorGuess() {
        stopTimer()
        setPhase('IMPOSTOR_GUESS')
      },
      cancelImpostorGuess() {
        resumeTimer()
        setPhase('GAME_ROUND')
      },
      /** false = wybrany gracz nie jest Reproduktorem. */
      handleImpostorGuess(playerId: string, isCorrect: boolean): boolean {
        const next = engine.handleImpostorGuess(get(), playerId, isCorrect)
        if (!next) return false
        stopTimer()
        commit(next)
        return true
      },
      submitVotes: (selected: Set<string>) => commit(engine.submitVotes(get(), selected)),

      getWinners: () => engine.getWinners(get()),
      goToNextRound: () => commit(engine.goToNextRound(get(), wordsByCategory)),

      resetGameKeepPlayers() {
        stopTimer()
        const next = engine.resetGameKeepPlayers(get())
        commit(next)
        persistPlayers(next)
      },
      exitToStart() {
        stopTimer()
        const next = engine.exitToStart(get())
        commit(next)
        persistPlayers(next)
      },
    }
  }, [commit, categories, wordsByCategory, pauseTimer, resumeTimer, runTimer, stopTimer])

  return { state, timerSeconds, categories, wordsStatus, retryWords, ...actions }
}

export type Game = ReturnType<typeof useGame>
