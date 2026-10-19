# icegames.me

Este é o código do meu portfólio. Site estático: HTML + CSS + JS puro, sem build, hospedado no Cloudflare Pages.

## Rodar localmente

Abrir `index.html` direto no navegador. Funciona em `file://`, não precisa de servidor.

## Estrutura

```
index.html               marcação e conteúdo estático (meta tags, seções), versão PT
en/index.html            versão EN: GERADA por tools/build-en.mjs, não editar à mão
css/site.css              todo o estilo
js/data.js                todo o conteúdo (projetos, textos, depoimentos...)
js/site.js                comportamento (render, i18n, modais, form, animações)
assets/                   imagens, vídeos e ícones (cache de 7 dias)
files/                    PDFs do currículo, gerados pelo projeto cv (cache de 1 hora)
tools/resize-image.ps1    script pra redimensionar imagens grandes
tools/og-image.html       fonte da imagem de preview do link (assets/og-image.jpg)
tools/build-en.mjs        gera en/index.html a partir de index.html + STR.en
_headers                  cache e cabeçalhos de segurança (Cloudflare Pages)
_redirects                /cv e /cv/pt apontam para os PDFs em files/
robots.txt
sitemap.xml
```

## Editar conteúdo

Tudo que é texto ou lista está em `js/data.js`:

- `PROJECTS`: projetos, na ordem de exibição. `category` é `"Minecraft"`, `"Game Design"` ou `"IA / Software"`. `media[0]` é o destaque do modal, o resto vira galeria. Tipos de mídia:
  - `file`: vídeo local (mp4)
  - `youtube`: thumbnail com link pro YouTube (`yt: "VIDEO_ID"`)
  - `scroll`: captura alta, rolável, com `caption { pt, en }`
  - `loop`: mp4 curto e sem som que toca sozinho em loop, como um GIF (GIFs viram mp4: são ~6x menores)
  - `image`: imagem simples, com `aspect: "w / h"`
- `TESTIMONIALS`: depoimentos.
- `CLIENTS`: logos do carrossel. `w`/`h` é a caixa em que o logo é encaixado; `href: ""` quando não tem link.
- `SERVICES`: liga cada serviço ao projeto que abre em "Ver a prova".
- `STR`: todos os textos da interface, em `pt` e `en`. Toda chave precisa existir nos dois idiomas.
- `VOCAB_EN`: tradução de tags e métricas que ficaram escritas em PT.

## Imagens

Novas imagens vão em `assets/`, de preferência em WebP (`ffmpeg -i foto.png -c:v libwebp -quality 85 foto.webp`). Se forem grandes, reduzo com:

```
.\tools\resize-image.ps1 -Path assets\arquivo.png -MaxWidth 540 -MaxHeight 144
```

Uso mais ou menos 2x o tamanho em que a imagem aparece na tela.

## Ícone

O desenho do ícone fica uma vez só no `index.html`, como `<symbol id="ig-mark">`. O cabeçalho e a tela de abertura usam ele com `<use href="#ig-mark">`, e a neve lê os mesmos traços. Para mudar o ícone, troco os `<path>` desse symbol.

Arquivos separados que não leem o symbol:

- `assets/favicon.svg`, com a versão PNG em `favicon-32.png` e `apple-touch-icon.png`
- `assets/og-image.jpg`, a imagem de preview do link, cuja fonte é `tools/og-image.html`

Se o ícone mudar, esses arquivos precisam ser refeitos à mão.

## Currículo

O currículo é feito em LaTeX num projeto privado à parte, `..\cv`, que tem o próprio README. Para atualizar:

1. Edito `cv-en.tex` e/ou `cv-pt.tex` nesse projeto.
2. Lá dentro, rodo `.\build.ps1 -Publish`. Ele confere se cada PDF tem 1 página e texto legível por ATS, e copia os PDFs para `files/`.
3. Faço commit e push deste site.

Endereços:

- `icegames.me/cv` abre o PDF em inglês.
- `icegames.me/cv/pt` abre o PDF em português.

O link aparece em "Currículo (PDF)" nos contatos e em "CV" no rodapé.

O portfólio e o currículo precisam contar a mesma história. Se um número ou fato mudar num, mudo no outro.

## Deploy

Cloudflare Pages conectado ao repositório no GitHub:

- Branch: `main`
- Comando de build: vazio
- Diretório de saída: `/`
- Domínio: `icegames.me`

Push em `main` publica direto. `_headers` define cache e os cabeçalhos de segurança.

## Visitas e Google

- **Visitas:** Cloudflare Web Analytics, ativado no painel do Pages (Metrics → Web Analytics). Não usa cookies. A Cloudflare injeta o script no deploy, então não há nada no código.
- **Google:** o domínio está no Google Search Console, com o `sitemap.xml` enviado. É lá que vejo indexação e buscas.

## E-mail

`vitor@icegames.me` é encaminhado para o Gmail pelo Cloudflare Email Routing. Respondo por esse endereço usando o "Enviar e-mail como" do Gmail, com a senha de app e `smtp.gmail.com`.

O registro SPF do domínio autoriza a Cloudflare e o Google:

```
v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all
```

## Idiomas

Cada idioma tem a sua URL, para o Google indexar os dois: `/` é PT e `/en/` é EN (ligados por `hreflang` e no `sitemap.xml`).

- Os botões PT/EN levam para a outra URL e a escolha fica salva no navegador.
- Na primeira visita a `/`, um navegador que não está em português vai para `/en/`. Robôs de busca não são redirecionados.
- `en/index.html` é gerado. **Depois de mexer em `index.html` ou em qualquer texto do `STR`, rodar:**

```
node tools/build-en.mjs
```

O script falha se algum texto ficar sem tradução em `STR.en` ou se `index.html` mudar de um jeito que ele não reconhece.
