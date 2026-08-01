import type { GameMeta } from '../../src/games/types.ts';
import type { GameCopy } from './content.ts';

export interface SiteConfig {
  /** e.g. https://feshalnaguji.github.io */
  origin: string;
  /** e.g. /tiny-finger-games/ */
  basePath: string;
  /** origin + basePath */
  url: string;
  gameCount: number;
}

const esc = (s: string): string =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const SHARED_CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:#17123a;color:#eae6f7;line-height:1.65}
  a{color:#b39ddb}
  .wrap{max-width:46rem;margin:0 auto;padding:0 1.25rem 3rem}
  header.hero{padding:3.5rem 1.25rem 2.5rem;text-align:center;color:#fff}
  header.hero .icon{font-size:4.5rem;line-height:1;display:block;margin-bottom:0.75rem}
  h1{font-size:clamp(1.6rem,5vw,2.4rem);font-weight:800}
  .tagline{opacity:0.85;margin-top:0.5rem;font-size:1.05rem}
  .cta{display:inline-block;margin-top:1.5rem;background:linear-gradient(160deg,#ffd54f,#ff9800);color:#3e2723;
    font-weight:800;font-size:1.2rem;padding:0.9rem 2.2rem;border-radius:3rem;text-decoration:none;
    box-shadow:0 8px 28px rgb(255 160 0 / .35)}
  main{padding-top:2rem}
  main p{margin-bottom:1rem}
  h2{font-size:1.25rem;margin:1.8rem 0 0.7rem;color:#ffd54f}
  ul.plain{padding-left:1.3rem;margin-bottom:1rem}
  ul.plain li{margin-bottom:0.4rem}
  .facts{display:flex;gap:0.6rem;flex-wrap:wrap;margin:1rem 0}
  .facts span{background:rgb(255 255 255 / 0.08);border-radius:2rem;padding:0.35rem 0.9rem;font-size:0.85rem}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(10.5rem,1fr));gap:0.8rem;margin:1rem 0}
  .grid a{display:flex;align-items:center;gap:0.6rem;background:rgb(255 255 255 / 0.07);border-radius:0.8rem;
    padding:0.7rem 0.9rem;text-decoration:none;color:#eae6f7;font-weight:600;font-size:0.95rem}
  .grid a .e{font-size:1.6rem}
  footer{border-top:1px solid rgb(255 255 255 / 0.12);margin-top:3rem;padding-top:1.5rem;font-size:0.88rem;opacity:0.9}
  footer nav{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1rem}
`;

interface PageOpts {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  themeColor: string;
  jsonLd: object[];
  heroHtml: string;
  bodyHtml: string;
  footerHtml: string;
  heroGradient: string;
}

export function renderPage(o: PageOpts): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.description)}" />
<link rel="canonical" href="${o.canonical}" />
<meta name="theme-color" content="${o.themeColor}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(o.title)}" />
<meta property="og:description" content="${esc(o.description)}" />
<meta property="og:url" content="${o.canonical}" />
<meta property="og:image" content="${o.ogImage}" />
<meta property="og:site_name" content="Tiny Paws" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(o.title)}" />
<meta name="twitter:description" content="${esc(o.description)}" />
<meta name="twitter:image" content="${o.ogImage}" />
<link rel="icon" href="../../icons/icon.svg" type="image/svg+xml" />
${o.jsonLd.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
<style>${SHARED_CSS}</style>
</head>
<body>
<header class="hero" style="background:${o.heroGradient}">${o.heroHtml}</header>
<div class="wrap">
<main>${o.bodyHtml}</main>
<footer>${o.footerHtml}</footer>
</div>
</body>
</html>
`;
}

export function gameLinkGrid(metas: readonly GameMeta[], base: string): string {
  return `<div class="grid">${metas
    .map(
      (m) =>
        `<a href="${base}games/${m.id}/"><span class="e">${m.icon}</span><span>${esc(m.title)}</span></a>`,
    )
    .join('')}</div>`;
}

export function commonFooter(site: SiteConfig, metas: readonly GameMeta[]): string {
  return `
<nav>
  <a href="${site.basePath}">▶️ Play Tiny Paws</a>
  <a href="${site.basePath}games/">All ${site.gameCount} games</a>
  <a href="${site.basePath}about/">About</a>
  <a href="${site.basePath}privacy/">Privacy</a>
  <a href="https://github.com/feshalnaguji/tiny-finger-games" rel="noreferrer">GitHub</a>
</nav>
<p>All ${site.gameCount} games:</p>
${gameLinkGrid(metas, site.basePath)}
<p>Tiny Paws 🐾 — free browser games for toddlers. No ads, no accounts, no tracking, ever.</p>`;
}

export function renderGamePage(
  meta: GameMeta,
  copy: GameCopy,
  site: SiteConfig,
  siblings: readonly GameMeta[],
): string {
  const canonical = `${site.url}games/${meta.id}/`;
  const playUrl = `${site.basePath}?game=${meta.id}`;
  const jsonLd: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: meta.title,
      description: copy.metaDescription,
      url: canonical,
      image: `${site.url}og/${meta.id}.png`,
      applicationCategory: 'Game',
      gamePlatform: 'Web Browser',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      audience: { '@type': 'PeopleAudience', suggestedMinAge: 1, suggestedMaxAge: 4 },
      isPartOf: { '@type': 'WebApplication', name: 'Tiny Paws', url: site.url },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Tiny Paws', item: site.url },
        { '@type': 'ListItem', position: 2, name: 'Games', item: `${site.url}games/` },
        { '@type': 'ListItem', position: 3, name: meta.title, item: canonical },
      ],
    },
  ];

  return renderPage({
    title: copy.metaTitle,
    description: copy.metaDescription,
    canonical,
    ogImage: `${site.url}og/${meta.id}.png`,
    themeColor: meta.color,
    jsonLd,
    heroGradient: `linear-gradient(160deg, ${meta.color} 0%, #17123a 130%)`,
    heroHtml: `
<span class="icon" role="img" aria-label="${esc(meta.title)}">${meta.icon}</span>
<h1>${esc(meta.title)} — free online game for toddlers</h1>
<p class="tagline">Part of Tiny Paws: ${site.gameCount} free games · no ads · no tracking</p>
<a class="cta" href="${playUrl}">▶ Play now — free</a>`,
    bodyHtml: `
<div class="facts">
  <span>Ages ${esc(copy.ageRange)}</span>
  ${copy.skills.map((s) => `<span>${esc(s)}</span>`).join('')}
  <span>works offline</span>
</div>
${copy.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n')}
<h2>How to play</h2>
<ul class="plain">${copy.howToPlay.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
<h2>Safe by design</h2>
<p>Like every Tiny Paws game, ${esc(meta.title)} runs fullscreen behind a kid-lock: your child can
play and switch games freely but can't accidentally leave, and exiting takes a deliberate
parent gesture (holding both top corners). There are no ads, no purchases, no accounts, and no
tracking of any kind — <a href="${site.basePath}privacy/">read the two-minute privacy page</a>.</p>
<p><a class="cta" href="${playUrl}">▶ Play ${esc(meta.title)} now</a></p>`,
    footerHtml: commonFooter(
      site,
      siblings.filter((s) => s.id !== meta.id),
    ),
  });
}

export function renderHub(metas: readonly GameMeta[], site: SiteConfig): string {
  const groups: [string, string[]][] = [
    ['Smash & pop', ['bubble-pop', 'space-smash', 'pop-pad', 'fireworks', 'feed-the-monster']],
    ['Music', ['rainbow-piano', 'drum-time']],
    [
      'Animals & nature',
      [
        'animal-friends',
        'guess-the-sound',
        'dino-stomp',
        'little-aquarium',
        'garden-friends',
        'rain-maker',
        'peekaboo',
      ],
    ],
    ['Early learning', ['counting-pond', 'color-pop', 'first-words', 'shape-party', 'match-pairs']],
    ['Vehicles & motion', ['beep-beep-cars', 'little-trains', 'star-catcher', 'finger-paint']],
    ['Wind-down', ['sleepy-stars']],
  ];
  const byId = new Map(metas.map((m) => [m.id, m]));
  return renderPage({
    title: `${site.gameCount} Free Toddler Games Online — No Ads, No Tracking | Tiny Paws`,
    description: `Every Tiny Paws game: ${site.gameCount} free browser games for babies and toddlers aged 1–4. Bubbles, piano, animals, counting, colors and more — safe, ad-free, offline-capable.`,
    canonical: `${site.url}games/`,
    ogImage: `${site.url}og/og-home.png`,
    themeColor: '#2a1a5e',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: metas.map((m, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: m.title,
          url: `${site.url}games/${m.id}/`,
        })),
      },
    ],
    heroGradient: 'linear-gradient(160deg, #2a1a5e 0%, #4527a0 55%, #7b1fa2 100%)',
    heroHtml: `
<span class="icon">🐾</span>
<h1>${site.gameCount} free toddler games</h1>
<p class="tagline">For ages 1–4 · plays in any browser · no ads, no accounts, no tracking</p>
<a class="cta" href="${site.basePath}">▶ Open Tiny Paws</a>`,
    bodyHtml: groups
      .map(
        ([label, ids]) => `
<h2>${label}</h2>
${gameLinkGrid(
  ids.map((id) => byId.get(id)).filter((m): m is GameMeta => Boolean(m)),
  site.basePath,
)}`,
      )
      .join('\n'),
    footerHtml: commonFooter(site, metas),
  });
}

export function renderAbout(metas: readonly GameMeta[], site: SiteConfig): string {
  return renderPage({
    title: 'About Tiny Paws — Safe Browser Games for Toddlers',
    description:
      'Why Tiny Paws exists, how the kid-lock keeps little fingers inside the app, and how touch, keyboard, gamepad, and MIDI piano all work.',
    canonical: `${site.url}about/`,
    ogImage: `${site.url}og/og-home.png`,
    themeColor: '#2a1a5e',
    jsonLd: [],
    heroGradient: 'linear-gradient(160deg, #2a1a5e 0%, #4527a0 55%, #7b1fa2 100%)',
    heroHtml: `<span class="icon">🐾</span><h1>About Tiny Paws</h1>
<p class="tagline">A play site for toddlers that respects toddlers — and their parents</p>`,
    bodyHtml: `
<p>Tiny Paws is a free, fullscreen play site for children aged one to four. It holds
${site.gameCount} small games — popping, drumming, counting, painting, peekaboo — each built on
the same promises: <strong>no reading required, no failure states, no timers, no scores.</strong>
Every tap does something joyful within a frame, because at this age cause-and-effect is the
whole curriculum.</p>
<h2>The kid-lock</h2>
<p>One tap on ▶️ takes the site fullscreen and arms a lock: the back button, edge-swipes,
pinch-zoom, context menus, and most keyboard shortcuts are absorbed so a toddler can't
accidentally wander into your email. Getting out is for grown-ups: <strong>hold both top corners
for 2½ seconds</strong> (or type <code>parent</code> on a keyboard) to open the parent panel,
where you can toggle sound, spoken words, and calm mode, see play stats, or exit.</p>
<h2>Four ways to play</h2>
<ul class="plain">
<li><strong>Touch</strong> — full multi-touch everywhere, targets sized for tiny fingers</li>
<li><strong>Keyboard</strong> — every game is keyboard-smashable; any key does something delightful</li>
<li><strong>Gamepad</strong> — plug in any controller; every button plays</li>
<li><strong>MIDI piano</strong> — connect from the parent panel; real pitches play Rainbow Piano's bars</li>
</ul>
<h2>Light and honest</h2>
<p>The whole site weighs about as much as one photo, works offline after the first visit (add it
to your home screen), and every sound is synthesized in the browser — there are no downloads,
no ads, no accounts, and <a href="${site.basePath}privacy/">no tracking of any kind</a>. The
code is open source on <a href="https://github.com/feshalnaguji/tiny-finger-games" rel="noreferrer">GitHub</a>.</p>`,
    footerHtml: commonFooter(site, metas),
  });
}

export function renderPrivacy(metas: readonly GameMeta[], site: SiteConfig): string {
  return renderPage({
    title: 'Privacy — Tiny Paws Collects Nothing',
    description:
      'Tiny Paws has no ads, no analytics, no cookies, no accounts, and makes zero third-party requests. Here is exactly what that means, verifiably.',
    canonical: `${site.url}privacy/`,
    ogImage: `${site.url}og/og-home.png`,
    themeColor: '#2a1a5e',
    jsonLd: [],
    heroGradient: 'linear-gradient(160deg, #1b5e20 0%, #2e7d32 60%, #43a047 100%)',
    heroHtml: `<span class="icon">🔒</span><h1>Privacy: we collect nothing</h1>
<p class="tagline">The shortest privacy page you'll read this year</p>`,
    bodyHtml: `
<p>Tiny Paws is built for the youngest people on the internet, so it holds itself to the
strictest possible standard: <strong>it collects no data, from anyone, ever.</strong></p>
<h2>Specifically</h2>
<ul class="plain">
<li><strong>No ads</strong> — nothing is sold, promoted, or linked out to a store</li>
<li><strong>No analytics or trackers</strong> — no Google Analytics, no pixels, no fingerprinting</li>
<li><strong>No cookies</strong> — the site sets none</li>
<li><strong>No accounts</strong> — nothing to sign up for, no emails collected</li>
<li><strong>No third-party requests</strong> — the site talks to no server but its own host</li>
</ul>
<h2>Verifiable, not just promised</h2>
<p>The site ships a Content-Security-Policy of <code>connect-src 'self'</code> — the browser
itself blocks any attempt to contact another server. You can confirm in your browser's network
inspector that after loading, Tiny Paws makes zero external requests. The full source code is
public on <a href="https://github.com/feshalnaguji/tiny-finger-games" rel="noreferrer">GitHub</a>.</p>
<h2>What stays on your device</h2>
<p>Settings (sound, calm mode) and playful tap counts are stored in your browser's local
storage on your device only. They never leave it, and clearing your browser data erases them.</p>
<h2>COPPA</h2>
<p>Because Tiny Paws collects no personal information from anyone — child or adult — there is
nothing to consent to, disclose, or delete. That's the whole policy.</p>`,
    footerHtml: commonFooter(site, metas),
  });
}
