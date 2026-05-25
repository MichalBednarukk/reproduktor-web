import { PrimaryButton } from '../components/PrimaryButton'
import type { ReadyToStartScreenProps } from './types'

export function ReadyToStartScreen({ theme, onStart, onExit }: ReadyToStartScreenProps) {
  return (
    <div className="screen center-screen">
      <button className="close-btn" onClick={onExit}>✕</button>
      <div className="center-content">
        <p className="giant-emoji">🎯</p>
        <h1 className="title">Wszyscy sprawdzili swoje role!</h1>
        <p className="subtitle">Czas zaczynać!</p>
        <PrimaryButton theme={theme} onClick={onStart}>🚀 Rozpocznij grę</PrimaryButton>
      </div>
    </div>
  )
}
