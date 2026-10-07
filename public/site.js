(function () {
  'use strict';
  var params = new URLSearchParams(location.search);
  var cmp = params.get('cmp') || null;
  var utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) { if (params.get(k)) utm[k] = params.get(k); });

  function send(payload) {
    try {
      var body = JSON.stringify(payload);
      if (navigator.sendBeacon) navigator.sendBeacon('/api/e', new Blob([body], { type: 'text/plain' }));
      else fetch('/api/e', { method: 'POST', body: body, keepalive: true, headers: { 'content-type': 'text/plain' } });
    } catch (e) { /* medição nunca pode quebrar a página */ }
  }

  // ---- Cookies (consentimento) ----
  function getCookie(n) { var m = document.cookie.match('(?:^|; )' + n + '=([^;]*)'); return m ? decodeURIComponent(m[1]) : null; }
  function setCookie(n, v, days) {
    var exp = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = n + '=' + encodeURIComponent(v) + '; expires=' + exp + '; path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
  }
  function randomId() {
    var a = new Uint8Array(18); (window.crypto || window.msCrypto).getRandomValues(a);
    return btoa(String.fromCharCode.apply(null, a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  var banner = document.getElementById('consent');
  function showBanner() { if (banner) banner.hidden = false; }
  if (banner && !getCookie('dv_consent')) showBanner();
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-consent]');
    if (b) {
      var v = b.getAttribute('data-consent');
      setCookie('dv_consent', v, 365);
      if (v === 'analytics') { if (!getCookie('dv_vid')) setCookie('dv_vid', randomId(), 365); }
      else setCookie('dv_vid', '', -1);
      banner.hidden = true;
      send({ t: 'consent_update', v: v });
    }
    if (e.target.closest('[data-consent-open]')) showBanner();
  });

  // ---- Folha "qual loja avaliar" ----
  var sheet = document.getElementById('sheet');
  document.addEventListener('click', function (e) {
    var open = e.target.closest('[data-open-sheet]');
    if (open && sheet && typeof sheet.showModal === 'function') { e.preventDefault(); sheet.showModal(); }
    if (sheet && (e.target.closest('[data-close]') || e.target === sheet)) sheet.close();
  });

  // ---- Menu de lojas: abertura do menu e da loja ----
  document.querySelectorAll('details.menu').forEach(function (d) {
    d.addEventListener('toggle', function () { if (d.open) send({ t: 'menu_open', k: d.getAttribute('data-menu'), cmp: cmp, utm: utm }); });
  });
  document.querySelectorAll('details.st').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      document.querySelectorAll('details.st[open]').forEach(function (o) { if (o !== d) o.open = false; });
      send({ t: 'store_view', s: d.getAttribute('data-store'), cmp: cmp, utm: utm });
    });
  });
  // "Avaliar no Google" sem suporte a diálogo: abre o menu de lojas
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open-sheet]');
    if (o && !(sheet && typeof sheet.showModal === 'function')) { var m = document.getElementById('lojas'); if (m) m.open = true; }
  });

  // ---- Visualização dos botões (≥50% visível por ≥1s) ----
  var pending = {}, seen = {}, timer = null;
  function flush() { var k = Object.keys(pending); if (!k.length) return; pending = {}; send({ t: 'cta_impression', k: k, cmp: cmp, utm: utm }); }
  if ('IntersectionObserver' in window) {
    var timers = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var key = en.target.getAttribute('data-cta') || en.target.getAttribute('data-cta-summary');
        if (!key || seen[key]) return;
        if (en.isIntersecting) {
          timers[key] = setTimeout(function () { seen[key] = 1; pending[key] = 1; clearTimeout(timer); timer = setTimeout(flush, 400); }, 1000);
        } else clearTimeout(timers[key]);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('a.btn[data-cta], summary[data-cta-summary]').forEach(function (el) { io.observe(el); });
    addEventListener('pagehide', flush);
  }
})();
