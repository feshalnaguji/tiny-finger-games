// Post-build SEO generator: writes per-game landing pages, the games hub,
// about + privacy pages, sitemap.xml, robots.txt, and OG share images into
// dist/. Runs under plain Node (type-stripping) — no bundler involved.
// Usage: node scripts/generate-seo.ts   (after `vite build`)
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { catalog } from '../src/games/catalog.ts';
import { gameCopy } from './seo/content.ts';
import {
  renderAbout,
  renderGamePage,
  renderHub,
  renderPrivacy,
  type SiteConfig,
} from './seo/template.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

const origin = process.env.SITE_ORIGIN ?? 'https://feshalnaguji.github.io';
const basePath = process.env.BASE_PATH ?? '/tiny-finger-games/';
const site: SiteConfig = { origin, basePath, url: origin + basePath, gameCount: catalog.length };

async function page(rel: string, html: string): Promise<void> {
  const dir = path.join(dist, rel);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), html);
}

// ---------- pages ----------
for (const meta of catalog) {
  await page(`games/${meta.id}`, renderGamePage(meta, gameCopy[meta.id], site, catalog));
}
await page('games', renderHub(catalog, site));
await page('about', renderAbout(catalog, site));
await page('privacy', renderPrivacy(catalog, site));

// ---------- sitemap + robots ----------
const urls = [
  site.url,
  `${site.url}games/`,
  ...catalog.map((m) => `${site.url}games/${m.id}/`),
  `${site.url}about/`,
  `${site.url}privacy/`,
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`;
await writeFile(path.join(dist, 'sitemap.xml'), sitemap);
await writeFile(
  path.join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${site.url}sitemap.xml\n`,
);

// ---------- OG images (1200x630) ----------
// Text uses widely-available system fonts; artwork is the paw icon composited
// from its SVG, so no color-emoji font is required on CI runners.
const pawPng = await sharp(path.join(root, 'public', 'icons', 'icon.svg'))
  .resize(300, 300)
  .png()
  .toBuffer();

function ogSvg(bg1: string, bg2: string, title: string, subtitle: string): string {
  const esc = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/>
  </linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="1050" cy="80" r="10" fill="#ffffff" opacity="0.85"/>
  <circle cx="1105" cy="130" r="6" fill="#ffffff" opacity="0.6"/>
  <circle cx="120" cy="520" r="8" fill="#ffffff" opacity="0.5"/>
  <text x="400" y="300" font-family="Segoe UI, DejaVu Sans, sans-serif" font-size="86"
    font-weight="800" fill="#ffffff">${esc(title)}</text>
  <text x="400" y="390" font-family="Segoe UI, DejaVu Sans, sans-serif" font-size="40"
    fill="#ffffff" opacity="0.88">${esc(subtitle)}</text>
</svg>`;
}

async function og(
  file: string,
  bg1: string,
  bg2: string,
  title: string,
  subtitle: string,
): Promise<void> {
  const base = await sharp(Buffer.from(ogSvg(bg1, bg2, title, subtitle)))
    .png()
    .toBuffer();
  await sharp(base)
    .composite([{ input: pawPng, left: 60, top: 165 }])
    .png()
    .toFile(path.join(dist, 'og', file));
}

await mkdir(path.join(dist, 'og'), { recursive: true });
await og(
  'og-home.png',
  '#2a1a5e',
  '#7b1fa2',
  'Tiny Paws',
  `${catalog.length} free toddler games · no ads · no tracking`,
);
for (const meta of catalog) {
  await og(`${meta.id}.png`, meta.color, '#17123a', meta.title, 'Free toddler game · Tiny Paws');
}

console.log(
  `seo: ${catalog.length} game pages, hub, about, privacy, sitemap (${urls.length} urls), robots, ${catalog.length + 1} og images → dist/`,
);
