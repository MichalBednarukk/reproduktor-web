// „Dodaj do ekranu głównego” (instalacja PWA).
// Android/Chrome/Edge: przeglądarka wysyła zdarzenie beforeinstallprompt — zapamiętujemy je i wywołujemy
// po kliknięciu przycisku. iPhone/iPad (Safari): brak takiego API — pokazujemy instrukcję.

import { useEffect, useState } from 'react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: InstallPromptEvent | null = null
let installedNow = false
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

/** Wywołać raz na starcie (main.tsx), zanim przeglądarka wyśle zdarzenie. */
export function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as InstallPromptEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    installedNow = true
    deferred = null
    notify()
  })
}

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export function useInstallPrompt() {
  const [, force] = useState(0)
  useEffect(() => {
    const listener = () => force((n) => n + 1)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const installed = installedNow || isStandalone()
  return {
    /** Czy pokazywać opcję instalacji w ogóle. */
    available: !installed && (deferred !== null || isIos()),
    /** iPhone/iPad — zamiast systemowego okna trzeba pokazać instrukcję. */
    needsInstructions: !installed && deferred === null && isIos(),
    async install(): Promise<boolean> {
      if (!deferred) return false
      const event = deferred
      await event.prompt()
      const { outcome } = await event.userChoice
      if (outcome === 'accepted') deferred = null
      notify()
      return outcome === 'accepted'
    },
  }
}
