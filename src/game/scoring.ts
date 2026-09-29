// Zasady punktacji 1:1 z Androida: app/src/main/java/com/example/reproduktor/game/Scoring.kt
//
// Głosowanie (grupa zaznacza tylu graczy, ilu jest Reproduktorów):
//  - niewykryty Reproduktor: +2, wykryty: 0
//  - zwykli gracze niewskazani przez grupę: wszyscy Reproduktorzy wykryci +1,
//    co najmniej połowa (ale nie wszyscy) +0,5, mniej niż połowa 0
//  - zwykły gracz niesłusznie wskazany jako Reproduktor: zawsze 0
// Zgadywanie hasła (kończy rundę bez głosowania):
//  - trafił: zgadujący +2, wszyscy pozostali 0
//  - pudło: zgadujący −1, zwykli gracze +1, pozostali Reproduktorzy 0

import type { Player, ResultType, RoundResult, SecretWord } from './types'

export const SCORING = {
  IMPOSTOR_ESCAPED: 2,
  ALL_IMPOSTORS_CAUGHT: 1,
  HALF_IMPOSTORS_CAUGHT: 0.5,
  GUESS_HIT: 2,
  GUESS_MISS: -1,
  GUESS_MISS_CREW: 1,
} as const

const applyDelta = (players: Player[], delta: Record<string, number>) =>
  players.map((p) => ({ ...p, score: p.score + (delta[p.id] ?? 0) }))

export function scoreVotes(
  players: Player[],
  impostorIds: Set<string>,
  selectedIds: Set<string>,
  secretWord: SecretWord,
): { players: Player[]; result: RoundResult } {
  const total = impostorIds.size
  const caught = [...impostorIds].filter((id) => selectedIds.has(id)).length

  let crewPoints = 0
  if (total > 0 && caught === total) crewPoints = SCORING.ALL_IMPOSTORS_CAUGHT
  else if (caught > 0 && caught * 2 >= total) crewPoints = SCORING.HALF_IMPOSTORS_CAUGHT

  const delta: Record<string, number> = {}
  for (const p of players) {
    if (impostorIds.has(p.id)) delta[p.id] = selectedIds.has(p.id) ? 0 : SCORING.IMPOSTOR_ESCAPED
    else if (selectedIds.has(p.id)) delta[p.id] = 0 // niesłusznie wskazany
    else delta[p.id] = crewPoints
  }

  let resultType: ResultType
  if (crewPoints === SCORING.ALL_IMPOSTORS_CAUGHT) resultType = 'IMPOSTORS_CAUGHT'
  else if (crewPoints === SCORING.HALF_IMPOSTORS_CAUGHT) resultType = 'IMPOSTORS_PARTIALLY_CAUGHT'
  else resultType = 'IMPOSTORS_ESCAPED'

  const single = total === 1
  let resultMessage: string
  if (resultType === 'IMPOSTORS_CAUGHT')
    resultMessage = single ? 'Gracze wykryli Reproduktora!' : 'Gracze wykryli wszystkich Reproduktorów!'
  else if (resultType === 'IMPOSTORS_PARTIALLY_CAUGHT') resultMessage = 'Gracze wykryli część Reproduktorów!'
  else if (single) resultMessage = 'Reproduktor uniknął wykrycia!'
  else if (caught > 0) resultMessage = 'Większość Reproduktorów uniknęła wykrycia!'
  else resultMessage = 'Reproduktorzy uniknęli wykrycia!'

  return {
    players: applyDelta(players, delta),
    result: {
      secretWord,
      impostors: players.filter((p) => impostorIds.has(p.id)),
      guessedPlayers: [],
      pointsDelta: delta,
      resultMessage,
      resultType,
    },
  }
}

export function scoreImpostorGuess(
  players: Player[],
  impostorIds: Set<string>,
  guesserId: string,
  isCorrect: boolean,
  secretWord: SecretWord,
): { players: Player[]; result: RoundResult } {
  const delta: Record<string, number> = {}
  for (const p of players) {
    if (p.id === guesserId) delta[p.id] = isCorrect ? SCORING.GUESS_HIT : SCORING.GUESS_MISS
    else if (impostorIds.has(p.id) || isCorrect) delta[p.id] = 0
    else delta[p.id] = SCORING.GUESS_MISS_CREW
  }

  const guesser = players.find((p) => p.id === guesserId)
  const name = guesser?.name ?? 'Reproduktor'

  return {
    players: applyDelta(players, delta),
    result: {
      secretWord,
      impostors: players.filter((p) => impostorIds.has(p.id)),
      guessedPlayers: guesser ? [guesser] : [],
      pointsDelta: delta,
      resultMessage: isCorrect
        ? `${name} poprawnie odgadł tajne słowo! 2\u00A0punkty za zgadywanie.`
        : `${name} nie trafił. Pudło! Zwykli gracze dostają po punkcie.`,
      resultType: isCorrect ? 'IMPOSTOR_GUESSED_CORRECTLY' : 'IMPOSTOR_GUESSED_INCORRECTLY',
    },
  }
}

/** „2”, „2,5”, „-1” — punkty zawsze są wielokrotnością 0,5. */
export function formatPoints(points: number): string {
  const halves = Math.round(points * 2)
  const whole = Math.floor(Math.abs(halves) / 2)
  const sign = halves < 0 ? '-' : ''
  return halves % 2 === 0 ? `${sign}${whole}` : `${sign}${whole},5`
}

/** „+1”, „+0,5”, „-1”, „±0” — zmiana punktów po rundzie. */
export function formatPointsDelta(delta: number): string {
  if (delta > 0) return `+${formatPoints(delta)}`
  if (delta < 0) return formatPoints(delta)
  return '±0'
}
