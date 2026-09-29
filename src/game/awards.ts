// Nagrody na koniec gry (Android: game/Awards.kt). Liczone z wyników wszystkich rund.

import type { Player, RoundResult } from './types'

export type AwardId = 'detective' | 'camouflage' | 'seer' | 'blunder'

export type Award = {
  id: AwardId
  emoji: string
  title: string
  description: string
  winners: Player[]
  /** Wartość, za którą przyznano nagrodę (np. liczba ucieczek). */
  value: number
  unit: 'pkt' | 'razy'
}

const isGuess = (r: RoundResult) =>
  r.resultType === 'IMPOSTOR_GUESSED_CORRECTLY' || r.resultType === 'IMPOSTOR_GUESSED_INCORRECTLY'

const isImpostor = (r: RoundResult, id: string) => r.impostors.some((p) => p.id === id)

export function computeAwards(players: Player[], rounds: RoundResult[]): Award[] {
  const tally = (score: (r: RoundResult, p: Player) => number) =>
    new Map(players.map((p) => [p.id, rounds.reduce((sum, r) => sum + score(r, p), 0)]))

  const specs: Array<Omit<Award, 'winners' | 'value'> & { values: Map<string, number> }> = [
    {
      id: 'detective',
      emoji: '🕵️',
      title: 'Najlepszy detektyw',
      description: 'Najwięcej punktów za wykrywanie Reproduktorów',
      unit: 'pkt',
      values: tally((r, p) => (!isImpostor(r, p.id) && !isGuess(r) ? Math.max(0, r.pointsDelta[p.id] ?? 0) : 0)),
    },
    {
      id: 'camouflage',
      emoji: '🥷',
      title: 'Mistrz kamuflażu',
      description: 'Najczęściej uciekł jako Reproduktor',
      unit: 'razy',
      values: tally((r, p) => (isImpostor(r, p.id) && !isGuess(r) && (r.pointsDelta[p.id] ?? 0) > 0 ? 1 : 0)),
    },
    {
      id: 'seer',
      emoji: '🔮',
      title: 'Jasnowidz',
      description: 'Najczęściej odgadł tajne hasło',
      unit: 'razy',
      values: tally((r, p) => (r.resultType === 'IMPOSTOR_GUESSED_CORRECTLY' && r.guessedPlayers.some((g) => g.id === p.id) ? 1 : 0)),
    },
    {
      id: 'blunder',
      emoji: '🙈',
      title: 'Wpadka roku',
      description: 'Najczęściej przyłapany jako Reproduktor',
      unit: 'razy',
      values: tally((r, p) => (isImpostor(r, p.id) && !isGuess(r) && (r.pointsDelta[p.id] ?? 0) === 0 ? 1 : 0)),
    },
  ]

  return specs.flatMap(({ values, ...spec }) => {
    const max = Math.max(0, ...values.values())
    if (max <= 0) return []
    return [{ ...spec, value: max, winners: players.filter((p) => values.get(p.id) === max) }]
  })
}
