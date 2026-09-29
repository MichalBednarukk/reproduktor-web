// Logika przycisku „Dodaj do ekranu głównego” + dialog z instrukcją dla iPhone'a (Safari nie ma API instalacji).

import { useState } from 'react'
import { IosInstructions } from '../components/IosInstallInstructions'
import { useInstallPrompt } from './installPrompt'

/** Logika instalacji + ewentualny dialog z instrukcją. */
export function useInstallAction() {
  const install = useInstallPrompt()
  const [showIos, setShowIos] = useState(false)
  return {
    available: install.available,
    start: () => (install.needsInstructions ? setShowIos(true) : void install.install()),
    dialog: showIos ? <IosInstructions onClose={() => setShowIos(false)} /> : null,
  }
}
