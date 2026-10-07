import { db, getSetting } from './db.js';
import { renderHome, renderPrivacy } from './views.js';
import {
  requestContext, touchSession, recordEvent, isDuplicateClick, pickUtm, cleanSlug, refHost, openNow, nextOpening,
} from './tracking.js';
import { localDay } from './tracking.js';

const NO_STORE = { 'cache-control': 'no-store, max-age=0', 'referrer-policy': 'strict-origin-when-cross-origin' };

async function activeCampaign(slug) {
  if (!cleanSlug(slug)) return null;
  const c = await db.one('SELECT *, starts_at::text AS starts_at, ends_at::text AS ends_at FROM campaigns WHERE slug=$1', [slug]);
  if (!c || !c.is_active) return null;
  const today = localDay();
  const fmt = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d));
  if (c.starts_at && fmt(c.starts_at) > today) return null;
  if (c.ends_at && fmt(c.ends_at) < today) return null;
  return c;
}

// Parâmetros que acompanham o visitante da página até o clique (sem cookie)
function carryQuery(campaign, utm) {
  const p = new URLSearchParams();
  if (campaign) p.set('cmp', campaign.slug);
  for (const [k, v] of Object.entries(utm)) p.set(k, v);
  return p.toString();
}

async function contextAndSession(req, { campaign, utm }) {
  const ctx = await requestContext(req);
  const sess = await touchSession(ctx, {
    campaign_slug: campaign?.slug || null,
    campaign_channel: campaign?.channel || null,
    utm: Object.keys(utm).length ? utm : (campaign?.default_utm || {}),
    referrer_host: refHost(req.headers.referer, ctx.selfHost),
  });
  return { ctx, sess };
}

function withSiteUtm(url, utm, campaign) {
  try {
    const u = new URL(url);
    if (!/divanmoveis\.com\.br$/.test(u.hostname)) return url;
    const src = Object.keys(utm).length ? utm : {
      utm_source: 'links_divan', utm_medium: 'referral', utm_campaign: campaign?.slug || 'pagina_links',
    };
    for (const [k, v] of Object.entries(src)) if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    return u.toString();
  } catch { return url; }
}

async function pickDestination(cta) {
  const list = await db.all('SELECT * FROM cta_destinations WHERE cta_id=$1 AND is_active ORDER BY id', [cta.id]);
  if (!list.length) return null;
  if (list.length === 1 || cta.distribution === 'first') return list[0];
  if (cta.distribution === 'weighted') {
    const total = list.reduce((a, d) => a + Math.max(0, d.weight), 0) || 1;
    let r = Math.random() * total;
    for (const d of list) { r -= Math.max(0, d.weight); if (r <= 0) return d; }
    return list[list.length - 1];
  }
  const { rr_counter } = await db.one('UPDATE ctas SET rr_counter = rr_counter + 1 WHERE id=$1 RETURNING rr_counter', [cta.id]);
  return list[(rr_counter - 1) % list.length];
}

export default async function publicRoutes(app) {
  app.get('/', async (req, reply) => {
    const campaign = await activeCampaign(req.query.cmp);
    const utm = pickUtm(req.query);
    const { ctx, sess } = await contextAndSession(req, { campaign, utm });
    await recordEvent('page_view', ctx, sess, { campaign_slug: campaign?.slug, utm });

    const ctas = await db.all('SELECT * FROM ctas WHERE is_active ORDER BY sort_order, id');
    const stores = await db.all("SELECT * FROM stores WHERE status <> 'hidden' ORDER BY sort_order, id");
    const page = await getSetting('page', {});
    const closedInfo = {};
    for (const c of ctas) {
      if (c.hours && !openNow(c.hours)) {
        const next = nextOpening(c.hours);
        closedInfo[c.key] = next ? `Fora do horário. Respondemos ${next}.` : (c.outside_hours_msg || 'Fora do horário de atendimento.');
      }
    }
    reply.headers(NO_STORE).type('text/html; charset=utf-8');
    return renderHome({ ctas, stores, page, qs: carryQuery(campaign, utm), closedInfo });
  });

  // Clique em atalho → registra no servidor e redireciona
  app.get('/r/:key', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
    reply.headers(NO_STORE);
    const cta = await db.one('SELECT * FROM ctas WHERE key=$1 AND is_active', [String(req.params.key)]);
    if (!cta) return reply.redirect('/', 302);
    const campaign = await activeCampaign(req.query.cmp);
    const utm = pickUtm(req.query);
    const { ctx, sess } = await contextAndSession(req, { campaign, utm });
    const via = req.query.via === 'tel' && cta.show_call ? 'tel' : 'default';

    let target, destination, destType;
    if (cta.type === 'url') {
      target = withSiteUtm(cta.url, utm, campaign || (sess.campaign_slug ? { slug: sess.campaign_slug } : null));
      destination = cta.url; destType = 'url';
    } else {
      const d = await pickDestination(cta);
      if (!d) return reply.redirect('/', 302);
      const digits = d.phone_e164.replace(/\D/g, '');
      if (via === 'tel' || cta.type === 'tel') {
        target = `tel:+${digits}`; destType = 'tel';
      } else {
        const camp = campaign || (sess.campaign_slug ? await activeCampaign(sess.campaign_slug) : null);
        const code = camp?.short_code ? ` [${camp.short_code}]` : '';
        const msg = (cta.wa_message || 'Olá!{codigo}').replace('{codigo}', code);
        target = `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`; destType = 'whatsapp';
      }
      destination = `${d.label || cta.label}: ${d.phone_e164}`;
    }
    const dup = await isDuplicateClick(sess.id, cta.key);
    await recordEvent(destType === 'tel' ? 'call_click' : 'cta_click', ctx, sess, {
      cta_key: cta.key, channel: cta.channel, campaign_slug: campaign?.slug, utm, destination, destination_type: destType, is_dup: dup,
      meta: cta.hours && !openNow(cta.hours) ? { outside_hours: true } : null,
    });
    return reply.redirect(target, 302);
  });

  async function storeRedirect(req, reply, kind) {
    reply.headers(NO_STORE);
    const slug = cleanSlug(req.params.slug);
    const s = slug && await db.one("SELECT * FROM stores WHERE slug=$1 AND status='active'", [slug]);
    const target = s && (kind === 'review' ? s.review_url : s.maps_url);
    if (!target) return reply.redirect('/#lojas', 302);
    const campaign = await activeCampaign(req.query.cmp);
    const utm = pickUtm(req.query);
    const { ctx, sess } = await contextAndSession(req, { campaign, utm });
    const key = `${kind === 'review' ? 'avaliar' : 'rota'}:${s.slug}`;
    const dup = await isDuplicateClick(sess.id, key);
    await recordEvent(kind === 'review' ? 'review_click' : 'store_maps_click', ctx, sess, {
      cta_key: key, channel: kind === 'review' ? 'avaliacao' : 'rota', store_slug: s.slug, campaign_slug: campaign?.slug, utm,
      destination: s.name, destination_type: kind === 'review' ? 'review' : 'maps', is_dup: dup,
    });
    return reply.redirect(target, 302);
  }
  app.get('/rota/:slug', (req, reply) => storeRedirect(req, reply, 'maps'));
  app.get('/avaliar/:slug', (req, reply) => storeRedirect(req, reply, 'review'));
  app.get('/avaliar', (req, reply) => reply.redirect('/#avaliar', 302));

  // Link de campanha
  app.get('/c/:slug', async (req, reply) => {
    reply.headers(NO_STORE);
    const campaign = await activeCampaign(req.params.slug);
    if (!campaign) return reply.redirect('/', 302);
    const utm = { ...(campaign.default_utm || {}), ...pickUtm(req.query) };
    const { ctx, sess } = await contextAndSession(req, { campaign, utm });
    await recordEvent('campaign_hit', ctx, sess, { campaign_slug: campaign.slug, utm });
    const qs = carryQuery(campaign, utm);
    const go = req.query.go || (campaign.landing === 'cta' ? campaign.landing_cta : null);
    if (go && /^[a-z0-9_-]{1,40}$/.test(go)) return reply.redirect(`/r/${go}?${qs}`, 302);
    if (campaign.landing === 'review' && campaign.landing_store) return reply.redirect(`/avaliar/${campaign.landing_store}?${qs}`, 302);
    return reply.redirect(`/?${qs}`, 302);
  });

  // Eventos enviados pela página (visualização de botões, consentimento)
  const ALLOWED = new Set(['cta_impression', 'consent_update', 'menu_open', 'store_view']);
  app.post('/api/e', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
    let b = req.body;
    if (typeof b === 'string') { try { b = JSON.parse(b); } catch { return reply.code(204).send(); } }
    if (!b || typeof b !== 'object' || !ALLOWED.has(b.t)) return reply.code(204).send();
    if (b.t === 'consent_update') {
      const choice = b.v === 'analytics' ? 'analytics' : 'essential';
      await db.query(`INSERT INTO consent_stats(day,choice,count) VALUES($1,$2,1)
        ON CONFLICT(day,choice) DO UPDATE SET count = consent_stats.count + 1`, [localDay(), choice]);
      return reply.code(204).send();
    }
    if (b.t === 'menu_open' || b.t === 'store_view') {
      const campaign = await activeCampaign(b.cmp);
      const utm = pickUtm(b.utm || {});
      const ctx = await requestContext(req);
      const sess = await touchSession(ctx, { campaign_slug: campaign?.slug, utm });
      if (b.t === 'menu_open') {
        const cta = await db.one('SELECT key, channel FROM ctas WHERE key=$1 AND is_active AND opens_stores', [String(b.k || '')]);
        if (cta) {
          const dup = await isDuplicateClick(sess.id, cta.key);
          await recordEvent('cta_click', ctx, sess, { cta_key: cta.key, channel: cta.channel, campaign_slug: campaign?.slug, utm, destination: 'Lista de lojas', destination_type: 'menu', is_dup: dup });
        }
      } else {
        const s = cleanSlug(b.s) && await db.one("SELECT slug, name FROM stores WHERE slug=$1 AND status='active'", [b.s]);
        if (s) await recordEvent('store_view', ctx, sess, { cta_key: `loja:${s.slug}`, channel: 'lojas', store_slug: s.slug, campaign_slug: campaign?.slug, utm, destination: s.name, destination_type: 'info' });
      }
      return reply.code(204).send();
    }
    const keys = Array.isArray(b.k) ? b.k.slice(0, 20) : [];
    if (!keys.length) return reply.code(204).send();
    const valid = new Set((await db.all('SELECT key FROM ctas WHERE is_active')).map(r => r.key));
    const campaign = await activeCampaign(b.cmp);
    const utm = pickUtm(b.utm || {});
    const ctx = await requestContext(req);
    const sess = await touchSession(ctx, { campaign_slug: campaign?.slug, utm });
    for (const k of new Set(keys)) {
      if (valid.has(k)) await recordEvent('cta_impression', ctx, sess, { cta_key: k, campaign_slug: campaign?.slug, utm });
    }
    return reply.code(204).send();
  });

  app.get('/privacidade', async (req, reply) => {
    const page = await getSetting('page', {});
    const retention = await getSetting('retention_days', 180);
    reply.type('text/html; charset=utf-8');
    return renderPrivacy({ page, retention });
  });

  app.get('/health', async () => ({ ok: true, db: db.kind }));
}
