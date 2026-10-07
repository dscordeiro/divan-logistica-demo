// Templates HTML da página pública (renderizados no servidor, sem framework)
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ICONS = {
  whatsapp: '<path d="M4 19.5 5.3 15.6A8 8 0 1 1 8.4 18.7Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-1.8-1.8l.8-1-1-2Z" fill="currentColor" stroke="none"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9Z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  store: '<path d="M4 9h16l-1-5H5Z"/><path d="M5 9v11h14V9"/><path d="M10 20v-6h4v6"/>',
  tool: '<path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5L15 12l-3-3Z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};
export const icon = (name, cls = 'ic') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.link}</svg>`;

const fmtRating = (r) => (r == null ? '' : Number(r).toFixed(1).replace('.', ','));

function layout({ title, body, description = '' }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#F28A21">
<meta name="format-detection" content="telephone=no">
<meta name="robots" content="index,follow">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<link rel="icon" href="/static/brand/icon.png">
<link rel="stylesheet" href="/static/site.css?v=6">
</head>
<body>
${body}
<script src="/static/site.js?v=3" defer></script>
</body>
</html>`;
}

export function renderHome({ ctas, stores, page, qs, closedInfo }) {
  const q = qs ? `?${esc(qs)}` : '';
  const visibleStores = stores.filter(s => s.status === 'active');

  const storeMenu = (c) => `<details class="menu" id="lojas" data-menu="${esc(c.key)}">
      <summary class="btn btn-${esc(c.style)}" data-cta-summary="${esc(c.key)}">${icon(c.icon)}<span>${esc(c.label)}</span>${icon('chevron', 'ic chev')}</summary>
      <ul class="menu-list">${visibleStores.map(s => `
        <li><details class="st" data-store="${esc(s.slug)}">
          <summary><span class="st-name"><strong>${esc(s.name)}</strong><small>${esc(s.city)}</small></span>${icon('chevron', 'ic-sm chev')}</summary>
          <div class="st-body">
            ${s.address ? `<p class="st-line">${icon('pin', 'ic-sm')}<span>${esc(s.address)}</span></p>` : ''}
            ${s.phone ? `<p class="st-line">${icon('phone', 'ic-sm')}<span>${esc(s.phone)}</span></p>` : ''}
            ${s.hours_text ? `<p class="st-line">${icon('clock', 'ic-sm')}<span>${esc(s.hours_text)}</span></p>` : ''}
            ${s.rating != null ? `<p class="st-line">${icon('star', 'ic-star')}<span><b>${fmtRating(s.rating)}</b> no Google · ${s.rating_count} avaliações</span></p>` : ''}
            <div class="st-actions">
              ${s.maps_url ? `<a class="btn btn-dark btn-sm" href="/rota/${esc(s.slug)}${q}" rel="nofollow">${icon('pin')}<span>Google Maps</span></a>` : ''}
              ${s.review_url ? `<a class="btn btn-light btn-sm" href="/avaliar/${esc(s.slug)}${q}" rel="nofollow">${icon('star')}<span>Avaliar</span></a>`
                : '<span class="st-soon">Avaliação no Google em breve</span>'}
            </div>
          </div>
        </details></li>`).join('')}
      </ul>
    </details>`;

  const buttons = ctas.map(c => {
    if (c.opens_stores) return `<li class="cta">${storeMenu(c)}</li>`;
    const closed = closedInfo[c.key];
    const main = `<a class="btn btn-${esc(c.style)}" href="/r/${esc(c.key)}${q}" data-cta="${esc(c.key)}" rel="nofollow">
        ${icon(c.type.startsWith('whatsapp') ? 'whatsapp' : c.icon)}<span>${esc(c.label)}</span></a>`;
    const tel = c.type === 'whatsapp_tel' && c.show_call
      ? `<a class="btn-call" href="/r/${esc(c.key)}${q}${q ? '&amp;' : '?'}via=tel" data-cta="${esc(c.key)}" data-via="tel" rel="nofollow" aria-label="Ligar para ${esc(c.label)}">${icon('phone')}</a>`
      : '';
    const note = closed ? `<p class="note">${icon('clock', 'ic-sm')} ${esc(closed)}</p>` : '';
    return `<li class="cta">${tel ? `<div class="row">${main}${tel}</div>` : main}${note}</li>`;
  }).join('\n');

  const sheetItems = visibleStores.filter(s => s.review_url).map(s =>
    `<li><a href="/avaliar/${esc(s.slug)}${q}" rel="nofollow"><span><strong>${esc(s.name)}</strong> · ${esc(s.city)}</span>${icon('star', 'ic-sm')}</a></li>`).join('');

  const body = `
<header class="hero">
  <div class="rays" aria-hidden="true"></div>
  <img class="logo" src="/static/brand/logo-white-solid.png" width="676" height="235" alt="Divan Móveis">
</header>
<main class="wrap">
  <p class="intro">${esc(page.intro).replace(/ (\S+)$/, '&nbsp;$1')}</p>
  <ul class="ctas">${buttons}</ul>
</main>

<footer class="foot">
  <section id="avaliar" class="review-card">
    <div class="stars" aria-hidden="true">${icon('star', 'ic-star')}${icon('star', 'ic-star')}${icon('star', 'ic-star')}${icon('star', 'ic-star')}${icon('star', 'ic-star')}</div>
    <h2>${esc(page.reviews_title)}</h2>
    <p>${esc(page.reviews_text)}</p>
    <a class="btn btn-light" href="#lojas" data-open-sheet>${icon('star')}<span>Avaliar no Google</span></a>
  </section>
  <p>${esc(page.footer)}</p>
  <p><a href="/privacidade">Privacidade</a> · <button type="button" class="linkbtn" data-consent-open>Preferências de cookies</button></p>
  <p class="credit"><a href="https://www.agencialeaf.com.br" target="_blank" rel="noopener"><span>Desenvolvido por</span><img src="/static/brand/leaf.png" width="406" height="108" alt="Agência Leaf"></a></p>
</footer>

<dialog id="sheet" class="sheet" aria-labelledby="sheet-title">
  <div class="sheet-head"><h3 id="sheet-title">Qual loja você quer avaliar?</h3>
  <button type="button" class="x" data-close aria-label="Fechar">×</button></div>
  <ul class="sheet-list">${sheetItems}</ul>
</dialog>

<div id="consent" class="consent" role="region" aria-label="Aviso de cookies" hidden>
  <p>Usamos um cookie opcional para entender quantas pessoas voltam à página. A contagem básica de acessos é anônima e não usa cookies. <a href="/privacidade">Saiba mais</a></p>
  <div class="consent-actions">
    <button type="button" data-consent="essential">Recusar</button>
    <button type="button" data-consent="analytics">Aceitar</button>
  </div>
</div>`;
  return layout({ title: 'Divan Móveis | Atendimento, lojas e ofertas', description: page.intro, body });
}

export function renderPrivacy({ page, retention }) {
  const body = `
<header class="hero hero-sm"><a href="/"><img class="logo" src="/static/brand/logo-white-solid.png" width="676" height="235" alt="Divan Móveis"></a></header>
<main class="wrap doc">
<h1>Privacidade</h1>
<p>Esta página reúne os canais de atendimento da Divan Móveis (${esc(page.footer)}). Explicamos aqui, de forma simples, o que é medido.</p>
<h2>O que coletamos</h2>
<ul>
<li>Data e hora do acesso e de cada botão tocado (por exemplo, "Falar com Televendas").</li>
<li>Tipo de aparelho, sistema e navegador, de forma resumida.</li>
<li>De onde veio o acesso (por exemplo, Instagram ou um link de campanha) e parâmetros de campanha (UTM).</li>
<li>Estado e cidade aproximados, estimados a partir do endereço de internet. <strong>O endereço de internet (IP) não é armazenado.</strong></li>
</ul>
<h2>O que não coletamos</h2>
<p>Não registramos nome, telefone, e-mail, nem o conteúdo das conversas no WhatsApp ou ligações.</p>
<h2>Cookies</h2>
<p>A contagem básica de acessos funciona sem cookies, com um identificador anônimo que muda todos os dias. Se você aceitar, usamos um cookie para saber se você voltou à página. Você pode mudar sua escolha a qualquer momento em <button type="button" class="linkbtn" data-consent-open>Preferências de cookies</button>.</p>
<h2>Por quanto tempo</h2>
<p>Os registros detalhados são apagados automaticamente após ${Number(retention)} dias. Depois disso, ficam apenas totais diários, sem nenhum dado pessoal.</p>
<h2>Finalidade e base legal</h2>
<p>Medir o desempenho dos canais de atendimento e das campanhas da Divan (legítimo interesse, LGPD art. 7º, IX) e, para o cookie opcional, o seu consentimento (art. 7º, I).</p>
<h2>Contato</h2>
<p>Dúvidas ou pedidos sobre seus dados: <a href="mailto:${esc(page.privacy_contact)}">${esc(page.privacy_contact)}</a>.</p>
<p><a href="/">← Voltar</a></p>
</main>
<div id="consent" class="consent" role="region" aria-label="Aviso de cookies" hidden>
  <p>Usamos um cookie opcional para entender quantas pessoas voltam à página.</p>
  <div class="consent-actions"><button type="button" data-consent="essential">Recusar</button><button type="button" data-consent="analytics">Aceitar</button></div>
</div>`;
  return layout({ title: 'Privacidade | Divan Móveis', body });
}
