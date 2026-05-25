import { useMemo, useRef, useState, type PointerEvent } from 'react'
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
  const offsetYRef = useRef(0)
  const minOffsetRef = useRef(-420)
  const returnTimerRef = useRef<number | null>(null)

  const roleContent = useMemo(() => {
    if (!current) {
      return (
        <section className="revealed-panel">
          <p className="giant-emoji">❓</p>
          <h2>Brak gracza</h2>
          <p className="hint">Nie udało się odczytać aktualnego gracza.</p>
        </section>
      )
    }

    if (isImpostor) {
      return (
        <section className="revealed-panel">
          <p className="giant-emoji">🥷</p>
          <h2 style={{ color: theme.error }}>Reproduktor</h2>

          {state.settings.hintsEnabled && hint ? (
            <>
              <p className="hint-title">💡 Wskazówka</p>
              <p className="hint-word">{hint}</p>
            </>
          ) : (
            <p className="hint">
              Nie znasz tajnego hasła. Słuchaj uważnie i spróbuj je odtworzyć.
            </p>
          )}
        </section>
      )
    }

    return (
      <section className="revealed-panel">
        <p className="hint">Twoje tajne słowo to:</p>
        <h2 className="secret-word">{state.currentSecretWord?.word ?? 'Brak hasła'}</h2>
        <p className="hint">Zapamiętaj i nie pokazuj nikomu.</p>
      </section>
    )
  }, [
    current,
    hint,
    isImpostor,
    state.currentSecretWord?.word,
    state.settings.hintsEnabled,
    theme.error,
  ])

  const setCoverOffset = (value: number) => {
    offsetYRef.current = value
    setOffsetY(value)
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (hasViewedRole) return

    if (returnTimerRef.current) {
      window.clearTimeout(returnTimerRef.current)
      returnTimerRef.current = null
    }

    const screenHeight = window.innerHeight || document.documentElement.clientHeight || 760
    minOffsetRef.current = -Math.max(340, Math.floor(screenHeight * 0.58))

    startYRef.current = event.clientY
    setIsDragging(true)

    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (hasViewedRole) return
    if (!isDragging || startYRef.current == null) return

    event.preventDefault()

    const delta = event.clientY - startYRef.current
    const nextOffset = Math.max(minOffsetRef.current, Math.min(0, delta))

    setCoverOffset(nextOffset)
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (hasViewedRole) return
    if (startYRef.current == null) return

    event.currentTarget.releasePointerCapture?.(event.pointerId)

    const minOffset = minOffsetRef.current
    const readableThreshold = Math.abs(minOffset) * 0.55
    const wasReadable = Math.abs(offsetYRef.current) >= readableThreshold

    startYRef.current = null
    setIsDragging(false)

    // Najpierw zasłona wraca na dół.
    setCoverOffset(0)

    // Dopiero po powrocie zasłony zmieniamy jej zawartość na confirmation.
    if (wasReadable) {
      returnTimerRef.current = window.setTimeout(() => {
        setHasViewedRole(true)
        returnTimerRef.current = null
      }, 240)
    }
  }

  return (
    <div className="screen reveal-screen">
      <button className="close-btn reveal-close-btn" onClick={onExit} type="button">
        ✕
      </button>

      {/* WARSTWA POD SPODEM — tutaj jest WYŁĄCZNIE rola/hasło */}
      <div className="reveal-under-layer">
        <div className="reveal-role-content">
          {roleContent}
        </div>
      </div>

      {/* WARSTWA ZASŁONY — tutaj jest albo kłódka, albo confirmation */}
      <div
        className={`reveal-cover ${isDragging ? 'is-dragging' : ''}`}
        style={{ transform: `translateY(${offsetY}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {hasViewedRole ? (
          <div className="remember-block">
            <p className="giant-emoji eye-icon">👁</p>
            <h3>Zapamiętałeś swoją rolę?</h3>
            <p>Możesz teraz przekazać telefon.</p>
            <PrimaryButton theme={theme} onClick={onContinue}>
              Kontynuuj →
            </PrimaryButton>
          </div>
        ) : (
          <div className="cover-lock-content">
            <div className="cover-player-header">
              <h2 className="fit-name">{current?.name ?? '?'}</h2>
              <p className="hint">
                Gracz {state.currentRevealIndex + 1} z {state.players.length}
              </p>
            </div>

            <div className="cover-lock-main">
              <p className="lock">🔒</p>
              <p className="cover-title">Twoja rola jest ukryta</p>
            </div>

            <div className="swipe-hint">
              <p>Przesuń w górę i przytrzymaj, aby podejrzeć rolę.</p>
              <span>︿</span>
              <span>︿</span>
              <span>︿</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}