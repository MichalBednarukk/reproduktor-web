// Wspólne dla ekranów w trakcie gry: ✕ i systemowe „wstecz” otwierają ExitGameDialog.

import { useState } from 'react'
import { ExitGameDialog } from '../components/Dialogs'
import type { Game } from '../game/useGame'
import { useBackHandler } from '../navigation/backHandler'

export function useExitGame(game: Game) {
  const [open, setOpen] = useState(false)
  useBackHandler(() => setOpen(true))

  const dialog = open ? (
    <ExitGameDialog
      onDismiss={() => setOpen(false)}
      onConfirm={() => {
        setOpen(false)
        game.exitToStart()
      }}
    />
  ) : null

  return { openExitDialog: () => setOpen(true), exitDialog: dialog }
}
