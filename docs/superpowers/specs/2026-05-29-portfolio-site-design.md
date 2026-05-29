# IceGames Portfolio Site — Design Spec

**Date:** 2026-05-29
**Owner:** Vitor Albert (IceGames)
**Status:** Approved for planning

## Purpose

A personal portfolio site for Vitor Albert ("IceGames") — a 21-year-old game
designer and Java developer. The site wins freelance/contract work and showcases
past projects to two audiences: gaming/Minecraft clients and companies seeking
AI/software work.

## Goals

- Present Vitor's identity, services, and best projects clearly and persuasively.
- Be findable: strong SEO so prospective clients who search his name/brand find it.
- Bilingual (Portuguese-BR and English) for local and international clients.
- Easy to maintain: add/edit projects and testimonials by editing files in the repo.
- Host-agnostic: a fully static build that runs on Vercel, Netlify, GitHub Pages, or a VPS.

## Non-Goals (YAGNI)

- No CMS or admin panel — content lives in version-controlled files.
- No backend or database.
- No contact form — contact is via direct links.
- No blog (can be added later; out of scope for v1).
- No dark mode toggle in v1 (the chosen direction is the light "Frost Light" theme).

## Audience & Brand

- **Audience A:** gaming/Minecraft project owners and players (more casual).
- **Audience B:** companies and international clients hiring Java/AI/software work (more serious).
- **Brand vibe:** "professional with a gamer edge" — credible and clean, with gaming
  energy expressed through microinteractions, iconography, and cold/ice hover effects
  rather than a dark/edgy base.

## Visual Direction — "Frost Light"

- Light theme: white and pale-blue backgrounds with ice-gradient accents.
- Primary accent: icy blue (e.g. `#2f9fd6` → `#1c6fb0` gradients); deep navy (`#0f2438`)
  for the footer and strong text.
- Clean typography, generous spacing, soft shadows with a cool tint.
- "Gamer edge" via: subtle scroll/reveal animations, frosty hover states on cards,
  a snowflake/ice motif in the logo (`❄ ICEGAMES`), and tasteful microinteractions.

**Frontend-design refinements (added after design review):**

- **Typography (distinctive, self-hosted):** display = *Bricolage Grotesque*; body =
  *Hanken Grotesk*; mono accent = *JetBrains Mono* for section labels, the role tagline,
  and tech tags (dev/gamer credibility). Deliberately avoids generic Inter/Space Grotesk.
- **Atmosphere:** layered cool gradient + frost-mesh radial glows + a faint grain overlay
  instead of flat white; frosted-glass cards (`backdrop-blur`).
- **Accent:** an electric cyan (`#38bdf8`) used sparingly alongside the ice blue for the
  "gamer edge" highlight (hover glow, gradient text).
- **Composition:** asymmetric hero — large name block left, floating glass stat card
  (AfterLands / Founder & CEO) right; mono kicker labels above section headings.
- **Motion:** one orchestrated page-load with staggered reveal in the hero; frost hover
  (cyan glow + lift) on cards. All motion respects `prefers-reduced-motion`.
- **Snowstorm preloader:** a signature first-visit intro — a lightweight canvas blizzard
  overlay that fades out to reveal the hero. Shows once per session (`sessionStorage`),
  is purely decorative (full HTML renders beneath, so SEO/no-JS unaffected), and is
  skipped entirely under `prefers-reduced-motion`.

Final exact spacing/token values are settled during implementation; this spec fixes the
direction and the key creative decisions above.

## Information Architecture

Single-page home composed of stacked sections, plus per-project detail pages.

**Home section order:**

1. **Navbar** — IceGames logo, section links, PT/EN language switcher.
2. **Hero** — name + role tagline ("Game Designer · Java Developer"), short value
   statement, two CTAs: "Ver projetos" and "Me contratar" (scroll to contact).
3. **About** — avatar/photo + short bio (age, role, AfterLands CEO, freelance Java dev, AI software builder).
4. **Services** — three cards: Minecraft servers (RankUP/MMORPG, plugins); Java/backend
   development for international clients; AI process-acceleration software for companies.
5. **Projects (featured)** — AfterLands featured + a few other projects as cards, each
   linking to its detail page; "ver todos os projetos" link.
6. **Skills / Stack** — technologies (Java, Spigot/Paper, Spring, Python, AI/LLMs, JS,
   databases, Git, design).
7. **Testimonials** — client/collaborator quotes from data files (social proof before CTA).
8. **Contact / CTA** — heading + direct links: email, Discord, GitHub, LinkedIn (no form).
9. **Footer** — copyright, social links, language note.

**Project detail page** (`/{lang}/projetos/{slug}`): full description, images, tech
stack used, role, and external links (live link, repo, etc.).

## Technical Architecture

**Stack:** Astro + Tailwind CSS + React islands. Static output (`astro build`).

### Folder structure

```
src/
  content/
    projects/            # one .md per project, with pt + en fields
    testimonials/        # one file per testimonial
    config.ts            # Zod schemas for collections (build-time validation)
  i18n/
    pt.json, en.json     # UI strings (navbar, buttons, labels)
    utils.ts             # translation helper + current-language resolver
  components/            # Navbar, LanguageSwitcher, Hero, ServiceCard, ProjectCard,
                         # Testimonial, ContactLinks, SectionReveal, etc.
  layouts/
    BaseLayout.astro     # <head>, SEO/meta tags, fonts, Frost Light theme shell
  pages/
    [lang]/
      index.astro        # home — composes all sections
      projetos/[slug].astro  # project detail pages (generated from collection)
  styles/                # Tailwind entry + ice color tokens
public/                  # images, favicon, og-image
astro.config.mjs         # i18n config (default: pt; locales: pt, en)
tailwind.config.mjs
```

### i18n

- Astro i18n routing generates `/pt/...` and `/en/...` statically; Portuguese is default.
- UI strings live in `pt.json` / `en.json` and are resolved via `i18n/utils.ts`.
- Content entries (projects, testimonials) carry both-language fields in their schema.
- Language switcher in the navbar swaps to the equivalent route in the other language.

### Content collections

- Defined with Zod schemas in `content/config.ts`. A missing/invalid field fails the
  build with a clear message, so content stays consistent.
- **Project schema (fields):** slug, title (pt/en), summary (pt/en), description (pt/en,
  Markdown body), tech tags, role (pt/en), featured (bool), order, cover image, gallery
  images, external links (live, repo, etc.).
- **Testimonial schema (fields):** author name, author role/company, quote (pt/en),
  avatar (optional), order.

### Components & interactivity

- Sections are `.astro` (static HTML, zero JS by default).
- React islands only where interaction is real: the language switcher, mobile nav toggle,
  and scroll-reveal animations. This keeps the JS payload minimal.

### Contact

- Direct links only: email, Discord, GitHub, LinkedIn. No form, no backend.

### SEO

- Per-page `<title>`, meta description, and Open Graph tags via `BaseLayout.astro`.
- `hreflang` tags linking the PT and EN versions of each page.
- A generated `sitemap.xml` and sensible `robots.txt`.

## Error Handling & Edge Cases

- **Build-time content validation:** Zod schemas catch missing/malformed fields before deploy.
- **Missing translation string:** `i18n/utils.ts` falls back to Portuguese (default) and
  logs a warning rather than rendering an empty string.
- **Missing project image:** components render a neutral placeholder so layout never breaks.
- **Unknown language route:** redirect/fallback to the default Portuguese version.
- **Empty collections:** if there are no testimonials/projects yet, the section renders a
  graceful empty state (or is hidden) instead of an empty block.

## Testing Strategy

- **Build verification:** `astro build` must succeed (this exercises content-schema
  validation across all entries).
- **Type checking:** `astro check` for `.astro` and TypeScript correctness.
- **Component/unit tests** (Vitest) for `i18n/utils.ts` (translation lookup + fallback)
  and any non-trivial data-shaping helpers.
- **Manual/visual QA:** verify both `/pt` and `/en` render all sections, the language
  switcher preserves the current page, and project detail pages generate correctly.
- **Lighthouse check** on the built site for performance, accessibility, and SEO before launch.

## Deployment

- `astro build` produces static assets in `dist/`.
- Deployable to any static host. Final host (Vercel / Netlify / GitHub Pages / VPS) is
  decided later; the build does not depend on a specific platform.

## Open Items (decide during implementation)

- Final color tokens, fonts, and spacing scale (via `frontend-design`).
- Exact copy/content for bio, services, and the initial set of projects/testimonials.
- Logo treatment for the snowflake/IceGames mark.
