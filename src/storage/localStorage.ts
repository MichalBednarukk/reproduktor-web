import type { GameSettings, Player } from '../game/types'

const keys = { players: 'reproduktor.players', settings: 'reproduktor.settings', theme: 'reproduktor.theme', onboarding: 'reproduktor.onboarding' }

export const storage = {
  loadPlayers: (): Player[] => JSON.parse(localStorage.getItem(keys.players) ?? '[]'),
  savePlayers: (players: Player[]) => localStorage.setItem(keys.players, JSON.stringify(players.map((p) => ({ name: p.name, avatarEmoji: p.avatarEmoji })))),
  loadSettings: (): GameSettings | null => JSON.parse(localStorage.getItem(keys.settings) ?? 'null'),
  saveSettings: (settings: GameSettings) => localStorage.setItem(keys.settings, JSON.stringify(settings)),
  loadTheme: () => localStorage.getItem(keys.theme) ?? 'classic',
  saveTheme: (theme: string) => localStorage.setItem(keys.theme, theme),
  loadOnboardingSeen: () => localStorage.getItem(keys.onboarding) === '1',
  saveOnboardingSeen: () => localStorage.setItem(keys.onboarding, '1'),
}

