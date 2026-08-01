# Tiny Paws — Hosting Options (decision file for launch/monetization time)

We currently deploy to **GitHub Pages** at `feshalnaguji.github.io/tiny-finger-games/`. Two
known problems with staying there long-term: the URL exposes the owner's personal name, and
free GitHub Pages requires the repo to stay public. This file keeps every option open with
real terms and prices so the decision can be made at launch (or monetization) time without
re-research. All site URLs already derive from `SITE_ORIGIN`/`BASE_PATH` env vars, so any
migration is ~30 minutes of work.

## The comparison (free tiers, verified 2026)

|                         | Cloudflare Pages                                                                | Netlify                | Vercel                                   | GitHub Pages (current) |
| ----------------------- | ------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------- | ---------------------- |
| Free bandwidth          | **Unlimited**                                                                   | 100 GB/mo              | 100 GB/mo                                | ~100 GB/mo (soft)      |
| Monetization on free    | **Allowed**                                                                     | Allowed                | **Prohibited** (Hobby is non-commercial) | Tolerated, soft limits |
| Private repo            | ✅                                                                              | ✅                     | ✅                                       | ❌ forces public       |
| Anonymous URL           | `tinypaws.pages.dev`                                                            | `tinypaws.netlify.app` | `tinypaws.vercel.app`                    | ❌ username in URL     |
| Real HTTP headers (CSP) | ✅ `_headers` file                                                              | ✅ `_headers` file     | ✅ `vercel.json`                         | ❌ meta tags only      |
| Builds/mo (free)        | 500                                                                             | 300 build minutes      | 6,000 minutes                            | Actions minutes        |
| Next paid tier          | $20/mo (Workers Paid; rarely needed for static)                                 | $19/mo                 | $20/mo                                   | n/a                    |
| Domain synergy          | **Registrar + DNS + hosting in one account**; at-cost domains (~$10.44/yr .com) | external registrar     | external registrar                       | external registrar     |

## Recommendation (recorded, not yet executed)

**Cloudflare Pages**, because every future path is safe there:

1. **Viral-proof** — unlimited bandwidth means a Show HN front-page day or a TikTok moment
   costs $0. Netlify/Vercel would cap or bill at 100 GB (a viral day for a 175 KB site is
   survivable, but embedded OG images + landing pages add up).
2. **Monetization-safe** — the free tier explicitly allows commercial use. Vercel's Hobby tier
   prohibits it, which eliminates Vercel given the stated plan to monetize eventually.
3. **Anonymity** — `tinypaws.pages.dev` carries no personal name, and the repo can go private.
4. **One-account operations** — we already recommend Cloudflare Registrar for the domain
   (at-cost pricing, see LAUNCH.md); Pages + DNS + domain in one dashboard is the simplest
   possible ops story.
5. **Security upgrade for free** — a `_headers` file gives the real HTTP CSP (plus
   `X-Frame-Options`, `Referrer-Policy`) instead of today's meta-tag CSP.

Netlify is the runner-up (same terms, capped bandwidth). Vercel is eliminated by its
non-commercial free tier. GitHub Pages remains fine until launch.

## Migration runbook (Cloudflare Pages, when decided)

1. Create a free Cloudflare account → Workers & Pages → create a Pages project named
   `tinypaws` (claims `tinypaws.pages.dev` — check availability early, names are
   first-come).
2. Don't use CF's git build — keep our GitHub Actions CI as the gate. Add a deploy step after
   `npm run build`:
   `npx wrangler pages deploy dist --project-name=tinypaws`
   with repo secrets `CLOUDFLARE_API_TOKEN` (Pages:Edit permission) and `CLOUDFLARE_ACCOUNT_ID`.
3. Set build env in that step: `BASE_PATH: '/'` and `SITE_ORIGIN: 'https://tinypaws.pages.dev'`
   (or the custom domain once bought) — this flips every canonical/OG/sitemap/robots URL.
4. Add `public/_headers` with the CSP (copy from index.html meta), `X-Frame-Options: DENY`,
   `Referrer-Policy: no-referrer`. Optionally drop the meta CSP afterward.
5. Verify `tinypaws.pages.dev` fully (app + /games/ pages + sitemap + OG images), THEN remove
   the GitHub Pages deploy job from `ci.yml` and disable Pages in repo settings.
6. Custom domain: add it to the Pages project (CF handles DNS automatically if the domain is
   at Cloudflare Registrar); update `SITE_ORIGIN` to the domain.
7. Search Console: add the new property, submit the sitemap, keep the old property until
   traffic drains. (Old github.io URLs 404 after Pages is disabled — if we've already been
   indexed by then, keep GH Pages up for a month serving `<meta http-equiv="refresh">` stubs;
   if pre-launch, just cut over.)

## Repo visibility (recommendation: keep public for now)

- Going private **today** would kill GitHub Pages and take the live site down — only possible
  at/after migration.
- The personal-name problem lives in the hosting URL, which migration fixes regardless of repo
  visibility.
- "The code is open source" is a real trust asset on the privacy page of a kids' site and in
  every launch submission. Weigh that against privacy of the code before flipping.
- **If we do go private at migration time**, also: remove the GitHub repo links from
  `scripts/seo/template.ts` (footer + about + privacy pages) and `src/ui/parent-panel.ts`, and
  reword the privacy page's proof paragraph to lean on the CSP + the browser network tab
  (both remain verifiable without source access).
