// Odpowiednik AppNavigation.kt. Ekran wynika z fazy gry (GamePhase),
// a Splash i „Zasady gry” (onboarding) są osobnymi warstwami nad nią.

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useGame } from './game/useGame'
import type { GamePhase } from './game/types'
import { useKeepScreenOn } from './platform/useKeepScreenOn'
import { appStorage } from './storage/localStorage'
import { applyTheme, themeFromStorage, type AppColorTheme } from './theme/themes'
import { CategorySelectionScreen } from './screens/CategorySelectionScreen'
import { GameOverScreen } from './screens/GameOverScreen'
import { GameRoundScreen } from './screens/GameRoundScreen'
import { GameSettingsScreen } from './screens/GameSettingsScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { PassPhoneScreen } from './screens/PassPhoneScreen'
import { PlayersScreen } from './screens/PlayersScreen'
import { ReadyToStartScreen } from './screens/ReadyToStartScreen'
import { RevealRoleScreen } from './screens/RevealRoleScreen'
import { RoundResultScreen } from './screens/RoundResultScreen'
import { SplashScreen } from './screens/SplashScreen'
import { VotingScreen } from './screens/VotingScreen'
import type { ScreenProps } from './screens/types'

/** Fazy, w których ekran nie może zgasnąć (jak GAMEPLAY_PHASES w AppNavigation.kt). */
const GAMEPLAY_PHASES = new Set<GamePhase>([
  'PASS_PHONE',
  'REVEAL_ROLE',
  'READY_TO_START',
  'GAME_ROUND',
  'IMPOSTOR_GUESS',
  'VOTING',
  'ROUND_RESULT',
])

type Overlay ={ kind: 'splash' } | { kind: 'onboarding'; entry: 'startup' | 'screen' } | null

const SCREENS: Record<GamePhase, (props: ScreenProps) => ReactNode> = {
  SETUP_PLAYERS: PlayersScreen,
  SETUP_CATEGORIES: CategorySelectionScreen,
  SETUP_SETTINGS: GameSettingsScreen,
  PASS_PHONE: PassPhoneScreen,
  REVEAL_ROLE: RevealRoleScreen,
  READY_TO_START: ReadyToStartScreen,
  GAME_ROUND: GameRoundScreen,
  IMPOSTOR_GUESS: GameRoundScreen, // zgadywanie to dialog nad ekranem rundy
  VOTING: VotingScreen,
  ROUND_RESULT: RoundResultScreen,
  GAME_OVER: GameOverScreen,
}

/** Klucz ekranu — zmiana klucza = nowy ekran (reset lokalnego stanu, animacja wejścia). */
function screenKey(phase: GamePhase, revealIndex: number, round: number): string {
  if (phase === 'IMPOSTOR_GUESS') return `GAME_ROUND:${round}`
  if (phase === 'GAME_ROUND') return `GAME_ROUND:${round}`
  if (phase === 'PASS_PHONE' || phase === 'REVEAL_ROLE') return `${phase}:${round}:${revealIndex}`
  return `${phase}:${round}`
}

function App() {
  const game = useGame()
  const [theme, setTheme] = useState<AppColorTheme>(() => themeFromStorage(appStorage.loadTheme()))
  const [overlay, setOverlay] = useState<Overlay>({ kind: 'splash' })
  const onRulesReturn = useRef<(() => void) | undefined>(undefined)

  useEffect(() => applyTheme(theme), [theme])
  useKeepScreenOn(GAMEPLAY_PHASES.has(game.state.phase))

  const selectTheme = useCallback((next: AppColorTheme) => {
    setTheme(next)
    appStorage.saveTheme(next.key)
  }, [])

  const finishSplash = useCallback(() => {
    setOverlay(appStorage.hasSeenOnboarding() ? null : { kind: 'onboarding', entry: 'startup' })
  }, [])

  const openRules = useCallback((onReturn?: () => void) => {
    onRulesReturn.current = onReturn
    setOverlay({ kind: 'onboarding', entry: 'screen' })
  }, [])

  const finishOnboarding = useCallback(() => {
    if (overlay?.kind === 'onboarding' && overlay.entry === 'startup') appStorage.markOnboardingSeen()
    setOverlay(null)
    const callback = onRulesReturn.current
    onRulesReturn.current = undefined
    callback?.()
  }, [overlay])

  if (overlay?.kind === 'splash') {
    return <SplashScreen onFinished={finishSplash} />
  }

  const { phase, currentRevealIndex, roundNumber } = game.state
  const Screen = SCREENS[phase]
  const showRules = overlay?.kind === 'onboarding'

  return (
    <>
      {/* Ekran gry zostaje zamontowany pod „Zasadami gry”, żeby nie tracić jego stanu. */}
      <div className="screen-host" hidden={showRules} key={screenKey(phase, currentRevealIndex, roundNumber)}>
        <Screen game={game} theme={theme} onSelectTheme={selectTheme} openRules={openRules} />
      </div>
      {showRules && (
        <div className="screen-host">
          <OnboardingScreen onFinish={finishOnboarding} />
        </div>
      )}
    </>
  )
}

export default App
