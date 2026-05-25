export type GamePhase =
  | 'SETUP_PLAYERS'
  | 'SETUP_CATEGORIES'
  | 'SETUP_SETTINGS'
  | 'PASS_PHONE'
  | 'REVEAL_ROLE'
  | 'READY_TO_START'
  | 'GAME_ROUND'
  | 'IMPOSTOR_GUESS'
  | 'VOTING'
  | 'ROUND_RESULT'
  | 'GAME_OVER'

export type Player = {
  id: string
  name: string
  score: number
  avatarEmoji: string
}

export type Category = {
  id: string
  name: string
  description: string
  emoji: string
}

export type SecretWord = {
  id: string
  word: string
  categoryId: string
  hints: string[]
  difficulty: string
}

export type GameSettings = {
  impostorCount: number
  roundDurationSeconds: number
  pointsToWin: number
  hintsEnabled: boolean
}

export type ResultType =
  | 'IMPOSTORS_CAUGHT'
  | 'IMPOSTORS_ESCAPED'
  | 'IMPOSTOR_GUESSED_CORRECTLY'
  | 'IMPOSTOR_GUESSED_INCORRECTLY'

export type RoundResult = {
  secretWord: SecretWord
  impostors: Player[]
  guessedPlayers: Player[]
  pointsDelta: Record<string, number>
  resultMessage: string
  resultType: ResultType
}

export type GameState = {
  players: Player[]
  selectedCategoryIds: Set<string>
  settings: GameSettings
  currentSecretWord: SecretWord | null
  currentImpostorIds: Set<string>
  currentImpostorHints: Record<string, string>
  recentHintsHistory: string[]
  currentRevealIndex: number
  roundNumber: number
  startingPlayer: Player | null
  lastRoundResult: RoundResult | null
  phase: GamePhase
  usedWordIds: Set<string>
}

export type WordsPayload = {
  categories: Array<
    Category & {
      words: Array<{
        id: string
        word: string
        hints?: string[]
        difficulty?: string
      }>
    }
  >
}

export type AppThemeKey = 'classic' | 'pride' | 'forest'

export type AppTheme = {
  key: AppThemeKey
  name: string
  gradientFrom: string
  gradientTo: string
  card: string
  cardLight: string
  border: string
  text: string
  textSecondary: string
  textMuted: string
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
}

export const DEFAULT_SETTINGS: GameSettings = {
  impostorCount: 1,
  roundDurationSeconds: 120,
  pointsToWin: 5,
  hintsEnabled: true,
}

export const DEFAULT_STATE: GameState = {
  players: [],
  selectedCategoryIds: new Set(),
  settings: DEFAULT_SETTINGS,
  currentSecretWord: null,
  currentImpostorIds: new Set(),
  currentImpostorHints: {},
  recentHintsHistory: [],
  currentRevealIndex: 0,
  roundNumber: 1,
  startingPlayer: null,
  lastRoundResult: null,
  phase: 'SETUP_PLAYERS',
  usedWordIds: new Set(),
}
