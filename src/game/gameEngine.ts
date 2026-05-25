import { DEFAULT_STATE, type GameSettings, type GameState, type Player, type RoundResult, type SecretWord } from './types'
import { pickWord } from './wordPicker'
import { scoreImpostorGuess, scoreVotes } from './scoring'

const MIN_HINT_HISTORY_SIZE = 6
const MAX_HINT_HISTORY_SIZE = 24

export const AVATAR_POOL = ['😀', '😎', '🤠', '🥳', '🤓', '😇', '🤩', '😈', '👻', '🤖', '🐽', '🦊']

export function createInitialState(players: Player[] = [], settings: GameSettings = DEFAULT_STATE.settings): GameState {
  return {
    ...DEFAULT_STATE,
    players,
    settings,
  }
}

export function nextAvatarEmoji(players: Player[]): string {
  const used = new Set(players.map((p) => p.avatarEmoji))
  const available = AVATAR_POOL.filter((emoji) => !used.has(emoji))
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)]
  }
  return AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)]
}

const normalizeHint = (hint: string) => hint.trim().toLocaleLowerCase()

const uniqueRuntimeHints = (word: SecretWord): string[] => {
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of word.hints ?? []) {
    const cleaned = raw.trim()
    if (!cleaned) continue
    const key = normalizeHint(cleaned)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(cleaned)
  }
  return result
}

const historySizeFor = (impostorCount: number): number =>
  Math.max(MIN_HINT_HISTORY_SIZE, Math.min(MAX_HINT_HISTORY_SIZE, impostorCount * 4))

const assignHintsForImpostors = (
  word: SecretWord,
  impostorIds: Set<string>,
  state: GameState,
): Record<string, string> => {
  if (impostorIds.size === 0) return {}

  const hints = uniqueRuntimeHints(word)
  if (hints.length === 0) {
    return Object.fromEntries([...impostorIds].map((id) => [id, '']))
  }

  const history = new Set(state.recentHintsHistory.map(normalizeHint))
  const assigned = new Set<string>()
  const entries: Array<[string, string]> = []

  const shuffledIds = [...impostorIds].sort(() => Math.random() - 0.5)
  for (const id of shuffledIds) {
    const basePool = hints.filter((h) => !assigned.has(normalizeHint(h)))
    const freshPool = basePool.filter((h) => !history.has(normalizeHint(h)))

    const selected =
      freshPool[Math.floor(Math.random() * freshPool.length)] ??
      basePool[Math.floor(Math.random() * basePool.length)] ??
      hints[Math.floor(Math.random() * hints.length)]

    assigned.add(normalizeHint(selected))
    entries.push([id, selected])
  }

  return Object.fromEntries(entries)
}

const updateHintHistory = (state: GameState, hints: string[]): string[] => {
  const additions = hints.map((h) => h.trim()).filter(Boolean)
  if (additions.length === 0) return state.recentHintsHistory
  return [...state.recentHintsHistory, ...additions].slice(-historySizeFor(state.settings.impostorCount))
}

const pickImpostors = (players: Player[], impostorCount: number): Set<string> =>
  new Set(players.slice().sort(() => Math.random() - 0.5).slice(0, impostorCount).map((p) => p.id))

export function startRound(
  state: GameState,
  wordsByCategory: Record<string, SecretWord[]>,
): GameState {
  const word = pickWord(state.selectedCategoryIds, state.usedWordIds, wordsByCategory)
  if (!word) return state

  const impostors = pickImpostors(state.players, state.settings.impostorCount)
  const hints = assignHintsForImpostors(word, impostors, state)

  return {
    ...state,
    currentSecretWord: word,
    currentImpostorIds: impostors,
    currentImpostorHints: hints,
    recentHintsHistory: updateHintHistory(state, Object.values(hints)),
    currentRevealIndex: 0,
    phase: 'PASS_PHONE',
    usedWordIds: new Set([...state.usedWordIds, word.id]),
  }
}

export function goToNextRound(
  state: GameState,
  wordsByCategory: Record<string, SecretWord[]>,
): GameState {
  if (getWinners(state).length > 0) {
    return { ...state, phase: 'GAME_OVER' }
  }

  const started = startRound({ ...state, roundNumber: state.roundNumber + 1, lastRoundResult: null }, wordsByCategory)
  return started
}

export function drawStartingPlayer(players: Player[]): Player | null {
  if (players.length === 0) return null
  return players[Math.floor(Math.random() * players.length)]
}

export function submitVotes(state: GameState, selected: Set<string>): GameState {
  if (!state.currentSecretWord) return state
  const { players, result } = scoreVotes(state.players, state.currentImpostorIds, selected, state.currentSecretWord)
  return {
    ...state,
    players,
    lastRoundResult: result,
    phase: 'ROUND_RESULT',
  }
}

export function handleImpostorGuess(
  state: GameState,
  playerId: string,
  isCorrect: boolean,
): { nextState: GameState; accepted: boolean; error?: string } {
  const player = state.players.find((p) => p.id === playerId)
  if (!player) {
    return { nextState: state, accepted: false, error: 'Nie znaleziono gracza.' }
  }
  if (!state.currentImpostorIds.has(playerId)) {
    return {
      nextState: state,
      accepted: false,
      error: `${player.name} nie jest Reproduktorem.`,
    }
  }
  if (!state.currentSecretWord) {
    return { nextState: state, accepted: false, error: 'Brak aktywnego hasła.' }
  }

  const { players, result } = scoreImpostorGuess(state.players, state.currentImpostorIds, playerId, isCorrect, state.currentSecretWord)
  return {
    accepted: true,
    nextState: {
      ...state,
      players,
      lastRoundResult: result,
      phase: 'ROUND_RESULT',
    },
  }
}

export function getWinners(state: GameState): Player[] {
  return state.players.filter((p) => p.score >= state.settings.pointsToWin)
}

export function exitToStart(state: GameState): GameState {
  return {
    ...createInitialState(state.players.map((p) => ({ ...p, score: 0 })), state.settings),
    selectedCategoryIds: new Set(state.selectedCategoryIds),
  }
}

export function resetGameKeepPlayers(state: GameState): GameState {
  return createInitialState(state.players.map((p) => ({ ...p, score: 0 })), state.settings)
}

export function resetEverything(): GameState {
  return createInitialState()
}

export function updateStateWithRoundResult(state: GameState, result: RoundResult): GameState {
  return { ...state, lastRoundResult: result, phase: 'ROUND_RESULT' }
}
