// Losowanie z pamięcią — Reproduktorzy i osoba zaczynająca rundę (Android: game/FairDraw.kt).
//
// Nadal losowe i uczciwe, ale bez długich serii:
//  - kto był wybrany w ostatnich rundach pod rząd, ma mniejszą szansę (2 razy z rzędu — możliwe,
//    3 — rzadko, 4 — nigdy),
//  - kto długo nie był wybrany, ma szansę trochę większą.
// Użytkownik świadomie NIE chce znać tych zasad — nie opisywać ich w aplikacji ani w rozmowie.

const STREAK_FACTOR = [1, 0.5, 0.15, 0]
const WAIT_BONUS_PER_ROUND = 0.25
const MAX_WAIT_ROUNDS = 6

function weight(id: string, history: string[][]): number {
  let streak = 0
  for (let i = history.length - 1; i >= 0 && history[i].includes(id); i--) streak++
  let last = -1
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].includes(id)) {
      last = i
      break
    }
  }
  const waited = last < 0 ? history.length : history.length - 1 - last
  const bonus = 1 + WAIT_BONUS_PER_ROUND * Math.min(waited, MAX_WAIT_ROUNDS)
  return STREAK_FACTOR[Math.min(streak, STREAK_FACTOR.length - 1)] * bonus
}

/** Wybiera `count` różnych id. `history` — kolejne rundy (najstarsza pierwsza), w każdej id wybranych. */
export function fairPick(ids: string[], count: number, history: string[][], random: () => number = Math.random): string[] {
  const remaining = ids.slice()
  const chosen: string[] = []
  for (let n = 0; n < Math.min(count, ids.length); n++) {
    const weights = remaining.map((id) => weight(id, history))
    const total = weights.reduce((a, b) => a + b, 0)
    let index: number
    if (total <= 0) {
      index = Math.floor(random() * remaining.length)
    } else {
      let roll = random() * total
      index = 0
      while (index < remaining.length - 1 && roll >= weights[index]) {
        roll -= weights[index]
        index++
      }
    }
    chosen.push(remaining[index])
    remaining.splice(index, 1)
  }
  return chosen
}
