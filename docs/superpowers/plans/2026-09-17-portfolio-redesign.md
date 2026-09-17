# IceGames Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild icegames.me as a static, single-page, dark-theme portfolio that reproduces the Claude Design file `Portfolio.dc.html` faithfully, with all content editable in one data file.

**Architecture:** Plain `index.html` + `css/site.css` + two classic (non-module) scripts: `js/data.js` exposes `window.IG_DATA` (all projects, testimonials, clients, PT/EN strings); `js/site.js` renders the dynamic sections from that data, handles PT/EN switching, filters, the two modals, the form, the splash, the snow canvas, the reveal animation and the testimonial rail. No build step, no framework, no Node.

**Tech Stack:** HTML5, CSS3 (custom properties, grid, `clamp()`), vanilla ES2015+ JavaScript, Google Fonts (Bricolage Grotesque, Instrument Serif, JetBrains Mono), Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-09-17-portfolio-redesign-design.md`

## Global Constraints

- **The design file is the source of truth for every visual value.** `docs/design/Portfolio.dc.html` (moved there in Task 1). Colors, font sizes, `clamp()` expressions, paddings, breakpoints and animation timings in this plan were transcribed from it; if a value in the plan and the design disagree, the design wins.
- Palette tokens: bg `#0B0B0C`, surface `#131315`, surface-2 `#131316`, line `#26262A`, line-2 `#3A3A3F`, text `#F4F1EA`, muted `#A8A49C`, dim `#8F8C85`, accent `#6ED4F2`, error `#FF8A6B`. Never hard-code these outside `:root` in `css/site.css`.
- Scripts are **classic scripts**, not ES modules, so `index.html` works over `file://` (there is no local dev server and no Node on this machine). `js/data.js` must load before `js/site.js`.
- No Node, no npm, no Python on the dev machine. Tooling is PowerShell 5.1 and Git Bash only.
- Every user-visible string comes from `IG_DATA.STR[lang]`; the only literal text allowed in `index.html` is the PT default that `site.js` overwrites on load (needed for no-JS / crawlers), plus brand strings (`ICEGAMES.ME`, `IceGames`, `icegames`, URLs, `© … Vitor Albert · IceGames`, `↑ Top`, `▶ YouTube`, `✓ OK`).
- Commit after every task with the message given in the task. Use Git Bash for git commands.

**User decisions (already made):**
- Stack: static HTML/CSS/JS, no build step.
- Hosting: Cloudflare Pages, output dir = repo root, no build command, domain `icegames.me`.
- Contact form keeps the design's behavior: validate → 1.6 s "sending" → Discord fallback modal. No backend, no form service.
- PT/EN is a client-side toggle (design behavior); no `/pt` `/en` routes.
- Assets are the files already dropped in `assets/`; oversized PNGs get resized; videos stay as-is.
- Delete `uploads/`, `support.js`, `image-slot.js`, `.thumbnail`; keep `Portfolio.dc.html` under `docs/design/`.

---

## File structure

| Path | Responsibility |
|---|---|
| `index.html` | All page markup. Static text in PT with `data-i18n` hooks; empty containers for JS-rendered lists; both modal shells. |
| `css/site.css` | Every style. Tokens in `:root`, then base, components, sections, modals, keyframes, responsive. |
| `js/data.js` | `window.IG_DATA = { PROJECTS, TESTIMONIALS, CLIENTS, SERVICES, STR, VOCAB_EN }`. Content only, no logic. |
| `js/site.js` | Rendering + behavior. One IIFE; sections: helpers, i18n, render functions, modals, form, splash, reveal, snow, rail, events, init. |
| `tools/resize-image.ps1` | One-off PowerShell helper used to downscale PNGs (kept so future logos can be processed the same way). |
| `_headers`, `robots.txt`, `sitemap.xml` | Cloudflare Pages headers and SEO files. |
| `README.md` | How to edit content and deploy. |
| `docs/design/Portfolio.dc.html` | Original design, reference only. |

---

### Task 1: Repository cleanup and design reference

**Goal:** Remove the design-tool runtime files, keep the design as a committed reference, and leave the working tree with only the files the site needs.

**Files:**
- Create: `docs/design/Portfolio.dc.html` (moved from repo root)
- Delete: `uploads/` (48 MB duplicate of `assets/`), `support.js`, `image-slot.js`, `.thumbnail`
- Modify: `.gitignore`

**Acceptance Criteria:**
- [ ] `git status --short` shows no `uploads/`, `support.js`, `image-slot.js` or `.thumbnail`
- [ ] `docs/design/Portfolio.dc.html` exists, is 94,464 bytes, and is committed
- [ ] `assets/` is still untracked (it is committed in Task 2 after resizing)
- [ ] `.gitignore` no longer mentions Astro (`.astro/`, `dist/`)

**Verify:** `cd "/c/Users/Vitor Albert/CodeProjects/icegames-site" && ls && git status --short` → lists `assets/` as `??` only; no `uploads`, `support.js`, `image-slot.js`, `.thumbnail` on disk.

**Steps:**

- [ ] **Step 1: Move the design file and delete tool files** (Git Bash)

```bash
cd "/c/Users/Vitor Albert/CodeProjects/icegames-site"
mkdir -p docs/design
mv Portfolio.dc.html docs/design/Portfolio.dc.html
rm -rf uploads support.js image-slot.js .thumbnail
ls -la
```

Expected: only `.git`, `.gitignore`, `assets`, `docs` remain.

- [ ] **Step 2: Rewrite `.gitignore`**

Replace the whole file with:

```gitignore
# OS / editor
.DS_Store
Thumbs.db
.idea/
.vscode/

# superpowers brainstorming artifacts
.superpowers/
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore docs/design/Portfolio.dc.html
git commit -m "chore: keep design reference, drop design-tool runtime files

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Downscale oversized images and commit assets

**Goal:** Bring every PNG down to about 2× its rendered size (aspect preserved), then commit the whole `assets/` folder.

**Files:**
- Create: `tools/resize-image.ps1`
- Modify (in place): `assets/vitor-avatar.png`, `assets/client-afterlands.png`, `assets/client-tabiquest.png`, `assets/client-panda.png`, `assets/client-eco.png`, `assets/client-mia.png`, `assets/afterlands-site.png`
- Commit: `assets/**`

**Acceptance Criteria:**
- [ ] `assets/vitor-avatar.png` ≤ 840 px on its longest side and smaller than the original 3.9 MB
- [ ] `assets/client-afterlands.png` fits inside 540×144 and smaller than the original 4.3 MB
- [ ] `assets/client-tabiquest.png` fits inside 220×220; `client-panda.png` inside 184×168; `client-eco.png` inside 412×144; `client-mia.png` inside 424×144
- [ ] `assets/afterlands-site.png` is 1360 px wide (height scales) and smaller than the original 7.9 MB
- [ ] PNG transparency preserved (logos on the dark background show no white box)
- [ ] `git ls-files assets | wc -l` → 17

**Verify:** PowerShell: `Add-Type -AssemblyName System.Drawing; Get-ChildItem assets\*.png | % { $i=[System.Drawing.Image]::FromFile($_.FullName); "{0} {1}x{2} {3}KB" -f $_.Name,$i.Width,$i.Height,[int]($_.Length/1KB); $i.Dispose() }` → dimensions within the boxes above.

**Steps:**

- [ ] **Step 1: Record the current dimensions** (PowerShell)

```powershell
Add-Type -AssemblyName System.Drawing
Get-ChildItem assets\*.png, assets\*.jpg, assets\*.jpeg | ForEach-Object {
  $i = [System.Drawing.Image]::FromFile($_.FullName)
  "{0,-28} {1,5}x{2,-5} {3,7:N0} KB" -f $_.Name, $i.Width, $i.Height, ($_.Length/1KB)
  $i.Dispose()
}
```

Note the numbers — they go in the commit message.

- [ ] **Step 2: Create `tools/resize-image.ps1`**

```powershell
<#
.SYNOPSIS
  Downscale a PNG/JPEG so it fits inside MaxWidth x MaxHeight, preserving aspect ratio and alpha.
  Never upscales. Overwrites the file in place.
.EXAMPLE
  .\tools\resize-image.ps1 -Path assets\client-afterlands.png -MaxWidth 540 -MaxHeight 144
#>
param(
  [Parameter(Mandatory)][string]$Path,
  [Parameter(Mandatory)][int]$MaxWidth,
  [int]$MaxHeight = 0
)
Add-Type -AssemblyName System.Drawing
$full = (Resolve-Path $Path).Path
$src = [System.Drawing.Image]::FromFile($full)
try {
  if ($MaxHeight -le 0) { $MaxHeight = [int][Math]::Ceiling($src.Height * $MaxWidth / $src.Width) }
  $scale = [Math]::Min($MaxWidth / $src.Width, $MaxHeight / $src.Height)
  if ($scale -ge 1) { Write-Host "skip (already small enough): $Path"; return }
  $w = [int][Math]::Round($src.Width * $scale)
  $h = [int][Math]::Round($src.Height * $scale)
  $bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)
  $attr = New-Object System.Drawing.Imaging.ImageAttributes
  $attr.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)   # avoids edge bleed
  $g.DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, $w, $h), 0, 0, $src.Width, $src.Height, [System.Drawing.GraphicsUnit]::Pixel, $attr)
  $g.Dispose()
  $isJpeg = $full -match '\.jpe?g$'
  $tmp = "$full.tmp"
  if ($isJpeg) { $bmp.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Jpeg) }
  else { $bmp.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png) }
  $bmp.Dispose()
} finally { $src.Dispose() }
Move-Item -Force $tmp $full
$after = Get-Item $full
Write-Host ("{0}: {1}x{2}, {3:N0} KB" -f $Path, $w, $h, ($after.Length/1KB))
```

- [ ] **Step 3: Run it for each oversized image** (PowerShell, from the repo root)

```powershell
.\tools\resize-image.ps1 -Path assets\vitor-avatar.png      -MaxWidth 840  -MaxHeight 840
.\tools\resize-image.ps1 -Path assets\client-afterlands.png -MaxWidth 540  -MaxHeight 144
.\tools\resize-image.ps1 -Path assets\client-tabiquest.png  -MaxWidth 220  -MaxHeight 220
.\tools\resize-image.ps1 -Path assets\client-panda.png      -MaxWidth 184  -MaxHeight 168
.\tools\resize-image.ps1 -Path assets\client-eco.png        -MaxWidth 412  -MaxHeight 144
.\tools\resize-image.ps1 -Path assets\client-mia.png        -MaxWidth 424  -MaxHeight 144
.\tools\resize-image.ps1 -Path assets\afterlands-site.png   -MaxWidth 1360
```

If PowerShell refuses to run the script (execution policy), run it as `powershell -ExecutionPolicy Bypass -File .\tools\resize-image.ps1 ...`.

- [ ] **Step 4: Re-run the dimension listing from Step 1** and confirm every file is inside its box and the sizes dropped. Open `assets/client-afterlands.png` with the Read tool to eyeball that transparency survived (no white background).

- [ ] **Step 5: Commit**

```bash
git add tools/resize-image.ps1 assets
git commit -m "feat: add site assets (PNGs downscaled to ~2x display size)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: `index.html` — complete page markup

**Goal:** Write the full page markup with PT default text, `data-i18n` hooks, empty containers for JS-rendered lists, and both modal shells.

**Files:**
- Create: `index.html`

**Acceptance Criteria:**
- [ ] Opening `index.html` in a browser (file://) shows every section's PT text in document order: header, hero, projects header + filters container, services, about, testimonials header, process, contact (links + form), footer
- [ ] All six section anchors exist: `#topo`, `#trabalho`, `#servicos`, `#sobre`, `#processo`, `#contato`
- [ ] Both `#discord-modal` and `#project-modal` are present and `hidden`
- [ ] `grep -c 'data-i18n=' index.html` ≥ 45 (every translatable static string is hooked)
- [ ] No `style=""` attributes in the file except none (styles come in Task 4)

**Verify:** `grep -c 'data-i18n=' index.html` → ≥ 45; `grep -c 'style="' index.html` → 0; open in browser → readable unstyled page with all PT content.

**Steps:**

- [ ] **Step 1: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Vitor Albert · IceGames — Software Engineer & Game Designer</title>
  <meta name="description" content="Software Engineer e Game Designer. Servidores de Minecraft, eventos ao vivo e software com IA que rodam com centenas de jogadores ao mesmo tempo.">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/site.css">
</head>
<body>

  <div class="splash" id="splash" aria-hidden="true">
    <span class="splash-logo">IceGames</span>
    <span class="splash-bar"><span></span></span>
  </div>

  <canvas class="snow" id="snow" aria-hidden="true"></canvas>

  <header class="header">
    <div class="wrap header-inner">
      <a class="brand" href="#topo">ICEGAMES.ME</a>
      <nav class="nav" aria-label="Seções">
        <a href="#trabalho" data-i18n="navProjects">Projetos</a>
        <a href="#servicos" data-i18n="navServices">Serviços</a>
        <a href="#processo" data-i18n="navProcess">Como trabalho</a>
        <a href="#sobre" data-i18n="navAbout">Sobre</a>
        <a href="#contato" data-i18n="navContact">Contato</a>
      </nav>
      <div class="header-right">
        <div class="lang" role="group" aria-label="Idioma / Language">
          <button class="lang-btn" type="button" data-lang="en" data-active="false">EN</button>
          <span class="lang-sep">/</span>
          <button class="lang-btn" type="button" data-lang="pt" data-active="true">PT</button>
        </div>
        <a class="btn btn-primary btn-sm" href="#contato" data-i18n="navCta">Vamos conversar</a>
      </div>
    </div>
  </header>

  <main>

    <section id="topo" class="hero">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="wrap hero-inner">
        <div class="hero-role">
          <span class="dot" aria-hidden="true"></span>
          <span data-i18n="heroRole">Software Engineer & Game Designer · Certificado pela CalArts</span>
        </div>
        <h1><span data-i18n="heroH1a">Transformando o impossível em </span><em data-i18n="heroH1b">possível</em>.</h1>
        <p class="hero-sub" data-i18n="heroSub">Sou Vitor Albert, também conhecido como IceGames. Desenho o jogo e construo a engenharia que o mantém de pé: servidores de Minecraft, eventos ao vivo e software com IA que rodam com centenas de jogadores ao mesmo tempo.</p>
        <div class="hero-ctas">
          <a class="btn btn-primary" href="#trabalho" data-i18n="heroCta1">Ver projetos</a>
          <a class="btn btn-ghost" href="#contato" data-i18n="heroCta2">Vamos conversar</a>
        </div>
      </div>
      <div class="clients">
        <div class="clients-inner">
          <span class="clients-label" data-i18n="heroClients">Trabalhei com</span>
          <div class="clients-mask">
            <div class="clients-rail" id="clients-rail"></div>
          </div>
        </div>
      </div>
    </section>

    <section id="trabalho" class="section projects" data-reveal>
      <div class="wrap projects-head section-head">
        <div>
          <div class="eyebrow" data-i18n="projEyebrow">Projetos em destaque</div>
          <h2 class="h2" data-i18n="projTitle">Trabalho recente.</h2>
        </div>
        <div class="chips" id="filters" role="group" aria-label="Filtro"></div>
      </div>
      <div class="wrap projects-list">
        <div class="wk" id="projects"></div>
        <p class="projects-empty" id="projects-empty" hidden data-i18n="projEmpty">Nenhum projeto nesta categoria ainda. Volte em breve.</p>
      </div>
    </section>

    <section id="servicos" class="section services" data-reveal>
      <div class="wrap services-inner">
        <div class="eyebrow" data-i18n="servEyebrow">O que eu construo</div>
        <h2 class="h2" data-i18n="servTitle">Do documento de design ao servidor no ar.</h2>
        <p class="section-sub" data-i18n="servSub">Quatro frentes de trabalho. Cada uma com um projeto entregue que você pode abrir e conferir agora.</p>
        <div class="two" id="services"></div>
      </div>
    </section>

    <section id="sobre" class="section about" data-reveal>
      <div class="wrap split">
        <div>
          <div class="flip-card">
            <div class="flip">
              <div class="flip-face flip-front"><img src="assets/vitor-avatar.png" alt="Vitor Albert, IceGames"></div>
              <div class="flip-face flip-back"><img src="assets/vitor-photo.jpeg" alt="Vitor Albert"></div>
            </div>
          </div>
          <div class="flip-hint">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
            <span data-i18n="aboutHint">passe o mouse</span>
          </div>
        </div>
        <div>
          <div class="eyebrow" data-i18n="aboutEyebrow">Sobre mim</div>
          <h2 class="h2" data-i18n="aboutTitle">Quem está por trás do código.</h2>
          <p class="lead" data-i18n="aboutLead">Sou apaixonado por transformar ideias em realidade.</p>
          <p class="about-body" data-i18n="aboutBody">Sou Software Engineer e Game Designer, certificado pela CalArts e cursando Sistemas de Informação na UFG. Engenharia de software, gestão de projetos, game design, escrita criativa e marketing raramente andam juntos, e é essa mistura que me deixa levar um projeto do escopo à entrega. Versátil, mas com uma especialidade clara: transformar o impossível em possível.</p>
          <div class="facts">
            <div data-i18n="aboutFact1">Certificado CalArts</div>
            <div data-i18n="aboutFact2">Cursando UFG</div>
            <div data-i18n="aboutFact3">Bilíngue (PT / EN)</div>
            <div data-i18n="aboutFact4">Brasil</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section testimonials" data-reveal>
      <div class="wrap testi-head section-head">
        <div>
          <div class="eyebrow" data-i18n="testiEyebrow">Depoimentos</div>
          <h2 class="h2" data-i18n="testiTitle">O que dizem os clientes.</h2>
        </div>
        <div class="testi-hint">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 7 4 12l4 5M16 7l4 5-4 5"/></svg>
          <span data-i18n="testiDrag">Arraste para navegar</span>
        </div>
      </div>
      <div class="testi-mask" id="testi-rail">
        <div class="testi-track" id="testimonials"></div>
      </div>
    </section>

    <section id="processo" class="section process" data-reveal>
      <div class="wrap process-inner">
        <div class="section-head process-head">
          <div>
            <div class="eyebrow" data-i18n="procEyebrow">Como eu trabalho</div>
            <h2 class="h2" data-i18n="procTitle">Sem surpresa no meio do caminho.</h2>
          </div>
          <p class="process-sub" data-i18n="procSub">Todo projeto segue o mesmo processo, do primeiro contato ao suporte depois da entrega.</p>
        </div>
        <div class="steps" id="steps"></div>
        <div class="guarantees">
          <span>✓ <span data-i18n="procG1">Resposta em até 24h</span></span>
          <span>✓ <span data-i18n="procG2">Escopo e prazo por escrito</span></span>
          <span>✓ <span data-i18n="procG3">Suporte após a entrega</span></span>
        </div>
      </div>
    </section>

    <section id="contato" class="section contact" data-reveal>
      <div class="wrap contact-grid">
        <div>
          <div class="eyebrow" data-i18n="contactEyebrow">Bora construir algo</div>
          <h2 class="h2" data-i18n="contactTitle">Tem um projeto em mente?</h2>
          <p class="contact-sub" data-i18n="contactSub">Servidor de Minecraft, app, integração com IA? Me conta a ideia e eu retorno em até 24h.</p>
          <div class="links">
            <a href="https://github.com/IceGames23" target="_blank" rel="noopener">github.com/IceGames23
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></a>
            <a href="https://www.linkedin.com/in/vitor-albert/" target="_blank" rel="noopener">linkedin.com/in/vitor-albert
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></a>
            <div>Discord <span class="handle">icegames</span></div>
          </div>
        </div>
        <div>
          <form class="form" id="contact-form" novalidate>
            <label class="field">
              <span class="field-label" data-i18n="formName">Nome</span>
              <input class="input" name="name" type="text" autocomplete="name" placeholder="Como posso te chamar?" data-i18n-placeholder="formNamePh">
              <span class="field-error" data-error="name"></span>
            </label>
            <label class="field">
              <span class="field-label" data-i18n="formEmail">E-mail</span>
              <input class="input input-mono" name="email" type="email" autocomplete="email" placeholder="voce@email.com" data-i18n-placeholder="formEmailPh">
              <span class="field-error" data-error="email"></span>
            </label>
            <label class="field">
              <span class="field-label" data-i18n="formMessage">Mensagem</span>
              <textarea class="input" name="message" rows="4" placeholder="Me conta sobre o projeto: escopo, prazo, o que você imagina." data-i18n-placeholder="formMsgPh"></textarea>
              <span class="field-error" data-error="message"></span>
            </label>
            <button class="btn btn-primary" type="submit">
              <span id="submit-label" data-i18n="formSubmit">Enviar mensagem</span>
              <span class="spinner" id="submit-spinner" hidden aria-hidden="true"></span>
              <svg id="submit-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </form>
          <div class="success" id="form-success" hidden>
            <div class="eyebrow">✓ OK</div>
            <h3 data-i18n="successTitle">Mensagem enviada!</h3>
            <p data-i18n="successText">Obrigado pelo contato. Retorno em até 24h, normalmente bem antes disso.</p>
            <button class="btn-link" type="button" id="form-reset" data-i18n="successAgain">Enviar outra mensagem</button>
          </div>
        </div>
      </div>
    </section>

  </main>

  <footer class="wrap footer">
    <span>© <span id="year">2026</span> Vitor Albert · IceGames</span>
    <span data-i18n="footerTagline">Transformando o impossível em possível.</span>
    <a href="#topo">↑ Top</a>
  </footer>

  <div class="overlay overlay-discord" id="discord-modal" hidden role="dialog" aria-modal="true" aria-labelledby="dc-title">
    <div class="dialog dialog-discord">
      <div class="dc-eyebrow" data-i18n="dcEyebrow">Falha no envio</div>
      <h3 class="dc-title" id="dc-title" data-i18n="dcTitle">O formulário não enviou.</h3>
      <p class="dc-text" data-i18n="dcText">Parece que o sistema de e-mail falhou. Me chama no Discord, minha DM é aberta:</p>
      <div class="dc-handle">
        <svg width="23" height="23" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.0766.0766 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c1.8483 1.3568 3.6636 2.1801 5.4494 2.7259a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.198.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.795-.5458 3.6103-1.3691 5.4586-2.7259a.0766.0766 0 00.0312-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
        <span data-i18n="dcHandle">icegames</span>
      </div>
      <div class="dc-ask-title" data-i18n="dcAskTitle">No recado, me conta:</div>
      <ul class="dc-ask" id="dc-ask"></ul>
      <button class="btn btn-primary" type="button" data-close-discord data-i18n="dcClose">Fechar</button>
    </div>
  </div>

  <div class="overlay" id="project-modal" hidden role="dialog" aria-modal="true">
    <div class="dialog dialog-project"></div>
  </div>

  <script src="js/data.js"></script>
  <script src="js/site.js"></script>
</body>
</html>
```

- [ ] **Step 2: Check the hooks and open the file**

```bash
grep -c 'data-i18n=' index.html      # expect >= 45
grep -c 'style="' index.html         # expect 0
```

Open `index.html` in the browser (`start index.html` from PowerShell). Expect an unstyled but complete PT page; the console will show 404s for `css/site.css`, `js/data.js`, `js/site.js` — that is expected until Tasks 4–6.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add page markup with i18n hooks and modal shells

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: `css/site.css` — all styles

**Goal:** Style every element of `index.html` (and the elements `site.js` will render) with the exact values from the design.

**Files:**
- Create: `css/site.css`

**Acceptance Criteria:**
- [ ] Page background `#0B0B0C`, text `#F4F1EA`, accent `#6ED4F2`, fonts load (Bricolage Grotesque headings, JetBrains Mono labels, Instrument Serif italic on the H1 accent word and the about lead)
- [ ] Header is sticky with blur; nav hidden at ≤1080 px
- [ ] At ≤900 px: services, about and contact grids are single column; process steps are 2 columns; at ≤620 px steps are 1 column
- [ ] Flip card rotates on hover
- [ ] `.overlay[hidden]` is not displayed
- [ ] Splash overlay is visible at load and `.splash[data-hide="true"]` hides it

**Verify:** Open `index.html` at 1440 px and 390 px width in the browser → matches the design's layout for all static sections (dynamic lists are still empty until Task 6).

**Steps:**

- [ ] **Step 1: Write `css/site.css`**

```css
/* ============================================================
   IceGames portfolio — styles
   Values transcribed from docs/design/Portfolio.dc.html
   ============================================================ */

:root {
  --bg: #0B0B0C;
  --surface: #131315;
  --surface-2: #131316;
  --line: #26262A;
  --line-2: #3A3A3F;
  --text: #F4F1EA;
  --muted: #A8A49C;
  --dim: #8F8C85;
  --ac: #6ED4F2;
  --err: #FF8A6B;
  --sans: 'Bricolage Grotesque', system-ui, sans-serif;
  --serif: 'Instrument Serif', Georgia, serif;
  --mono: 'JetBrains Mono', monospace;
  --pad: clamp(20px, 4vw, 56px);
  --wrap: 1320px;
  --ease-out: cubic-bezier(.16, 1, .3, 1);
}

/* ---------- base ---------- */
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
::selection { background: var(--ac); color: var(--bg); }
a { color: var(--ac); text-decoration: none; }
a:hover { color: var(--text); }
button { font-family: inherit; }
img, video { max-width: 100%; }
[hidden] { display: none !important; }

.wrap { max-width: var(--wrap); margin: 0 auto; padding-left: var(--pad); padding-right: var(--pad); }
.section { border-bottom: 1px solid var(--line); scroll-margin-top: 72px; }
.section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.eyebrow { font-family: var(--mono); font-size: 11.5px; letter-spacing: .16em; text-transform: uppercase; color: var(--ac); margin-bottom: 18px; }
.h2 { font-size: clamp(2rem, 4.4vw, 3.4rem); font-weight: 800; letter-spacing: -.04em; line-height: 1; margin: 0; }
.section-sub { font-size: clamp(1rem, 1.4vw, 1.15rem); color: var(--muted); line-height: 1.6; max-width: 620px; margin: 0 0 clamp(40px, 5vw, 64px); }

/* ---------- buttons, chips, tags ---------- */
.btn {
  display: inline-flex; align-items: center; gap: 10px;
  font-family: var(--mono); font-size: 12.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
  cursor: pointer; border: none; white-space: nowrap;
  transition: background .2s ease, color .2s ease, border-color .2s ease;
}
.btn-primary { color: var(--bg); background: var(--ac); padding: 15px 24px; }
.btn-primary:hover { color: var(--bg); background: var(--text); }
.btn-ghost { color: var(--text); background: none; border: 1px solid var(--line-2); padding: 14px 23px; }
.btn-ghost:hover { color: var(--bg); background: var(--text); border-color: var(--text); }
.btn-sm { padding: 9px 16px; font-size: 12px; letter-spacing: .12em; gap: 8px; }
.btn-link {
  display: inline-flex; align-items: center; gap: 9px;
  background: none; border: none; padding: 0; cursor: pointer;
  font-family: var(--mono); font-size: 11.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--ac);
}
.btn-link:hover { color: var(--text); }
.chips { display: flex; gap: 8px; flex-wrap: wrap; }
.chip {
  font-family: var(--mono); font-size: 11.5px; letter-spacing: .12em; text-transform: uppercase;
  padding: 9px 15px; border: 1px solid var(--line-2); background: none; color: var(--dim); cursor: pointer;
  transition: color .18s ease, border-color .18s ease;
}
.chip:hover { color: var(--text); border-color: var(--text); }
.chip[data-active="true"] { color: var(--bg); background: var(--ac); border-color: var(--ac); }
.tags { display: flex; gap: 8px; flex-wrap: wrap; font-family: var(--mono); font-size: 11.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--dim); }
.tag { border: 1px solid var(--line); padding: 6px 12px; }

/* ---------- splash & snow ---------- */
.splash {
  position: fixed; inset: 0; z-index: 200; background: var(--bg);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px;
  transition: opacity .55s ease, visibility .55s ease;
}
.splash[data-hide="true"] { opacity: 0; visibility: hidden; pointer-events: none; }
.splash-logo { font-family: var(--mono); font-size: 13px; font-weight: 700; letter-spacing: .34em; text-transform: uppercase; color: var(--text); }
.splash-bar { display: block; width: 170px; height: 2px; background: var(--line); overflow: hidden; }
.splash-bar span { display: block; width: 40%; height: 100%; background: var(--ac); animation: ig-load 1.15s cubic-bezier(.65, 0, .35, 1) infinite; }
.snow { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 40; pointer-events: none; mix-blend-mode: screen; }

/* ---------- header ---------- */
.header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(11, 11, 12, .82); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--line);
}
.header-inner { height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.brand { display: inline-flex; align-items: center; gap: 10px; color: var(--text); font-family: var(--mono); font-weight: 700; font-size: 13px; letter-spacing: .18em; text-transform: uppercase; }
.nav { display: flex; align-items: center; gap: clamp(18px, 2vw, 28px); white-space: nowrap; font-family: var(--mono); font-size: 12px; letter-spacing: .14em; text-transform: uppercase; }
.nav a { color: var(--dim); }
.nav a:hover { color: var(--text); }
.header-right { display: flex; align-items: center; gap: 18px; }
.lang { display: flex; align-items: center; gap: 8px; font-family: var(--mono); font-size: 12px; letter-spacing: .1em; }
.lang-btn { background: none; border: none; padding: 0; cursor: pointer; font: inherit; color: var(--dim); }
.lang-btn:hover { color: var(--text); }
.lang-btn[data-active="true"] { color: var(--ac); }
.lang-sep { color: var(--line-2); }

/* ---------- hero ---------- */
.hero { position: relative; overflow: hidden; border-bottom: 1px solid var(--line); }
.hero-glow { position: absolute; top: -260px; right: -180px; width: 720px; height: 720px; background: radial-gradient(circle, rgba(110, 212, 242, .12), transparent 62%); pointer-events: none; }
.hero-inner { position: relative; padding-top: clamp(56px, 9vw, 120px); padding-bottom: clamp(40px, 5vw, 64px); }
.hero-role { display: inline-flex; align-items: center; gap: 12px; font-family: var(--mono); font-size: clamp(11.5px, 1.1vw, 13px); letter-spacing: .16em; text-transform: uppercase; color: var(--text); margin-bottom: clamp(24px, 3vw, 34px); }
.dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ac); animation: ig-blink 2.4s steps(1, end) infinite; }
.hero h1 { font-size: clamp(2.9rem, 8.4vw, 7.4rem); font-weight: 800; line-height: .92; letter-spacing: -.045em; margin: 0; text-wrap: balance; }
.hero h1 em { font-family: var(--serif); font-weight: 400; font-style: italic; letter-spacing: -.01em; color: var(--ac); }
.hero-sub { font-size: clamp(1.02rem, 1.5vw, 1.25rem); line-height: 1.55; color: var(--muted); max-width: 752px; margin: clamp(26px, 3vw, 38px) 0 0; text-wrap: pretty; }
.hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 36px; }
.hero-ctas .btn { font-size: 12.5px; letter-spacing: .12em; }

.clients { position: relative; border-top: 1px solid var(--line); }
.clients-inner { display: flex; align-items: center; gap: clamp(20px, 3vw, 40px); padding: clamp(30px, 3.6vw, 44px) 0 clamp(30px, 3.6vw, 44px) var(--pad); overflow: hidden; }
.clients-label { font-family: var(--mono); font-size: 12.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--text); white-space: nowrap; flex: none; border-left: 2px solid var(--ac); padding-left: 14px; line-height: 1.5; }
.clients-mask {
  position: relative; flex: 1; min-width: 0; overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 6%, #000 90%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 90%, transparent);
}
.clients-rail { display: flex; align-items: center; width: max-content; animation: ig-marquee 36s linear infinite; }
.clients-mask:hover .clients-rail { animation-play-state: paused; }
.client {
  display: block; flex: none; margin-right: clamp(28px, 4vw, 56px);
  opacity: .78; filter: grayscale(1) brightness(1.4) contrast(.9);
  transition: filter .3s ease, opacity .3s ease;
}
.client:hover { opacity: 1; filter: none; }
.client img { display: block; width: 100%; height: 100%; object-fit: contain; }

/* ---------- projects ---------- */
.projects-head { padding-top: clamp(56px, 7vw, 96px); padding-bottom: clamp(40px, 5vw, 64px); }
.projects-list { padding-bottom: clamp(56px, 7vw, 88px); }
.wk { border-top: 1px solid var(--line); }
.wk-row {
  display: grid; grid-template-columns: 76px minmax(0, 1fr) 160px 72px 40px; align-items: center; gap: 16px;
  width: 100%; text-align: left; padding: clamp(20px, 2.6vw, 30px) clamp(10px, 2vw, 22px);
  background: none; border: none; border-bottom: 1px solid var(--line); color: var(--text); cursor: pointer;
  transition: background .2s ease;
}
.wk-num { font-family: var(--mono); font-size: 12px; letter-spacing: .1em; color: var(--dim); }
.wk-title { font-size: clamp(1.5rem, 3.4vw, 2.6rem); font-weight: 800; letter-spacing: -.035em; line-height: 1.05; min-width: 0; }
.wk-cat { font-family: var(--mono); font-size: 11.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--dim); }
.wk-year { font-family: var(--mono); font-size: 12px; color: var(--dim); }
.wk-arrow { display: inline-flex; justify-content: flex-end; color: var(--ac); transition: transform .28s var(--ease-out); }
.wk-row:hover { background: var(--ac); }
.wk-row:hover * { color: var(--bg); opacity: 1; border-color: var(--bg); }
.wk-row:hover .wk-arrow { transform: translateX(8px); }
.projects-empty { text-align: center; color: var(--dim); padding: 56px 0; font-family: var(--mono); font-size: 13px; margin: 0; }

/* ---------- services ---------- */
.services-inner { padding-top: clamp(56px, 7vw, 96px); padding-bottom: clamp(56px, 7vw, 96px); }
.services .h2 { line-height: 1.02; margin: 0 0 16px; max-width: 760px; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 4vw, 56px) clamp(32px, 4vw, 64px); }
.service { border-top: 1px solid var(--line-2); padding-top: 26px; display: flex; flex-direction: column; }
.service-top { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.serif-num { font-family: var(--serif); font-style: italic; font-size: 3.2rem; line-height: 1; color: var(--ac); }
.service-model { font-family: var(--mono); font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--dim); text-align: right; }
.service h3 { font-size: clamp(1.4rem, 2.2vw, 1.85rem); font-weight: 800; letter-spacing: -.03em; margin: 0 0 12px; }
.service-promise { color: var(--text); font-size: 1.05rem; line-height: 1.5; margin: 0 0 12px; max-width: 460px; }
.service-desc { color: var(--muted); line-height: 1.65; margin: 0 0 22px; max-width: 460px; }
.service .tags { margin-bottom: 18px; }
.service .btn-link { align-self: flex-start; margin-top: auto; }

/* ---------- about ---------- */
.split { padding-top: clamp(56px, 7vw, 96px); padding-bottom: clamp(56px, 7vw, 96px); display: grid; grid-template-columns: .78fr 1.22fr; gap: clamp(36px, 5vw, 72px); align-items: center; }
.flip-card { perspective: 1400px; width: 100%; max-width: 420px; margin: 0 auto; aspect-ratio: 1 / 1; }
.flip { position: relative; width: 100%; height: 100%; transition: transform .9s var(--ease-out); transform-style: preserve-3d; }
.flip-card:hover .flip { transform: rotateY(180deg); }
.flip-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; overflow: hidden; border: 1px solid var(--line-2); }
.flip-back { transform: rotateY(180deg); }
.flip-face img { width: 100%; height: 100%; object-fit: cover; display: block; }
.flip-back img { filter: grayscale(1) contrast(1.05); }
.flip-hint { display: flex; align-items: center; gap: 9px; margin-top: 14px; font-family: var(--mono); font-size: 11.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--dim); }
.about .h2 { font-size: clamp(1.9rem, 3.8vw, 3rem); line-height: 1.02; margin: 0 0 26px; }
.lead { font-family: var(--serif); font-size: clamp(1.4rem, 2.4vw, 2rem); font-style: italic; line-height: 1.32; color: var(--text); margin: 0 0 22px; text-wrap: pretty; }
.about-body { color: var(--muted); line-height: 1.7; margin: 0 0 30px; max-width: 620px; text-wrap: pretty; }
.facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid var(--line); font-family: var(--mono); font-size: 12px; color: var(--muted); max-width: 620px; }
.facts div { padding: 14px 0 14px 16px; border-bottom: 1px solid var(--line); }
.facts div:nth-child(odd) { padding: 14px 16px 14px 0; border-right: 1px solid var(--line); }

/* ---------- testimonials ---------- */
.testi-head { padding-top: clamp(56px, 7vw, 96px); padding-bottom: clamp(32px, 3.5vw, 44px); }
.testi-hint { display: flex; align-items: center; gap: 10px; font-family: var(--mono); font-size: 11.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--dim); padding-bottom: 6px; }
.testi-mask {
  position: relative; overflow-x: auto; overflow-y: hidden; cursor: grab;
  padding-bottom: clamp(56px, 7vw, 96px); scrollbar-width: none; -ms-overflow-style: none; touch-action: pan-y;
  mask-image: linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent);
}
.testi-mask::-webkit-scrollbar { display: none; }
.testi-mask:active { cursor: grabbing; }
.testi-track { display: flex; width: max-content; padding-left: var(--pad); }
.testi {
  margin: 0 clamp(32px, 4vw, 56px) 0 0; width: clamp(280px, 30vw, 420px); flex: none;
  border-top: 1px solid var(--line-2); padding-top: 26px; display: flex; flex-direction: column; gap: 22px;
  user-select: none; -webkit-user-select: none;
}
.stars { font-family: var(--mono); font-size: 11px; letter-spacing: .14em; color: var(--ac); }
.testi blockquote { font-family: var(--serif); font-size: clamp(1.3rem, 1.9vw, 1.7rem); font-style: italic; line-height: 1.35; margin: 0; color: var(--text); text-wrap: pretty; }
.testi figcaption { font-family: var(--mono); font-size: 11.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--dim); margin-top: auto; }

/* ---------- process ---------- */
.process-inner { padding-top: clamp(56px, 7vw, 96px); padding-bottom: clamp(56px, 7vw, 96px); }
.process-head { margin-bottom: clamp(36px, 4.5vw, 56px); }
.process-sub { color: var(--muted); line-height: 1.6; margin: 0; max-width: 380px; padding-bottom: 4px; }
.steps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1px; background: var(--line); }
.step { background: var(--bg); padding: clamp(24px, 3vw, 34px) clamp(20px, 2.2vw, 28px); display: flex; flex-direction: column; gap: 14px; }
.step-top { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.step .serif-num { font-size: 2.4rem; }
.step-meta { font-family: var(--mono); font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--dim); }
.step h3 { font-size: 1.15rem; font-weight: 800; letter-spacing: -.02em; margin: 0; }
.step p { color: var(--muted); font-size: .95rem; line-height: 1.6; margin: 0; }
.guarantees { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px 28px; margin-top: 26px; font-family: var(--mono); font-size: 11.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--text); }

/* ---------- contact ---------- */
.contact-grid { padding-top: clamp(56px, 7vw, 100px); padding-bottom: clamp(56px, 7vw, 100px); display: grid; grid-template-columns: 1.1fr .9fr; gap: clamp(40px, 5vw, 80px); align-items: start; }
.contact .h2 { font-size: clamp(2.2rem, 6vw, 4.6rem); letter-spacing: -.045em; line-height: .96; margin: 0 0 22px; }
.contact-sub { color: var(--muted); font-size: clamp(1rem, 1.4vw, 1.15rem); line-height: 1.6; max-width: 420px; margin: 0 0 40px; }
.links { display: flex; flex-direction: column; border-top: 1px solid var(--line); max-width: 460px; }
.links > * { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--line); font-family: var(--mono); font-size: 13px; color: var(--muted); }
.links a:hover { color: var(--text); }
.links .handle { color: var(--ac); }

.form { display: flex; flex-direction: column; gap: 26px; }
.field { display: block; }
.field-label { display: block; font-family: var(--mono); font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--dim); margin-bottom: 10px; }
.input {
  width: 100%; box-sizing: border-box; padding: 10px 0;
  background: none; border: none; border-bottom: 1px solid var(--line-2); color: var(--text);
  font-family: var(--sans); font-size: 17px; outline: none; transition: border-color .2s ease;
}
.input:focus { border-color: var(--ac); }
.input::placeholder { color: var(--dim); opacity: 1; }
.input-mono { font-family: var(--mono); font-size: 15px; }
textarea.input { font-size: 16px; line-height: 1.55; resize: vertical; }
.field-error { display: block; margin-top: 8px; font-family: var(--mono); font-size: 12px; color: var(--err); }
.field-error:empty { display: none; }
.form .btn-primary { align-self: flex-start; padding: 16px 26px; }
.spinner { display: block; width: 14px; height: 14px; border: 2px solid rgba(11, 11, 12, .25); border-top-color: var(--bg); border-radius: 50%; animation: ig-spin .7s linear infinite; }
.success { border: 1px solid var(--line-2); padding: clamp(28px, 4vw, 44px); display: flex; flex-direction: column; gap: 16px; }
.success .eyebrow { margin: 0; }
.success h3 { font-size: clamp(1.5rem, 2.6vw, 2rem); font-weight: 800; letter-spacing: -.03em; margin: 0; }
.success p { color: var(--muted); line-height: 1.65; margin: 0; }
.success .btn-link { align-self: flex-start; margin-top: 6px; font-size: 12px; font-weight: 400; }

/* ---------- footer ---------- */
.footer { padding-top: 40px; padding-bottom: 48px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; font-family: var(--mono); font-size: 12px; letter-spacing: .08em; color: var(--dim); }
.footer a { color: var(--dim); }
.footer a:hover { color: var(--ac); }

/* ---------- overlays & dialogs ---------- */
.overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(6, 6, 7, .86); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; padding: 20px; overflow-y: auto;
}
.overlay-discord { z-index: 110; }
.dialog { position: relative; width: 100%; max-height: 92vh; overflow-y: auto; background: var(--surface); border: 1px solid var(--line-2); box-sizing: border-box; }
.dialog-discord { max-width: 540px; padding: clamp(28px, 4vw, 44px); flex: none; }
.dialog-project { max-width: 680px; }

.dc-eyebrow { font-family: var(--mono); font-size: 11.5px; letter-spacing: .16em; text-transform: uppercase; color: var(--err); margin-bottom: 16px; }
.dc-title { font-size: clamp(1.5rem, 2.8vw, 2.1rem); font-weight: 800; letter-spacing: -.03em; line-height: 1.05; margin: 0 0 14px; }
.dc-text { color: var(--muted); line-height: 1.65; margin: 0 0 18px; }
.dc-handle { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border: 1px solid var(--ac); margin-bottom: 26px; color: var(--ac); }
.dc-handle span { font-family: var(--mono); font-size: 17px; font-weight: 700; letter-spacing: .06em; }
.dc-ask-title { font-family: var(--mono); font-size: 11.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--dim); margin-bottom: 14px; }
.dc-ask { list-style: none; margin: 0 0 30px; padding: 0; display: flex; flex-direction: column; border-top: 1px solid var(--line); }
.dc-ask li { display: flex; align-items: flex-start; gap: 12px; padding: 13px 0; border-bottom: 1px solid var(--line); color: var(--muted); line-height: 1.5; }
.dc-ask li::before { content: '›'; color: var(--ac); font-family: var(--mono); font-size: 12px; padding-top: 3px; }

.pm-media { position: relative; background: var(--bg); }
.pm-media video, .gallery video { display: block; width: 100%; aspect-ratio: 16 / 9; background: var(--bg); border: none; }
.yt { position: relative; display: block; width: 100%; aspect-ratio: 16 / 9; background: var(--bg); overflow: hidden; }
.yt img { display: block; width: 100%; height: 100%; object-fit: cover; }
.yt-badge { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.yt-badge span { display: flex; align-items: center; gap: 10px; padding: 13px 22px; background: var(--bg); color: var(--text); font-family: var(--mono); font-size: 12px; letter-spacing: .14em; text-transform: uppercase; font-weight: 700; }
.gallery .yt { border: 1px solid var(--line); }
.scrollbox { max-height: 420px; overflow-y: auto; border: 1px solid var(--line); background: var(--bg); }
.scrollbox img { display: block; width: 100%; height: auto; }
.pm-media .scrollbox { max-height: 460px; border: none; border-bottom: 1px solid var(--line); }
.media-img { display: block; width: 100%; height: auto; object-fit: contain; background: var(--surface-2); }
.gallery .media-img { object-fit: cover; border: 1px solid var(--line); }
.media-caption, .pm-caption { display: block; font-family: var(--mono); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--dim); }
.media-caption { margin-top: 8px; }
.pm-caption { margin: -8px 0 22px; }
.pm-badge { position: absolute; top: 14px; left: 16px; z-index: 2; font-family: var(--mono); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; padding: 6px 12px; background: var(--ac); color: var(--bg); font-weight: 700; }
.pm-close { position: absolute; top: 14px; right: 16px; z-index: 2; display: inline-flex; width: 34px; height: 34px; align-items: center; justify-content: center; background: var(--bg); border: 1px solid var(--line-2); color: var(--text); cursor: pointer; }
.pm-close:hover { background: var(--text); color: var(--bg); }
.pm-body { padding: clamp(24px, 3.4vw, 36px); }
.pm-title { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.pm-title h3 { font-size: clamp(1.7rem, 3.4vw, 2.5rem); font-weight: 800; letter-spacing: -.035em; line-height: 1; margin: 0; }
.pm-year { font-family: var(--mono); font-size: 12px; color: var(--dim); white-space: nowrap; }
.pm-long { color: var(--muted); line-height: 1.7; margin: 0 0 28px; }
.gallery { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 0 0 28px; }
.gallery-item { position: relative; min-width: 0; }
.gallery-item.full { grid-column: 1 / -1; }
.metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); margin-bottom: 26px; }
.metric { padding: 18px 16px 18px 0; }
.metric-value { font-size: 1.5rem; font-weight: 800; letter-spacing: -.03em; color: var(--ac); }
.metric-label { font-family: var(--mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--dim); margin-top: 6px; }
.pm-body .tags { margin-bottom: 30px; }
.pm-actions { display: flex; flex-wrap: wrap; gap: 10px; }

/* ---------- motion ---------- */
@keyframes ig-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes ig-load { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }
@keyframes ig-spin { to { transform: rotate(360deg); } }
@keyframes ig-blink { 0%, 60% { opacity: 1; } 61%, 100% { opacity: .15; } }
.is-reveal { opacity: 0; transform: translateY(26px); will-change: opacity, transform; }
.is-reveal.is-in { opacity: 1; transform: none; transition: opacity .8s var(--ease-out), transform .8s var(--ease-out); }

@media (prefers-reduced-motion: reduce) {
  .clients-rail { animation: none; }
  .dot { animation: none; }
  .is-reveal { opacity: 1; transform: none; }
  .flip { transition: none; }
}

/* ---------- responsive ---------- */
@media (max-width: 1080px) {
  .nav { display: none; }
}
@media (max-width: 900px) {
  .two, .split, .contact-grid { grid-template-columns: 1fr; }
  .wk-row { grid-template-columns: 44px 1fr; row-gap: 6px; }
  .wk-hidemob { display: none; }
  .steps { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 620px) {
  .steps { grid-template-columns: 1fr; }
  .metrics { grid-template-columns: 1fr; }
  .metric { padding-right: 0; border-bottom: 1px solid var(--line); }
  .metric:last-child { border-bottom: none; }
}
```

- [ ] **Step 2: Open `index.html` in the browser** at full width and with the window narrowed to ~390 px. Compare with the design: header layout, hero type scale, about flip card, contact grid, footer. The lists (`#clients-rail`, `#projects`, `#services`, `#steps`, `#testimonials`) are still empty — expected. Because `data-hide` is never set yet, the splash covers the page: temporarily check the page by running `document.getElementById('splash').dataset.hide = 'true'` in the console.

- [ ] **Step 3: Commit**

```bash
git add css/site.css
git commit -m "feat: add stylesheet transcribed from the design

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: `js/data.js` — all content

**Goal:** Put every piece of content (projects, testimonials, clients, services, PT/EN strings, tag vocabulary) into one global `IG_DATA` object, copied verbatim from the design.

**Files:**
- Create: `js/data.js`
- Read: `docs/design/Portfolio.dc.html` lines 495–552 (`PROJECTS`), 554–570 (`TESTIMONIALS`), 572–582 (`VOCAB_EN`), 584–709 (`STR`), 1018–1021 (services), 1034–1039 (clients)

**Acceptance Criteria:**
- [ ] In the browser console after loading `index.html`: `IG_DATA.PROJECTS.length === 6`, `IG_DATA.TESTIMONIALS.length === 5`, `IG_DATA.CLIENTS.length === 6`, `IG_DATA.SERVICES.length === 4`
- [ ] `Object.keys(IG_DATA.STR.pt).length === Object.keys(IG_DATA.STR.en).length` and `Object.keys(IG_DATA.STR.pt).every(k => k in IG_DATA.STR.en)` → `true`
- [ ] `IG_DATA.STR.pt.footerTagline === "Transformando o impossível em possível."` (no trailing `\n` — the design has a stray newline)
- [ ] `IG_DATA.PROJECTS.map(p => p.id).join()` → `afterlands,highschool,tabiquest,cortex,dinosaurs,iglanguages`
- [ ] File has no functions and no references to `this`, `React`, or `state`

**Verify:** In the browser console: `[IG_DATA.PROJECTS.length, IG_DATA.TESTIMONIALS.length, IG_DATA.CLIENTS.length, IG_DATA.SERVICES.length, Object.keys(IG_DATA.STR.pt).every(k => k in IG_DATA.STR.en)]` → `[6, 5, 6, 4, true]`.

**Steps:**

- [ ] **Step 1: Write `js/data.js` with this skeleton**, then fill each array/object by copying the design's literal exactly (the design's object syntax is valid plain JS; only `this.`-prefixes and class wrappers must not be copied — there are none inside these literals).

```js
/* ============================================================
   IceGames portfolio — content
   Edit this file to add/change projects, testimonials, clients
   or any PT/EN string. No logic lives here.
   ============================================================ */
window.IG_DATA = {

  /* Projects, in display order. category is one of:
     "Minecraft" | "Game Design" | "IA / Software"
     media[0] is the modal hero; the rest is the gallery.
     media types: file (mp4 in assets/) | youtube (yt: video id) |
                  scroll (tall screenshot, scrollable) | image (aspect: "w / h") */
  PROJECTS: [
    // ← paste the 6 objects from docs/design/Portfolio.dc.html lines 496–551 verbatim
  ],

  TESTIMONIALS: [
    // ← paste the 5 objects from lines 555–569 verbatim
  ],

  /* Logos in the hero marquee. w/h are the box the logo is fitted into. href "" = not a link */
  CLIENTS: [
    { id: "client-soggy",      name: "Soggy",         src: "assets/client-soggy.jpg",      w: "78px",  h: "78px",  href: "https://www.youtube.com/@savvysoggy" },
    { id: "client-afterlands", name: "AfterLands",    src: "assets/client-afterlands.png", w: "270px", h: "72px",  href: "https://www.afterlands.com" },
    { id: "client-tabiquest",  name: "TabiQuest",     src: "assets/client-tabiquest.png",  w: "110px", h: "110px", href: "" },
    { id: "client-mia",        name: "Mia Studios",   src: "assets/client-mia.png",        w: "212px", h: "72px",  href: "https://www.mia-studios.net" },
    { id: "client-panda",      name: "Panda Studios", src: "assets/client-panda.png",      w: "92px",  h: "84px",  href: "https://www.panda-studios.net/" },
    { id: "client-eco",        name: "Eco Studios",   src: "assets/client-eco.png",        w: "206px", h: "72px",  href: "https://www.ecostudios.com.br/" },
  ],

  /* Services: n selects STR keys serv{n}Title/Model/Promise/Desc; proof = project id opened by "See the proof" */
  SERVICES: [
    { n: 1, proof: "dinosaurs",  tags: ["Game Design", "GDD", "Narrativa"] },
    { n: 2, proof: "afterlands", tags: ["Java", "Spigot / Paper", "Redis"] },
    { n: 3, proof: "highschool", tags: ["DevOps", "Teste de carga", "Monitoramento"] },
    { n: 4, proof: "cortex",     tags: ["Java / Spring", "Python", "RAG", "Vue"] },
  ],

  /* Tag / metric words written in PT that get translated when lang === "en" */
  VOCAB_EN: {
    // ← paste the 9 entries from lines 573–581 verbatim
  },

  /* Every UI string. Keys must exist in BOTH pt and en. */
  STR: {
    pt: {
      // ← paste lines 586–645 verbatim, then remove the trailing "\n" from footerTagline
    },
    en: {
      // ← paste lines 648–707 verbatim
    },
  },
};
```

Practical way to copy without retyping (Git Bash): `sed -n '496,551p' docs/design/Portfolio.dc.html` prints the PROJECTS objects; paste the output between the brackets. Same for the other ranges. After pasting, fix `footerTagline: "Transformando o impossível em possível.\n"` → `"Transformando o impossível em possível."`.

- [ ] **Step 2: Syntax-check without Node.** Open `index.html` in the browser and run in the console:

```js
[IG_DATA.PROJECTS.length, IG_DATA.TESTIMONIALS.length, IG_DATA.CLIENTS.length, IG_DATA.SERVICES.length,
 Object.keys(IG_DATA.STR.pt).length === Object.keys(IG_DATA.STR.en).length,
 Object.keys(IG_DATA.STR.pt).every(k => k in IG_DATA.STR.en),
 IG_DATA.STR.pt.footerTagline,
 IG_DATA.PROJECTS.map(p => p.id).join()]
```

Expected: `[6, 5, 6, 4, true, true, "Transformando o impossível em possível.", "afterlands,highschool,tabiquest,cortex,dinosaurs,iglanguages"]`. A syntax error in the file shows as a red console error and `IG_DATA` undefined — fix the paste.

- [ ] **Step 3: Commit**

```bash
git add js/data.js
git commit -m "feat: add site content (projects, testimonials, clients, PT/EN strings)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: `js/site.js` — i18n and list rendering

**Goal:** Render the client marquee, filter chips, project rows, services, process steps, testimonials and Discord "ask" list from `IG_DATA`, and make the EN/PT toggle and project filters work.

**Files:**
- Create: `js/site.js` (this task writes the file; Tasks 7 and 8 add to it)

**Acceptance Criteria:**
- [ ] On load, the page is in PT if `navigator.language` starts with `pt`, otherwise EN; a saved `localStorage.ig_lang` wins
- [ ] Clicking EN/PT switches every `data-i18n` string, every rendered list, `<html lang>` and the active button; reload keeps the choice
- [ ] Filter chips show: Todos → 6 rows, Minecraft → 4, Game Design → 1, IA / Software → 1; the active chip is highlighted; rows are renumbered from 01
- [ ] Client rail shows 12 logos (6 × 2), TabiQuest is not a link, the others open in a new tab
- [ ] Testimonial track has 10 figures (5 × 2)
- [ ] Discord modal's list has 4 items (still hidden — opened in Task 7)
- [ ] Footer year is the current year
- [ ] No console errors

**Verify:** Browser console: `[document.querySelectorAll('#clients-rail .client').length, document.querySelectorAll('#projects .wk-row').length, document.querySelectorAll('#services .service').length, document.querySelectorAll('#steps .step').length, document.querySelectorAll('#testimonials .testi').length, document.querySelectorAll('#dc-ask li').length]` → `[12, 6, 4, 4, 10, 4]`; click "Game Design" chip → `document.querySelectorAll('#projects .wk-row').length === 1`.

**Steps:**

- [ ] **Step 1: Write `js/site.js`**

```js
/* ============================================================
   IceGames portfolio — behavior
   Content comes from js/data.js (window.IG_DATA).
   Sections: helpers · i18n · render · modals · form · splash ·
             reveal · snow · testimonial rail · events · init
   ============================================================ */
(function () {
  'use strict';

  var D = window.IG_DATA;
  if (!D) { console.error('IG_DATA missing: load js/data.js before js/site.js'); return; }

  /* ---------- helpers ---------- */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var ICON_ARROW = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var ICON_ARROW_SM = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var ICON_ARROW_16 = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var ICON_EXT = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';
  var ICON_CLOSE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';

  /* filter value (matches project.category) → STR key for its label */
  var FILTERS = [
    ['Todos', 'filterAll'],
    ['Minecraft', 'filterMc'],
    ['Game Design', 'filterGd'],
    ['IA / Software', 'filterAi'],
  ];

  /* ---------- state ---------- */
  var state = {
    lang: initialLang(),
    filter: 'Todos',
    modalId: null,
    discordOpen: false,
    sending: false,
    errors: {},        // field name → STR key
  };

  function initialLang() {
    try {
      var s = localStorage.getItem('ig_lang');
      if (s === 'pt' || s === 'en') return s;
    } catch (e) { /* private mode */ }
    var nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
    return nav.indexOf('pt') === 0 ? 'pt' : 'en';
  }

  /* ---------- i18n ---------- */
  function t(key) {
    var s = D.STR[state.lang][key];
    if (s === undefined) console.warn('missing string: ' + key);
    return s === undefined ? key : s;
  }
  /* tags / metric values written in PT inside data.js */
  function tr(s) { return (state.lang === 'en' && D.VOCAB_EN[s]) ? D.VOCAB_EN[s] : s; }
  /* localized field: plain string or {pt, en} */
  function L(v) { return typeof v === 'string' ? v : v[state.lang]; }
  function catLabel(cat) {
    return cat === 'IA / Software' ? t('filterAi')
      : cat === 'Game Design' ? t('filterGd')
      : cat === 'Minecraft' ? t('filterMc')
      : cat;
  }
  function projectCategory(p) { return p.label || catLabel(p.category); }

  function setLang(l) {
    if (l !== 'pt' && l !== 'en') return;
    try { localStorage.setItem('ig_lang', l); } catch (e) { /* ignore */ }
    state.lang = l;
    renderAll();
  }

  /* ---------- render ---------- */
  function renderStatic() {
    document.documentElement.lang = state.lang;
    $$('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    $$('[data-i18n-placeholder]').forEach(function (el) { el.placeholder = t(el.getAttribute('data-i18n-placeholder')); });
    $$('.lang-btn').forEach(function (b) { b.setAttribute('data-active', String(b.getAttribute('data-lang') === state.lang)); });
  }

  function renderClients() {
    var html = D.CLIENTS.concat(D.CLIENTS).map(function (c) {
      var img = '<img src="' + esc(c.src) + '" alt="' + esc(c.name) + '" loading="lazy">';
      var style = 'width:' + esc(c.w) + ';height:' + esc(c.h);
      return c.href
        ? '<a class="client" href="' + esc(c.href) + '" target="_blank" rel="noopener" title="' + esc(c.name) + '" style="' + style + '">' + img + '</a>'
        : '<div class="client" title="' + esc(c.name) + '" style="' + style + '">' + img + '</div>';
    }).join('');
    $('#clients-rail').innerHTML = html;
  }

  function renderFilters() {
    $('#filters').innerHTML = FILTERS.map(function (f) {
      return '<button class="chip" type="button" data-filter="' + esc(f[0]) + '" data-active="' + (state.filter === f[0]) + '">' + esc(t(f[1])) + '</button>';
    }).join('');
  }

  function visibleProjects() {
    return D.PROJECTS.filter(function (p) { return state.filter === 'Todos' || p.category === state.filter; });
  }

  function renderProjects() {
    var list = visibleProjects();
    $('#projects').innerHTML = list.map(function (p, i) {
      var num = ('0' + (i + 1)).slice(-2);
      return '<button class="wk-row" type="button" data-open="' + esc(p.id) + '">' +
        '<span class="wk-num">' + num + '</span>' +
        '<span class="wk-title">' + esc(p.title) + '</span>' +
        '<span class="wk-cat wk-hidemob">' + esc(projectCategory(p)) + '</span>' +
        '<span class="wk-year wk-hidemob">' + esc(L(p.year)) + '</span>' +
        '<span class="wk-arrow wk-hidemob">' + ICON_ARROW + '</span>' +
        '</button>';
    }).join('');
    $('#projects-empty').hidden = list.length > 0;
  }

  function renderServices() {
    $('#services').innerHTML = D.SERVICES.map(function (s) {
      var k = 'serv' + s.n;
      return '<div class="service">' +
        '<div class="service-top"><span class="serif-num">0' + s.n + '</span><span class="service-model">' + esc(t(k + 'Model')) + '</span></div>' +
        '<h3>' + esc(t(k + 'Title')) + '</h3>' +
        '<p class="service-promise">' + esc(t(k + 'Promise')) + '</p>' +
        '<p class="service-desc">' + esc(t(k + 'Desc')) + '</p>' +
        '<div class="tags">' + s.tags.map(function (x) { return '<span class="tag">' + esc(tr(x)) + '</span>'; }).join('') + '</div>' +
        '<button class="btn-link" type="button" data-open="' + esc(s.proof) + '">' + esc(t('servProof')) + ICON_ARROW_SM + '</button>' +
        '</div>';
    }).join('');
  }

  function renderSteps() {
    $('#steps').innerHTML = [1, 2, 3, 4].map(function (n) {
      return '<div class="step">' +
        '<div class="step-top"><span class="serif-num">0' + n + '</span><span class="step-meta">' + esc(t('proc' + n + 'm')) + '</span></div>' +
        '<h3>' + esc(t('proc' + n + 't')) + '</h3>' +
        '<p>' + esc(t('proc' + n + 'd')) + '</p>' +
        '</div>';
    }).join('');
  }

  function renderTestimonials() {
    $('#testimonials').innerHTML = D.TESTIMONIALS.concat(D.TESTIMONIALS).map(function (q) {
      return '<figure class="testi">' +
        '<span class="stars">' + esc(q.stars) + '</span>' +
        '<blockquote>“' + esc(L(q.quote)) + '”</blockquote>' +
        '<figcaption>' + esc(q.name) + ' · ' + esc(L(q.role)) + '</figcaption>' +
        '</figure>';
    }).join('');
  }

  function renderAsk() {
    $('#dc-ask').innerHTML = ['askProject', 'askTimeline', 'askBudget', 'askScale'].map(function (k) {
      return '<li>' + esc(t(k)) + '</li>';
    }).join('');
  }

  function renderAll() {
    renderStatic();
    renderClients();
    renderFilters();
    renderProjects();
    renderServices();
    renderSteps();
    renderTestimonials();
    renderAsk();
    renderModal();
    renderForm();
  }

  /* ---------- modals (Task 7) ---------- */
  function renderModal() { /* filled in Task 7 */ }
  function openModal(id) { /* filled in Task 7 */ }
  function closeModal() { /* filled in Task 7 */ }
  function openDiscord() { /* filled in Task 7 */ }
  function closeDiscord() { /* filled in Task 7 */ }

  /* ---------- form (Task 7) ---------- */
  function renderForm() { /* filled in Task 7 */ }
  function bindForm() { /* filled in Task 7 */ }

  /* ---------- splash · reveal · snow · rail (Task 8) ---------- */
  function initSplash() { $('#splash').setAttribute('data-hide', 'true'); /* replaced in Task 8 */ }
  function initReveal() { /* filled in Task 8 */ }
  function initSnow() { /* filled in Task 8 */ }
  function initRail() { /* filled in Task 8 */ }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var el;
    if ((el = e.target.closest('.lang-btn'))) { setLang(el.getAttribute('data-lang')); return; }
    if ((el = e.target.closest('[data-filter]'))) { state.filter = el.getAttribute('data-filter'); renderFilters(); renderProjects(); return; }
    if ((el = e.target.closest('[data-open]'))) { openModal(el.getAttribute('data-open')); return; }
    if (e.target.closest('[data-close]')) { closeModal(); return; }
    if (e.target.closest('[data-close-discord]')) { closeDiscord(); return; }
    if (e.target.id === 'project-modal') { closeModal(); return; }
    if (e.target.id === 'discord-modal') { closeDiscord(); return; }
  });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); closeDiscord(); }
  });

  /* ---------- init ---------- */
  $('#year').textContent = String(new Date().getFullYear());
  renderAll();
  bindForm();
  initReveal();
  initSnow();
  initRail();
  initSplash();
})();
```

- [ ] **Step 2: Verify in the browser.** Open `index.html`. Run the console check from **Verify**. Click each filter chip and confirm the counts 6 / 4 / 1 / 1 and renumbering. Click EN then PT: nav, hero, services, steps, testimonial roles, form placeholders and the Discord list all switch; `document.documentElement.lang` follows; reload keeps the last choice. Hover a client logo → color returns and marquee pauses. Check there are no console errors (the `[data-open]` click is a no-op until Task 7).

- [ ] **Step 3: Commit**

```bash
git add js/site.js
git commit -m "feat: render lists from data, add PT/EN toggle and project filters

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: `js/site.js` — project modal, Discord modal, contact form

**Goal:** Open each project in the modal with the right media, gallery, metrics, tags and links; wire the Discord modal; validate the form and route a valid submit to the Discord modal after 1.6 s.

**Files:**
- Modify: `js/site.js` — replace the `/* filled in Task 7 */` stubs

**Acceptance Criteria:**
- [ ] Clicking any project row or any service's "Ver a prova" opens `#project-modal` with that project; `document.body.style.overflow === 'hidden'` while open
- [ ] AfterLands: hero is a `<video>`, gallery has a full-width scrollable screenshot with caption + 2 videos side by side, "Ver o site" link present
- [ ] High School / TabiQuest: hero is a YouTube thumbnail link with the "▶ YouTube" badge (opens youtube.com in a new tab)
- [ ] CORTEX / IGLanguages: hero is a scrollable screenshot; caption shows under the title
- [ ] Dinosaurs: hero is a portrait image with `aspect-ratio: 1656 / 2339`
- [ ] Modal closes on ✕, backdrop click, ESC and the "Quero algo assim" CTA (which then scrolls to `#contato`); body scroll restores
- [ ] Switching language while a modal is open re-renders it in the new language
- [ ] Empty form submit shows the three PT/EN errors; typing in a field clears its error; valid submit shows the spinner + "Enviando" for 1.6 s then opens `#discord-modal`; Discord modal closes on button, backdrop, ESC

**Verify:** Browser: click "AfterLands" row → `document.querySelectorAll('#project-modal .gallery-item').length === 3` and `document.querySelector('#project-modal .pm-media video') !== null`; press ESC → `document.getElementById('project-modal').hidden === true && document.body.style.overflow === ''`. Submit the empty form → `document.querySelectorAll('.field-error:not(:empty)').length === 3`.

**Steps:**

- [ ] **Step 1: Replace the modal stubs** in `js/site.js` with:

```js
  /* ---------- modals ---------- */
  function syncScrollLock() {
    document.body.style.overflow = (state.modalId || state.discordOpen) ? 'hidden' : '';
  }

  function mediaHtml(m, p, isHero) {
    var alt = esc(p.title);
    if (m.type === 'youtube') {
      return '<a class="yt" href="https://www.youtube.com/watch?v=' + esc(m.yt) + '" target="_blank" rel="noopener">' +
        '<img src="https://i.ytimg.com/vi/' + esc(m.yt) + '/maxresdefault.jpg" alt="' + alt + '">' +
        '<span class="yt-badge"><span>▶ YouTube</span></span></a>';
    }
    if (m.type === 'file') {
      return '<video src="' + esc(m.src) + '" controls playsinline preload="metadata"></video>';
    }
    if (m.type === 'scroll') {
      var cap = (!isHero && m.caption) ? '<span class="media-caption">' + esc(L(m.caption)) + '</span>' : '';
      return '<div class="scrollbox"><img src="' + esc(m.src) + '" alt="' + alt + '"></div>' + cap;
    }
    /* image */
    return '<img class="media-img" src="' + esc(m.src) + '" alt="' + alt + '" style="aspect-ratio:' + esc(m.aspect || '16 / 9') + '">';
  }

  function renderModal() {
    var overlay = $('#project-modal');
    var dialog = $('.dialog', overlay);
    var p = null;
    for (var i = 0; i < D.PROJECTS.length; i++) if (D.PROJECTS[i].id === state.modalId) p = D.PROJECTS[i];
    if (!p) { overlay.hidden = true; dialog.innerHTML = ''; return; }

    var media = p.media || [];
    var hero = media[0];
    var gallery = media.slice(1);
    var heroCaption = (hero && hero.caption) ? L(hero.caption) : '';

    dialog.innerHTML =
      '<div class="pm-media">' +
        (hero ? mediaHtml(hero, p, true) : '') +
        '<span class="pm-badge">' + esc(projectCategory(p)) + '</span>' +
        '<button class="pm-close" type="button" data-close aria-label="' + esc(t('dcClose')) + '">' + ICON_CLOSE + '</button>' +
      '</div>' +
      '<div class="pm-body">' +
        '<div class="pm-title"><h3>' + esc(p.title) + '</h3><span class="pm-year">' + esc(L(p.year)) + '</span></div>' +
        (heroCaption ? '<span class="pm-caption">' + esc(heroCaption) + '</span>' : '') +
        '<p class="pm-long">' + esc(L(p.long)) + '</p>' +
        (gallery.length
          ? '<div class="gallery">' + gallery.map(function (m) {
              return '<div class="gallery-item' + (m.type === 'scroll' ? ' full' : '') + '">' + mediaHtml(m, p, false) + '</div>';
            }).join('') + '</div>'
          : '') +
        '<div class="metrics">' + (p.metrics || []).map(function (m) {
          return '<div class="metric"><div class="metric-value">' + esc(tr(m.value)) + '</div><div class="metric-label">' + esc(L(m.label)) + '</div></div>';
        }).join('') + '</div>' +
        '<div class="tags">' + (p.tags || []).map(function (x) { return '<span class="tag">' + esc(tr(x)) + '</span>'; }).join('') + '</div>' +
        '<div class="pm-actions">' +
          '<a class="btn btn-primary" href="#contato" data-close>' + esc(t('modalCta')) + ICON_ARROW_16 + '</a>' +
          (p.link ? '<a class="btn btn-ghost" href="' + esc(p.link.url) + '" target="_blank" rel="noopener">' + esc(L(p.link.label)) + ICON_EXT + '</a>' : '') +
        '</div>' +
      '</div>';
    overlay.hidden = false;
    overlay.scrollTop = 0;
    dialog.scrollTop = 0;
  }

  function openModal(id) { state.modalId = id; renderModal(); syncScrollLock(); }
  function closeModal() {
    if (!state.modalId) return;
    state.modalId = null; renderModal(); syncScrollLock();
  }
  function openDiscord() { state.discordOpen = true; $('#discord-modal').hidden = false; syncScrollLock(); }
  function closeDiscord() {
    if (!state.discordOpen) return;
    state.discordOpen = false; $('#discord-modal').hidden = true; syncScrollLock();
  }
```

- [ ] **Step 2: Replace the form stubs** with:

```js
  /* ---------- form ---------- */
  var sendTimer = null;
  var FIELDS = ['name', 'email', 'message'];

  function field(name) { return $('#contact-form [name="' + name + '"]'); }

  function renderForm() {
    FIELDS.forEach(function (k) {
      $('#contact-form [data-error="' + k + '"]').textContent = state.errors[k] ? t(state.errors[k]) : '';
    });
    $('#submit-label').textContent = t(state.sending ? 'formSending' : 'formSubmit');
    $('#submit-spinner').hidden = !state.sending;
    $('#submit-arrow').hidden = state.sending;
  }

  function validate() {
    var errors = {};
    if (!field('name').value.trim()) errors.name = 'errName';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(field('email').value.trim())) errors.email = 'errEmail';
    if (field('message').value.trim().length < 10) errors.message = 'errMessage';
    return errors;
  }

  function bindForm() {
    var form = $('#contact-form');
    form.addEventListener('input', function (e) {
      var k = e.target.getAttribute('name');
      if (k && state.errors[k]) { delete state.errors[k]; renderForm(); }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (state.sending) return;
      state.errors = validate();
      renderForm();
      if (Object.keys(state.errors).length) return;
      state.sending = true;
      renderForm();
      /* Design behavior (user decision): no backend — after a short "sending" state,
         fall back to the Discord modal. */
      sendTimer = setTimeout(function () {
        state.sending = false;
        renderForm();
        openDiscord();
      }, 1600);
    });
    $('#form-reset').addEventListener('click', function () {
      form.reset();
      state.errors = {};
      $('#form-success').hidden = true;
      form.hidden = false;
      renderForm();
    });
  }
```

- [ ] **Step 3: Verify in the browser.** Work through the **Acceptance Criteria** list project by project (all six), then the form flow. Also: open a modal, click PT/EN — the modal text switches; click the "Quero algo assim" CTA → modal closes and the page scrolls to the form.

- [ ] **Step 4: Commit**

```bash
git add js/site.js
git commit -m "feat: project modal with media gallery, Discord fallback modal, form validation

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: `js/site.js` — splash, reveal, snow, testimonial rail

**Goal:** Add the page-load splash, scroll-reveal for sections, the canvas snow with the arrival gust, and the auto-scrolling draggable testimonial rail.

**Files:**
- Modify: `js/site.js` — replace the `/* filled in Task 8 */` stubs and the temporary `initSplash`

**Acceptance Criteria:**
- [ ] Splash shows on load and fades out ~350 ms after `load` (never later than 2.6 s)
- [ ] Sections with `data-reveal` start invisible and fade/slide in when scrolled into view (once)
- [ ] Snow renders on the canvas: strong gust in the first ~2 s settling into a calm drift; large flakes are accent-colored; canvas resizes with the window; nothing renders under `prefers-reduced-motion`
- [ ] Testimonial rail scrolls left continuously, pauses while hovered, can be dragged with the mouse, resumes 1.4 s after release, and wraps without a visible jump; under `prefers-reduced-motion` it does not auto-scroll but still drags
- [ ] No console errors; page scroll performance stays smooth (no layout thrash: the rail loop only touches `scrollLeft`)

**Verify:** Browser: reload → splash visible then gone; `document.getElementById('splash').dataset.hide === 'true'` after 3 s; `document.querySelectorAll('.is-reveal.is-in').length` grows as you scroll; hover the testimonials → `scrollLeft` stops changing; DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce" + reload → canvas blank, rail static.

**Steps:**

- [ ] **Step 1: Replace `initSplash`, `initReveal`, `initSnow`, `initRail`** with:

```js
  /* ---------- splash ---------- */
  function initSplash() {
    var el = $('#splash');
    var done = false;
    var finish = function () { if (done) return; done = true; el.setAttribute('data-hide', 'true'); };
    if (document.readyState === 'complete') setTimeout(finish, 450);
    else window.addEventListener('load', function () { setTimeout(finish, 350); });
    setTimeout(finish, 2600);   /* fallback if load stalls (fonts, video metadata) */
  }

  /* ---------- reveal ---------- */
  function initReveal() {
    var els = $$('[data-reveal]');
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { el.classList.add('is-reveal'); io.observe(el); });
  }

  /* ---------- snow ---------- */
  function initSnow() {
    var cv = $('#snow');
    if (!cv || reduceMotion) return;
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var accent = getComputedStyle(document.documentElement).getPropertyValue('--ac').trim() || '#6ED4F2';
    var w = 0, h = 0, flakes = [];

    var resize = function () {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(220, (w * h) / 9000));
      flakes = [];
      for (var i = 0; i < count; i++) {
        flakes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          s: 1 + Math.floor(Math.random() * 3),
          vy: 14 + Math.random() * 48,
          drift: 6 + Math.random() * 26,
          phase: Math.random() * Math.PI * 2,
          a: 0.18 + Math.random() * 0.5,
        });
      }
    };
    resize();
    window.addEventListener('resize', resize);

    var t0 = performance.now(), last = t0;
    var draw = function (now) {
      if (cv.clientWidth !== w || cv.clientHeight !== h) resize();
      if (!w || !h) { requestAnimationFrame(draw); return; }
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      var life = (now - t0) / 1000;
      /* blizzard on arrival: strong gust that settles into a calm drift */
      var gust = 1 + 3.4 * Math.exp(-life / 1.9);
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.phase += dt * 1.1;
        f.y += f.vy * gust * dt;
        f.x += (Math.sin(f.phase) * f.drift + 26 * (gust - 1)) * dt;
        if (f.y - f.s > h) { f.y = -f.s * 2; f.x = Math.random() * w; }
        if (f.x > w + 6) f.x = -6;
        if (f.x < -6) f.x = w + 6;
        ctx.globalAlpha = f.a * Math.min(1, 0.45 + gust * 0.25);
        ctx.fillStyle = f.s > 2 ? accent : '#F4F1EA';
        ctx.fillRect(Math.round(f.x), Math.round(f.y), f.s, f.s);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  /* ---------- testimonial rail ---------- */
  function initRail() {
    var el = $('#testi-rail');
    var track = $('#testimonials');
    if (!el || !track) return;
    var paused = false, drag = null, resume = 0;

    /* distance between the first card and the first duplicated card */
    var half = function () {
      var n = track.children.length;
      if (!n) return 0;
      var mid = track.children[Math.floor(n / 2)];
      return mid ? mid.offsetLeft - track.children[0].offsetLeft : 0;
    };
    var wrap = function () {
      var h = half();
      if (h <= 0) return;
      if (el.scrollLeft >= h) el.scrollLeft -= h;
      else if (el.scrollLeft <= 0) el.scrollLeft += h;
    };
    var loop = function (now) {
      if (!reduceMotion && !paused && !drag && now > resume) el.scrollLeft += 0.5;
      wrap();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    el.addEventListener('pointerenter', function () { paused = true; });
    el.addEventListener('pointerleave', function () { paused = false; });
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;          /* native scroll on touch */
      drag = { x: e.clientX, left: el.scrollLeft };
      if (el.setPointerCapture) el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', function (e) {
      if (!drag) return;
      e.preventDefault();
      el.scrollLeft = drag.left - (e.clientX - drag.x);
    });
    var up = function () { if (drag) { drag = null; resume = performance.now() + 1400; } };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  }
```

- [ ] **Step 2: Verify in the browser** per **Verify**, then also drag the rail with the mouse and release: it stays put for ~1.4 s then resumes. Resize the window: the snow canvas fills it again.

- [ ] **Step 3: Commit**

```bash
git add js/site.js
git commit -m "feat: splash, scroll reveal, snow canvas and draggable testimonial rail

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: SEO metadata, Cloudflare headers, robots/sitemap, README

**Goal:** Make the page discoverable and shareable, and document how to edit and deploy it.

**Files:**
- Modify: `index.html` (`<head>` only)
- Create: `_headers`, `robots.txt`, `sitemap.xml`, `README.md`

**Acceptance Criteria:**
- [ ] `<head>` has canonical `https://icegames.me/`, `og:title`, `og:description`, `og:image` (absolute URL to `assets/vitor-avatar.png`), `og:url`, `og:type=website`, `og:locale=pt_BR`, `og:locale:alternate=en_US`, `twitter:card=summary`, `theme-color=#0B0B0C`
- [ ] JSON-LD `Person` block parses (`JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)` succeeds) with `name`, `alternateName`, `jobTitle`, `url`, `sameAs` (GitHub + LinkedIn)
- [ ] `_headers` sets `Cache-Control: public, max-age=604800` for `/assets/*` and `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` for `/*`
- [ ] `robots.txt` allows everything and points to `https://icegames.me/sitemap.xml`
- [ ] `sitemap.xml` lists exactly one URL
- [ ] `README.md` explains: how to preview locally, where content lives (`js/data.js`) with the media types, how to add a logo with `tools/resize-image.ps1`, and the Cloudflare Pages settings

**Verify:** `grep -c 'property="og:' index.html` → 7; browser console `JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent).name` → `"Vitor Albert"`; `cat _headers robots.txt sitemap.xml` shows the contents below.

**Steps:**

- [ ] **Step 1: Add to `<head>` in `index.html`, right after the `<meta name="description">` line:**

```html
  <meta name="theme-color" content="#0B0B0C">
  <link rel="canonical" href="https://icegames.me/">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://icegames.me/">
  <meta property="og:title" content="Vitor Albert · IceGames — Software Engineer & Game Designer">
  <meta property="og:description" content="Servidores de Minecraft, eventos ao vivo e software com IA que rodam com centenas de jogadores ao mesmo tempo.">
  <meta property="og:image" content="https://icegames.me/assets/vitor-avatar.png">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:locale:alternate" content="en_US">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Vitor Albert · IceGames">
  <meta name="twitter:description" content="Software Engineer & Game Designer. Minecraft servers, live events and AI-powered software.">
  <meta name="twitter:image" content="https://icegames.me/assets/vitor-avatar.png">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Vitor Albert",
    "alternateName": "IceGames",
    "jobTitle": "Software Engineer & Game Designer",
    "url": "https://icegames.me/",
    "image": "https://icegames.me/assets/vitor-avatar.png",
    "sameAs": [
      "https://github.com/IceGames23",
      "https://www.linkedin.com/in/vitor-albert/"
    ]
  }
  </script>
```

- [ ] **Step 2: Create `_headers`**

```
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY

/assets/*
  Cache-Control: public, max-age=604800
```

- [ ] **Step 3: Create `robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://icegames.me/sitemap.xml
```

- [ ] **Step 4: Create `sitemap.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://icegames.me/</loc>
    <lastmod>2026-09-17</lastmod>
    <changefreq>monthly</changefreq>
  </url>
</urlset>
```

- [ ] **Step 5: Create `README.md`**

````markdown
# icegames.me

Portfolio de Vitor Albert (IceGames). Site estático: HTML + CSS + JS puro, sem build.

## Ver localmente

Abra `index.html` no navegador (funciona direto de `file://`).

## Editar conteúdo

Tudo que é texto ou lista está em **`js/data.js`**:

- `PROJECTS` — projetos (ordem de exibição). `category` é `"Minecraft"`, `"Game Design"` ou `"IA / Software"`.
  `media[0]` é o destaque do modal; o resto vira galeria. Tipos de mídia:
  - `{ type: "file", src: "assets/x.mp4" }` — vídeo local
  - `{ type: "youtube", yt: "VIDEO_ID" }` — thumbnail com link para o YouTube
  - `{ type: "scroll", src: "assets/x.png", caption: { pt, en } }` — captura alta, rolável
  - `{ type: "image", src: "assets/x.png", aspect: "w / h" }` — imagem simples
- `TESTIMONIALS` — depoimentos (`quote` e `role` em `{ pt, en }`).
- `CLIENTS` — logos do carrossel. `w`/`h` é a caixa em que o logo é encaixado; `href: ""` = sem link.
- `SERVICES` — mapeia cada serviço ao projeto aberto em "Ver a prova".
- `STR` — todos os textos da interface, em `pt` e `en`. Toda chave precisa existir nos dois.
- `VOCAB_EN` — tradução de tags/métricas escritas em PT.

Imagens novas: coloque em `assets/` e, se forem grandes, reduza com
`.\tools\resize-image.ps1 -Path assets\arquivo.png -MaxWidth 540 -MaxHeight 144`
(use ~2× o tamanho em que a imagem aparece).

## Deploy (Cloudflare Pages)

Projeto conectado ao repositório GitHub:

- Branch de produção: `main`
- Comando de build: *(vazio)*
- Diretório de saída: `/`
- Domínio: `icegames.me`

Cada push em `main` publica automaticamente. `_headers` define cache e cabeçalhos de segurança.

## Design

O arquivo original do Claude Design está em `docs/design/Portfolio.dc.html`; o spec e o plano em `docs/superpowers/`.
````

- [ ] **Step 6: Verify** per **Verify**, then open the page once more to be sure the `<head>` edit didn't break rendering.

- [ ] **Step 7: Commit**

```bash
git add index.html _headers robots.txt sitemap.xml README.md
git commit -m "feat: SEO metadata, Cloudflare headers, robots/sitemap and README

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Full walkthrough against the spec and fixes

**Goal:** Run the spec's verification checklist end to end at desktop and phone widths, fix anything that deviates from the design, and leave the repo ready to connect to Cloudflare Pages.

**Files:**
- Modify (only if a check fails): `index.html`, `css/site.css`, `js/site.js`, `js/data.js`

**Acceptance Criteria:**
- [ ] All 11 items of the spec's "Verification" section pass at 1440 px and at 390 px
- [ ] Browser console shows zero errors and zero 404s (YouTube thumbnails need network; that's the only external image)
- [ ] Every value in the design that was transcribed into CSS spot-checks correctly: hero H1 size, section paddings, `.wk-row` grid, `.steps` gap lines, modal max-width 680 px, Discord dialog 540 px
- [ ] `git status` clean; `git log --oneline | head -12` shows Tasks 1–9 commits plus any fix commits

**Verify:** Walk the checklist in the browser using the `run` skill (or `start index.html` and DevTools device toolbar); record each item as pass in the task notes. Final: `git status --short` → empty.

**Steps:**

- [ ] **Step 1: Desktop pass (1440 px).** Go through spec items 2–11 in order. For item 7 (rail wrap), watch the rail for at least one full cycle (~2 min at 0.5 px/frame) or drag it past the halfway point and confirm no jump.

- [ ] **Step 2: Phone pass (390 px).** DevTools device toolbar → iPhone 12/14. Check: nav hidden, EN/PT + CTA still fit in the header, hero H1 wraps to ≤ 3 lines, project rows show only number + title, services/about/contact stack, steps 1 column, modal fits with metrics stacked, form usable, Discord modal fits.

- [ ] **Step 3: Reduced motion pass.** DevTools → Rendering → emulate `prefers-reduced-motion: reduce`, reload: no snow, marquee static, rail static (drag still works), sections visible without reveal animation.

- [ ] **Step 4: Fix anything that failed.** Each fix is its own small commit:

```bash
git add -A
git commit -m "fix: <what was wrong> (<section>)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 5: Final state**

```bash
git status --short          # expect empty
git log --oneline | head -12
```

Report the checklist results (pass/fail per item, with what was fixed) to the user, and remind them the only remaining manual step is connecting the repo in the Cloudflare Pages dashboard (settings are in `README.md`).
