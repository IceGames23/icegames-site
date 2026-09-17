# icegames.me

Este é o código do meu portfólio. Site estático: HTML + CSS + JS puro, sem build, hospedado no Cloudflare Pages.

## Rodar localmente

Abrir `index.html` direto no navegador. Funciona em `file://`, não precisa de servidor.

## Estrutura

```
index.html               marcação e conteúdo estático (meta tags, seções)
css/site.css              todo o estilo
js/data.js                todo o conteúdo (projetos, textos, depoimentos...)
js/site.js                comportamento (render, i18n, modais, form, animações)
assets/                   imagens, vídeos e ícones
tools/resize-image.ps1    script pra redimensionar imagens grandes
_headers                  cache e cabeçalhos de segurança (Cloudflare Pages)
robots.txt
sitemap.xml
```

## Editar conteúdo

Tudo que é texto ou lista está em `js/data.js`:

- `PROJECTS`: projetos, na ordem de exibição. `category` é `"Minecraft"`, `"Game Design"` ou `"IA / Software"`. `media[0]` é o destaque do modal, o resto vira galeria. Tipos de mídia:
  - `file`: vídeo local (mp4)
  - `youtube`: thumbnail com link pro YouTube (`yt: "VIDEO_ID"`)
  - `scroll`: captura alta, rolável, com `caption { pt, en }`
  - `image`: imagem simples, com `aspect: "w / h"`
- `TESTIMONIALS`: depoimentos.
- `CLIENTS`: logos do carrossel. `w`/`h` é a caixa em que o logo é encaixado; `href: ""` quando não tem link.
- `SERVICES`: liga cada serviço ao projeto que abre em "Ver a prova".
- `STR`: todos os textos da interface, em `pt` e `en`. Toda chave precisa existir nos dois idiomas.
- `VOCAB_EN`: tradução de tags e métricas que ficaram escritas em PT.

## Imagens

Novas imagens vão em `assets/`. Se forem grandes, reduzo com:

```
.\tools\resize-image.ps1 -Path assets\arquivo.png -MaxWidth 540 -MaxHeight 144
```

Uso mais ou menos 2x o tamanho em que a imagem aparece na tela.

## Deploy

Cloudflare Pages conectado ao repositório no GitHub:

- Branch: `main`
- Comando de build: vazio
- Diretório de saída: `/`
- Domínio: `icegames.me`

Push em `main` publica direto. `_headers` define cache e os cabeçalhos de segurança.

## Idiomas

PT e EN alternam na mesma página, sem recarregar. A escolha fica salva no navegador. Na primeira visita, o idioma inicial segue o do navegador.
