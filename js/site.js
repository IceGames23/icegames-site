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
        '<div class="pm-title"><h3 id="pm-title">' + esc(p.title) + '</h3><span class="pm-year">' + esc(L(p.year)) + '</span></div>' +
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
    overlay.setAttribute('aria-labelledby', 'pm-title');
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

  /* ---------- splash · reveal · snow · rail (Task 8) ---------- */

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
      /* under reduced motion the rail must stay put while idle; only wrap
         while a drag is in progress (or resolving) so dragging still works */
      if (!reduceMotion || drag) wrap();
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
