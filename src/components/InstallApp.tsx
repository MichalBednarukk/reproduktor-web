// Baner „Dodaj do ekranu głównego” na ekranie graczy (logika: platform/useInstallAction.tsx).

import { useState } from 'react'
import { useInstallAction } from '../platform/useInstallAction'

const DISMISS_KEY = 'reproduktor.install.dismissed'

/** Baner na ekranie graczy — można go zamknąć (zapamiętane w przeglądarce). */
export function InstallBanner() {
  const action = useInstallAction()
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return false
    }
  })
  if (!action.available || dismissed) return action.dialog

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // brak zapisu — baner wróci przy następnym uruchomieniu
    }
  }

  return (
    <>
      <div className="install-banner">
        <button type="button" className="install-banner-main" onClick={action.start}>
          <span className="install-icon">📲</span>
          <span className="install-text">
            <strong>Dodaj do ekranu głównego</strong>
            <span>Reproduktor otworzy się jak aplikacja</span>
          </span>
        </button>
        <button type="button" className="icon-btn install-close" onClick={dismiss} aria-label="Zamknij">
          ✕
        </button>
      </div>
      {action.dialog}
    </>
  )
}
