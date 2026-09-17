# IceGames Portfolio — Redesign Spec (dark, single page, static)

**Date:** 2026-09-17
**Owner:** Vitor Albert (IceGames)
**Status:** Approved for planning
**Source design:** Claude Design project `63d584d8-6609-4b4e-b91a-bfc85150f75a`, file `Portfolio.dc.html` (kept in `docs/design/Portfolio.dc.html`)

## Purpose

Rebuild icegames.me from scratch as a faithful implementation of the new dark
single-page design. The previous Astro site was removed in commit `31e3116`.
Nothing from it is reused.

## Decisions (made during brainstorming)

| Topic | Decision |
|---|---|
| Stack | Static HTML + CSS + vanilla JS. No build step, no framework, no Node dependency. |
| Hosting | Cloudflare Pages, repo root as output dir, no build command. Domain `icegames.me`. |
| Contact form | Keep the design's behavior: validate → 1.6 s "sending" state → Discord fallback modal. No backend. |
| Languages | PT/EN client-side toggle (design behavior). Initial: `localStorage.ig_lang` → `navigator.language` starts with `pt` → else `en`. `<html lang>` follows. |
| Content editing | All content (projects, testimonials, clients, PT/EN strings) lives in `js/data.js`. Editing content never touches HTML/CSS. |
| Assets | Already in `assets/`. Oversized PNGs are resized to display size. Videos stay as-is with `preload="metadata"`. |
| Design-tool files | `uploads/`, `support.js`, `image-slot.js`, `.thumbnail` are deleted. `Portfolio.dc.html` moves to `docs/design/`. |

## Non-goals

- No CMS, backend, database or form service.
- No per-language URLs (`/pt`, `/en`); single URL.
- No tests requiring Node (none installed on the dev machine). Verification is manual in the browser.
- No project detail pages; projects open in a modal as designed.

## Repository layout

```
index.html                 single page, all sections
css/site.css               all styles (inline styles from the design → classes)
js/data.js                 PROJECTS, TESTIMONIALS, CLIENTS, SERVICES, STR (pt/en), VOCAB_EN
js/site.js                 rendering, i18n, filters, modal, snow, testimonial rail, form, splash, reveal
assets/                    images, videos, favicon.svg, logo-mark.svg
_headers                   Cloudflare Pages headers
robots.txt
sitemap.xml
docs/design/Portfolio.dc.html   original design, reference only
docs/superpowers/specs/…        this spec
```

## Visual system (from the design, unchanged)

- Background `#0B0B0C`, surface `#131315`, borders `#26262A` / `#3A3A3F`,
  text `#F4F1EA`, muted `#A8A49C`, dim `#8F8C85`, accent `--ac: #6ED4F2`,
  error `#FF8A6B`.
- Fonts (Google Fonts): Bricolage Grotesque (body/headings, 400/600/800),
  Instrument Serif italic (accents), JetBrains Mono (labels, nav, buttons).
- Layout: `max-width: 1320px`, horizontal padding `clamp(20px, 4vw, 56px)`,
  sections separated by 1 px `#26262A` borders, `scroll-margin-top: 72px`.
- Breakpoints: ≤1080 px hides desktop nav; ≤900 px stacks two-column grids,
  hides project meta columns, steps 2 cols; ≤620 px steps 1 col.
- Motion: reveal (`translateY(26px)` → 0, 0.8 s), marquee 36 s, splash bar,
  blink dot, flip card 0.9 s. All respects `prefers-reduced-motion`
  (snow off, marquee off, rail auto-scroll off).

## Page sections (top to bottom)

1. **Splash** — fixed overlay "IceGames" + loading bar. Hidden (`data-hide`)
   350 ms after `window.load`, or 450 ms if already complete, fallback 2.6 s.
2. **Snow canvas** — fixed, `mix-blend-mode: screen`, `pointer-events: none`.
   Flake count `min(220, w*h/9000)`, gust factor `1 + 3.4·e^(−t/1.9)`,
   large flakes use accent color. Skipped under reduced motion.
3. **Header** — sticky, blurred. Logo `ICEGAMES.ME` → `#topo`; nav links
   (`#trabalho`, `#servicos`, `#processo`, `#sobre`, `#contato`); EN/PT
   buttons with `data-active`; CTA → `#contato`.
4. **Hero** (`#topo`) — role line with blinking dot, H1 with italic serif
   accent word, subtitle, two CTAs. Below: "Worked with" label + client logo
   marquee (list duplicated for seamless loop, grayscale until hover, paused
   on hover; logos with `href` are links).
5. **Projects** (`#trabalho`) — eyebrow/title + 4 filter chips
   (Todos/All, Minecraft, Game Design, IA / Software). Rows:
   `num | title | category | year | arrow`; whole row is a button opening the
   modal; hover inverts to accent background. Empty state text when a filter
   has no projects.
6. **Services** (`#servicos`) — 2-col grid of 4 services: serif number,
   model label, title, promise, description, tag chips, "See the proof"
   button that opens the linked project's modal (`dinosaurs`, `afterlands`,
   `highschool`, `cortex`).
7. **About** (`#sobre`) — flip card (avatar front, grayscale photo back,
   flips on hover) with "hover to flip" hint; eyebrow, title, serif lead,
   body, 2×2 fact grid.
8. **Testimonials** — header with "Drag to explore" hint; horizontal rail
   with list duplicated; auto-scroll 0.5 px/frame with seamless wrap, paused
   on pointer enter, draggable via pointer events (resume 1.4 s after
   release), native scroll allowed on touch (`touch-action: pan-y`).
9. **Process** (`#processo`) — 4-step grid with 1 px gap lines, three ✓
   guarantees below.
10. **Contact** (`#contato`) — left: eyebrow, title, sub, links (GitHub,
    LinkedIn, Discord handle). Right: form (name, email, message) with
    underline inputs and inline PT/EN errors; or success panel (markup kept,
    never reached in v1). Submit: validate → `sending` 1.6 s → open Discord
    modal.
11. **Footer** — © year · tagline · "↑ Top".
12. **Discord modal** — overlay, card with handle `icegames` and 4 "tell me"
    items; closes on backdrop click, ESC, close button. Locks body scroll.
13. **Project modal** — overlay, card ≤680 px. Hero media = `media[0]`;
    gallery = rest in a 2-col grid (`scroll` items and first item span full
    width). Category badge, close button, title + year, optional hero
    caption, long text, 3 metrics, tags, CTA "I want something like this"
    (→ `#contato`, closes modal) and optional external link. Media types:
    - `file` → `<video controls playsinline preload="metadata">`
    - `youtube` → link to watch page with `maxresdefault.jpg` thumbnail and
      "▶ YouTube" badge (no iframe)
    - `scroll` → `<img>` inside a 460 px (hero) / 420 px (gallery)
      scrollable box, with caption
    - `image` → `<img>` with the given `aspect`
    Closes on backdrop click, ESC, close button. Locks body scroll.

## Data model (`js/data.js`)

```js
export const PROJECTS = [{ id, category, title, label?, year: string | {pt,en},
  short:{pt,en}, long:{pt,en}, tags:[string], link?:{url,label:{pt,en}},
  media:[{type:'file'|'youtube'|'scroll'|'image', src?, yt?, aspect?, caption?:{pt,en}}],
  metrics:[{value, label:{pt,en}}] }]
export const TESTIMONIALS = [{ name, stars, role:{pt,en}, quote:{pt,en} }]
export const CLIENTS = [{ id, name, src, w, h, href }]
export const SERVICES = [{ n, proof, tags:[string] }]   // text comes from STR
export const STR = { pt:{…}, en:{…} }                   // all UI strings, verbatim from the design
export const VOCAB_EN = { 'Arquitetura':'Architecture', … } // tag/metric translation
```

Content is copied verbatim from the design, including the six projects,
five testimonials and six clients. Testimonials whose original text is
English keep that text in both languages.

## i18n mechanism

- Static text nodes carry `data-i18n="key"`; placeholders carry
  `data-i18n-placeholder="key"`. `setLang(l)` writes `STR[l][key]` into each,
  sets `<html lang>`, updates `data-active` on the EN/PT buttons, stores the
  choice, and re-renders the dynamic sections (projects, services, clients,
  testimonials, steps, open modal if any).
- Tags and metric values pass through `VOCAB_EN` when `lang === 'en'`.
- Category label: `project.label` if present, else the translated filter name.

## Assets

Resized in place with PowerShell (`System.Drawing`) to about 2× display size:

| File | Displayed at | Target |
|---|---|---|
| `vitor-avatar.png` | ≤420 px square | 840×840 |
| `vitor-photo.jpeg` | ≤420 px square | keep (106 KB) |
| `client-afterlands.png` | 270×72 | 540×144 |
| `client-tabiquest.png` | 110×110 | 220×220 |
| `client-panda.png` | 92×84 | 184×168 |
| `client-eco.png` | 206×72 | 412×144 |
| `client-mia.png` | 212×72 | 424×144 |
| `afterlands-site.png` | ≤680 px wide, scrollable | 1360 px wide |
| `cortex-demo.png`, `dinosaurs-gdd-p1.png` | ≤680 px wide | keep (<210 KB) |
| `iglanguages-demo.gif` | ≤680 px wide | keep (animated; no tool to recompress) |
| `*.mp4` | modal only | keep, `preload="metadata"` |

Aspect ratios are preserved; the design's `w`/`h` for logos are kept (they
use `fit: contain`).

## SEO / meta

- `<title>Vitor Albert · IceGames — Software Engineer & Game Designer</title>`
- Meta description in PT (default audience), `lang` attribute set at runtime.
- Canonical `https://icegames.me/`, Open Graph + Twitter card with
  `assets/vitor-avatar.png` (1200×630 not available; square image is
  acceptable for OG).
- JSON-LD `Person` (name, alternateName IceGames, jobTitle, url, sameAs
  GitHub/LinkedIn).
- `robots.txt` allowing all + sitemap URL; `sitemap.xml` with the single URL.
- `_headers`: `assets/*` → `Cache-Control: public, max-age=604800` (1 week; file names are not hashed, so no `immutable`);
  `/*` → `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `X-Frame-Options: DENY`.

## Error handling

- `localStorage` access wrapped in try/catch (private mode).
- Missing `_snow`/`_testi` elements → feature skipped, page still works.
- Media that fails to load shows the browser default; no custom placeholder
  (`image-slot` drop zones from the design tool are not reproduced).
- Form: errors shown inline under each field; submit blocked while sending.

## Verification

Manual, in the browser (no Node on the machine):

1. Open `index.html` via a local static server (PowerShell one-liner or
   `run` skill) at 1440 px and 390 px widths.
2. Splash hides; snow renders; header nav hides ≤1080 px.
3. EN ↔ PT: every visible string switches, `<html lang>` updates, choice
   persists across reload.
4. Filters: each chip shows the right rows; "Game Design" shows 1, "IA /
   Software" shows 1.
5. Each of the 6 projects opens its modal with the right media type; ESC,
   backdrop and ✕ close it; body scroll restores.
6. Each service "See the proof" opens the mapped project.
7. Testimonial rail auto-scrolls, pauses on hover, drags, wraps without
   a visible jump.
8. Flip card flips on hover.
9. Form: empty submit shows 3 errors; valid submit shows "Sending" then the
   Discord modal.
10. `prefers-reduced-motion` emulated: no snow, no marquee, no auto-scroll.
11. Lighthouse (Chrome DevTools): no console errors, images sized sanely.
