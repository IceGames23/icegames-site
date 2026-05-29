# IceGames Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (PT/EN), statically-generated portfolio site for Vitor Albert (IceGames) with a clean "Frost Light" theme, content-driven projects/testimonials, and per-project detail pages.

**Architecture:** Astro generates static HTML for `/pt` and `/en` routes. UI strings come from JSON dictionaries; project and testimonial content comes from type-validated Content Collections. Sections are static `.astro` components; React islands are used only for the language switcher, mobile nav, and scroll-reveal. Output is a static `dist/` deployable to any host.

**Tech Stack:** Astro, Tailwind CSS, React (islands), TypeScript, Zod (via Astro content schemas), Vitest, `@astrojs/sitemap`.

---

## File Structure

```
astro.config.mjs              # Astro config: integrations + i18n routing
tailwind.config.mjs           # Frost Light design tokens
tsconfig.json
package.json
src/
  styles/global.css           # Tailwind layers + base theme
  i18n/
    ui.ts                     # UI string dictionaries (pt, en) + types
    utils.ts                  # getLangFromUrl, useTranslations, fallback
    utils.test.ts             # Vitest tests for the helpers
  content.config.ts           # Zod schemas: projects, testimonials
  content/
    projects/afterlands.md    # sample project (featured)
    projects/example-freela.md
    testimonials/cliente-1.md
  layouts/BaseLayout.astro     # <head>, SEO, hreflang, theme shell
  components/
    Navbar.astro
    LanguageSwitcher.tsx       # React island
    MobileNav.tsx              # React island
    Snowstorm.tsx              # React island: first-visit blizzard preloader
    Hero.astro
    About.astro
    Services.astro
    ServiceCard.astro
    FeaturedProjects.astro
    ProjectCard.astro
    Skills.astro
    Testimonials.astro
    TestimonialCard.astro
    ContactLinks.astro
    Footer.astro
    Reveal.tsx                 # React island: scroll-reveal wrapper
  pages/
    index.astro                # redirect "/" -> "/pt/"
    [lang]/index.astro         # home, composes all sections
    [lang]/projetos/[slug].astro  # project detail pages
  data/
    site.ts                    # static site data: name, links, skills
public/
  favicon.svg
  og-image.png                 # placeholder ok
  robots.txt
```

---

## Task 1: Scaffold Astro project with Tailwind + React

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/styles/global.css`

- [ ] **Step 1: Initialize the project non-interactively**

Run from the repo root (it already contains `.git`):

```bash
npm create astro@latest -- --template minimal --no-install --no-git --skip-houston --yes .
```

Expected: Astro scaffolds `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/pages/index.astro`, `public/`. (If the command refuses because the dir is non-empty, scaffold into a temp dir and copy the generated files in, preserving `.git`, `docs/`, `.gitignore`.)

- [ ] **Step 2: Add integrations**

```bash
npx astro add tailwind react sitemap --yes
npm install
npm install -D vitest
```

Expected: Tailwind, React, and sitemap integrations installed and wired into `astro.config.mjs`; `npm install` completes without errors.

- [ ] **Step 3: Verify the dev toolchain runs**

```bash
npm run build
```

Expected: build succeeds and produces `dist/`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project with Tailwind, React, sitemap"
```

---

## Task 2: Frost Light design tokens (Tailwind + global CSS)

**Files:**
- Modify: `tailwind.config.mjs`
- Create/Modify: `src/styles/global.css`

> NOTE: The exact token values below are the spec's "Frost Light" starting point. They are refined in the frontend-design review pass (see end of plan) before heavy component work.

- [ ] **Step 1: Define color + font tokens**

`tailwind.config.mjs`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md}'],
  theme: {
    extend: {
      colors: {
        ice: {
          50: '#f7fbfe',
          100: '#eaf4fb',
          200: '#d4e9f7',
          300: '#9fc6e0',
          400: '#5fbfe6',
          500: '#2f9fd6',
          600: '#1c6fb0',
          700: '#155488',
          cyan: '#38bdf8', // electric accent — the "gamer edge" highlight
          ink: '#0a1a2b',
        },
      },
      fontFamily: {
        // Distinctive, self-hostable via @fontsource. Avoids generic Inter/Space Grotesk.
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Hanken Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        frost: '0 10px 30px rgba(60,130,180,0.12)',
        glow: '0 0 0 1px rgba(56,189,248,0.4), 0 8px 30px rgba(56,189,248,0.18)',
      },
      backgroundImage: {
        'frost-gradient': 'linear-gradient(160deg,#f7fbfe 0%,#eaf4fb 55%,#d8ebf8 100%)',
        'ice-accent': 'linear-gradient(135deg,#38bdf8,#1c6fb0)',
        'frost-mesh':
          'radial-gradient(60% 50% at 15% 0%, rgba(56,189,248,0.18), transparent 60%), radial-gradient(50% 50% at 90% 10%, rgba(125,211,252,0.16), transparent 60%)',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Set base styles + fonts**

`src/styles/global.css`:

```css
@import '@fontsource/hanken-grotesk/400.css';
@import '@fontsource/hanken-grotesk/500.css';
@import '@fontsource/hanken-grotesk/600.css';
@import '@fontsource-variable/bricolage-grotesque';
@import '@fontsource/jetbrains-mono/400.css';
@import '@fontsource/jetbrains-mono/500.css';
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { scroll-behavior: smooth; }
  body {
    @apply text-ice-ink font-sans antialiased min-h-screen;
    /* layered atmosphere: cool gradient + frost-mesh glows */
    background-color: #f7fbfe;
    background-image: theme('backgroundImage.frost-mesh'), theme('backgroundImage.frost-gradient');
    background-attachment: fixed;
  }
  h1, h2, h3 { @apply font-display; }
  /* subtle grain overlay for texture (no extra asset) */
  body::before {
    content: '';
    position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
  main, header, footer { position: relative; z-index: 1; }
}

@layer components {
  .btn-primary { @apply inline-flex items-center gap-2 rounded-lg bg-ice-accent px-5 py-2.5 text-white font-semibold shadow-frost transition hover:shadow-glow hover:brightness-105; }
  .btn-ghost { @apply inline-flex items-center gap-2 rounded-lg border border-ice-300 px-5 py-2.5 text-ice-600 font-semibold transition hover:border-ice-cyan hover:bg-ice-100; }
  .card-frost { @apply rounded-xl border border-ice-200 bg-white/70 shadow-frost backdrop-blur-md transition; }
  .card-frost:hover { @apply -translate-y-1 border-ice-cyan/50 shadow-glow; }
  .section { @apply mx-auto max-w-6xl px-6 py-24; }
  /* mono section label — small, uppercase, tracked */
  .label { @apply font-mono text-xs uppercase tracking-[0.25em] text-ice-500; }
  /* mono tech tag */
  .tag { @apply font-mono rounded bg-ice-100 px-2 py-0.5 text-xs text-ice-600; }
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
```

- [ ] **Step 3: Install fonts**

```bash
npm install @fontsource/hanken-grotesk @fontsource-variable/bricolage-grotesque @fontsource/jetbrains-mono
```

- [ ] **Step 4: Import global.css globally**

In `astro.config.mjs`, ensure the integration order is fine; the import is done from `BaseLayout.astro` in Task 6. For now just verify it builds:

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Frost Light design tokens and base styles"
```

---

## Task 3: Configure i18n routing

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Add i18n + site config**

`astro.config.mjs` (merge into existing `defineConfig`):

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://icegames.dev', // placeholder; update when domain is chosen
  integrations: [tailwind(), react(), sitemap()],
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
    routing: { prefixDefaultLocale: true }, // /pt and /en both prefixed
  },
});
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: configure pt/en i18n routing"
```

---

## Task 4: i18n dictionaries + helper (with tests)

**Files:**
- Create: `src/i18n/ui.ts`, `src/i18n/utils.ts`, `src/i18n/utils.test.ts`
- Modify: `package.json` (add test script)

- [ ] **Step 1: Write the UI dictionaries**

`src/i18n/ui.ts`:

```ts
export const languages = { pt: 'Português', en: 'English' } as const;
export const defaultLang = 'pt';
export type Lang = keyof typeof languages;

export const ui = {
  pt: {
    'nav.about': 'Sobre',
    'nav.services': 'Serviços',
    'nav.projects': 'Projetos',
    'nav.skills': 'Skills',
    'nav.testimonials': 'Depoimentos',
    'nav.contact': 'Contato',
    'hero.role': 'Game Designer · Desenvolvedor Java',
    'hero.cta.projects': 'Ver projetos',
    'hero.cta.contact': 'Me contratar',
    'projects.viewAll': 'Ver todos os projetos',
    'contact.heading': 'Vamos construir algo juntos?',
  },
  en: {
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.projects': 'Projects',
    'nav.skills': 'Skills',
    'nav.testimonials': 'Testimonials',
    'nav.contact': 'Contact',
    'hero.role': 'Game Designer · Java Developer',
    'hero.cta.projects': 'View projects',
    'hero.cta.contact': 'Hire me',
    'projects.viewAll': 'View all projects',
    'contact.heading': "Let's build something together?",
  },
} as const;

export type UIKey = keyof (typeof ui)['pt'];
```

- [ ] **Step 2: Write the failing test**

`src/i18n/utils.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getLangFromUrl, useTranslations } from './utils';

describe('getLangFromUrl', () => {
  it('reads the locale from the path', () => {
    expect(getLangFromUrl(new URL('https://x.com/en/projetos'))).toBe('en');
  });
  it('falls back to default for unknown locale', () => {
    expect(getLangFromUrl(new URL('https://x.com/fr/'))).toBe('pt');
  });
});

describe('useTranslations', () => {
  it('returns the string for the active language', () => {
    const t = useTranslations('en');
    expect(t('hero.cta.contact')).toBe('Hire me');
  });
  it('falls back to default language when key missing in target', () => {
    // @ts-expect-error simulate a partial dict at runtime
    const t = useTranslations('en');
    expect(t('nav.about')).toBe('About');
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/i18n/utils.test.ts`
Expected: FAIL — `./utils` has no exports yet.

- [ ] **Step 4: Implement the helper**

`src/i18n/utils.ts`:

```ts
import { ui, defaultLang, languages, type Lang, type UIKey } from './ui';

export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
  if (seg in languages) return seg as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

export function localizedPath(lang: Lang, path: string): string {
  const clean = path.replace(/^\/+/, '');
  return `/${lang}/${clean}`;
}
```

- [ ] **Step 5: Add the test script and run to verify pass**

In `package.json` `"scripts"`, add: `"test": "vitest run"`.

Run: `npx vitest run src/i18n/utils.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add i18n dictionaries and translation helper with tests"
```

---

## Task 5: Content collections (projects + testimonials) + sample content

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/projects/afterlands.md`, `src/content/projects/example-freela.md`
- Create: `src/content/testimonials/cliente-1.md`

- [ ] **Step 1: Define the schemas**

`src/content.config.ts`:

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const bilingual = z.object({ pt: z.string(), en: z.string() });

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: bilingual,
      summary: bilingual,
      role: bilingual,
      tech: z.array(z.string()),
      featured: z.boolean().default(false),
      order: z.number().default(99),
      cover: image().optional(),
      links: z
        .array(z.object({ label: z.string(), url: z.string().url() }))
        .default([]),
    }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z.object({
    author: z.string(),
    role: bilingual,
    quote: bilingual,
    order: z.number().default(99),
  }),
});

export const collections = { projects, testimonials };
```

- [ ] **Step 2: Create sample project content (featured)**

`src/content/projects/afterlands.md`:

```md
---
title:
  pt: "AfterLands"
  en: "AfterLands"
summary:
  pt: "Servidor de Minecraft que funde os gêneros RankUP e MMORPG."
  en: "Minecraft server fusing the RankUP and MMORPG genres."
role:
  pt: "CEO, Game Designer e Desenvolvedor Java"
  en: "CEO, Game Designer and Java Developer"
tech: ["Java", "Paper/Spigot", "MySQL", "Redis"]
featured: true
order: 1
links:
  - label: "Site"
    url: "https://www.afterlands.com"
---

Descrição completa do AfterLands em PT vai aqui no corpo Markdown. (English body
can be added in a follow-up; the body is optional secondary detail.)
```

`src/content/projects/example-freela.md`:

```md
---
title:
  pt: "Projeto Freelance Internacional"
  en: "International Freelance Project"
summary:
  pt: "Sistema de backend em Java para um cliente internacional."
  en: "Java backend system for an international client."
role:
  pt: "Desenvolvedor Java"
  en: "Java Developer"
tech: ["Java", "Spring", "PostgreSQL"]
featured: false
order: 2
---

Detalhes do projeto.
```

- [ ] **Step 3: Create sample testimonial**

`src/content/testimonials/cliente-1.md`:

```md
---
author: "Nome do Cliente"
role:
  pt: "Dono de servidor de Minecraft"
  en: "Minecraft server owner"
quote:
  pt: "Trabalho excelente e entrega rápida. Recomendo o IceGames."
  en: "Excellent work and fast delivery. I recommend IceGames."
order: 1
---
```

- [ ] **Step 4: Verify schema validation via build**

```bash
npm run build
```

Expected: build succeeds (schemas validate). If a field is wrong, the build prints a clear Zod error — fix and rebuild.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add project and testimonial content collections with samples"
```

---

## Task 6: BaseLayout with SEO + hreflang

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/data/site.ts`

- [ ] **Step 1: Create static site data**

`src/data/site.ts`:

```ts
export const site = {
  name: 'IceGames',
  author: 'Vitor Albert',
  url: 'https://icegames.dev', // placeholder
  links: {
    email: 'mailto:icegames2004@gmail.com',
    github: 'https://github.com/', // TODO: real handle
    linkedin: 'https://www.linkedin.com/', // TODO: real handle
    discord: '#', // TODO: invite/handle
  },
  skills: ['Java', 'Spigot/Paper', 'Spring', 'Python', 'IA/LLMs', 'JavaScript', 'SQL', 'Git', 'Design'],
};
```

- [ ] **Step 2: Create the layout**

`src/layouts/BaseLayout.astro`:

```astro
---
import '../styles/global.css';
import { site } from '../data/site';
import type { Lang } from '../i18n/ui';

interface Props { lang: Lang; title: string; description: string; path?: string; }
const { lang, title, description, path = '' } = Astro.props;
const base = site.url;
---
<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={`${base}/og-image.png`} />
    <meta property="og:type" content="website" />
    <link rel="alternate" hreflang="pt" href={`${base}/pt/${path}`} />
    <link rel="alternate" hreflang="en" href={`${base}/en/${path}`} />
    <link rel="alternate" hreflang="x-default" href={`${base}/pt/${path}`} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add BaseLayout with SEO meta and hreflang"
```

---

## Task 7: Navbar + LanguageSwitcher + MobileNav

**Files:**
- Create: `src/components/Navbar.astro`, `src/components/LanguageSwitcher.tsx`, `src/components/MobileNav.tsx`

- [ ] **Step 1: Language switcher island**

`src/components/LanguageSwitcher.tsx`:

```tsx
interface Props { lang: 'pt' | 'en'; path: string; }
export default function LanguageSwitcher({ lang, path }: Props) {
  const other = lang === 'pt' ? 'en' : 'pt';
  return (
    <a
      href={`/${other}/${path}`}
      class="rounded-full border border-ice-300 px-3 py-1 text-sm text-ice-600 transition hover:bg-ice-100"
    >
      {lang === 'pt' ? 'EN' : 'PT'}
    </a>
  );
}
```

- [ ] **Step 2: Mobile nav island**

`src/components/MobileNav.tsx`:

```tsx
import { useState } from 'react';
interface Item { href: string; label: string; }
export default function MobileNav({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div class="md:hidden">
      <button aria-label="Menu" onClick={() => setOpen(!open)} class="text-ice-600 text-2xl">☰</button>
      {open && (
        <nav class="absolute left-0 right-0 top-full bg-white/95 border-b border-ice-200 px-6 py-4 flex flex-col gap-3">
          {items.map((it) => (
            <a key={it.href} href={it.href} class="text-ice-ink" onClick={() => setOpen(false)}>{it.label}</a>
          ))}
        </nav>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Navbar**

`src/components/Navbar.astro`:

```astro
---
import { useTranslations, type Lang } from '../i18n/utils';
import { site } from '../data/site';
import LanguageSwitcher from './LanguageSwitcher.tsx';
import MobileNav from './MobileNav.tsx';
const { lang, path = '' } = Astro.props as { lang: Lang; path?: string };
const t = useTranslations(lang);
const items = [
  { href: '#about', label: t('nav.about') },
  { href: '#services', label: t('nav.services') },
  { href: '#projects', label: t('nav.projects') },
  { href: '#skills', label: t('nav.skills') },
  { href: '#testimonials', label: t('nav.testimonials') },
  { href: '#contact', label: t('nav.contact') },
];
---
<header class="sticky top-0 z-50 border-b border-ice-200 bg-white/70 backdrop-blur">
  <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
    <a href={`/${lang}/`} class="font-display text-lg font-bold text-ice-ink">❄ {site.name}</a>
    <nav class="hidden gap-6 text-sm text-ice-700 md:flex">
      {items.map((it) => <a href={it.href} class="transition hover:text-ice-600">{it.label}</a>)}
    </nav>
    <div class="flex items-center gap-3">
      <LanguageSwitcher client:load lang={lang} path={path} />
      <MobileNav client:load items={items} />
    </div>
  </div>
</header>
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add navbar, language switcher, and mobile nav"
```

---

## Task 8: Reveal island + Hero section

**Files:**
- Create: `src/components/Reveal.tsx`, `src/components/Hero.astro`

- [ ] **Step 1: Scroll-reveal island**

`src/components/Reveal.tsx`:

```tsx
import { useEffect, useRef, useState, type ReactNode } from 'react';
export default function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} class={`transition-all duration-700 ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Hero**

`src/components/Hero.astro`:

```astro
---
import { useTranslations, type Lang } from '../i18n/utils';
import { site } from '../data/site';
const { lang } = Astro.props as { lang: Lang };
const t = useTranslations(lang);
const tagline = lang === 'pt'
  ? 'Construo servidores Minecraft e software com IA. Do AfterLands a projetos internacionais.'
  : 'I build Minecraft servers and AI software. From AfterLands to international projects.';
const stat = lang === 'pt' ? 'Fundador & CEO' : 'Founder & CEO';
---
<!-- Asymmetric hero: name block left, floating glass stat card right. Staggered load reveal. -->
<section class="section grid items-center gap-10 pt-32 md:grid-cols-[1.4fr_1fr] hero-stagger">
  <div>
    <p class="label" style="--d:0">{t('hero.role')}</p>
    <h1 class="mt-4 text-5xl font-bold leading-[0.95] md:text-7xl" style="--d:1">
      {site.author}<br /><span class="bg-ice-accent bg-clip-text text-transparent">{site.name}</span>
    </h1>
    <p class="mt-6 max-w-xl text-lg text-ice-700" style="--d:2">{tagline}</p>
    <div class="mt-8 flex gap-4" style="--d:3">
      <a href="#projects" class="btn-primary">{t('hero.cta.projects')}</a>
      <a href="#contact" class="btn-ghost">{t('hero.cta.contact')}</a>
    </div>
  </div>
  <aside class="card-frost p-6 md:justify-self-end md:rotate-1" style="--d:2">
    <div class="text-4xl">❄</div>
    <p class="mt-3 font-display text-2xl font-bold">AfterLands</p>
    <p class="label mt-1">{stat}</p>
    <div class="mt-4 flex flex-wrap gap-2">
      <span class="tag">Minecraft</span><span class="tag">RankUP</span><span class="tag">MMORPG</span><span class="tag">Java</span>
    </div>
  </aside>
</section>

<style>
  .hero-stagger [style*='--d'] { opacity: 0; transform: translateY(14px); animation: rise 0.7s cubic-bezier(.2,.7,.2,1) forwards; animation-delay: calc(var(--d) * 110ms); }
  @keyframes rise { to { opacity: 1; transform: none; } }
</style>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add scroll-reveal island and hero section"
```

---

## Task 8b: Snowstorm preloader (signature ice intro)

**Files:**
- Create: `src/components/Snowstorm.tsx`

A lightweight canvas blizzard that overlays the page on first visit of a session,
then fades out to reveal the hero. Decorative only — the page HTML renders beneath it,
so crawlers and no-JS users see full content. Respects `prefers-reduced-motion`.

- [ ] **Step 1: Implement the preloader island**

`src/components/Snowstorm.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react';

export default function Snowstorm() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seen = sessionStorage.getItem('ice-intro') === '1';
    if (reduce || seen) { setDone(true); return; }
    sessionStorage.setItem('ice-intro', '1');

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);

    const flakes = Array.from({ length: 220 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 2.6 + 0.6, s: Math.random() * 2 + 1.5, drift: Math.random() * 1.5 + 0.8,
    }));

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      for (const f of flakes) {
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
        f.y += f.s; f.x += f.drift; // diagonal "blown" snow
        if (f.y > h) { f.y = -5; f.x = Math.random() * w; }
        if (f.x > w) f.x = -5;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    const timer = window.setTimeout(() => setDone(true), 1200);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(timer); window.removeEventListener('resize', onResize); };
  }, []);

  if (done) return null;
  return (
    <div
      class="snow-overlay"
      onAnimationEnd={(e) => { if (e.animationName === 'snowOut') setDone(true); }}
    >
      <canvas ref={canvasRef} class="block h-full w-full" />
      <span class="snow-mark">❄ IceGames</span>
      <style>{`
        .snow-overlay { position: fixed; inset: 0; z-index: 100; background:
          radial-gradient(60% 60% at 50% 40%, #ffffff, #dcebf8 60%, #c6def2);
          animation: snowOut 0.6s ease 1.2s forwards; }
        .snow-mark { position: absolute; inset: 0; display: grid; place-items: center;
          font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: clamp(1.5rem, 6vw, 3rem);
          color: #0a1a2b; letter-spacing: 0.02em; }
        @keyframes snowOut { to { opacity: 0; visibility: hidden; } }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds. (Wired into the home page in Task 15.)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add snowstorm preloader intro"
```

---

## Task 9: About section

**Files:**
- Create: `src/components/About.astro`

- [ ] **Step 1: Implement**

`src/components/About.astro`:

```astro
---
import type { Lang } from '../i18n/ui';
const { lang } = Astro.props as { lang: Lang };
const bio = lang === 'pt'
  ? 'Tenho 21 anos, sou game designer e desenvolvedor Java. Fundei e sou CEO do AfterLands, atuo como freelancer para clientes internacionais e crio softwares de aceleração de processos com IA.'
  : "I'm 21, a game designer and Java developer. I founded and run AfterLands, freelance for international clients, and build AI process-acceleration software.";
const heading = lang === 'pt' ? 'Sobre mim' : 'About me';
---
<section id="about" class="section">
  <h2 class="text-3xl font-bold">{heading}</h2>
  <div class="mt-8 flex flex-col gap-6 md:flex-row md:items-center">
    <div class="card-frost flex h-40 w-40 shrink-0 items-center justify-center text-ice-300">avatar</div>
    <p class="text-lg text-ice-700">{bio}</p>
  </div>
</section>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add about section"
```

---

## Task 10: Services section

**Files:**
- Create: `src/components/ServiceCard.astro`, `src/components/Services.astro`

- [ ] **Step 1: ServiceCard**

`src/components/ServiceCard.astro`:

```astro
---
const { icon, title, desc } = Astro.props as { icon: string; title: string; desc: string };
---
<div class="card-frost p-6 transition hover:-translate-y-1 hover:shadow-lg">
  <div class="text-3xl">{icon}</div>
  <h3 class="mt-3 text-lg font-semibold">{title}</h3>
  <p class="mt-2 text-sm text-ice-700">{desc}</p>
</div>
```

- [ ] **Step 2: Services**

`src/components/Services.astro`:

```astro
---
import ServiceCard from './ServiceCard.astro';
import type { Lang } from '../i18n/ui';
const { lang } = Astro.props as { lang: Lang };
const heading = lang === 'pt' ? 'Serviços' : 'Services';
const services = lang === 'pt'
  ? [
      { icon: '🎮', title: 'Servidores Minecraft', desc: 'RankUP, MMORPG e plugins Java sob medida.' },
      { icon: '⚙️', title: 'Dev Java / Backend', desc: 'Sistemas e projetos para clientes internacionais.' },
      { icon: '🤖', title: 'Software com IA', desc: 'Automação e aceleração de processos para empresas.' },
    ]
  : [
      { icon: '🎮', title: 'Minecraft Servers', desc: 'RankUP, MMORPG and custom Java plugins.' },
      { icon: '⚙️', title: 'Java / Backend Dev', desc: 'Systems and projects for international clients.' },
      { icon: '🤖', title: 'AI Software', desc: 'Process automation and acceleration for companies.' },
    ];
---
<section id="services" class="section">
  <h2 class="text-3xl font-bold">{heading}</h2>
  <div class="mt-8 grid gap-6 md:grid-cols-3">
    {services.map((s) => <ServiceCard icon={s.icon} title={s.title} desc={s.desc} />)}
  </div>
</section>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add services section"
```

---

## Task 11: Featured projects section + ProjectCard

**Files:**
- Create: `src/components/ProjectCard.astro`, `src/components/FeaturedProjects.astro`

- [ ] **Step 1: ProjectCard**

`src/components/ProjectCard.astro`:

```astro
---
import type { Lang } from '../i18n/ui';
const { lang, slug, title, summary, tech } = Astro.props as {
  lang: Lang; slug: string; title: string; summary: string; tech: string[];
};
---
<a href={`/${lang}/projetos/${slug}`} class="card-frost block p-6 transition hover:-translate-y-1 hover:shadow-lg">
  <h3 class="text-lg font-semibold">{title}</h3>
  <p class="mt-2 text-sm text-ice-700">{summary}</p>
  <div class="mt-4 flex flex-wrap gap-2">
    {tech.map((ttag) => <span class="tag">{ttag}</span>)}
  </div>
</a>
```

- [ ] **Step 2: FeaturedProjects**

`src/components/FeaturedProjects.astro`:

```astro
---
import { getCollection } from 'astro:content';
import ProjectCard from './ProjectCard.astro';
import { useTranslations, type Lang } from '../i18n/utils';
const { lang } = Astro.props as { lang: Lang };
const t = useTranslations(lang);
const heading = lang === 'pt' ? 'Projetos em destaque' : 'Featured projects';
const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
---
<section id="projects" class="section">
  <h2 class="text-3xl font-bold">{heading}</h2>
  <div class="mt-8 grid gap-6 md:grid-cols-3">
    {projects.map((p) => (
      <ProjectCard lang={lang} slug={p.id} title={p.data.title[lang]} summary={p.data.summary[lang]} tech={p.data.tech} />
    ))}
  </div>
</section>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds and the section renders both sample projects.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add featured projects section and project card"
```

---

## Task 12: Skills section

**Files:**
- Create: `src/components/Skills.astro`

- [ ] **Step 1: Implement**

`src/components/Skills.astro`:

```astro
---
import { site } from '../data/site';
import type { Lang } from '../i18n/ui';
const { lang } = Astro.props as { lang: Lang };
const heading = lang === 'pt' ? 'Skills & Stack' : 'Skills & Stack';
---
<section id="skills" class="section">
  <h2 class="text-3xl font-bold">{heading}</h2>
  <div class="mt-8 flex flex-wrap gap-3">
    {site.skills.map((s) => <span class="card-frost px-4 py-2 text-sm font-medium text-ice-700">{s}</span>)}
  </div>
</section>
```

- [ ] **Step 2: Verify build + commit**

```bash
npm run build
git add -A
git commit -m "feat: add skills section"
```

Expected: build succeeds.

---

## Task 13: Testimonials section

**Files:**
- Create: `src/components/TestimonialCard.astro`, `src/components/Testimonials.astro`

- [ ] **Step 1: TestimonialCard**

`src/components/TestimonialCard.astro`:

```astro
---
const { quote, author, role } = Astro.props as { quote: string; author: string; role: string };
---
<figure class="card-frost p-6">
  <blockquote class="text-ice-700">“{quote}”</blockquote>
  <figcaption class="mt-4 text-sm font-semibold text-ice-ink">{author}<span class="block font-normal text-ice-500">{role}</span></figcaption>
</figure>
```

- [ ] **Step 2: Testimonials**

`src/components/Testimonials.astro`:

```astro
---
import { getCollection } from 'astro:content';
import TestimonialCard from './TestimonialCard.astro';
import type { Lang } from '../i18n/ui';
const { lang } = Astro.props as { lang: Lang };
const heading = lang === 'pt' ? 'Depoimentos' : 'Testimonials';
const items = (await getCollection('testimonials')).sort((a, b) => a.data.order - b.data.order);
---
<section id="testimonials" class="section">
  <h2 class="text-3xl font-bold">{heading}</h2>
  <div class="mt-8 grid gap-6 md:grid-cols-2">
    {items.map((it) => (
      <TestimonialCard quote={it.data.quote[lang]} author={it.data.author} role={it.data.role[lang]} />
    ))}
  </div>
</section>
```

- [ ] **Step 3: Verify build + commit**

```bash
npm run build
git add -A
git commit -m "feat: add testimonials section"
```

Expected: build succeeds and renders the sample testimonial.

---

## Task 14: Contact links + Footer

**Files:**
- Create: `src/components/ContactLinks.astro`, `src/components/Footer.astro`

- [ ] **Step 1: ContactLinks**

`src/components/ContactLinks.astro`:

```astro
---
import { useTranslations, type Lang } from '../i18n/utils';
import { site } from '../data/site';
const { lang } = Astro.props as { lang: Lang };
const t = useTranslations(lang);
const sub = lang === 'pt' ? 'Me chame pelos canais abaixo.' : 'Reach me through the channels below.';
const links = [
  { label: 'Email', url: site.links.email },
  { label: 'GitHub', url: site.links.github },
  { label: 'LinkedIn', url: site.links.linkedin },
  { label: 'Discord', url: site.links.discord },
];
---
<section id="contact" class="section text-center">
  <h2 class="text-3xl font-bold">{t('contact.heading')}</h2>
  <p class="mt-3 text-ice-700">{sub}</p>
  <div class="mt-8 flex flex-wrap justify-center gap-4">
    {links.map((l) => <a href={l.url} class="btn-ghost">{l.label}</a>)}
  </div>
</section>
```

- [ ] **Step 2: Footer**

`src/components/Footer.astro`:

```astro
---
import { site } from '../data/site';
---
<footer class="bg-ice-ink text-ice-200">
  <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm md:flex-row">
    <span>© {site.name} · {site.author}</span>
    <div class="flex gap-4">
      <a href={site.links.github} class="hover:text-white">GitHub</a>
      <a href={site.links.linkedin} class="hover:text-white">LinkedIn</a>
      <a href={site.links.discord} class="hover:text-white">Discord</a>
    </div>
  </div>
</footer>
```

- [ ] **Step 3: Verify build + commit**

```bash
npm run build
git add -A
git commit -m "feat: add contact links and footer"
```

Expected: build succeeds.

---

## Task 15: Home page composition + root redirect

**Files:**
- Create: `src/pages/[lang]/index.astro`
- Modify/Replace: `src/pages/index.astro`

- [ ] **Step 1: Compose the home page**

`src/pages/[lang]/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import Snowstorm from '../../components/Snowstorm.tsx';
import Navbar from '../../components/Navbar.astro';
import Hero from '../../components/Hero.astro';
import About from '../../components/About.astro';
import Services from '../../components/Services.astro';
import FeaturedProjects from '../../components/FeaturedProjects.astro';
import Skills from '../../components/Skills.astro';
import Testimonials from '../../components/Testimonials.astro';
import ContactLinks from '../../components/ContactLinks.astro';
import Footer from '../../components/Footer.astro';
import type { Lang } from '../../i18n/ui';

export function getStaticPaths() {
  return [{ params: { lang: 'pt' } }, { params: { lang: 'en' } }];
}
const lang = Astro.params.lang as Lang;
const title = lang === 'pt' ? 'IceGames — Vitor Albert | Game Designer & Dev Java' : 'IceGames — Vitor Albert | Game Designer & Java Dev';
const description = lang === 'pt'
  ? 'Portfólio de Vitor Albert (IceGames): servidores Minecraft, desenvolvimento Java e software com IA.'
  : 'Portfolio of Vitor Albert (IceGames): Minecraft servers, Java development and AI software.';
---
<BaseLayout lang={lang} title={title} description={description}>
  <Snowstorm client:only="react" />
  <Navbar lang={lang} path="" />
  <main>
    <Hero lang={lang} />
    <About lang={lang} />
    <Services lang={lang} />
    <FeaturedProjects lang={lang} />
    <Skills lang={lang} />
    <Testimonials lang={lang} />
    <ContactLinks lang={lang} />
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Root redirect to default locale**

`src/pages/index.astro`:

```astro
---
return Astro.redirect('/pt/');
---
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds; `dist/pt/index.html` and `dist/en/index.html` exist.

- [ ] **Step 4: Manual check**

```bash
npm run preview
```

Visit `http://localhost:4321/pt/` and `/en/`: all sections render; language switcher toggles; section links scroll.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: compose home page and add root redirect"
```

---

## Task 16: Project detail pages

**Files:**
- Create: `src/pages/[lang]/projetos/[slug].astro`

- [ ] **Step 1: Implement detail page with static paths**

`src/pages/[lang]/projetos/[slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import Navbar from '../../../components/Navbar.astro';
import Footer from '../../../components/Footer.astro';
import type { Lang } from '../../../i18n/ui';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  const langs: Lang[] = ['pt', 'en'];
  return langs.flatMap((lang) =>
    projects.map((p) => ({ params: { lang, slug: p.id }, props: { entry: p } }))
  );
}

const lang = Astro.params.lang as Lang;
const { entry } = Astro.props;
const { Content } = await render(entry);
const backLabel = lang === 'pt' ? '← Voltar' : '← Back';
---
<BaseLayout lang={lang} title={`${entry.data.title[lang]} — IceGames`} description={entry.data.summary[lang]} path={`projetos/${entry.id}`}>
  <Navbar lang={lang} path={`projetos/${entry.id}`} />
  <main class="section">
    <a href={`/${lang}/`} class="text-sm text-ice-600">{backLabel}</a>
    <h1 class="mt-4 text-4xl font-bold">{entry.data.title[lang]}</h1>
    <p class="mt-2 text-ice-700">{entry.data.role[lang]}</p>
    <div class="mt-4 flex flex-wrap gap-2">
      {entry.data.tech.map((tag) => <span class="tag">{tag}</span>)}
    </div>
    <article class="prose mt-8 max-w-none text-ice-700"><Content /></article>
    <div class="mt-6 flex flex-wrap gap-4">
      {entry.data.links.map((l) => <a href={l.url} class="btn-ghost">{l.label}</a>)}
    </div>
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds; `dist/pt/projetos/afterlands/index.html` and the `/en/` equivalent exist.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add per-project detail pages"
```

---

## Task 17: SEO assets (sitemap, robots, favicon, og-image)

**Files:**
- Create: `public/robots.txt`, `public/favicon.svg`, `public/og-image.png` (placeholder)

- [ ] **Step 1: robots.txt**

`public/robots.txt`:

```
User-agent: *
Allow: /
Sitemap: https://icegames.dev/sitemap-index.xml
```

- [ ] **Step 2: Favicon (snowflake)**

`public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text x="16" y="24" font-size="24" text-anchor="middle">❄</text></svg>
```

- [ ] **Step 3: Add a placeholder og-image**

Create any 1200×630 PNG at `public/og-image.png` (a simple Frost Light card with "IceGames" is fine; replace later).

- [ ] **Step 4: Verify build produces sitemap**

```bash
npm run build
```

Expected: build succeeds; `dist/sitemap-index.xml` exists (from `@astrojs/sitemap`).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add robots, favicon, og-image and verify sitemap"
```

---

## Task 18: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full test + build + check**

```bash
npm run test
npm run build
npx astro check
```

Expected: tests pass, build succeeds, `astro check` reports no errors.

- [ ] **Step 2: Manual QA checklist (via `npm run preview`)**

- `/pt/` and `/en/` render all 8 sections in order.
- Language switcher swaps locale and stays on the equivalent page.
- Project cards link to working detail pages in both languages.
- Mobile nav opens/closes; layout is responsive.

- [ ] **Step 3: Lighthouse (optional but recommended)**

Run Lighthouse on the previewed build; aim for green Performance / Accessibility / SEO. Note any quick wins.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "chore: final verification fixes"
```

---

## Open Items / Follow-ups (not blocking v1)

- Replace placeholder social handles in `src/data/site.ts`.
- Replace placeholder `site.url` once the domain/host is chosen; update `robots.txt` and `BaseLayout` `base`.
- Real bio/services/project copy and additional projects/testimonials (just add content files).
- English Markdown bodies for project detail pages (currently bodies are PT-first).
- Real avatar, project cover images, and og-image.

## Self-Review

- **Spec coverage:** Hero/About/Services/Projects/Skills/Testimonials/Contact/Footer → Tasks 8–15; project detail pages → Task 16; i18n PT/EN → Tasks 3,4 + per-section dictionaries; Markdown/JSON content → Task 5; Frost Light theme → Task 2; SEO/hreflang/sitemap → Tasks 6,17; static host-agnostic build → all tasks build to `dist/`; contact-via-links (no form) → Task 14; testing strategy (vitest + build + astro check + Lighthouse) → Tasks 4,18. All spec sections map to tasks.
- **Placeholder scan:** Remaining placeholders (social handles, domain, og-image) are intentional content/config follow-ups listed under Open Items, not missing implementation. No "TBD" steps in build tasks.
- **Type consistency:** `Lang`, `useTranslations`, `getLangFromUrl`, `localizedPath`, `site`, collection field names (`title`, `summary`, `role`, `tech`, `featured`, `order`, `links`, `quote`, `author`) are used consistently across tasks. Collection entry id accessed as `p.id` throughout.
