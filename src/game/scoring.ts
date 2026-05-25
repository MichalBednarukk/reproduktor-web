import type { Player, RoundResult, SecretWord } from './types'

export function scoreVotes(players: Player[], impostorIds: Set<string>, selectedPlayerIds: Set<string>, word: SecretWord): { players: Player[]; result: RoundResult } {
  const allCorrect = eqSet(impostorIds, selectedPlayerIds)
  const delta: Record<string, number> = {}
  for (const p of players) {
    delta[p.id] = allCorrect ? (impostorIds.has(p.id) ? 0 : 1) : (impostorIds.has(p.id) && !selectedPlayerIds.has(p.id) ? 1 : 0)
  }
  return {
    players: players.map((p) => ({ ...p, score: p.score + (delta[p.id] ?? 0) })),
    result: {
      secretWord: word,
      impostors: players.filter((p) => impostorIds.has(p.id)),
      guessedPlayers: [],
      pointsDelta: delta,
      resultMessage: allCorrect ? 'Gracze wykryli wszystkich Reproduktorów!' : 'Reproduktorzy uniknęli wykrycia!',
      resultType: allCorrect ? 'IMPOSTORS_CAUGHT' : 'IMPOSTORS_ESCAPED',
    },
  }
}

export function scoreImpostorGuess(players: Player[], impostorIds: Set<string>, guessedId: string, isCorrect: boolean, word: SecretWord): { players: Player[]; result: RoundResult } {
  const delta: Record<string, number> = Object.fromEntries(players.map((p) => [p.id, 0]))
  if (impostorIds.has(guessedId)) delta[guessedId] = isCorrect ? 1 : -1
  return {
    players: players.map((p) => ({ ...p, score: p.score + (delta[p.id] ?? 0) })),
    result: {
      secretWord: word,
      impostors: players.filter((p) => impostorIds.has(p.id)),
      guessedPlayers: players.filter((p) => p.id === guessedId),
      pointsDelta: delta,
      resultMessage: isCorrect ? 'Reproduktor poprawnie odgadł tajne słowo!' : 'Reproduktor nie trafił.',
      resultType: isCorrect ? 'IMPOSTOR_GUESSED_CORRECTLY' : 'IMPOSTOR_GUESSED_INCORRECTLY',
    },
  }
}

const eqSet = (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every((i) => b.has(i))

