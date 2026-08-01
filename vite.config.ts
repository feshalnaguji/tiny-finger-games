import { defineConfig, type Plugin } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';
import { catalog } from './src/games/catalog.ts';

const SITE_ORIGIN = process.env.SITE_ORIGIN ?? 'https://feshalnaguji.github.io';
const BASE_PATH = process.env.BASE_PATH ?? '/tiny-finger-games/';
const SITE_URL = SITE_ORIGIN + BASE_PATH;

/** Replaces %SITE_URL%, %GAME_LINKS%, %JSONLD% in index.html at build time. */
function seoHtml(): Plugin {
  return {
    name: 'tiny-paws-seo-html',
    transformIndexHtml(html) {
      const gameLinks = catalog
        .map((m) => `<li><a href="${BASE_PATH}games/${m.id}/">${m.icon} ${m.title}</a></li>`)
        .join('\n          ');
      const jsonLd = JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Tiny Paws',
          url: SITE_URL,
          description: `${catalog.length} free browser games for toddlers aged 1-4. No ads, no accounts, no tracking.`,
          applicationCategory: 'GameApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          audience: { '@type': 'PeopleAudience', suggestedMinAge: 1, suggestedMaxAge: 4 },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: catalog.map((m, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: m.title,
            url: `${SITE_URL}games/${m.id}/`,
          })),
        },
      ]);
      return html
        .replaceAll('%SITE_URL%', SITE_URL)
        .replace('%GAME_LINKS%', gameLinks)
        .replace('%JSONLD%', jsonLd);
    },
  };
}

export default defineConfig({
  base: BASE_PATH,
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  plugins: [
    seoHtml(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'Tiny Paws — safe play for tiny fingers',
        short_name: 'Tiny Paws',
        description: `A safe, fullscreen play site for toddlers: ${catalog.length} free games behind a kid-lock, with no ads and no tracking.`,
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
        globIgnores: ['games/**', 'about/**', 'privacy/**', 'og/**'],
        navigateFallback: null,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
});
