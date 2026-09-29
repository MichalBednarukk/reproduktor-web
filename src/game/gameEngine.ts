// Czyste funkcje odwzorowujące GameViewModel.kt (Android).
// Timer żyje w useGame.ts — tutaj tylko przejścia stanu.

import { CHARACTER_IDS } from '../avatars/characters'
import { DEFAULT_STATE, type GameSettings, type GameState, type Player, type SecretWord } from './types'
import { pickWord } from './wordPicker'
import { scoreImpostorGuess, scoreVotes } from './scoring'

const MIN_HINT_HISTORY_SIZE = 6
const MAX_HINT_HISTORY_SIZE = 24

export const MAX_PLAYERS = 12
export const MIN_PLAYERS = 3
export const MAX_PLAYER_NAME_LENGTH = 30

export const AVATAR_POOL = ['😀', '😎', '🤠', '🥳', '🤓', '😇', '🤩', '😈', '👻', '🤖', '🐼', '🦊']

export const ROUND_DURATIONS = [
  60, 120, 180, 300, 360, 420, 480, 540, 600, 660,
  720, 780, 840, 900, 960, 1020, 1080, 1140, 1200,
]

export function shuffled<T>(items: readonly T[]): T[] {
  const result = items.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const randomOf = <T,>(items: readonly T[]): T | undefined =>
  items.length > 0 ? items[Math.floor(Math.random() * items.length)] : undefined

export function createInitialState(players: Player[] = []): GameState {
  return { ...DEFAULT_STATE, players }
}

const maxImpostorsFor = (playerCount: number) => Math.max(1, playerCount - 2)

// ── Gracze ────────────────────────────────────────────────────────────────────

/**
 * Avatar dla nowego gracza. Najpierw wolne postacie (animowane, z AVATAR/), potem wolne emotki.
 * Pole Player.avatarEmoji przechowuje id postaci (np. „pierozek”) albo emotkę.
 */
export function nextAvatarEmoji(players: Player[]): string {
  const used = new Set(players.map((p) => p.avatarEmoji))
  return (
    randomOf(CHARACTER_IDS.filter((c) => !used.has(c))) ??
    randomOf(AVATAR_POOL.filter((e) => !used.has(e))) ??
    randomOf(AVATAR_POOL)!
  )
}

export function addPlayer(state: GameState, name: string): GameState | null {
  const trimmed = name.trim()
  if (!trimmed) return null
  if (state.players.length >= MAX_PLAYERS) return null
  if (state.players.some((p) => p.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase())) return null
  const player: Player = {
    id: crypto.randomUUID(),
    name: trimmed,
    score: 0,
    avatarEmoji: nextAvatarEmoji(state.players),
  }
  return { ...state, players: [...state.players, player] }
}

export function removePlayer(state: GameState, playerId: string): GameState {
  const players = state.players.filter((p) => p.id !== playerId)
  return {
    ...state,
    players,
    settings: {
      ...state.settings,
      impostorCount: Math.min(state.settings.impostorCount, maxImpostorsFor(players.length)),
    },
  }
}

// ── Ustawienia ────────────────────────────────────────────────────────────────

export function updateSettings(state: GameState, next: Partial<GameSettings>): GameState {
  const merged = { ...state.settings, ...next }
  merged.impostorCount = Math.max(1, Math.min(maxImpostorsFor(state.players.length), merged.impostorCount))
  merged.pointsToWin = Math.max(3, Math.min(20, merged.pointsToWin))
  return { ...state, settings: merged }
}

// ── Losowanie ─────────────────────────────────────────────────────────────────

const normalizeHint = (hint: string) => hint.trim().toLocaleLowerCase()

function uniqueRuntimeHints(word: SecretWord): string[] {
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

const historySizeFor = (impostorCount: number) =>
  Math.max(MIN_HINT_HISTORY_SIZE, Math.min(MAX_HINT_HISTORY_SIZE, impostorCount * 4))

function assignHintsForImpostors(word: SecretWord, impostorIds: Set<string>, state: GameState): Record<string, string> {
  if (impostorIds.size === 0) return {}
  const hints = uniqueRuntimeHints(word)
  if (hints.length === 0) return Object.fromEntries([...impostorIds].map((id) => [id, '']))

  const history = new Set(state.recentHintsHistory.map(normalizeHint))
  const assigned = new Set<string>()
  const result: Record<string, string> = {}

  for (const id of shuffled([...impostorIds])) {
    const basePool = hints.filter((h) => !assigned.has(normalizeHint(h)))
    const freshPool = basePool.filter((h) => !history.has(normalizeHint(h)))
    const selected = randomOf(freshPool) ?? randomOf(basePool) ?? randomOf(hints)!
    result[id] = selected
    assigned.add(normalizeHint(selected))
  }
  return result
}

function updateHintHistory(state: GameState, usedHints: string[]): string[] {
  const additions = usedHints.map((h) => h.trim()).filter(Boolean)
  if (additions.length === 0) return state.recentHintsHistory
  return [...state.recentHintsHistory, ...additions].slice(-historySizeFor(state.settings.impostorCount))
}

const pickImpostors = (state: GameState): Set<string> =>
  new Set(shuffled(state.players).slice(0, state.settings.impostorCount).map((p) => p.id))

/** Losuje hasło i role; null gdy brak haseł w wybranych kategoriach. */
function drawRound(state: GameState, wordsByCategory: Record<string, SecretWord[]>): GameState | null {
  const word = pickWord(state.selectedCategoryIds, state.usedWordIds, wordsByCategory)
  if (!word) return null
  const impostors = pickImpostors(state)
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

export function startRound(state: GameState, wordsByCategory: Record<string, SecretWord[]>): GameState {
  return drawRound(state, wordsByCategory) ?? state
}

// ── Odkrywanie ról ────────────────────────────────────────────────────────────

export function revealAndContinue(state: GameState): GameState {
  const next = state.currentRevealIndex + 1
  return { ...state, currentRevealIndex: next, phase: next >= state.players.length ? 'READY_TO_START' : 'PASS_PHONE' }
}

/** Losuje gracza, który zaczyna rundę — może to być dowolny gracz (bez rotacji). */
export function startGameRound(state: GameState): GameState {
  return { ...state, startingPlayer: randomOf(state.players) ?? null, phase: 'GAME_ROUND' }
}

// ── Wyniki ────────────────────────────────────────────────────────────────────

export function submitVotes(state: GameState, selected: Set<string>): GameState {
  if (!state.currentSecretWord) return state
  const { players, result } = scoreVotes(state.players, state.currentImpostorIds, selected, state.currentSecretWord)
  return { ...state, players, lastRoundResult: result, phase: 'ROUND_RESULT' }
}

/** null = wybrany gracz nie jest Reproduktorem (UI pokazuje błąd). */
export function handleImpostorGuess(state: GameState, playerId: string, isCorrect: boolean): GameState | null {
  if (!state.players.some((p) => p.id === playerId)) return null
  if (!state.currentImpostorIds.has(playerId) || !state.currentSecretWord) return null
  const { players, result } = scoreImpostorGuess(
    state.players,
    state.currentImpostorIds,
    playerId,
    isCorrect,
    state.currentSecretWord,
  )
  return { ...state, players, lastRoundResult: result, phase: 'ROUND_RESULT' }
}

export const getWinners = (state: GameState): Player[] =>
  state.players.filter((p) => p.score >= state.settings.pointsToWin)

export function goToNextRound(state: GameState, wordsByCategory: Record<string, SecretWord[]>): GameState {
  if (getWinners(state).length > 0) return { ...state, phase: 'GAME_OVER' }
  const next = drawRound(state, wordsByCategory)
  if (!next) return state
  return { ...next, roundNumber: state.roundNumber + 1, lastRoundResult: null }
}

// ── Reset ─────────────────────────────────────────────────────────────────────

/** „Zagraj ponownie” / „Nowa gra”: gracze zostają z zerowymi punktami, kategorie czyszczone. */
export function resetGameKeepPlayers(state: GameState): GameState {
  return { ...createInitialState(state.players.map((p) => ({ ...p, score: 0 }))), settings: state.settings }
}

/** Wyjście z gry (✕): jak wyżej, ale zachowuje wybrane kategorie. */
export function exitToStart(state: GameState): GameState {
  return { ...resetGameKeepPlayers(state), selectedCategoryIds: new Set(state.selectedCategoryIds) }
}
