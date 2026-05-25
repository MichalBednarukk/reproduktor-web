import type { AppThemeKey, GameSettings, Player } from '../game/types'

const KEYS = {
  players: 'reproduktor.players',
  settings: 'reproduktor.settings',
  theme: 'reproduktor.theme',
  onboardingSeen: 'reproduktor.onboarding.seen',
} as const

type SavedPlayer = { name: string; avatarEmoji: string }

export const appStorage = {
  savePlayers(players: Player[]) {
    const saved: SavedPlayer[] = players.map((p) => ({ name: p.name, avatarEmoji: p.avatarEmoji }))
    localStorage.setItem(KEYS.players, JSON.stringify(saved))
  },

  loadPlayers(): SavedPlayer[] {
    try {
      const raw = localStorage.getItem(KEYS.players)
      if (!raw) return []
      const parsed = JSON.parse(raw) as SavedPlayer[]
      return parsed.filter((p) => p.name && p.avatarEmoji)
    } catch {
      return []
    }
  },

  saveSettings(settings: GameSettings) {
    localStorage.setItem(KEYS.settings, JSON.stringify(settings))
  },

  loadSettings(): GameSettings | null {
    try {
      const raw = localStorage.getItem(KEYS.settings)
      return raw ? (JSON.parse(raw) as GameSettings) : null
    } catch {
      return null
    }
  },

  saveTheme(theme: AppThemeKey) {
    localStorage.setItem(KEYS.theme, theme)
  },

  loadTheme(): AppThemeKey {
    const value = localStorage.getItem(KEYS.theme)
    if (value === 'classic' || value === 'pride' || value === 'forest') return value
    return 'classic'
  },

  markOnboardingSeen() {
    localStorage.setItem(KEYS.onboardingSeen, '1')
  },

  hasSeenOnboarding(): boolean {
    return localStorage.getItem(KEYS.onboardingSeen) === '1'
  },
}
