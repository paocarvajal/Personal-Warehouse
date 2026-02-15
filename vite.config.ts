import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Personal Warehouse',
        short_name: 'Warehouse',
        description: 'Gestión inteligente de inventario personal',
        theme_color: '#242938',
        background_color: '#1A1D29',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'pwa-icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  base: '/Personal-Warehouse/',
  server: {
    host: true
  }
})
