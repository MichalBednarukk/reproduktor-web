import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { installBackHandling } from './navigation/backHandler'
import { setupInstallPrompt } from './platform/installPrompt'
import './index.css'

registerSW({ immediate: true })
installBackHandling()
setupInstallPrompt()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
