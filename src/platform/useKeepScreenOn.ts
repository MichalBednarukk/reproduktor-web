// Odpowiednik view.keepScreenOn z AppNavigation.kt — Screen Wake Lock API.
// Przeglądarka zwalnia blokadę, gdy karta przechodzi w tło, więc po powrocie prosimy o nią ponownie.
// Bez wsparcia API (starsze przeglądarki) hook po prostu nic nie robi.

import { useEffect } from 'react'

export function useKeepScreenOn(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return
    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      if (document.visibilityState !== 'visible' || (sentinel && !sentinel.released)) return
      try {
        const lock = await navigator.wakeLock.request('screen')
        if (cancelled) lock.release().catch(() => {})
        else sentinel = lock
      } catch {
        // np. tryb oszczędzania baterii — gra działa dalej bez blokady
      }
    }

    acquire()
    document.addEventListener('visibilitychange', acquire)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', acquire)
      sentinel?.release().catch(() => {})
    }
  }, [enabled])
}
