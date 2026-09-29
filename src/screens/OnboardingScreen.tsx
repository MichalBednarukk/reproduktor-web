// Odpowiednik OnboardingScreen.kt: 10 kroków „Zasady gry” z animowanymi podglądami.

import { useState } from 'react'
import { AppBackground, DarkCard, PrimaryButton, SecondaryButton, Spacer } from '../components/Basics'
import { useBackHandler } from '../navigation/backHandler'

type Visual = 'WELCOME' | 'PLAYERS' | 'CATEGORIES' | 'SETTINGS' | 'REVEAL' | 'ROUND' | 'GUESS' | 'VOTING' | 'RESULTS' | 'READY'

const STEPS: Array<{ title: string; description: string; visual: Visual }> = [
  {
    title: 'Witaj w Reproduktorze',
    description:
      'To gra imprezowa, w której większość graczy zna tajne hasło, a Reproduktor dostaje tylko wskazówkę i próbuje się nie zdradzić.',
    visual: 'WELCOME',
  },
  {
    title: 'Dodaj graczy',
    description: 'Wpisz imiona osób, które grają. Minimum 3 graczy. Potem kliknij Dalej.',
    visual: 'PLAYERS',
  },
  {
    title: 'Wybierz kategorie',
    description: 'Możesz wybrać jedną kategorię, kilka kategorii albo Wszystko, żeby gra losowała hasła z całej bazy.',
    visual: 'CATEGORIES',
  },
  {
    title: 'Ustaw rozgrywkę',
    description: 'Ustaw liczbę Reproduktorów, czas rundy, punkty potrzebne do zwycięstwa i wskazówki.',
    visual: 'SETTINGS',
  },
  {
    title: 'Sprawdź swoją rolę',
    description:
      'Każdy gracz po kolei dostaje telefon i przesuwa zasłonę w górę, żeby podejrzeć rolę. Nie pokazuj ekranu innym.',
    visual: 'REVEAL',
  },
  {
    title: 'Mówcie po kolei skojarzenia',
    description:
      'Gracze mówią słowa kojarzące się z tajnym hasłem, ale nie mogą powiedzieć go wprost. Reproduktor próbuje dopasować się do rozmowy.',
    visual: 'ROUND',
  },
  {
    title: 'Reproduktor może zgadywać',
    description:
      'Jeśli Reproduktor myśli, że zna hasło, może zgadywać. Trafił – 2 punkty dla niego. Pudło – minus punkt dla niego i punkt dla każdego zwykłego gracza.',
    visual: 'GUESS',
  },
  {
    title: 'Głosowanie',
    description:
      'Po rundzie gracze głosują, kto ich zdaniem był Reproduktorem. Wykryjecie wszystkich – każdy zwykły gracz dostaje punkt, co najmniej połowę – pół punktu. Niewykryty Reproduktor dostaje 2 punkty, a niesłusznie wskazany gracz nic.',
    visual: 'VOTING',
  },
  {
    title: 'Wyniki i następna runda',
    description: 'Po każdej rundzie widzisz tabelę wyników. Możesz przejść do kolejnej rundy albo zakończyć grę.',
    visual: 'RESULTS',
  },
  { title: 'Gotowe', description: 'Teraz możesz zacząć grę.', visual: 'READY' },
]

export const ONBOARDING_BACK_PRIORITY = 0.5

export function OnboardingScreen({ onFinish }: { onFinish: () => void }) {
  const [stepIndex, setStepIndex] = useState(0)
  const isLast = stepIndex === STEPS.length - 1
  const step = STEPS[stepIndex]

  useBackHandler(
    () => (stepIndex > 0 ? setStepIndex(stepIndex - 1) : onFinish()),
    true,
    ONBOARDING_BACK_PRIORITY,
  )

  return (
    <AppBackground>
      <div className="screen with-bottom-bar">
        <div className="scroll-area pad-24">
          <Spacer h={18} />
          <h1 className="title-34">Zasady gry</h1>
          <Spacer h={8} />
          <p className="body-14 text-secondary">
            Krok {stepIndex + 1} z {STEPS.length}
          </p>
          <Spacer h={14} />
          <div className="progress-strip">
            <div className="progress-fill" style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
          </div>
          <Spacer h={18} />
          <div className="onboarding-step" key={stepIndex}>
            <DarkCard padding={18}>
              <h2 className="step-title">{step.title}</h2>
              <Spacer h={12} />
              <p className="step-description">{step.description}</p>
              <Spacer h={18} />
              <VisualPreview visual={step.visual} />
            </DarkCard>
          </div>
          <Spacer h={18} />
        </div>
        <div className="bottom-bar plain">
          <div className="bottom-bar-inner onboarding-actions">
            <SecondaryButton onClick={onFinish}>Pomiń</SecondaryButton>
            <Spacer h={10} />
            <PrimaryButton onClick={() => (isLast ? onFinish() : setStepIndex(stepIndex + 1))}>
              {isLast ? 'Zaczynamy' : 'Dalej'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </AppBackground>
  )
}

function VisualPreview({ visual }: { visual: Visual }) {
  return <div className="visual-preview">{renderVisual(visual)}</div>
}

function renderVisual(visual: Visual) {
  switch (visual) {
    case 'WELCOME':
      return (
        <div className="visual-center">
          <div className="welcome-glow" />
          <span className="pulse emoji-64">🎉</span>
        </div>
      )
    case 'PLAYERS':
      return (
        <div className="visual-pad visual-column-center">
          <div className="mock-input">
            <span className="text-muted">Imię gracza</span>
            <span className="mock-plus">+</span>
          </div>
          <Spacer h={16} />
          <div className="mock-row">
            <span className="arrow-shift">➤</span>
            <span className="text-secondary">Kliknij Dalej</span>
          </div>
        </div>
      )
    case 'CATEGORIES':
      return (
        <div className="visual-pad-14 visual-column">
          <p className="body-13 text-muted">Wybierz 1 lub kilka kategorii</p>
          <div className="chip-grid">
            {['Jedzenie', 'Sport', 'Zwierzęta', 'Podróże', 'Muzyka', 'Wszystko'].map((label) => (
              <span key={label} className={`chip-preview ${label === 'Wszystko' ? 'active' : ''}`}>
                {label}
              </span>
            ))}
          </div>
          <div className="flex-1" />
          <div className="mock-divider" />
          <Spacer h={10} />
          <div className="mock-button primary">Dalej</div>
        </div>
      )
    case 'SETTINGS':
      return (
        <div className="visual-pad visual-column gap-12">
          <SettingRow label="Reproduktorzy" value={0.3} />
          <SettingRow label="Czas" value={0.45} />
          <SettingRow label="Punkty do zwycięstwa" value={0.55} />
          <div className="mock-row space-between">
            <span className="body-13 text-secondary">Wskazówki</span>
            <span className="mock-pill">Włączone</span>
          </div>
        </div>
      )
    case 'REVEAL':
      return (
        <div className="visual-column-center reveal-visual">
          <div className="reveal-phone">
            <div className="reveal-window">
              <div className="reveal-secret">
                <span className="body-12 text-muted">TAJNA ROLA</span>
                <span className="reveal-secret-role">REPRODUKTOR</span>
              </div>
              <div className="reveal-curtain" />
            </div>
          </div>
          <Spacer h={10} />
          <div className="mock-row gap-8">
            <span>👆</span>
            <span className="text-secondary-accent">↑</span>
            <span className="body-13 text-secondary-accent">Przesuń w górę i przytrzymaj</span>
          </div>
          <Spacer h={6} />
          <span className="body-12 text-muted">Nie pokazuj ekranu innym</span>
        </div>
      )
    case 'ROUND':
      return (
        <div className="visual-pad visual-column space-between">
          <span className="round-mock-timer">⏱️ 01:20</span>
          <span className="text-secondary">Mówcie po kolei</span>
          <div className="mock-row gap-10">
            <Bubble emoji="😀" text="woda" />
            <Bubble emoji="😎" text="plaża" />
            <Bubble emoji="🥷" text="..." />
          </div>
        </div>
      )
    case 'GUESS':
      return (
        <div className="visual-pad visual-column gap-12">
          <div className="mock-surface">🥷 Reproduktor zgaduje</div>
          <div className="mock-row gap-10">
            <div className="mock-button success">Trafił</div>
            <div className="mock-button error">Pudło</div>
          </div>
        </div>
      )
    case 'VOTING':
      return (
        <div className="visual-pad visual-column gap-10">
          <VoteRow text="😀 Ola" selected={false} />
          <VoteRow text="😎 Kuba" selected />
          <VoteRow text="🤓 Basia" selected={false} />
          <Spacer h={6} />
          <div className="mock-button primary">Sprawdź wynik</div>
        </div>
      )
    case 'RESULTS':
      return (
        <div className="visual-pad visual-column gap-10">
          <ScoreRow player="😀 Ola" score={4} />
          <ScoreRow player="😎 Kuba" score={3} />
          <ScoreRow player="🤓 Basia" score={2} />
          <Spacer h={10} />
          <div className="mock-button secondary">Następna runda</div>
        </div>
      )
    case 'READY':
      return (
        <div className="visual-center column pop-in">
          <span className="pulse emoji-72">✅</span>
          <Spacer h={8} />
          <span className="body-16 text-secondary">Powodzenia i dobrej zabawy!</span>
        </div>
      )
  }
}

const SettingRow = ({ label, value }: { label: string; value: number }) => (
  <div>
    <span className="body-13 text-secondary">{label}</span>
    <Spacer h={6} />
    <div className="mock-track">
      <div className="mock-track-fill" style={{ width: `${value * 100}%` }} />
    </div>
  </div>
)

const Bubble = ({ emoji, text }: { emoji: string; text: string }) => (
  <span className="mock-bubble">
    {emoji} <span className="text-secondary">{text}</span>
  </span>
)

const VoteRow = ({ text, selected }: { text: string; selected: boolean }) => (
  <div className={`mock-vote ${selected ? 'selected' : ''}`}>
    <span>{text}</span>
    <span className="text-primary-accent">{selected ? '✓' : ''}</span>
  </div>
)

const ScoreRow = ({ player, score }: { player: string; score: number }) => (
  <div className="mock-score">
    <span>{player}</span>
    <span className="mock-score-value">{score}</span>
  </div>
)
