// Odpowiednik RevealRoleScreen.kt (PeekRevealScreen):
// rola leży pod zasłoną; gracz przesuwa zasłonę w górę (max 48% ekranu) i przytrzymuje.
// Rola liczy się jako „obejrzana”, gdy dolna krawędź zasłony minie środek hasła/wskazówki.
// Po puszczeniu zasłona wraca, a na niej pojawia się „Zapamiętałeś swoją rolę?”.

import { useRef, useState, type PointerEvent } from 'react'
import { PlayerAvatar } from '../avatars/PlayerAvatar'
import { AutoResizeText } from '../components/AutoResizeText'
import { CloseButton, DarkCard, PrimaryButton, Spacer } from '../components/Basics'
import type { ScreenProps } from './types'
import { useExitGame } from './useExitGame'

const MAX_LIFT_FRACTION = 0.48
const LIFTED_THRESHOLD_PX = 50

export function RevealRoleScreen({ game }: ScreenProps) {
  const { state } = game
  const current = state.players[state.currentRevealIndex]
  const { openExitDialog, exitDialog } = useExitGame(game)
  const [isAdvancing, setIsAdvancing] = useState(false)

  if (!current) return null

  const isImpostor = state.currentImpostorIds.has(current.id)
  const hint = state.currentImpostorHints[current.id] ?? ''

  return (
    <>
      <PeekReveal
        key={current.id}
        playerName={current.name}
        avatar={current.avatarEmoji}
        playerIdx={state.currentRevealIndex + 1}
        playerCount={state.players.length}
        isImpostor={isImpostor}
        word={state.currentSecretWord?.word ?? '?'}
        hint={hint}
        hintsEnabled={state.settings.hintsEnabled}
        isAdvancing={isAdvancing}
        onExitGame={openExitDialog}
        onContinue={() => {
          setIsAdvancing(true)
          game.revealAndContinue()
        }}
      />
      {exitDialog}
    </>
  )
}

type PeekRevealProps = {
  playerName: string
  avatar: string
  playerIdx: number
  playerCount: number
  isImpostor: boolean
  word: string
  hint: string
  hintsEnabled: boolean
  isAdvancing: boolean
  onExitGame: () => void
  onContinue: () => void
}

function PeekReveal(props: PeekRevealProps) {
  const { isImpostor, word, hint, hintsEnabled, isAdvancing } = props
  const rootRef = useRef<HTMLDivElement>(null)
  const readableRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ pointerId: number; startY: number; startOffset: number; minOffset: number; midY: number } | null>(null)
  const passedThreshold = useRef(false)

  const [offsetY, setOffsetY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [hasViewedRole, setHasViewedRole] = useState(false)

  const lifted = Math.abs(offsetY) > LIFTED_THRESHOLD_PX
  const showConfirmation = hasViewedRole || isAdvancing

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current || (e.target as HTMLElement).closest('button')) return
    const root = rootRef.current
    const readable = readableRef.current
    if (!root) return
    const rootRect = root.getBoundingClientRect()
    const readableRect = readable?.getBoundingClientRect()
    drag.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startOffset: offsetY,
      minOffset: -rootRect.height * MAX_LIFT_FRACTION,
      midY: readableRect ? readableRect.top - rootRect.top + readableRect.height / 2 : Number.NEGATIVE_INFINITY,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.pointerId !== e.pointerId) return
    const next = Math.min(0, Math.max(d.minOffset, d.startOffset + (e.clientY - d.startY)))
    setOffsetY(next)
    const height = rootRef.current?.clientHeight ?? 0
    if (!passedThreshold.current && height + next <= d.midY) passedThreshold.current = true
  }

  const onPointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.pointerId !== e.pointerId) return
    drag.current = null
    if (passedThreshold.current) setHasViewedRole(true)
    passedThreshold.current = false
    setIsDragging(false)
    setOffsetY(0)
  }

  const hintText = hint.trim()

  return (
    <div className="screen reveal-root" ref={rootRef}>
      {/* Warstwa pod zasłoną — rola */}
      <div className="reveal-under">
        <div className="reveal-role">
          {isImpostor ? (
            <>
              <PlayerAvatar avatar={props.avatar} size={130} mood="sneaky" />
              <Spacer h={12} />
              {hintsEnabled && hintText ? (
                <>
                  <p className="impostor-title">Reproduktor</p>
                  <Spacer h={16} />
                  <DarkCard padding={16} className="full-width">
                    <p className="body-12 text-muted center">💡 Wskazówka</p>
                    <Spacer h={6} />
                    <div ref={readableRef}>
                      <AutoResizeText
                        text={hintText}
                        maxFontSize={22}
                        minFontSize={15}
                        maxLines={1}
                        lineHeightMultiplier={1.28}
                        className="hint-text"
                      />
                    </div>
                  </DarkCard>
                </>
              ) : (
                <>
                  <div ref={readableRef} className="full-width">
                    <p className="impostor-title">Reproduktor</p>
                  </div>
                  <Spacer h={12} />
                  <p className="body-15 text-secondary center">
                    Nie znasz tajnego hasła.
                    <br />
                    Słuchaj uważnie i spróbuj je odtworzyć.
                  </p>
                </>
              )}
            </>
          ) : (
            <>
              <PlayerAvatar avatar={props.avatar} size={120} mood="happy" />
              <Spacer h={8} />
              <p className="body-14 text-muted center">Twoje tajne słowo to:</p>
              <Spacer h={10} />
              <div ref={readableRef} className="full-width">
                <AutoResizeText
                  text={word.trim()}
                  maxFontSize={46}
                  minFontSize={22}
                  maxLines={4}
                  lineHeightMultiplier={1.2}
                  className="secret-word-text"
                />
              </div>
              <Spacer h={10} />
              <p className="body-14 text-muted center">Zapamiętaj i nie pokazuj nikomu.</p>
            </>
          )}
        </div>
      </div>

      {/* Zasłona */}
      <div
        className={`reveal-cover ${isDragging ? 'dragging' : ''}`}
        style={{ transform: `translateY(${offsetY}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <div className="reveal-cover-content">
          <Spacer h={56} />
          <AutoResizeText
            text={props.playerName.trim()}
            maxFontSize={44}
            minFontSize={28}
            maxLines={2}
            lineHeightMultiplier={1.18}
            className="name-text"
          />
          <Spacer h={6} />
          <p className="reveal-counter">
            Gracz {props.playerIdx} z {props.playerCount}
          </p>
          <Spacer h={16} />
          <PlayerAvatar avatar={props.avatar} size={220} mood={showConfirmation ? 'happy' : 'idle'} />
          <div className="flex-1" />
          {showConfirmation ? (
            <div className="reveal-confirmation">
              <span className="emoji-64 blink-eye">👁</span>
              <Spacer h={20} />
              <h2 className="reveal-card-title">Zapamiętałeś swoją rolę?</h2>
              <Spacer h={10} />
              <p className="body-14 text-secondary center">Możesz teraz przekazać telefon.</p>
              <Spacer h={32} />
              <PrimaryButton onClick={props.onContinue} disabled={isAdvancing}>
                Kontynuuj →
              </PrimaryButton>
            </div>
          ) : (
            <div className="reveal-instruction">
              <span className="emoji-56 lock-wiggle">🔒</span>
              <Spacer h={20} />
              <h2 className="reveal-card-title">Twoja rola jest ukryta</h2>
              <Spacer h={12} />
              <p className="body-15 text-secondary center lh-24">
                Przesuń w górę i przytrzymaj,
                <br />
                aby podejrzeć rolę.
              </p>
              <Spacer h={20} />
              <div className="instruction-divider" />
              <Spacer h={16} />
              <p className="body-12 text-muted center">Nie pokazuj ekranu innym graczom</p>
            </div>
          )}
          <div className="flex-1" />
          {!showConfirmation && <SwipeHint lifted={lifted} />}
          <Spacer h={28} />
        </div>
        <CloseButton onClick={props.onExitGame} />
      </div>
    </div>
  )
}

function SwipeHint({ lifted }: { lifted: boolean }) {
  return (
    <div className={`swipe-hint ${lifted ? 'lifted' : ''}`}>
      <span className="chevron c1">∧</span>
      <span className="chevron c2">∧</span>
      <span className="chevron c3">∧</span>
      <Spacer h={10} />
      <span className="swipe-handle" />
    </div>
  )
}
