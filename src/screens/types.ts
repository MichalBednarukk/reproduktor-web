import type { AppTheme, AppThemeKey, Category, GameSettings, GameState, Player } from '../game/types'

export type CoreScreenProps = {
  theme: AppTheme
  themeKey: AppThemeKey
  onThemeChange: (theme: AppThemeKey) => void
  onInfo: () => void
}

export type PlayersScreenProps = CoreScreenProps & {
  state: GameState
  onAddPlayer: (name: string) => { ok: boolean; message?: string }
  onRemovePlayer: (id: string) => void
  onRemoveAllPlayers: () => void
  onNext: () => void
}

export type CategoryScreenProps = CoreScreenProps & {
  state: GameState
  categories: Category[]
  onToggle: (id: string) => void
  onSelectAll: () => void
  onClearAll: () => void
  onBack: () => void
  onNext: () => void
}

export type SettingsScreenProps = CoreScreenProps & {
  state: GameState
  onBack: () => void
  onUpdateSettings: (next: Partial<GameSettings>) => void
  onStartRound: () => void
}

export type PassPhoneScreenProps = CoreScreenProps & {
  state: GameState
  onConfirm: () => void
  onExit: () => void
}

export type RevealRoleScreenProps = CoreScreenProps & {
  state: GameState
  onContinue: () => void
  onExit: () => void
}

export type ReadyToStartScreenProps = CoreScreenProps & {
  onStart: () => void
  onExit: () => void
}

export type RoundScreenProps = CoreScreenProps & {
  state: GameState
  timerSeconds: number
  onOpenGuess: () => void
  onEndRound: () => void
  onForceEnd: () => void
  onExit: () => void
}

export type VotingScreenProps = CoreScreenProps & {
  state: GameState
  voteSet: Set<string>
  onToggleVote: (id: string) => void
  onSubmitVotes: () => void
  onOpenGuess: () => void
  onExit: () => void
}

export type RoundResultScreenProps = CoreScreenProps & {
  state: GameState
  onNextRound: () => void
  onExit: () => void
}

export type GameOverScreenProps = CoreScreenProps & {
  state: GameState
  winners: Player[]
  onPlayAgain: () => void
  onNewGame: () => void
}

export type OnboardingScreenProps = CoreScreenProps & {
  onFinish: () => void
}
