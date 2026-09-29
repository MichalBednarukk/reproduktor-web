// Jaka mina dla którego gracza po rundzie. Odpowiednik ui/avatar/AvatarMoods.kt.

import type { RoundResult } from '../game/types'
import type { AvatarMood } from './characters'

export function resultMood(result: RoundResult, playerId: string): AvatarMood {
  const delta = result.pointsDelta[playerId] ?? 0
  const isImpostor = result.impostors.some((p) => p.id === playerId)
  const isGuess = result.resultType === 'IMPOSTOR_GUESSED_CORRECTLY' || result.resultType === 'IMPOSTOR_GUESSED_INCORRECTLY'

  if (isImpostor) {
    if (delta > 0) return 'win' // uciekł albo zgadł hasło
    if (delta < 0) return 'sad' // pudło przy zgadywaniu
    return isGuess ? 'idle' : 'caught' // wykryty w głosowaniu
  }
  if (delta > 0) return 'happy'
  return result.resultType === 'IMPOSTOR_GUESSED_CORRECTLY' || result.resultType === 'IMPOSTORS_ESCAPED' ? 'sad' : 'idle'
}
