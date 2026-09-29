import type { Game } from '../game/useGame'
import type { AppColorTheme } from '../theme/themes'

/** Wspólne rzeczy przekazywane każdemu ekranowi gry. */
export type ScreenProps = {
  game: Game
  theme: AppColorTheme
  onSelectTheme: (theme: AppColorTheme) => void
  /** Otwiera „Zasady gry”; onReturn wywoła się po powrocie z samouczka. */
  openRules: (onReturn?: () => void) => void
}
