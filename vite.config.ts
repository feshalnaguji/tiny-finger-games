import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: process.env.BASE_PATH ?? '/tiny-finger-games/',
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'Tiny Paws — safe play for tiny fingers',
        short_name: 'Tiny Paws',
        description:
          'A safe, fullscreen play site for toddlers: 12 mini-games behind a kid-lock so little fingers can’t wander off.',
        display: 'fullscreen',
        display_override: ['fullscreen', 'standalone'],
        orientation: 'any',
        background_color: '#2a1a5e',
        theme_color: '#2a1a5e',
        start_url: '.',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: null,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
});
