import { useMemo, useRef, useState } from 'react'
import { PrimaryButton } from '../components/PrimaryButton'
import type { RevealRoleScreenProps } from './types'

export function RevealRoleScreen({ state, theme, onContinue, onExit }: RevealRoleScreenProps) {
  const current = state.players[state.currentRevealIndex]
  const isImpostor = !!current && state.currentImpostorIds.has(current.id)
  const hint = current ? (state.currentImpostorHints[current.id] ?? '') : ''

  const [offsetY, setOffsetY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [hasViewedRole, setHasViewedRole] = useState(false)
  const startYRef = useRef<number | null>(null)
  const screenHeightRef = useRef<number>(window.innerHeight)

  const minOffset = -Math.max(320, Math.floor(screenHeightRef.current * 0.55))

  const roleContent = useMemo(() => {
    if (!current) {
      return (
        <>
          <p className="giant-emoji">❓</p>
          <h2>Brak gracza</h2>
          <p className="hint">Nie udało się odczytać aktualnego gracza.</p>
        </>
      )
    }

    if (isImpostor) {
      if (state.settings.hintsEnabled && hint) {
        return (
          <>
            <p className="giant-emoji">🥷</p>
            <h2 style={{ color: theme.error }}>Reproduktor</h2>
            <p className="hint-title">💡 Wskazówka</p>
            <p className="hint-word">{hint}</p>
          </>
        )
      }

      return (
        <>
          <p className="giant-emoji">🥷</p>
          <h2 style={{ color: theme.error }}>Reproduktor</h2>
          <p className="hint">Nie znasz tajnego hasła. Słuchaj uważnie i spróbuj je odtworzyć.</p>
        </>
      )
    }

    return (
      <>
        <p className="hint">Twoje tajne słowo to:</p>
        <h2 className="secret-word">{state.currentSecretWord?.word ?? 'Brak hasła'}</h2>
        <p className="hint">Zapamiętaj i nie pokazuj nikomu.</p>
      </>
    )
  }, [current, hint, isImpostor, state.currentSecretWord?.word, state.settings.hintsEnabled, theme.error])

  const handlePointerDown = (clientY: number) => {
    screenHeightRef.current = window.innerHeight
    startYRef.current = clientY
    setIsDragging(true)
  }

  const handlePointerMove = (clientY: number) => {
    if (startYRef.current == null || !isDragging) return
    const delta = clientY - startYRef.current
    const next = Math.max(minOffset, Math.min(0, delta))
    setOffsetY(next)
  }

  const handlePointerUp = () => {
    const threshold = Math.abs(minOffset) * 0.6
    if (Math.abs(offsetY) >= threshold) {
      setHasViewedRole(true)
    }
    setOffsetY(0)
    setIsDragging(false)
    startYRef.current = null
  }

  return (
    <div className="screen reveal-screen">
      <button className="close-btn" onClick={onExit}>✕</button>

      <div className="reveal-under-layer">
        <div className="reveal-role-content">
          <h2 className="fit-name">{current?.name ?? '?'}</h2>
          <p className="hint">Gracz {state.currentRevealIndex + 1} z {state.players.length}</p>

          <section className="revealed-panel">{roleContent}</section>

          {hasViewedRole ? (
            <div className="remember-block">
              <p className="giant-emoji">👁</p>
              <h3>Zapamiętałeś swoją rolę?</h3>
              <p>Możesz teraz przekazać telefon.</p>
              <PrimaryButton theme={theme} onClick={onContinue}>Kontynuuj →</PrimaryButton>
            </div>
          ) : (
            <div className="swipe-hint">
              <p>Przesuń w górę i przytrzymaj, aby podejrzeć rolę.</p>
              <span>︿</span>
              <span>︿</span>
              <span>︿</span>
            </div>
          )}
        </div>
      </div>

      <div
        className="reveal-cover"
        style={{ transform: `translateY(${offsetY}px)` }}
        onMouseDown={(e) => handlePointerDown(e.clientY)}
        onMouseMove={(e) => handlePointerMove(e.clientY)}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={(e) => handlePointerDown(e.touches[0].clientY)}
        onTouchMove={(e) => handlePointerMove(e.touches[0].clientY)}
        onTouchEnd={handlePointerUp}
      >
        <p className="lock">🔒</p>
        <p>Twoja rola jest ukryta</p>
      </div>
    </div>
  )
}
