import { DEFAULT_STATE, type GameState, type Player, type SecretWord } from './types'
import { pickWord } from './wordPicker'

const AVATARS = ['??','??','??','??','??','??','??','??','??','??','??','??']
const MIN_HINT_HISTORY_SIZE = 6
const MAX_HINT_HISTORY_SIZE = 24

export const freshState = (players: Player[] = []): GameState => ({ ...DEFAULT_STATE, players })
export const nextAvatar = (used: string[]) => AVATARS.find((a) => !used.includes(a)) ?? AVATARS[Math.floor(Math.random() * AVATARS.length)]

export function prepareRound(state: GameState, wordsByCategory: Record<string, SecretWord[]>): GameState {
  const word = pickWord(state.selectedCategoryIds, state.usedWordIds, wordsByCategory)
  if (!word) return state
  const impostorIds = new Set(state.players.map((p) => p.id).sort(() => Math.random() - 0.5).slice(0, state.settings.impostorCount))
  const hints = assignHints(word, impostorIds, state.recentHintsHistory)
  const recentHintsHistory = [...state.recentHintsHistory, ...Object.values(hints)].slice(-historySizeFor(state.settings.impostorCount))
  return { ...state, currentSecretWord: word, currentImpostorIds: impostorIds, currentImpostorHints: hints, recentHintsHistory, currentRevealIndex: 0, phase: 'PASS_PHONE', usedWordIds: new Set([...state.usedWordIds, word.id]) }
}

export function winners(state: GameState) { return state.players.filter((p) => p.score >= state.settings.pointsToWin) }

function historySizeFor(impostors: number) { return Math.max(MIN_HINT_HISTORY_SIZE, Math.min(MAX_HINT_HISTORY_SIZE, impostors * 4)) }
function norm(v: string) { return v.trim().toLocaleLowerCase() }

function assignHints(word: SecretWord, impostorIds: Set<string>, history: string[]) {
  const uniqueHints = [...new Set((word.hints ?? []).map((h) => h.trim()).filter(Boolean).map((h) => `${h}|${norm(h)}`))].map((v) => v.split('|')[0])
  const historyKeys = new Set(history.map(norm))
  const assigned = new Set<string>()
  const result: Record<string, string> = {}
  for (const id of [...impostorIds].sort(() => Math.random() - 0.5)) {
    const base = uniqueHints.filter((h) => !assigned.has(norm(h)))
    const fresh = base.filter((h) => !historyKeys.has(norm(h)))
    const pick = (fresh[0] ?? base[0] ?? uniqueHints[0] ?? '')
    result[id] = pick
    assigned.add(norm(pick))
  }
  return result
}

