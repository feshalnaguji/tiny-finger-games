# Tiny Paws — Launch Checklist

The operational steps for the public launch. Code-side SEO shipped in v2.0 (landing pages, hub,
about, privacy, sitemap, OG images, JSON-LD, deep links). Everything below is ordered — do it
top to bottom when launch time comes.

## 1. Buy the domain (owner action)

| Registrar                | .com cost (reg = renewal)   | Notes                                                            |
| ------------------------ | --------------------------- | ---------------------------------------------------------------- |
| **Cloudflare Registrar** | ~$10.44/yr at-cost forever  | Cheapest, free WHOIS privacy; must use Cloudflare DNS (good DNS) |
| **Porkbun**              | ~$11.06/yr flat             | Best UX, free WHOIS privacy, no renewal hikes                    |
| Namecheap                | $5.98 yr 1 → $18.48 renewal | Avoid for a keep-forever domain                                  |

Name candidates to check: `tinypawsgames.com`, `playtinypaws.com`, `tinypaws.app`,
`tinypawsplay.com`. Prefer `.com`; `.app` (~$14/yr, forced HTTPS) is the fallback.

> **Decide hosting together with the domain** — see `docs/HOSTING.md` for the full platform
> comparison (Cloudflare Pages recommended: unlimited bandwidth, monetization-safe, anonymous
> URL, private-repo capable) and the step-by-step migration runbook.

## 2. Connect the domain (5 minutes, code side is ready)

1. Add `public/CNAME` containing the bare domain (one line).
2. DNS at the registrar:
   - Apex `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME www` → `feshalnaguji.github.io`
3. GitHub repo → Settings → Pages → Custom domain → enter domain, wait for cert, tick
   **Enforce HTTPS**.
4. In `.github/workflows/ci.yml` build step add:
   `env: { BASE_PATH: '/', SITE_ORIGIN: 'https://<domain>' }`
   (this flips every canonical/OG/sitemap/robots URL in one place).
5. Push — GitHub 301-redirects all old `feshalnaguji.github.io/tiny-finger-games/*` URLs
   automatically; installed PWAs migrate on their own.

## 3. Search engines (needs owner's Google account)

1. **Google Search Console** → add property for the domain (DNS TXT verification at the
   registrar, or HTML-file method: drop the verification file in `public/` and push).
2. Submit `sitemap.xml` in Search Console.
3. URL Inspection → **Request indexing** for: home, `/games/`, and 4 flagship pages
   (bubble-pop, counting-pond, color-pop, sleepy-stars).
4. **Bing Webmaster Tools** → "Import from Google Search Console" (one click; also covers
   DuckDuckGo and Yahoo).

## 4. Validation pass (post-deploy, no logins needed)

- Google **Rich Results Test** on a game page (expect VideoGame + BreadcrumbList).
- An OG-card debugger (e.g. opengraph.xyz) on home + one game page — images and titles render.
- **Lighthouse** SEO category on home + one game page — target 100.

## 5. Community submissions (after the domain connects, so backlinks are permanent)

Order matters — do these over ~2 weeks, not all at once:

1. **Show HN** — angle: the engineering story. Draft title: "Show HN: I built 24 ad-free,
   tracking-free browser games for my toddler (with a kid-lock)". Link the privacy page in the
   first comment; mention every sound is synthesized and the whole site is ~150 KB.
2. **Product Hunt** — angle: the parent product. "The toddler arcade that collects nothing."
3. **Reddit**: r/InternetIsBeautiful, r/SideProject, r/webdev (showoff Saturday). Parenting
   subs only within their self-promo rules — answer "screen time app?" threads honestly.
4. **Outreach** to "best free games for toddlers" listicle authors + toddler-app roundup blogs —
   short email leaning on ad-free/COPPA-friendly/works-offline.
5. **Common Sense Media** suggestion form.

## 6. Success metrics (zero on-site tracking — Search Console IS the analytics)

- All sitemap URLs indexed within **4 weeks**.
- Impressions trending up for the query families ("toddler games", per-game titles) by **week 6**.
- Any top-20 ranking for one long-tail per-game query ("counting games for toddlers",
  "keyboard smash game for babies") by **week 8**.
- Never add analytics — the zero-tracking promise on the privacy page is the moat.
