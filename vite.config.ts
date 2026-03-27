import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['klinik-icon.svg'],
      manifest: {
        name: 'KliniK Rounds',
        short_name: 'KliniK',
        description: 'Clinical rounds companion for ward doctors',
        theme_color: '#0D9488',
        background_color: '#F9FAFB',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/Klinik/',
        start_url: '/Klinik/',
        icons: [
          {
            src: 'klinik-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cache the app shell (JS, CSS, HTML) so it works offline
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        // Network-first for API calls — fall back to cache if offline
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.anthropic\.com\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
        // CLINICAL: Never cache patient data responses
        navigateFallback: '/Klinik/index.html',
      },
    }),
  ],
  base: '/Klinik/',
  worker: {
    format: 'es',
  },
})
