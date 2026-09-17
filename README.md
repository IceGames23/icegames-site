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
