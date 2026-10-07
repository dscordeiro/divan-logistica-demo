/* Divan Links — painel administrativo (JS puro, sem build) */
(function () {
  'use strict';
  var $app = document.getElementById('app');
  var state = { user: null, meta: null, charts: [], filters: { preset: '30' } };

  // ---------- utilidades ----------
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var nf = new Intl.NumberFormat('pt-BR');
  function n(v) { return nf.format(v || 0); }
  function pct(v, d) { return v == null ? '–' : (v * 100).toLocaleString('pt-BR', { maximumFractionDigits: d == null ? 1 : d }) + '%'; }
  function dt(s) { if (!s) return '–'; var d = new Date(s); return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); }
  function dOnly(s) { if (!s) return ''; return String(s).slice(0, 10); }
  function brDate(s) { var p = String(s).slice(0, 10).split('-'); return p[2] + '/' + p[1]; }
  function today() { return new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10); }
  function addDays(d, k) { return new Date(Date.parse(d + 'T00:00:00Z') + k * 864e5).toISOString().slice(0, 10); }
  function isAdmin() { return state.user && state.user.role === 'admin'; }
  function toast(msg) { var t = document.getElementById('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, 2600); }
  function copy(text) { (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () { toast('Link copiado'); }, function () { prompt('Copie o link:', text); }); }

  function api(method, url, body) {
    var opt = { method: method, headers: { 'x-dv': '1' }, credentials: 'same-origin' };
    if (body !== undefined) { opt.headers['content-type'] = 'application/json'; opt.body = JSON.stringify(body); }
    return fetch(url, opt).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.status === 401 && url.indexOf('/login') < 0 && url.indexOf('/me') < 0) { state.user = null; renderLogin(); throw new Error('Sessão expirada'); }
        if (!r.ok) throw new Error(j.error || 'Erro ' + r.status);
        return j;
      });
    });
  }
  function qs(o) { var p = new URLSearchParams(); Object.keys(o).forEach(function (k) { if (o[k] !== '' && o[k] != null) p.set(k, o[k]); }); return p.toString(); }

  // ---------- login ----------
  function renderLogin(stage, msg) {
    destroyCharts();
    if (stage === 'pending_2fa') {
      $app.innerHTML = '<div class="login"><div class="box"><img class="logo" src="/static/brand/logo-white-solid.png" alt="Divan Móveis"><h1>Verificação em duas etapas</h1>' +
        '<form id="f2"><label class="f">Código do aplicativo autenticador<input name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required autofocus></label>' +
        '<div class="err" id="err"></div><button class="btn brand">Confirmar</button></form></div></div>';
      document.getElementById('f2').onsubmit = function (e) {
        e.preventDefault();
        api('POST', '/admin/api/login/2fa', { code: e.target.code.value.trim() }).then(afterLogin, function (er) { document.getElementById('err').textContent = er.message; });
      };
      return;
    }
    if (stage === 'setup_2fa') return render2faSetup(true);
    $app.innerHTML = '<div class="login"><div class="box"><img class="logo" src="/static/brand/logo-white-solid.png" alt="Divan Móveis"><h1>Painel Divan Links</h1>' +
      '<form id="fl"><label class="f">E-mail<input name="email" type="email" autocomplete="username" required autofocus></label>' +
      '<label class="f">Senha<input name="password" type="password" autocomplete="current-password" required></label>' +
      '<div class="err" id="err">' + esc(msg || '') + '</div><button class="btn brand">Entrar</button></form></div></div>';
    document.getElementById('fl').onsubmit = function (e) {
      e.preventDefault();
      var b = e.target.querySelector('button'); b.disabled = true;
      api('POST', '/admin/api/login', { email: e.target.email.value, password: e.target.password.value })
        .then(function (r) { if (r.stage === 'full') afterLogin(r); else renderLogin(r.stage); },
          function (er) { b.disabled = false; document.getElementById('err').textContent = er.message; });
    };
  }
  function renderSetup(setup) {
    $app.innerHTML = '<div class="login"><div class="box"><img class="logo" src="/static/brand/logo-white-solid.png" alt="Divan Móveis"><h1>Primeiro acesso</h1>' +
      '<p class="muted">Crie a senha do administrador <b>' + esc(setup.email) + '</b>. Depois disso, este passo fica bloqueado.</p>' +
      '<form id="fs"><label class="f">Nova senha <span class="h">mínimo 10 caracteres, com letras e números</span><input name="p1" type="password" autocomplete="new-password" required autofocus></label>' +
      '<label class="f">Repita a senha<input name="p2" type="password" autocomplete="new-password" required></label>' +
      '<div class="err" id="err"></div><button class="btn brand">Criar senha e entrar</button></form></div></div>';
    document.getElementById('fs').onsubmit = function (e) {
      e.preventDefault();
      var f = e.target; if (f.p1.value !== f.p2.value) { document.getElementById('err').textContent = 'As senhas não conferem.'; return; }
      api('POST', '/admin/api/setup', { password: f.p1.value }).then(function (r) { if (r.stage === 'full') afterLogin(r); else renderLogin(r.stage); },
        function (er) { document.getElementById('err').textContent = er.message; });
    };
  }
  function render2faSetup(forced) {
    api('GET', '/admin/api/2fa/setup').then(function (r) {
      var html = '<img class="logo" src="/static/brand/logo-white-solid.png" alt="Divan Móveis"><h1>Ative a verificação em duas etapas</h1>' +
        '<p class="muted">Escaneie com Google Authenticator, Microsoft Authenticator ou similar e digite o código de 6 dígitos.</p>' +
        '<img class="qr" src="' + r.qr + '" width="200" height="200" alt="QR Code para o autenticador">' +
        '<p class="muted">Ou digite a chave: <code>' + esc(r.secret) + '</code></p>' +
        '<form id="f3"><label class="f">Código<input name="code" inputmode="numeric" maxlength="6" required></label><div class="err" id="err"></div><button class="btn brand">Ativar</button></form>';
      if (forced) $app.innerHTML = '<div class="login"><div class="box">' + html + '</div></div>';
      else openModal('Verificação em duas etapas', html.replace(/<img class="logo"[^>]*>/, '').replace(/<h1>.*?<\/h1>/, ''), null);
      document.getElementById('f3').onsubmit = function (e) {
        e.preventDefault(); e.stopPropagation();
        api('POST', '/admin/api/2fa/enable', { code: e.target.code.value.trim() }).then(function (x) {
          if (forced) afterLogin(x); else { closeModal(); state.user.totp_enabled = true; toast('Verificação em duas etapas ativada'); route(); }
        }, function (er) { document.getElementById('err').textContent = er.message; });
      };
    }, function (er) { renderLogin(null, er.message); });
  }
  function afterLogin(r) {
    state.user = r.user;
    api('GET', '/admin/api/meta').then(function (m) { state.meta = m; if (!location.hash) location.hash = '#/dashboard'; route(); });
  }

  // ---------- estrutura ----------
  var NAV = [
    ['dashboard', 'Dashboard', 'all'], ['eventos', 'Eventos', 'all'], ['campanhas', 'Campanhas e links', 'all'], ['lojas', 'Lojas e Google', 'all'],
    ['sep'], ['atalhos', 'Atalhos da página', 'admin'], ['usuarios', 'Usuários', 'admin'], ['auditoria', 'Auditoria', 'admin'], ['config', 'Configurações', 'admin'],
    ['sep'], ['conta', 'Minha conta', 'all'],
  ];
  function shell(view, title, subtitle, actions) {
    destroyCharts();
    var nav = NAV.filter(function (x) { return x[0] === 'sep' || x[2] === 'all' || isAdmin(); }).map(function (x) {
      return x[0] === 'sep' ? '<div class="sep"></div>' : '<a href="#/' + x[0] + '" class="' + (x[0] === view ? 'on' : '') + '">' + esc(x[1]) + '</a>';
    }).join('');
    $app.innerHTML = '<div class="shell"><aside class="side" id="side"><div class="brand"><div><img src="/static/brand/logo-white-solid.png" alt="Divan Móveis"><small>Painel de atendimento e links</small></div></div>' +
      '<nav class="nav">' + nav + '</nav><div class="me">' + esc(state.user.name) + '<br><span>' + esc(state.user.email) + ' · ' + (isAdmin() ? 'admin' : 'visualizador') + '</span><br><button id="logout">Sair</button></div></aside>' +
      '<main class="main"><div class="head"><div><button class="btn ghost sm menu-btn" id="menu">Menu</button><h1>' + esc(title) + '</h1>' + (subtitle ? '<p>' + esc(subtitle) + '</p>' : '') + '</div><div>' + (actions || '') + '</div></div><div id="view"></div></main></div>';
    document.getElementById('logout').onclick = function () { api('POST', '/admin/api/logout', {}).then(function () { state.user = null; location.hash = ''; renderLogin(); }); };
    document.getElementById('menu').onclick = function () { document.getElementById('side').classList.toggle('open'); };
    return document.getElementById('view');
  }
  function destroyCharts() { state.charts.forEach(function (c) { c.destroy(); }); state.charts = []; }

  // ---------- modal ----------
  var modal = document.getElementById('modal'), mform = document.getElementById('modal-form');
  function openModal(title, body, onSave, saveLabel) {
    mform.innerHTML = '<div class="mh"><h3>' + esc(title) + '</h3><button type="button" class="btn ghost sm" data-x>Fechar</button></div><div class="mb">' + body + '</div>' +
      (onSave ? '<div class="mf"><span class="err" id="merr"></span><button type="button" class="btn ghost" data-x>Cancelar</button><button type="submit" class="btn brand">' + esc(saveLabel || 'Salvar') + '</button></div>' : '');
    mform.querySelectorAll('[data-x]').forEach(function (b) { b.onclick = closeModal; });
    mform.onsubmit = function (e) {
      if (!onSave) return;
      e.preventDefault();
      var btn = mform.querySelector('.mf .brand'); btn.disabled = true;
      Promise.resolve().then(function () { return onSave(mform); }).then(function () { closeModal(); }, function (er) { btn.disabled = false; document.getElementById('merr').textContent = er.message; });
    };
    modal.showModal();
  }
  function closeModal() { if (modal.open) modal.close(); }

  // ---------- filtros de período ----------
  function rangeFromFilters() {
    var f = state.filters, t = today();
    if (f.preset === 'custom' && f.from && f.to) return { from: f.from, to: f.to };
    if (f.preset === 'today') return { from: t, to: t };
    var d = Number(f.preset) || 30;
    return { from: addDays(t, -(d - 1)), to: t };
  }
  function filterBar(opts) {
    var f = state.filters, m = state.meta || { campaigns: [], sources: [], ctas: [], stores: [] };
    var sel = function (name, label, items, cur) {
      return '<select name="' + name + '" aria-label="' + label + '"><option value="">' + label + '</option>' + items.map(function (i) {
        return '<option value="' + esc(i[0]) + '"' + (String(cur || '') === String(i[0]) ? ' selected' : '') + '>' + esc(i[1]) + '</option>';
      }).join('') + '</select>';
    };
    var html = '<div class="filters" id="filters"><div class="seg">' + [['today', 'Hoje'], ['7', '7 dias'], ['30', '30 dias'], ['90', '90 dias'], ['custom', 'Período']].map(function (p) {
      return '<button type="button" data-preset="' + p[0] + '" class="' + (f.preset === p[0] ? 'on' : '') + '">' + p[1] + '</button>';
    }).join('') + '</div>' +
      '<span id="custom"' + (f.preset === 'custom' ? '' : ' hidden') + '><input type="date" name="from" value="' + esc(f.from || addDays(today(), -29)) + '" aria-label="De"> até <input type="date" name="to" value="' + esc(f.to || today()) + '" aria-label="Até"></span>' +
      sel('cmp', 'Todas as campanhas', m.campaigns.map(function (c) { return [c.slug, c.name]; }), f.cmp) +
      sel('source', 'Todas as origens', m.sources.map(function (s) { return [s, s]; }), f.source) +
      sel('device', 'Todos os dispositivos', [['mobile', 'Celular'], ['desktop', 'Computador'], ['tablet', 'Tablet']], f.device);
    if (opts && opts.events) {
      html += sel('type', 'Todos os eventos', [['page_view', 'Acesso à página'], ['cta_click', 'Clique em atalho'], ['call_click', 'Ligação'], ['store_maps_click', 'Rota de loja'], ['review_click', 'Avaliar loja'], ['campaign_hit', 'Entrada por campanha'], ['cta_impression', 'Visualização de botão'], ['session_start', 'Início de sessão'], ['store_view', 'Abriu loja no menu']], f.type) +
        sel('cta', 'Todos os botões', m.ctas.map(function (c) { return [c.key, c.label]; }), f.cta) +
        sel('store', 'Todas as lojas', m.stores.map(function (s) { return [s.slug, s.name]; }), f.store) +
        '<label class="chk"><input type="checkbox" name="noise"' + (f.noise ? ' checked' : '') + '> Mostrar robôs/internos</label>';
    }
    if (opts && opts.gran) html += sel('gran', 'Agrupar: automático', [['day', 'Por dia'], ['week', 'Por semana'], ['month', 'Por mês']], f.gran);
    return html + '</div>';
  }
  function bindFilters(onChange) {
    var box = document.getElementById('filters');
    box.querySelectorAll('[data-preset]').forEach(function (b) {
      b.onclick = function () { state.filters.preset = b.dataset.preset; onChange(); };
    });
    box.querySelectorAll('select,input').forEach(function (el) {
      el.onchange = function () {
        if (el.type === 'checkbox') state.filters[el.name] = el.checked ? '1' : '';
        else state.filters[el.name] = el.value;
        onChange();
      };
    });
  }
  function currentQuery(extra) {
    var r = rangeFromFilters(), f = state.filters;
    var q = { from: r.from, to: r.to, cmp: f.cmp, source: f.source, device: f.device, gran: f.gran };
    if (extra) Object.keys(extra).forEach(function (k) { q[k] = extra[k]; });
    return q;
  }

  // ---------- gráficos ----------
  var AX = { grid: { color: '#EFEBE4' }, border: { display: false }, ticks: { color: '#6F6F6F', font: { size: 11 } } };
  function chart(id, cfg) {
    var el = document.getElementById(id); if (!el || !window.Chart) return;
    cfg.options = Object.assign({ responsive: true, maintainAspectRatio: false, animation: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1A1A1A', padding: 10, cornerRadius: 8, callbacks: { label: function (c) { return ' ' + c.dataset.label + ': ' + n(c.parsed.y); } } } },
      scales: { x: Object.assign({}, AX, { grid: { display: false } }), y: Object.assign({}, AX, { beginAtZero: true, ticks: Object.assign({}, AX.ticks, { precision: 0 }) }) },
    }, cfg.options || {});
    state.charts.push(new Chart(el, cfg));
  }
  function bars(rows, keyFn, valFn, extraFn) {
    if (!rows.length) return '<div class="empty">Sem dados no período</div>';
    var max = Math.max.apply(null, rows.map(valFn).concat([1]));
    return '<div class="bars">' + rows.map(function (r) {
      return '<div class="bar-row"><div class="top"><span class="k">' + esc(keyFn(r)) + '</span><span>' + (extraFn ? '<span class="muted">' + extraFn(r) + '</span> · ' : '') + '<b>' + n(valFn(r)) + '</b></span></div>' +
        '<div class="track"><div class="fill" data-w="' + (valFn(r) / max * 100).toFixed(1) + '"></div></div></div>';
    }).join('') + '</div>';
  }
  function applyBarWidths(root) { (root || document).querySelectorAll('.fill[data-w]').forEach(function (el) { el.style.width = el.dataset.w + '%'; }); }
  function delta(cur, prev) {
    if (!prev) return cur ? '<span class="up">novo</span>' : '';
    var d = (cur - prev) / prev;
    return '<span class="' + (d >= 0 ? 'up' : 'down') + '">' + (d >= 0 ? '▲ ' : '▼ ') + pct(Math.abs(d), 0) + '</span>';
  }
  var DEVICE = { mobile: 'Celular', desktop: 'Computador', tablet: 'Tablet', bot: 'Robô' };
  var EVENT = { page_view: 'Acesso à página', cta_click: 'Clique em atalho', call_click: 'Ligação', store_maps_click: 'Rota de loja', review_click: 'Avaliar loja', campaign_hit: 'Entrada por campanha', cta_impression: 'Visualização de botão', session_start: 'Início de sessão', store_view: 'Abriu loja no menu' };
  var WD = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // ---------- Dashboard ----------
  function viewDashboard() {
    var v = shell('dashboard', 'Dashboard', 'Acessos à página, cliques nos atalhos e desempenho das campanhas');
    v.innerHTML = filterBar({ gran: true }) + '<div id="dash"><div class="empty">Carregando…</div></div>';
    bindFilters(viewDashboard);
    var q = currentQuery();
    api('GET', '/admin/api/dashboard?' + qs(q)).then(function (d) {
      var k = d.kpis, p = d.prev;
      var tiles = [
        ['Visitantes', k.visitors, p.visitors, 'únicos no período'],
        ['Sessões', k.sessions, p.sessions, 'visitas com 30 min de intervalo'],
        ['Cliques de contato', k.contact_clicks, p.contact_clicks, 'WhatsApp, ligações e links', true],
        ['Taxa de clique', null, null, 'cliques ÷ visitantes'],
        ['Cliques no WhatsApp', k.wa_clicks, p.wa_clicks, 'televendas + assistência'],
        ['Cliques hoje', d.today.contact_clicks, null, n(d.today.visitors) + ' visitantes hoje'],
      ];
      var html = '<div class="kpis">' + tiles.map(function (t) {
        var val = t[0] === 'Taxa de clique' ? pct(k.ctr) : n(t[1]);
        var dl = t[0] === 'Taxa de clique' ? (p.ctr ? delta(k.ctr, p.ctr) + ' vs. ' + pct(p.ctr) : '') : (t[2] != null ? delta(t[1], t[2]) + ' vs. período anterior' : '');
        return '<div class="kpi' + (t[4] ? ' hl' : '') + '"><div class="l">' + t[0] + '</div><div class="v">' + val + '</div><div class="d">' + (dl || esc(t[3])) + '</div></div>';
      }).join('') + '</div>';

      html += '<div class="cards">' +
        '<section class="card c8"><h2>Evolução</h2><p class="sub">Acessos à página e cliques de contato por ' + ({ day: 'dia', week: 'semana', month: 'mês' })[d.range.gran] + '</p>' +
        '<div class="legend"><span><i class="s1"></i>Acessos</span><span><i class="s2"></i>Cliques de contato</span></div><div class="chart"><canvas id="c-ts"></canvas></div></section>' +
        '<section class="card c4"><h2>Cliques por canal</h2><p class="sub">Toques em cada botão · taxa sobre os acessos</p>' +
        bars(d.byCta.filter(function (c) { return true; }), function (c) { return c.label; }, function (c) { return c.total; }, function (c) { return pct(c.ctr); }) + '</section>' +
        '<section class="card c6"><h2>Horário de pico</h2><p class="sub">Cliques de contato por hora (Brasília)</p><div class="chart sm"><canvas id="c-hour"></canvas></div></section>' +
        '<section class="card c6"><h2>Dia da semana</h2><p class="sub">Cliques de contato por dia</p><div class="chart sm"><canvas id="c-wd"></canvas></div></section>' +
        '<section class="card c12"><h2>Campanhas e links</h2><p class="sub">Desempenho por link rastreável · "(sem campanha)" = acesso direto ou pelas redes sem link de campanha</p>' + campaignTable(d.byCampaign) + '</section>' +
        '<section class="card c4"><h2>Origens de tráfego</h2><p class="sub">Sessões por origem</p>' + bars(d.bySource, function (s) { return s.source; }, function (s) { return s.sessions; }, function (s) { return n(s.clicks) + ' cliques'; }) + '</section>' +
        '<section class="card c4"><h2>Dispositivos</h2><p class="sub">Visitantes por tipo de aparelho</p>' + bars(d.byDevice, function (s) { return DEVICE[s.k] || s.k; }, function (s) { return s.visitors; }) +
        '<p class="sub mt">Sistema</p>' + bars(d.byOs.slice(0, 5), function (s) { return s.k; }, function (s) { return s.visitors; }) +
        '<p class="sub mt">Navegador</p>' + bars(d.byBrowser.slice(0, 5), function (s) { return s.k; }, function (s) { return s.visitors; }) + '</section>' +
        '<section class="card c4"><h2>Localização aproximada</h2><p class="sub">Visitantes por estado · estimativa pelo endereço de internet</p>' +
        (d.byUf.length === 1 && d.byUf[0].k === 'Desconhecido' ? '<div class="empty">Geolocalização desativada. Veja Configurações.</div>' : bars(d.byUf, function (s) { return s.k; }, function (s) { return s.visitors; }) +
          (d.byCity.length ? '<p class="sub mt">Cidades (indicativo; no celular costuma mostrar a cidade da operadora)</p>' + bars(d.byCity, function (s) { return s.city + ' · ' + (s.uf || ''); }, function (s) { return s.visitors; }) : '')) + '</section>' +
        '<section class="card c8"><h2>Lojas: rotas e avaliações</h2><p class="sub">Toques em "Rota" e "Avaliar" por loja · nota e total do Google atualizados manualmente em Lojas</p>' + storeTable(d.stores) + '</section>' +
        '<section class="card c4"><h2>Contatos por número</h2><p class="sub">Quantas vezes cada número da Divan foi acionado pela página</p>' +
        (d.destinations.length ? bars(d.destinations, function (s) { return destLabel(s); }, function (s) { return s.clicks; }) : '<div class="empty">Nenhum contato no período.</div>') + '</section>' +
        '</div><p class="note">Excluídos dos números: ' + n(d.noise.bots) + ' registros de robôs/prévias de link, ' + n(d.noise.internal) + ' acessos internos e ' + n(d.noise.dups) + ' cliques repetidos em menos de 10 s. ' +
        (k.outside_hours_clicks ? n(k.outside_hours_clicks) + ' cliques de contato aconteceram fora do horário de atendimento. ' : '') +
        (k.includes_history ? 'Parte do período vem de totais consolidados (dados detalhados já apagados pela retenção).' : '') + '</p>';
      var box = document.getElementById('dash'); box.innerHTML = html; applyBarWidths(box);
      box.querySelectorAll('.legend i.s1').forEach(function (i) { i.style.background = '#E8590C'; });
      box.querySelectorAll('.legend i.s2').forEach(function (i) { i.style.background = '#3B5BA9'; });

      var labels = d.series.map(function (s) { return d.range.gran === 'month' ? s.bucket.slice(5, 7) + '/' + s.bucket.slice(0, 4) : brDate(s.bucket); });
      chart('c-ts', { type: 'line', data: { labels: labels, datasets: [
        { label: 'Acessos', data: d.series.map(function (s) { return s.page_views; }), borderColor: '#E8590C', backgroundColor: '#E8590C', borderWidth: 2, pointRadius: d.series.length > 40 ? 0 : 3, tension: .25 },
        { label: 'Cliques de contato', data: d.series.map(function (s) { return s.clicks; }), borderColor: '#3B5BA9', backgroundColor: '#3B5BA9', borderWidth: 2, pointRadius: d.series.length > 40 ? 0 : 3, tension: .25 },
      ] } });
      var hours = []; for (var h = 0; h < 24; h++) hours.push((d.byHour.find(function (x) { return x.h === h; }) || {}).clicks || 0);
      chart('c-hour', { type: 'bar', data: { labels: hours.map(function (_, i) { return String(i).padStart(2, '0') + 'h'; }), datasets: [{ label: 'Cliques', data: hours, backgroundColor: '#E8590C', borderRadius: 4, maxBarThickness: 22 }] } });
      var wd = WD.map(function (_, i) { return (d.byWeekday.find(function (x) { return x.d === i; }) || {}).clicks || 0; });
      chart('c-wd', { type: 'bar', data: { labels: WD, datasets: [{ label: 'Cliques', data: wd, backgroundColor: '#E8590C', borderRadius: 4, maxBarThickness: 36 }] } });
    }, function (er) { document.getElementById('dash').innerHTML = '<div class="empty">' + esc(er.message) + '</div>'; });
  }
  function fmtPhone(p) { var m = String(p || '').replace(/\D/g, '').match(/^55(\d{2})(\d{4,5})(\d{4})$/); return m ? '(' + m[1] + ') ' + m[2] + '-' + m[3] : p; }
  function destLabel(s) { var raw = String(s.destination || ''); var i = raw.lastIndexOf(':'); var name = i > 0 ? raw.slice(0, i) : (s.cta_key || ''); var num = i > 0 ? raw.slice(i + 1).trim() : raw;
    return (name ? name + ' · ' : '') + fmtPhone(num) + (s.destination_type === 'tel' ? ' (ligação)' : ''); }
  function campaignTable(rows) {
    if (!rows.length) return '<div class="empty">Sem dados no período</div>';
    var CH = { televendas: 'Televendas', assistencia: 'Assistência', ofertas: 'Ofertas', lojas: 'Lojas', site: 'Site' };
    return '<div class="tbl-wrap"><table><thead><tr><th>Campanha</th><th class="n">Entradas pelo link</th><th class="n">Visitantes</th><th class="n">Acessos</th><th class="n">Cliques de contato</th><th class="n">Taxa</th><th>Canal mais clicado</th><th class="n">Avaliações</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td>' + (r.slug ? '<b>' + esc(r.name || r.slug) + '</b> <span class="muted">/c/' + esc(r.slug) + '</span>' : '<span class="muted">(sem campanha)</span>') + '</td><td class="n">' + n(r.hits) + '</td><td class="n">' + n(r.visitors) + '</td><td class="n">' + n(r.page_views) +
          '</td><td class="n"><b>' + n(r.clicks) + '</b></td><td class="n">' + pct(r.visitors ? r.clicks / r.visitors : 0) + '</td><td>' + esc(CH[r.top_channel] || r.top_channel || '–') + '</td><td class="n">' + n(r.reviews) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  function storeTable(rows) {
    return '<div class="tbl-wrap"><table><thead><tr><th>Loja</th><th class="n">Nota</th><th class="n">Avaliações</th><th class="n">Rota</th><th class="n">Avaliar</th></tr></thead><tbody>' +
      rows.map(function (s) {
        return '<tr><td><b>' + esc(s.name) + '</b> <span class="muted">' + esc(s.city) + '</span>' + (s.status === 'coming_soon' ? ' <span class="pill warn">em breve</span>' : '') + '</td><td class="n">' + (s.rating != null ? Number(s.rating).toFixed(1).replace('.', ',') : '–') +
          '</td><td class="n">' + (s.rating_count != null ? n(s.rating_count) : '–') + '</td><td class="n">' + n(s.routes) + '</td><td class="n"><b>' + n(s.reviews) + '</b></td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  // ---------- Eventos ----------
  function viewEventos() {
    var page = state.evPage || 1;
    var exp = '<div class="exp" id="exp">' + [['events', 'Eventos'], ['daily', 'Resumo diário'], ['campaigns', 'Por campanha'], ['stores', 'Por loja']].map(function (x) {
      return '<a class="btn ghost sm" data-k="' + x[0] + '">CSV · ' + x[1] + '</a>';
    }).join('') + '</div>';
    var v = shell('eventos', 'Eventos', 'Registro detalhado de cada acesso e clique', exp);
    v.innerHTML = filterBar({ events: true }) + '<div id="ev"><div class="empty">Carregando…</div></div>';
    bindFilters(function () { state.evPage = 1; viewEventos(); });
    var f = state.filters;
    var q = currentQuery({ type: f.type, cta: f.cta, store: f.store, noise: f.noise, page: page, limit: 50 });
    document.querySelectorAll('#exp [data-k]').forEach(function (a) { a.href = '/admin/api/export.csv?' + qs(Object.assign({}, q, { kind: a.dataset.k, page: '', limit: '' })); });
    api('GET', '/admin/api/events?' + qs(q)).then(function (r) {
      var pages = Math.max(1, Math.ceil(r.total / r.limit));
      var html = '<div class="tbl-wrap"><table><thead><tr><th>Data e hora</th><th>Evento</th><th>Botão / loja</th><th>Destino</th><th>Campanha</th><th>Origem</th><th>UTM</th><th>Dispositivo</th><th>Local</th><th>Sessão</th></tr></thead><tbody>' +
        (r.rows.length ? r.rows.map(function (e) {
          var flags = (e.is_bot ? ' <span class="pill off">robô</span>' : '') + (e.is_internal ? ' <span class="pill warn">interno</span>' : '') + (e.is_dup ? ' <span class="pill">repetido</span>' : '');
          return '<tr><td>' + dt(e.occurred_at) + '</td><td>' + esc(EVENT[e.event_type] || e.event_type) + flags + '</td><td>' + esc(e.cta_key || '–') + '</td><td>' + esc(e.destination || '–') + '</td><td>' + esc(e.campaign_slug || '–') +
            '</td><td>' + esc(e.traffic_source || '–') + (e.referrer_host ? ' <span class="muted">' + esc(e.referrer_host) + '</span>' : '') + '</td><td>' + esc([e.utm_source, e.utm_medium, e.utm_campaign].filter(Boolean).join(' / ') || '–') +
            '</td><td>' + esc(DEVICE[e.device_type] || e.device_type || '–') + ' <span class="muted">' + esc((e.os || '') + ' · ' + (e.browser || '')) + '</span></td><td>' + esc([e.geo_city, e.geo_uf].filter(Boolean).join(' · ') || '–') + '</td><td><code>' + esc(e.session || '') + '</code></td></tr>';
        }).join('') : '<tr><td colspan="10" class="empty">Nenhum evento com esses filtros</td></tr>') + '</tbody></table></div>' +
        '<div class="pager"><span class="muted">' + n(r.total) + ' eventos · página ' + r.page + ' de ' + pages + '</span><button class="btn ghost sm" id="pv"' + (r.page <= 1 ? ' disabled' : '') + '>Anterior</button><button class="btn ghost sm" id="nx"' + (r.page >= pages ? ' disabled' : '') + '>Próxima</button></div>';
      document.getElementById('ev').innerHTML = html;
      document.getElementById('pv').onclick = function () { state.evPage = page - 1; viewEventos(); };
      document.getElementById('nx').onclick = function () { state.evPage = page + 1; viewEventos(); };
    });
  }

  // ---------- Campanhas ----------
  var CHN = { instagram: 'Instagram', facebook: 'Facebook', whatsapp: 'WhatsApp', meta_ads: 'Meta Ads', google_ads: 'Google Ads', google_perfil: 'Perfil do Google', radio: 'Rádio', tv: 'TV', jornal: 'Jornal / portal', impresso: 'Impresso / panfleto', qr_loja: 'QR Code na loja', email: 'E-mail', sms: 'SMS', site: 'Site', outro: 'Outro' };
  function viewCampanhas() {
    var v = shell('campanhas', 'Campanhas e links', 'Um link rastreável para cada divulgação, para comparar resultados', isAdmin() ? '<button class="btn brand" id="new">Nova campanha</button>' : '');
    var base = state.meta.appUrl;
    v.innerHTML = '<div class="item"><div class="grow"><div class="t">Link principal da página</div><div class="s">' + esc(base) + '/</div></div><button class="btn ghost sm" data-copy="' + esc(base) + '/">Copiar</button><a class="btn ghost sm" href="/admin/api/qr?path=/">QR Code</a></div><div id="list" class="list mt12"><div class="empty">Carregando…</div></div>';
    api('GET', '/admin/api/campaigns').then(function (r) {
      state.channels = r.channels;
      var html = r.rows.length ? r.rows.map(function (c) {
        var url = base + '/c/' + c.slug;
        var period = (c.starts_at || c.ends_at) ? ' · ' + (c.starts_at ? 'de ' + brDate(c.starts_at) : '') + (c.ends_at ? ' até ' + brDate(c.ends_at) : '') : '';
        var landing = c.landing === 'cta' ? 'abre direto: ' + c.landing_cta : c.landing === 'review' ? 'abre direto: avaliar ' + c.landing_store : 'abre a página';
        return '<div class="item"><div class="grow"><div class="t">' + esc(c.name) + ' ' + (c.is_active ? '<span class="pill ok">ativa</span>' : '<span class="pill off">desativada</span>') + '</div>' +
          '<div class="s">' + esc(url) + '</div><div class="s">' + esc(CHN[c.channel] || c.channel) + ' · ' + esc(landing) + (c.short_code ? ' · código no WhatsApp: [' + esc(c.short_code) + ']' : '') + esc(period) + '</div></div>' +
          '<div class="s"><b>' + n(c.hits) + '</b> entradas · <b>' + n(c.clicks) + '</b> cliques</div>' +
          '<button class="btn ghost sm" data-copy="' + esc(url) + '">Copiar link</button><a class="btn ghost sm" href="/admin/api/qr?path=/c/' + esc(c.slug) + '">QR Code</a>' +
          (isAdmin() ? '<button class="btn ghost sm" data-edit="' + c.id + '">Editar</button><button class="btn ghost sm" data-toggle="' + c.id + '">' + (c.is_active ? 'Desativar' : 'Ativar') + '</button><button class="btn danger sm" data-del="' + c.id + '">Excluir</button>' : '') + '</div>';
      }).join('') : '<div class="empty">Nenhuma campanha ainda. Crie uma para cada divulgação (post, anúncio, QR da loja, rádio…).</div>';
      document.getElementById('list').innerHTML = html;
      v.querySelectorAll('[data-copy]').forEach(function (b) { b.onclick = function () { copy(b.dataset.copy); }; });
      v.querySelectorAll('[data-edit]').forEach(function (b) { b.onclick = function () { campaignForm(r.rows.find(function (x) { return x.id == b.dataset.edit; })); }; });
      v.querySelectorAll('[data-del]').forEach(function (b) { b.onclick = function () { confirmDeleteCampaign(r.rows.find(function (x) { return x.id == b.dataset.del; })); }; });
      v.querySelectorAll('[data-toggle]').forEach(function (b) {
        b.onclick = function () { var c = r.rows.find(function (x) { return x.id == b.dataset.toggle; }); api('PUT', '/admin/api/campaigns/' + c.id, { is_active: !c.is_active }).then(function () { toast('Campanha atualizada'); viewCampanhas(); }, function (e) { toast(e.message); }); };
      });
    });
    var nb = document.getElementById('new'); if (nb) nb.onclick = function () { campaignForm(null); };
  }
  function slugify(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60); }
  function campaignForm(c) {
    var isNew = !c; c = c || { channel: 'instagram', landing: 'page', default_utm: {}, is_active: true };
    var u = c.default_utm || {};
    var opt = function (list, cur) { return list.map(function (x) { return '<option value="' + esc(x[0]) + '"' + (x[0] === cur ? ' selected' : '') + '>' + esc(x[1]) + '</option>'; }).join(''); };
    var body = '<div class="grid2"><label class="f">Nome da campanha<input name="name" required value="' + esc(c.name || '') + '" placeholder="Ex.: Gazeta outubro"></label>' +
      '<label class="f">Identificador no link<input name="slug" ' + (isNew ? '' : 'readonly ') + 'required pattern="[a-z0-9][a-z0-9-]*" value="' + esc(c.slug || '') + '" placeholder="gazeta-out26"><span class="h">' + esc(state.meta.appUrl) + '/c/…' + (isNew ? '' : ' (não muda depois de criada)') + '</span></label></div>' +
      '<div class="grid3"><label class="f">Onde será divulgada<select name="channel">' + opt((state.channels || Object.keys(CHN)).map(function (k) { return [k, CHN[k] || k]; }), c.channel) + '</select></label>' +
      '<label class="f">Código no WhatsApp<input name="short_code" maxlength="8" value="' + esc(c.short_code || '') + '" placeholder="GZ26"><span class="h">Opcional. Aparece no fim da mensagem: [GZ26]. Até 8 letras ou números.</span></label>' +
      '<label class="f">Ao abrir o link<select name="landing">' + opt([['page', 'Mostrar a página'], ['cta', 'Ir direto para um botão'], ['review', 'Ir direto para avaliar uma loja']], c.landing) + '</select></label></div>' +
      '<div class="grid2"><label class="f">Botão (se for direto)<select name="landing_cta"><option value="">—</option>' + opt(state.meta.ctas.map(function (x) { return [x.key, x.label]; }), c.landing_cta) + '</select></label>' +
      '<label class="f">Loja (se for avaliar)<select name="landing_store"><option value="">—</option>' + opt(state.meta.stores.map(function (x) { return [x.slug, x.name]; }), c.landing_store) + '</select></label></div>' +
      '<fieldset><legend>Etiquetas UTM (opcional)</legend>' +
      '<div class="help"><b>Para que serve:</b> UTM são etiquetas que vão junto no link e aparecem nos relatórios (coluna UTM e CSV) e no Google Analytics do site, se a pessoa seguir para lá. ' +
      'Este painel já mede a campanha sozinho pelo identificador do link, então <b>pode deixar em branco</b>. Preencha só se quiser cruzar com o Analytics ou agrupar várias campanhas.' +
      '<ul><li><b>Origem</b> (utm_source): de onde vem a pessoa. Ex.: instagram, facebook, gazeta, radio-tribuna</li>' +
      '<li><b>Meio</b> (utm_medium): o formato da divulgação. Ex.: stories, anuncio, post, qrcode, jornal</li>' +
      '<li><b>Campanha</b> (utm_campaign): a ação comercial. Ex.: aniversario-26, black-friday</li></ul>' +
      '<div class="mt8">Use minúsculas, sem acento e com hífen no lugar de espaço. Se o link já chegar com UTM (ex.: anúncio do Meta), vale o que vier no link.</div></div>' +
      '<div class="grid3"><label class="f">Origem (utm_source)<input name="utm_source" value="' + esc(u.utm_source || '') + '" placeholder="instagram"></label><label class="f">Meio (utm_medium)<input name="utm_medium" value="' + esc(u.utm_medium || '') + '" placeholder="stories"></label><label class="f">Campanha (utm_campaign)<input name="utm_campaign" value="' + esc(u.utm_campaign || '') + '" placeholder="aniversario-26"></label></div></fieldset>' +
      '<div class="grid2"><label class="f">Início<input type="date" name="starts_at" value="' + dOnly(c.starts_at) + '"><span class="h">Opcional.</span></label><label class="f">Fim<input type="date" name="ends_at" value="' + dOnly(c.ends_at) + '"><span class="h">Opcional. Depois dessa data o link e o QR continuam abrindo a página, mas não contam mais para a campanha.</span></label></div>' +
      '<label class="f">Observações<textarea name="notes">' + esc(c.notes || '') + '</textarea></label>' +
      '<label class="chk"><input type="checkbox" name="is_active"' + (c.is_active ? ' checked' : '') + '> Ativa</label>';
    openModal(isNew ? 'Nova campanha' : 'Editar campanha', body, function (f) {
      var data = { name: f.name.value, slug: f.slug.value.trim(), channel: f.channel.value, short_code: f.short_code.value, landing: f.landing.value,
        landing_cta: f.landing_cta.value, landing_store: f.landing_store.value, starts_at: f.starts_at.value, ends_at: f.ends_at.value, notes: f.notes.value, is_active: f.is_active.checked,
        default_utm: { utm_source: f.utm_source.value, utm_medium: f.utm_medium.value, utm_campaign: f.utm_campaign.value } };
      return api(isNew ? 'POST' : 'PUT', '/admin/api/campaigns' + (isNew ? '' : '/' + c.id), data).then(function () {
        toast(isNew ? 'Campanha criada' : 'Campanha salva');
        return api('GET', '/admin/api/meta').then(function (m) { state.meta = m; viewCampanhas(); });
      });
    });
    if (!isNew) {
      var del = document.createElement('button'); del.type = 'button'; del.className = 'btn danger'; del.textContent = 'Excluir campanha';
      del.onclick = function () { confirmDeleteCampaign(c); };
      var mf = mform.querySelector('.mf'); mf.insertBefore(del, mf.firstChild);
    }
    if (isNew) { var nm = mform.name, sl = mform.slug; nm.oninput = function () { if (!sl.dataset.touched) sl.value = slugify(nm.value); }; sl.oninput = function () { sl.dataset.touched = 1; }; }
  }

  function confirmDeleteCampaign(c) {
    var body = '<p>Excluir <b>' + esc(c.name) + '</b> (' + esc(state.meta.appUrl) + '/c/' + esc(c.slug) + ')?</p>' +
      '<ul class="help"><li>O link e o QR Code continuam abrindo a página principal, mas param de contar para esta campanha.</li>' +
      '<li>O histórico já registrado (' + n(c.hits || 0) + ' entradas, ' + n(c.clicks || 0) + ' cliques) continua nos relatórios e no CSV.</li>' +
      '<li>Se quiser só pausar, use <b>Desativar</b>: dá para reativar depois.</li>' +
      '<li>Evite criar outra campanha com o mesmo identificador, senão os números se misturam com os antigos.</li></ul>' +
      '<label class="f">Para confirmar, digite o identificador: ' + esc(c.slug) + '<input name="confirm" autocomplete="off"></label>';
    openModal('Excluir campanha', body, function (f) {
      if (f.confirm.value.trim() !== c.slug) return Promise.reject(new Error('Digite o identificador exatamente como aparece.'));
      return api('DELETE', '/admin/api/campaigns/' + c.id).then(function () {
        toast('Campanha excluída');
        return api('GET', '/admin/api/meta').then(function (m) { state.meta = m; viewCampanhas(); });
      });
    }, 'Excluir definitivamente');
    var sb = mform.querySelector('.mf .brand'); sb.classList.remove('brand'); sb.classList.add('danger');
  }

  // ---------- Atalhos ----------
  var STYLE = [['primary', 'Laranja (principal)'], ['highlight', 'Amarelo (destaque)'], ['dark', 'Preto'], ['light', 'Branco com borda']];
  var DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  function viewAtalhos() {
    var v = shell('atalhos', 'Atalhos da página', 'Textos, destinos, números de WhatsApp e horários. As mudanças valem na hora, sem publicar de novo.');
    api('GET', '/admin/api/ctas').then(function (rows) {
      v.innerHTML = '<div class="list">' + rows.map(function (c) {
        var dest = c.type === 'url' ? c.url : c.destinations.map(function (d) { return d.phone_e164 + (d.is_active ? '' : ' (pausado)'); }).join(', ');
        return '<div class="item"><div class="grow"><div class="t">' + c.sort_order + '. ' + esc(c.label) + ' ' + (c.is_active ? '<span class="pill ok">visível</span>' : '<span class="pill off">oculto</span>') + '</div><div class="s">' +
          esc(c.opens_stores ? 'Abre a lista de lojas' : c.type === 'url' ? 'Link' : (c.show_call ? 'WhatsApp + ligação' : 'WhatsApp')) + ' → ' + esc(dest) + '</div></div><button class="btn ghost sm" data-edit="' + c.id + '">Editar</button></div>';
      }).join('') + '</div>';
      v.querySelectorAll('[data-edit]').forEach(function (b) { b.onclick = function () { ctaForm(rows.find(function (x) { return x.id == b.dataset.edit; })); }; });
    });
  }
  function ctaForm(c) {
    var opt = function (list, cur) { return list.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === cur ? ' selected' : '') + '>' + esc(x[1]) + '</option>'; }).join(''); };
    var hours = c.hours || {};
    var body = '<div class="grid2"><label class="f">Texto do botão<input name="label" required maxlength="80" value="' + esc(c.label) + '"></label>' +
      '<div class="grid2"><label class="f">Cor<select name="style">' + opt(STYLE, c.style) + '</select></label><label class="f">Ordem<input name="sort_order" type="number" min="0" max="99" value="' + c.sort_order + '"></label></div></div>';
    if (c.type === 'url') body += '<label class="f">Destino (https://)<input name="url" required value="' + esc(c.url) + '"></label>' +
      '<label class="chk"><input type="checkbox" name="opens_stores"' + (c.opens_stores ? ' checked' : '') + '> Ao tocar, abrir a lista de lojas (endereço, telefone, Maps e avaliação) em vez do link</label>';
    else {
      body += '<label class="f">Mensagem inicial do WhatsApp <span class="h">{codigo} vira o código da campanha, ex.: [GZ26]</span><textarea name="wa_message">' + esc(c.wa_message || '') + '</textarea></label>' +
        '<fieldset><legend>Números</legend><div id="dests" class="list">' + c.destinations.map(destRow).join('') + '</div>' +
        '<div class="dact" id="dact"><button type="button" class="btn ghost sm" id="adddest">Adicionar número</button>' +
        '<label class="f">Se houver mais de um<select name="distribution">' + opt([['round_robin', 'Alternar entre eles'], ['weighted', 'Distribuir por peso'], ['first', 'Sempre o primeiro ativo']], c.distribution) + '</select></label></div></fieldset>' +
        '<fieldset><legend>Horário de atendimento <span class="muted">(vazio = fechado; ex.: 08:00-18:00)</span></legend><div class="hours">' + DAYS.map(function (d, i) {
          var val = (hours[i] || []).map(function (s) { return s[0] + '-' + s[1]; }).join(', ');
          return '<span>' + d + '</span><input name="h' + i + '" value="' + esc(val) + '" placeholder="fechado">';
        }).join('') + '</div><label class="chk mt8"><input type="checkbox" name="nohours"' + (c.hours ? '' : ' checked') + '> Não mostrar aviso de horário</label></fieldset>';
    }
    if (c.type === 'whatsapp_tel') body += '<label class="chk"><input type="checkbox" name="show_call"' + (c.show_call ? ' checked' : '') + '> Mostrar botão de ligação ao lado do WhatsApp</label>';
    body += '<label class="chk"><input type="checkbox" name="is_active"' + (c.is_active ? ' checked' : '') + '> Mostrar este botão na página</label>';
    openModal('Editar atalho', body, function (f) {
      var data = { label: f.label.value, style: f.style.value, sort_order: Number(f.sort_order.value), is_active: f.is_active.checked };
      if (c.type === 'url') { data.url = f.url.value.trim(); data.opens_stores = f.opens_stores.checked; }
      if (c.type === 'whatsapp_tel') data.show_call = f.show_call.checked;
      else {
        data.wa_message = f.wa_message.value; data.distribution = f.distribution.value;
        data.destinations = Array.prototype.map.call(mform.querySelectorAll('.dest'), function (row) {
          return { id: row.dataset.id || null, label: row.querySelector('[name=dlabel]').value, phone_e164: row.querySelector('[name=dphone]').value, weight: row.querySelector('[name=dweight]').value, is_active: row.querySelector('[name=dactive]').checked };
        });
        if (!data.destinations.length) throw new Error('Informe pelo menos um número.');
        if (f.nohours.checked) data.hours = null;
        else {
          var h = {};
          for (var i = 0; i < 7; i++) {
            var raw = f['h' + i].value.trim(); if (!raw) continue;
            h[i] = raw.split(',').map(function (s) { var p = s.trim().split('-').map(function (t) { t = t.trim(); return /^\d:\d\d$/.test(t) ? '0' + t : t; }); return p; });
          }
          data.hours = h;
        }
      }
      return api('PUT', '/admin/api/ctas/' + c.id, data).then(function () { toast('Atalho salvo'); viewAtalhos(); });
    });
    var add = document.getElementById('adddest');
    if (add) add.onclick = function () { document.getElementById('dests').insertAdjacentHTML('beforeend', destRow({ label: '', phone_e164: '+55', weight: 1, is_active: true })); bindDestRemove(); };
    bindDestRemove();
  }
  function destRow(d) {
    return '<div class="item dest" data-id="' + (d.id || '') + '"><input name="dlabel" placeholder="Nome (ex.: Televendas)" value="' + esc(d.label || '') + '">' +
      '<input name="dphone" placeholder="+5528999999999" value="' + esc(d.phone_e164) + '"><input name="dweight" type="number" min="0" max="100" value="' + (d.weight || 1) + '" aria-label="Peso" title="Peso">' +
      '<label class="chk"><input type="checkbox" name="dactive"' + (d.is_active ? ' checked' : '') + '> ativo</label><button type="button" class="btn danger sm" data-rm>Remover</button></div>';
  }
  function bindDestRemove() { mform.querySelectorAll('[data-rm]').forEach(function (b) { b.onclick = function () { b.closest('.dest').remove(); }; }); }

  // ---------- Lojas ----------
  function viewLojas() {
    var v = shell('lojas', 'Lojas e Google', 'Links de rota e avaliação de cada loja. Atualize a nota e o total de avaliações uma vez por mês.');
    var base = state.meta.appUrl;
    api('GET', '/admin/api/stores').then(function (rows) {
      v.innerHTML = '<div class="list">' + rows.map(function (s) {
        var st = s.status === 'active' ? '<span class="pill ok">ativa</span>' : s.status === 'coming_soon' ? '<span class="pill warn">em breve</span>' : '<span class="pill off">oculta</span>';
        var rating = s.rating != null ? '★ ' + Number(s.rating).toFixed(1).replace('.', ',') + ' · ' + n(s.rating_count) + ' avaliações' + (s.rating_updated_at ? ' (atualizado ' + dt(s.rating_updated_at).slice(0, 8) + ')' : '') : 'sem nota cadastrada';
        var link = base + '/avaliar/' + s.slug;
        return '<div class="item"><div class="grow"><div class="t">' + esc(s.name) + ' <span class="muted">' + esc(s.city) + '</span> ' + st + '</div><div class="s">' + esc(rating) + '</div>' +
          (s.review_url ? '<div class="s">Link de avaliação: ' + esc(link) + '</div>' : '<div class="s">Sem perfil no Google ainda</div>') + '</div>' +
          (s.review_url ? '<button class="btn ghost sm" data-copy="' + esc(link) + '">Copiar link de avaliação</button><a class="btn ghost sm" href="/admin/api/qr?path=/avaliar/' + esc(s.slug) + '">QR para o caixa</a>' : '') +
          (s.maps_url ? '<a class="btn ghost sm" href="' + esc(s.maps_url) + '" target="_blank" rel="noopener">Ver no Maps</a>' : '') +
          (isAdmin() ? '<button class="btn ghost sm" data-edit="' + s.id + '">Editar</button>' : '') + '</div>';
      }).join('') + '</div><p class="note">O QR Code aponta para ' + esc(base) + '/avaliar/…, então dá para trocar o destino depois sem reimprimir. Use no caixa, no comprovante de entrega e na mensagem pós-montagem. Peça avaliação a todos os clientes, sem brinde em troca (regra do Google).</p>';
      v.querySelectorAll('[data-copy]').forEach(function (b) { b.onclick = function () { copy(b.dataset.copy); }; });
      v.querySelectorAll('[data-edit]').forEach(function (b) { b.onclick = function () { storeForm(rows.find(function (x) { return x.id == b.dataset.edit; })); }; });
    });
  }
  function storeForm(s) {
    var opt = function (list, cur) { return list.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === cur ? ' selected' : '') + '>' + esc(x[1]) + '</option>'; }).join(''); };
    var body = '<div class="grid3"><label class="f">Nome<input name="name" required value="' + esc(s.name) + '"></label><label class="f">Cidade<input name="city" required value="' + esc(s.city) + '"></label>' +
      '<label class="f">Situação<select name="status">' + opt([['active', 'Ativa'], ['coming_soon', 'Em breve no Google'], ['hidden', 'Oculta']], s.status) + '</select></label></div>' +
      '<label class="f">Endereço<input name="address" value="' + esc(s.address || '') + '"></label>' +
      '<div class="grid2"><label class="f">Telefone (como aparece na página)<input name="phone" value="' + esc(s.phone || '') + '" placeholder="(28) 99999-9999"></label>' +
      '<label class="f">Horário<input name="hours_text" value="' + esc(s.hours_text || '') + '" placeholder="Seg a sex 8h às 18h · Sáb 8h às 12h"></label></div>' +
      '<label class="f">Place ID do Google <span class="h">ao trocar, os três links abaixo são gerados automaticamente</span><input name="google_place_id" value="' + esc(s.google_place_id || '') + '"></label>' +
      '<label class="f">Link do Maps (rota)<input name="maps_url" value="' + esc(s.maps_url || '') + '"></label>' +
      '<label class="f">Link para avaliar <span class="h">pode ser o link curto g.page/r/… do Perfil da Empresa</span><input name="review_url" value="' + esc(s.review_url || '') + '"></label>' +
      '<div class="grid3"><label class="f">Nota no Google<input name="rating" type="number" step="0.1" min="1" max="5" value="' + (s.rating != null ? s.rating : '') + '"></label>' +
      '<label class="f">Total de avaliações<input name="rating_count" type="number" min="0" value="' + (s.rating_count != null ? s.rating_count : '') + '"></label>' +
      '<label class="f">Ordem<input name="sort_order" type="number" min="0" value="' + s.sort_order + '"></label></div>';
    openModal('Editar loja · ' + s.name, body, function (f) {
      return api('PUT', '/admin/api/stores/' + s.id, { name: f.name.value, city: f.city.value, status: f.status.value, address: f.address.value, phone: f.phone.value, hours_text: f.hours_text.value, google_place_id: f.google_place_id.value,
        maps_url: f.maps_url.value, review_url: f.review_url.value, rating: f.rating.value, rating_count: f.rating_count.value, sort_order: Number(f.sort_order.value) })
        .then(function () { toast('Loja salva'); viewLojas(); });
    });
  }

  // ---------- Usuários ----------
  function viewUsuarios() {
    var v = shell('usuarios', 'Usuários', 'Administrador edita tudo; visualizador só consulta métricas, eventos e links.', '<button class="btn brand" id="new">Novo usuário</button>');
    api('GET', '/admin/api/users').then(function (rows) {
      v.innerHTML = '<div class="tbl-wrap"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Situação</th><th>2FA</th><th>Último acesso</th><th></th></tr></thead><tbody>' + rows.map(function (u) {
        var locked = u.locked_until && new Date(u.locked_until) > new Date();
        return '<tr><td>' + esc(u.name) + '</td><td>' + esc(u.email) + '</td><td>' + (u.role === 'admin' ? 'Administrador' : 'Visualizador') + '</td><td>' + (u.status === 'active' ? (locked ? '<span class="pill warn">bloqueio temporário</span>' : '<span class="pill ok">ativo</span>') : '<span class="pill off">bloqueado</span>') +
          '</td><td>' + (u.totp_enabled ? '<span class="pill ok">ativo</span>' : '<span class="pill">não</span>') + '</td><td>' + dt(u.last_login_at) + '</td><td><button class="btn ghost sm" data-edit="' + u.id + '">Editar</button></td></tr>';
      }).join('') + '</tbody></table></div>';
      v.querySelectorAll('[data-edit]').forEach(function (b) { b.onclick = function () { userForm(rows.find(function (x) { return x.id == b.dataset.edit; })); }; });
    });
    document.getElementById('new').onclick = function () { userForm(null); };
  }
  function userForm(u) {
    var isNew = !u; u = u || { role: 'viewer', status: 'active' };
    var body = '<div class="grid2"><label class="f">Nome<input name="name" required value="' + esc(u.name || '') + '"></label><label class="f">E-mail<input name="email" type="email" ' + (isNew ? 'required' : 'readonly') + ' value="' + esc(u.email || '') + '"></label></div>' +
      '<div class="grid2"><label class="f">Perfil<select name="role"><option value="viewer"' + (u.role === 'viewer' ? ' selected' : '') + '>Visualizador</option><option value="admin"' + (u.role === 'admin' ? ' selected' : '') + '>Administrador</option></select></label>' +
      '<label class="f">Situação<select name="status"><option value="active"' + (u.status === 'active' ? ' selected' : '') + '>Ativo</option><option value="blocked"' + (u.status === 'blocked' ? ' selected' : '') + '>Bloqueado</option></select></label></div>' +
      '<label class="f">' + (isNew ? 'Senha inicial' : 'Nova senha (deixe vazio para manter)') + ' <span class="h">mínimo 10 caracteres, com letras e números</span><input name="password" type="text" autocomplete="new-password"' + (isNew ? ' required' : '') + '></label>' +
      (isNew ? '' : '<label class="chk"><input type="checkbox" name="unlock"> Liberar bloqueio por tentativas</label><label class="chk"><input type="checkbox" name="reset2fa"> Redefinir verificação em duas etapas (celular perdido)</label>');
    openModal(isNew ? 'Novo usuário' : 'Editar usuário', body, function (f) {
      var data = { name: f.name.value, role: f.role.value, status: f.status.value, password: f.password.value || undefined };
      if (isNew) data.email = f.email.value; else { data.unlock = f.unlock.checked; data.reset2fa = f.reset2fa.checked; }
      return api(isNew ? 'POST' : 'PUT', '/admin/api/users' + (isNew ? '' : '/' + u.id), data).then(function () { toast('Usuário salvo'); viewUsuarios(); });
    });
  }

  // ---------- Auditoria ----------
  var ACT = { login: 'Entrou', logout: 'Saiu', login_falhou: 'Tentativa de login falhou', criou: 'Criou', alterou: 'Alterou', alterou_numeros: 'Alterou números', exportou_csv: 'Exportou CSV', senha_alterada: 'Trocou a senha', redefiniu_senha: 'Redefiniu senha', redefiniu_2fa: 'Redefiniu 2FA', '2fa_ativado': 'Ativou 2FA' };
  function viewAuditoria() {
    var page = state.auPage || 1;
    var v = shell('auditoria', 'Auditoria', 'Quem fez o quê no painel, e quando');
    api('GET', '/admin/api/audit?page=' + page).then(function (r) {
      var pages = Math.max(1, Math.ceil(r.total / 50));
      v.innerHTML = '<div class="tbl-wrap"><table><thead><tr><th>Quando</th><th>Usuário</th><th>Ação</th><th>Item</th><th>Detalhes</th><th>Rede</th></tr></thead><tbody>' + r.rows.map(function (a) {
        var det = a.diff ? Object.keys(a.diff).map(function (k) { var x = a.diff[k]; return k + ': ' + (x && typeof x === 'object' && 'para' in x ? JSON.stringify(x.de) + ' → ' + JSON.stringify(x.para) : JSON.stringify(x)); }).join(' · ') : '';
        return '<tr><td>' + dt(a.created_at) + '</td><td>' + esc(a.user_email || '–') + '</td><td>' + esc(ACT[a.action] || a.action) + '</td><td>' + esc([a.entity, a.entity_id].filter(Boolean).join(' ')) + '</td><td class="wrap">' + esc(det.slice(0, 400)) + '</td><td><code>' + esc(a.ip_prefix || '') + '</code></td></tr>';
      }).join('') + '</tbody></table></div><div class="pager"><span class="muted">página ' + page + ' de ' + pages + '</span><button class="btn ghost sm" id="pv"' + (page <= 1 ? ' disabled' : '') + '>Anterior</button><button class="btn ghost sm" id="nx"' + (page >= pages ? ' disabled' : '') + '>Próxima</button></div>';
      document.getElementById('pv').onclick = function () { state.auPage = page - 1; viewAuditoria(); };
      document.getElementById('nx').onclick = function () { state.auPage = page + 1; viewAuditoria(); };
    });
  }

  // ---------- Configurações ----------
  function viewConfig() {
    var v = shell('config', 'Configurações');
    api('GET', '/admin/api/settings').then(function (s) {
      var p = s.page || {};
      var cons = {}; (s.consent || []).forEach(function (c) { cons[c.choice] = c.n; });
      v.innerHTML = '<form id="cf" class="cards">' +
        '<section class="card c6"><h2>Dados e privacidade</h2><p class="sub">Eventos detalhados são apagados após o prazo; ficam só totais diários sem dado pessoal.</p>' +
        '<label class="f">Guardar eventos detalhados por (dias)<input name="retention_days" type="number" min="30" max="730" value="' + esc(s.retention_days) + '"></label>' +
        '<p class="note">Cookies (últimos 30 dias): ' + n(cons.analytics) + ' aceitaram · ' + n(cons.essential) + ' recusaram.</p></section>' +
        '<section class="card c6"><h2>Acessos internos</h2><p class="sub">IPs da equipe e das lojas. Acessos desses endereços ficam fora dos relatórios. Um por linha; use * no fim para faixas (ex.: 177.10.20.*).</p>' +
        '<textarea name="internal_ips" rows="4">' + esc((s.internal_ips || []).join('\n')) + '</textarea><button type="button" class="btn ghost sm" id="myip">Adicionar meu IP atual</button></section>' +
        '<section class="card c12"><h2>Textos da página</h2><p class="sub">Aparecem na página pública.</p><div class="grid2">' +
        '<label class="f">Apresentação (abaixo do logo)<textarea name="intro">' + esc(p.intro) + '</textarea></label>' +
        '<label class="f">Rodapé<textarea name="footer">' + esc(p.footer) + '</textarea></label>' +
        '<label class="f">Título da seção de avaliação<input name="reviews_title" value="' + esc(p.reviews_title) + '"></label>' +
        '<label class="f">Texto da seção de avaliação<input name="reviews_text" value="' + esc(p.reviews_text) + '"></label>' +
        '<label class="f">Contato de privacidade (LGPD)<input name="privacy_contact" value="' + esc(p.privacy_contact) + '"></label></div></section>' +
        '<section class="card c12"><button class="btn brand">Salvar configurações</button> <span class="muted">Banco de dados: ' + esc(s.db) + ' · 2FA obrigatório para administradores: ' + (s.require2fa ? 'sim' : 'não (ambiente local)') + '</span></section></form>';
      document.getElementById('myip').onclick = function () { api('GET', '/admin/api/my-ip').then(function (r) { var t = document.querySelector('[name=internal_ips]'); t.value = (t.value.trim() ? t.value.trim() + '\n' : '') + r.ip; }); };
      document.getElementById('cf').onsubmit = function (e) {
        e.preventDefault(); var f = e.target;
        api('PUT', '/admin/api/settings', { retention_days: Number(f.retention_days.value), internal_ips: f.internal_ips.value.split(/\s+/).filter(Boolean),
          page: { intro: f.intro.value, footer: f.footer.value, reviews_title: f.reviews_title.value, reviews_text: f.reviews_text.value, privacy_contact: f.privacy_contact.value } })
          .then(function () { toast('Configurações salvas'); }, function (er) { toast(er.message); });
      };
    });
  }

  // ---------- Minha conta ----------
  function viewConta() {
    var v = shell('conta', 'Minha conta');
    v.innerHTML = '<div class="cards"><section class="card c6"><h2>Trocar senha</h2><p class="sub">Ao trocar, as outras sessões abertas são encerradas.</p>' +
      '<form id="pw" class="list"><label class="f">Senha atual<input name="current" type="password" required autocomplete="current-password"></label><label class="f">Nova senha <span class="h">mínimo 10 caracteres, com letras e números</span><input name="next" type="password" required autocomplete="new-password"></label><button class="btn brand">Salvar nova senha</button></form></section>' +
      '<section class="card c6"><h2>Verificação em duas etapas</h2><p class="sub">Pede um código do celular além da senha.</p>' +
      (state.user.totp_enabled ? '<span class="pill ok">Ativa</span><p class="note">Perdeu o celular? Peça a um administrador para redefinir.</p>' : '<button class="btn brand" id="en2fa">Ativar agora</button>') + '</section></div>';
    document.getElementById('pw').onsubmit = function (e) {
      e.preventDefault();
      api('POST', '/admin/api/password', { current: e.target.current.value, next: e.target.next.value }).then(function () { toast('Senha alterada'); e.target.reset(); }, function (er) { toast(er.message); });
    };
    var b = document.getElementById('en2fa'); if (b) b.onclick = function () { render2faSetup(false); };
  }

  // ---------- roteador ----------
  var VIEWS = { dashboard: viewDashboard, eventos: viewEventos, campanhas: viewCampanhas, lojas: viewLojas, atalhos: viewAtalhos, usuarios: viewUsuarios, auditoria: viewAuditoria, config: viewConfig, conta: viewConta };
  var ADMIN_ONLY = { atalhos: 1, usuarios: 1, auditoria: 1, config: 1 };
  function route() {
    if (!state.user) return;
    var name = (location.hash.replace(/^#\//, '') || 'dashboard').split('?')[0];
    if (!VIEWS[name] || (ADMIN_ONLY[name] && !isAdmin())) name = 'dashboard';
    VIEWS[name]();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  api('GET', '/admin/api/me').then(function (r) {
    if (r.stage === 'full') afterLogin(r); else if (!r.stage && r.setup) renderSetup(r.setup); else renderLogin(r.stage);
  }, function () { renderLogin(); });
})();
