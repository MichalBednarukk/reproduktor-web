import { useMemo, useState } from 'react'
import { PrimaryButton } from './PrimaryButton'
import { SecondaryButton } from './SecondaryButton'
import type { AppTheme, Player } from '../game/types'

type Props = {
  open: boolean
  theme: AppTheme
  players: Player[]
  dismissText: string
  error: string
  onDismiss: () => void
  onSubmit: (playerId: string, isCorrect: boolean) => void
}

export function ImpostorGuessDialog({
  open,
  theme,
  players,
  dismissText,
  error,
  onDismiss,
  onSubmit,
}: Props) {
  const [selectedId, setSelectedId] = useState<string>('')
  const selected = useMemo(() => players.find((p) => p.id === selectedId), [players, selectedId])

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onDismiss}>
      <div className="modal" style={{ background: theme.card }} onClick={(e) => e.stopPropagation()}>
        <h3>🥷 Reproduktor zgaduje</h3>
        <p style={{ color: theme.textSecondary }}>Wybierz gracza, który zgaduje tajne słowo.</p>

        <div className="guess-list">
          {players.map((p) => (
            <button
              key={p.id}
              className={`guess-item ${selectedId === p.id ? 'selected' : ''}`}
              style={{ borderColor: selectedId === p.id ? theme.secondary : theme.border }}
              onClick={() => setSelectedId(p.id)}
            >
              {p.avatarEmoji} {p.name}
            </button>
          ))}
        </div>

        {error && <p style={{ color: theme.error }}>{error}</p>}

        <div className="dialog-actions two-col">
          <SecondaryButton theme={theme} onClick={onDismiss}>{dismissText}</SecondaryButton>
          <PrimaryButton theme={theme} disabled={!selected} onClick={() => selected && onSubmit(selected.id, false)}>
            Pudło
          </PrimaryButton>
          <PrimaryButton theme={theme} disabled={!selected} onClick={() => selected && onSubmit(selected.id, true)}>
            Trafił
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
