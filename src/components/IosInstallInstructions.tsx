// Instrukcja „Dodaj do ekranu głównego” dla iPhone'a/iPada (Safari nie pozwala instalować z przycisku).

import { AlertDialog } from './Dialogs'

export function IosInstructions({ onClose }: { onClose: () => void }) {
  return (
    <AlertDialog
      title="📲 Dodaj do ekranu głównego"
      text={
        <ol className="install-steps">
          <li>
            Stuknij <strong>Udostępnij</strong> (kwadrat ze strzałką ↑) na pasku Safari.
          </li>
          <li>
            Wybierz <strong>„Do ekranu początkowego”</strong>.
          </li>
          <li>
            Potwierdź <strong>„Dodaj”</strong> — Reproduktor pojawi się na ekranie jak aplikacja.
          </li>
        </ol>
      }
      confirm={{ text: 'Rozumiem', onClick: onClose }}
      onDismissRequest={onClose}
    />
  )
}
