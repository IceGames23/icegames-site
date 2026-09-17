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
