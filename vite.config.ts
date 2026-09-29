import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Strona jest publikowana na GitHub Pages pod /reproduktor-web/ (repo MichalBednarukk/reproduktor-web).
  // Przy zmianie nazwy repo lub adresu trzeba zmienić tę ścieżkę.
  base: '/reproduktor-web/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // używamy public/manifest.json
      workbox: {
        // Baza haseł (.json) i ikony też trafiają do cache — gra działa offline.
        globPatterns: ['**/*.{js,css,html,json,png,svg,woff2}'],
      },
    }),
  ],
})
