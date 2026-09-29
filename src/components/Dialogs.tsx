// Odpowiedniki: Material3 AlertDialog, ExitGameDialog.kt, ImpostorGuessDialog.kt, ScoreTable.kt.

import { useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { PlayerAvatar } from '../avatars/PlayerAvatar'
import type { AvatarMood } from '../avatars/characters'
import { formatPoints, formatPointsDelta } from '../game/scoring'
import type { Player } from '../game/types'
import { BACK_PRIORITY_DIALOG, useBackHandler } from '../navigation/backHandler'

type DialogShellProps = {
  onDismiss: () => void
  children: ReactNode
  className?: string
}

/** Warstwa dialogu: przyciemnienie, zamykanie kliknięciem obok, „wstecz” i Esc. */
export function DialogShell({ onDismiss, children, className }: DialogShellProps) {
  useBackHandler(onDismiss, true, BACK_PRIORITY_DIALOG)
  return createPortal(
    <div className="scrim" onClick={onDismiss}>
      <div className={className} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  )
}

export type DialogButton = { text: string; onClick: () => void; color?: string }

type AlertDialogProps = {
  title: ReactNode
  text?: ReactNode
  confirm: DialogButton
  dismiss?: DialogButton
  onDismissRequest: () => void
}

export function AlertDialog({ title, text, confirm, dismiss, onDismissRequest }: AlertDialogProps) {
  return (
    <DialogShell onDismiss={onDismissRequest} className="alert-dialog">
      <h2 className="alert-title">{title}</h2>
      {text && <div className="alert-text">{text}</div>}
      <div className="alert-actions">
        {dismiss && <TextButton {...dismiss} />}
        <TextButton {...confirm} />
      </div>
    </DialogShell>
  )
}

const TextButton = ({ text, onClick, color }: DialogButton) => (
  <button type="button" className="text-btn" onClick={onClick} style={color ? { color } : undefined}>
    {text}
  </button>
)

export function ExitGameDialog({ onDismiss, onConfirm }: { onDismiss: () => void; onConfirm: () => void }) {
  return (
    <AlertDialog
      title="Przerwać grę?"
      text="Jeśli wyjdziesz teraz, obecna rozgrywka zostanie zakończona."
      confirm={{ text: 'Wyjdź do początku', onClick: onConfirm, color: 'var(--error)' }}
      dismiss={{ text: 'Zostań', onClick: onDismiss }}
      onDismissRequest={onDismiss}
    />
  )
}

type ImpostorGuessDialogProps = {
  players: Player[]
  /** Zwraca false, gdy wybrany gracz nie jest Reproduktorem. */
  onGuessResult: (playerId: string, isCorrect: boolean) => boolean
  onDismiss: () => void
  dismissText?: string
}

export function ImpostorGuessDialog({ players, onGuessResult, onDismiss, dismissText = '← Wróć do gry' }: ImpostorGuessDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const selected = players.find((p) => p.id === selectedId) ?? null

  const submit = (isCorrect: boolean) => {
    if (!selected) return
    if (!onGuessResult(selected.id, isCorrect)) {
      setError('Wybrany gracz nie jest Reproduktorem. Wybierz właściwą osobę.')
    }
  }

  return (
    <DialogShell onDismiss={onDismiss} className="guess-dialog">
      <div className="guess-header">
        <h2>🥷 Który Reproduktor zgaduje?</h2>
        <p>Który gracz chce zgadnąć tajne słowo?</p>
      </div>
      <div className="guess-list">
        {players.map((player) => {
          const isSelected = player.id === selectedId
          return (
            <button
              type="button"
              key={player.id}
              className={`guess-item ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                setSelectedId(player.id)
                setError(null)
              }}
            >
              <span className="guess-avatar">
                <PlayerAvatar avatar={player.avatarEmoji} size={34} mood={isSelected ? 'sneaky' : 'idle'} />
              </span>
              <span className="guess-name">{player.name}</span>
              {isSelected && <span className="check">✓</span>}
            </button>
          )
        })}
      </div>
      <div className="guess-footer">
        {selected && (
          <p className="guess-status">
            <span className="avatar-chip">
              <PlayerAvatar avatar={selected.avatarEmoji} size={24} mood="sneaky" />
              {selected.name} zgaduje...
            </span>
          </p>
        )}
        {error && <p className="guess-error">{error}</p>}
        <div className="guess-buttons">
          <button type="button" className="guess-btn hit" disabled={!selected} onClick={() => submit(true)}>
            Trafił
          </button>
          <button type="button" className="guess-btn miss" disabled={!selected} onClick={() => submit(false)}>
            Pudło
          </button>
        </div>
        <button type="button" className="text-btn guess-dismiss" onClick={onDismiss}>
          {dismissText}
        </button>
      </div>
    </DialogShell>
  )
}

type ScoreTableProps = {
  players: Player[]
  pointsDelta?: Record<string, number>
  showAvatars?: boolean
  moods?: Record<string, AvatarMood>
}

export function ScoreTable({ players, pointsDelta = {}, showAvatars = false, moods = {} }: ScoreTableProps) {
  const sorted = players.slice().sort((a, b) => b.score - a.score)
  return (
    <div className="score-table">
      {sorted.map((player) => {
        const delta = pointsDelta[player.id]
        let deltaText = ''
        let deltaClass = ''
        if (delta !== undefined) {
          deltaText = formatPointsDelta(delta)
          deltaClass = delta > 0 ? 'plus' : delta < 0 ? 'minus' : 'zero'
        }
        return (
          <div className="score-row" key={player.id}>
            <div className="score-left">
              {showAvatars && (
                <span className="score-avatar">
                  <PlayerAvatar avatar={player.avatarEmoji} size={30} mood={moods[player.id]} />
                </span>
              )}
              <span className="score-name">{player.name}</span>
            </div>
            <div className="score-right">
              {delta !== undefined && <span className={`score-delta ${deltaClass}`}>{deltaText}</span>}
              <span className="score-points">{formatPoints(player.score)} pkt</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
