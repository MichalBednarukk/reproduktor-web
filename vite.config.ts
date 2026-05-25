import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Zmien na '/<nazwa-repozytorium>/' jezeli repo na GitHub ma inna nazwe niz reproduktor-web.
  base: '/reproduktor-web/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: false,
    }),
  ],
})
