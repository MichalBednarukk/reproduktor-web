// Odpowiednik PlayerStorage / OnboardingStorage / AppSettingsStorage z Androida.
// Jak na Androidzie: zapisujemy tylko graczy (imię + avatar), motyw i flagę onboardingu.
// Ustawienia gry NIE są zapamiętywane (Android też ich nie zapisuje).

import type { AppThemeKey } from '../theme/themes'
import type { Player } from '../game/types'

const KEYS = {
  players: 'reproduktor.players',
  theme: 'reproduktor.theme',
  onboardingSeen: 'reproduktor.onboarding.seen',
} as const

type SavedPlayer = { name: string; avatarEmoji: string }

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // tryb prywatny / zablokowany storage — gra działa dalej bez zapisu
  }
}

export const appStorage = {
  savePlayers(players: Player[]) {
    const saved: SavedPlayer[] = players.map((p) => ({ name: p.name, avatarEmoji: p.avatarEmoji }))
    write(KEYS.players, JSON.stringify(saved))
  },

  /** Każdy gracz dostaje nowe id i score = 0 (jak PlayerStorage.loadPlayers). */
  loadPlayers(): Player[] {
    try {
      const parsed = JSON.parse(read(KEYS.players) ?? '[]') as SavedPlayer[]
      if (!Array.isArray(parsed)) return []
      return parsed
        .filter((p) => typeof p?.name === 'string' && typeof p?.avatarEmoji === 'string' && p.name.trim())
        .map((p) => ({ id: crypto.randomUUID(), name: p.name, avatarEmoji: p.avatarEmoji, score: 0 }))
    } catch {
      return []
    }
  },

  clearPlayers() {
    write(KEYS.players, null)
  },

  loadTheme: (): string | null => read(KEYS.theme),
  saveTheme: (theme: AppThemeKey) => write(KEYS.theme, theme),

  hasSeenOnboarding: () => read(KEYS.onboardingSeen) === '1',
  markOnboardingSeen: () => write(KEYS.onboardingSeen, '1'),
}
