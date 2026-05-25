import type { Player, RoundResult, SecretWord } from './types'

const setsEqual = (left: Set<string>, right: Set<string>): boolean =>
  left.size === right.size && [...left].every((v) => right.has(v))

export function scoreVotes(
  players: Player[],
  impostorIds: Set<string>,
  selectedPlayerIds: Set<string>,
  secretWord: SecretWord,
): { players: Player[]; result: RoundResult } {
  const allCorrect = setsEqual(selectedPlayerIds, impostorIds)
  const delta: Record<string, number> = {}

  if (allCorrect) {
    for (const p of players) {
      delta[p.id] = impostorIds.has(p.id) ? 0 : 1
    }
  } else {
    for (const p of players) {
      delta[p.id] = impostorIds.has(p.id) && !selectedPlayerIds.has(p.id) ? 1 : 0
    }
  }

  const updatedPlayers = players.map((p) => ({ ...p, score: p.score + (delta[p.id] ?? 0) }))

  return {
    players: updatedPlayers,
    result: {
      secretWord,
      impostors: players.filter((p) => impostorIds.has(p.id)),
      guessedPlayers: [],
      pointsDelta: delta,
      resultMessage: allCorrect
        ? 'Gracze wykryli wszystkich Reproduktorów!'
        : 'Reproduktorzy uniknęli wykrycia!',
      resultType: allCorrect ? 'IMPOSTORS_CAUGHT' : 'IMPOSTORS_ESCAPED',
    },
  }
}

export function scoreImpostorGuess(
  players: Player[],
  impostorIds: Set<string>,
  guessedPlayerId: string,
  isCorrect: boolean,
  secretWord: SecretWord,
): { players: Player[]; result: RoundResult } {
  const delta: Record<string, number> = {}
  for (const p of players) {
    delta[p.id] = 0
  }

  if (impostorIds.has(guessedPlayerId)) {
    delta[guessedPlayerId] = isCorrect ? 1 : -1
  }

  const updatedPlayers = players.map((p) => ({ ...p, score: p.score + (delta[p.id] ?? 0) }))
  const guessedPlayer = players.find((p) => p.id === guessedPlayerId)

  return {
    players: updatedPlayers,
    result: {
      secretWord,
      impostors: players.filter((p) => impostorIds.has(p.id)),
      guessedPlayers: guessedPlayer ? [guessedPlayer] : [],
      pointsDelta: delta,
      resultMessage: isCorrect
        ? `${guessedPlayer?.name ?? 'Reproduktor'} poprawnie odgadł tajne słowo! Punkt za zgadywanie.`
        : `${guessedPlayer?.name ?? 'Reproduktor'} nie trafił. Pudło!`,
      resultType: isCorrect
        ? 'IMPOSTOR_GUESSED_CORRECTLY'
        : 'IMPOSTOR_GUESSED_INCORRECTLY',
    },
  }
}
