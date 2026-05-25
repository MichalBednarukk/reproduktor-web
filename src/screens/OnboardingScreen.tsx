import { DarkCard } from '../components/DarkCard'
import { PrimaryButton } from '../components/PrimaryButton'
import type { OnboardingScreenProps } from './types'

export function OnboardingScreen({ theme, onFinish }: OnboardingScreenProps) {
  return (
    <div className="screen center-screen">
      <section className="screen-scroll">
        <h1 className="title">Jak grać?</h1>

        <DarkCard theme={theme}>
          <ol className="tutorial-list">
            <li>Dodaj min. 3 graczy.</li>
            <li>Wybierz kategorie i ustawienia gry.</li>
            <li>Po kolei odsłoń role na jednym telefonie.</li>
            <li>W rundzie podawaj skojarzenia z hasłem.</li>
            <li>Reproduktor próbuje odgadnąć hasło.</li>
            <li>Potem głosowanie i punktacja.</li>
          </ol>
        </DarkCard>

        <PrimaryButton theme={theme} onClick={onFinish}>Rozumiem</PrimaryButton>
      </section>
    </div>
  )
}
