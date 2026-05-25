import { DarkCard } from '../components/DarkCard'
import { PrimaryButton } from '../components/PrimaryButton'
import type { PassPhoneScreenProps } from './types'

export function PassPhoneScreen({ state, theme, onConfirm, onExit }: PassPhoneScreenProps) {
  const current = state.players[state.currentRevealIndex]

  return (
    <div className="screen center-screen">
      <button className="close-btn" onClick={onExit}>✕</button>
      <div className="center-content">
        <p className="giant-emoji">{current?.avatarEmoji ?? '📱'}</p>
        <DarkCard theme={theme} className="center-card">
          <p className="subtitle">Przekaż telefon do</p>
          <h2 className="fit-name">{current?.name ?? '?'}</h2>
          <p className="hint">Gracz {state.currentRevealIndex + 1} z {state.players.length}</p>
        </DarkCard>
        <PrimaryButton theme={theme} onClick={onConfirm}>Kontynuuj</PrimaryButton>
      </div>
    </div>
  )
}
