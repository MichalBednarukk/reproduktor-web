import { useMemo, useState } from 'react'
import { DarkCard } from '../components/DarkCard'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'
import { TopCornerActions } from '../components/TopCornerActions'
import type { PlayersScreenProps } from './types'

const MAX_PLAYER_NAME_LENGTH = 30

export function PlayersScreen({
  theme,
  themeKey,
  onThemeChange,
  onInfo,
  state,
  onAddPlayer,
  onRemovePlayer,
  onRemoveAllPlayers,
  onNext,
}: PlayersScreenProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const canGoNext = state.players.length >= 3
  const reversedPlayers = useMemo(() => state.players.slice().reverse(), [state.players])

  const submit = () => {
    const result = onAddPlayer(name)
    if (!result.ok) {
      setError(result.message ?? 'Nie można dodać gracza')
      return
    }
    setName('')
    setError('')
  }

  return (
    <div className="screen">
      <TopCornerActions theme={theme} selectedTheme={themeKey} onSelectTheme={onThemeChange} onInfoClick={onInfo} />

      <section className="screen-scroll with-bottom-bar">
        <h1 className="title">🎮 Gracze</h1>
        <p className="subtitle">Kto gra dzisiaj?</p>

        {state.players.length > 0 && (
          <button className="danger-link" onClick={onRemoveAllPlayers}>
            Usuń wszystkich
          </button>
        )}

        <DarkCard theme={theme}>
          <div className="row">
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value.slice(0, MAX_PLAYER_NAME_LENGTH))
                setError('')
              }}
              placeholder="Wpisz imię gracza"
            />
            <button className="plus-btn" style={{ background: theme.primary }} onClick={submit}>
              +
            </button>
          </div>
        </DarkCard>

        <p className="counter" style={{ color: theme.textMuted }}>
          {name.length}/{MAX_PLAYER_NAME_LENGTH} znaków
        </p>

        {error && (
          <p className="error" style={{ color: theme.error }}>
            {error}
          </p>
        )}

        <div className="list">
          {reversedPlayers.map((player) => (
            <DarkCard key={player.id} theme={theme} className="player-card">
              <span className="avatar">{player.avatarEmoji}</span>
              <span className="player-name">{player.name}</span>
              <button className="ghost-btn" onClick={() => onRemovePlayer(player.id)}>
                ✕
              </button>
            </DarkCard>
          ))}
        </div>
      </section>

      <footer className="bottom-bar" style={{ background: theme.gradientFrom, borderColor: theme.border }}>
        {!canGoNext && <p className="hint">Dodaj co najmniej 3 graczy, aby kontynuować</p>}
        <PrimaryButton theme={theme} disabled={!canGoNext} onClick={onNext}>
          Dalej →
        </PrimaryButton>
        <SecondaryButton theme={theme} onClick={onInfo}>
          Zasady gry
        </SecondaryButton>
      </footer>
    </div>
  )
}
