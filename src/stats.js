import { db } from './db.js';

const LOCAL = `(occurred_at AT TIME ZONE 'America/Sao_Paulo')`;
const CONTACT = `event_type IN ('cta_click','call_click')`;
export const CLEAN = `NOT is_bot AND NOT is_internal AND NOT is_dup`;

const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
export function todayLocal() { return new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10); }

export function parseRange(q) {
  const today = todayLocal();
  let to = isDate(q.to) ? q.to : today;
  let from = isDate(q.from) ? q.from : addDays(to, -29);
  if (from > to) [from, to] = [to, from];
  const days = Math.round((Date.parse(to) - Date.parse(from)) / 864e5) + 1;
  return {
    from, to, days,
    fromTs: `${from}T00:00:00-03:00`, toTs: `${addDays(to, 1)}T00:00:00-03:00`,
    prev: { from: addDays(from, -days), to: addDays(from, -1), fromTs: `${addDays(from, -days)}T00:00:00-03:00`, toTs: `${from}T00:00:00-03:00` },
  };
}

// Monta WHERE com filtros opcionais (sempre parametrizado)
export function buildWhere(r, f = {}, { includeNoise = false } = {}) {
  const p = [r.fromTs, r.toTs];
  const w = ['occurred_at >= $1', 'occurred_at < $2'];
  if (!includeNoise) w.push(CLEAN);
  const add = (col, v) => { if (v) { p.push(String(v)); w.push(`${col} = $${p.length}`); } };
  add('campaign_slug', f.cmp);
  add('traffic_source', f.source);
  add('device_type', f.device);
  add('cta_key', f.cta);
  add('event_type', f.type);
  add('store_slug', f.store);
  add('geo_uf', f.uf);
  if (f.none_campaign) w.push('campaign_slug IS NULL');
  return { sql: w.join(' AND '), p };
}

async function kpis(r, f) {
  const { sql, p } = buildWhere(r, f);
  const k = await db.one(`
    SELECT count(DISTINCT visitor_hash) FILTER (WHERE event_type='page_view' OR event_type='campaign_hit' OR ${CONTACT})::int AS visitors,
           count(DISTINCT session_id)::int AS sessions,
           count(*) FILTER (WHERE event_type='page_view')::int AS page_views,
           count(*) FILTER (WHERE ${CONTACT})::int AS contact_clicks,
           count(*) FILTER (WHERE event_type='cta_click' AND destination_type='whatsapp')::int AS wa_clicks,
           count(*) FILTER (WHERE event_type='call_click')::int AS calls,
           count(*) FILTER (WHERE event_type='store_maps_click')::int AS route_clicks,
           count(*) FILTER (WHERE event_type='review_click')::int AS review_clicks,
           count(*) FILTER (WHERE event_type='campaign_hit')::int AS campaign_hits,
           count(*) FILTER (WHERE ${CONTACT} AND (meta->>'outside_hours')='true')::int AS outside_hours_clicks
    FROM events WHERE ${sql}`, p);
  // Dias já consolidados (dados brutos apagados pela retenção)
  const raw = await db.one(`SELECT min(${LOCAL}::date)::text AS d FROM events`);
  const cutoff = raw?.d ? (raw.d instanceof Date ? raw.d.toISOString().slice(0, 10) : String(raw.d)) : todayLocal();
  if (r.from < cutoff) {
    const hp = [r.from, cutoff < r.toTs.slice(0, 10) ? cutoff : r.toTs.slice(0, 10)];
    const extra = []; const addF = (col, v) => { if (v) { hp.push(String(v)); extra.push(`${col}=$${hp.length}`); } };
    addF('campaign_slug', f.cmp); addF('traffic_source', f.source); addF('device_type', f.device);
    const h = await db.one(`SELECT
        coalesce(sum(count) FILTER (WHERE event_type='page_view'),0)::int AS page_views,
        coalesce(sum(count) FILTER (WHERE event_type IN ('cta_click','call_click')),0)::int AS contact_clicks,
        coalesce(sum(count) FILTER (WHERE event_type='call_click'),0)::int AS calls,
        coalesce(sum(count) FILTER (WHERE event_type='store_maps_click'),0)::int AS route_clicks,
        coalesce(sum(count) FILTER (WHERE event_type='review_click'),0)::int AS review_clicks,
        coalesce(sum(count) FILTER (WHERE event_type='campaign_hit'),0)::int AS campaign_hits
      FROM daily_stats WHERE day >= $1 AND day < $2 ${extra.length ? 'AND ' + extra.join(' AND ') : ''}`, hp);
    const t = await db.one('SELECT coalesce(sum(visitors),0)::int AS v, coalesce(sum(sessions),0)::int AS s FROM daily_totals WHERE day >= $1 AND day < $2', hp.slice(0, 2));
    for (const key of Object.keys(h)) k[key] += h[key];
    if (!f.cmp && !f.source && !f.device) { k.visitors += t.v; k.sessions += t.s; }
    k.includes_history = true;
  }
  k.ctr = k.visitors ? k.contact_clicks / k.visitors : 0;
  return k;
}

export async function dashboard(q) {
  const r = parseRange(q);
  const f = { cmp: q.cmp, source: q.source, device: q.device };
  const gran = ['day', 'week', 'month'].includes(q.gran) ? q.gran : (r.days > 120 ? 'month' : r.days > 45 ? 'week' : 'day');
  const { sql, p } = buildWhere(r, f);

  const [cur, prev] = await Promise.all([kpis(r, f), kpis({ ...r.prev }, f)]);
  const todayR = parseRange({ from: todayLocal(), to: todayLocal() });
  const today = await kpis(todayR, f);

  const byCta = await db.all(`
    SELECT c.key, c.label, c.channel, c.sort_order,
      coalesce(e.clicks,0)::int AS clicks, coalesce(e.calls,0)::int AS calls, coalesce(e.impressions,0)::int AS impressions
    FROM ctas c LEFT JOIN (
      SELECT cta_key, count(*) FILTER (WHERE event_type='cta_click') AS clicks, count(*) FILTER (WHERE event_type='call_click') AS calls,
             count(*) FILTER (WHERE event_type='cta_impression') AS impressions
      FROM events WHERE ${sql} GROUP BY cta_key) e ON e.cta_key = c.key
    ORDER BY c.sort_order, c.id`, p);
  for (const c of byCta) {
    c.total = c.clicks + c.calls;
    c.ctr = cur.page_views ? c.total / cur.page_views : 0;
    c.ctr_impr = c.impressions ? c.total / c.impressions : null;
  }

  const timeseries = await db.all(`
    SELECT to_char(date_trunc('${gran}', ${LOCAL}), 'YYYY-MM-DD') AS bucket,
      count(*) FILTER (WHERE event_type='page_view')::int AS page_views,
      count(DISTINCT visitor_hash) FILTER (WHERE event_type='page_view')::int AS visitors,
      count(*) FILTER (WHERE ${CONTACT})::int AS clicks
    FROM events WHERE ${sql} GROUP BY 1 ORDER BY 1`, p);
  // complementa com dias consolidados
  const hist = await db.all(`
    SELECT to_char(date_trunc('${gran}', day::timestamp), 'YYYY-MM-DD') AS bucket,
      sum(count) FILTER (WHERE event_type='page_view')::int AS page_views,
      sum(count) FILTER (WHERE event_type IN ('cta_click','call_click'))::int AS clicks
    FROM daily_stats WHERE day >= $1 AND day <= $2 AND day < (SELECT coalesce(min(${LOCAL}::date), '9999-12-31') FROM events)
    GROUP BY 1`, [r.from, r.to]);
  const tsMap = new Map(timeseries.map(t => [t.bucket, t]));
  for (const h of hist) {
    const t = tsMap.get(h.bucket) || { bucket: h.bucket, page_views: 0, visitors: null, clicks: 0 };
    t.page_views += h.page_views || 0; t.clicks += h.clicks || 0; tsMap.set(h.bucket, t);
  }
  // preenche buckets vazios (dias)
  const series = [];
  if (gran === 'day') {
    for (let d = r.from; d <= r.to; d = new Date(Date.parse(d) + 864e5).toISOString().slice(0, 10)) {
      series.push(tsMap.get(d) || { bucket: d, page_views: 0, visitors: 0, clicks: 0 });
    }
  } else series.push(...[...tsMap.values()].sort((a, b) => a.bucket.localeCompare(b.bucket)));

  const byCampaign = await db.all(`
    SELECT e.campaign_slug AS slug, c.name, c.channel, c.is_active,
      count(*) FILTER (WHERE event_type='campaign_hit')::int AS hits,
      count(*) FILTER (WHERE event_type='page_view')::int AS page_views,
      count(DISTINCT visitor_hash)::int AS visitors,
      count(*) FILTER (WHERE ${CONTACT})::int AS clicks,
      count(*) FILTER (WHERE event_type='review_click')::int AS reviews,
      mode() WITHIN GROUP (ORDER BY e.channel) FILTER (WHERE ${CONTACT}) AS top_channel
    FROM events e LEFT JOIN campaigns c ON c.slug = e.campaign_slug
    WHERE ${sql.replace(/\b(campaign_slug|traffic_source|device_type|event_type)\b/g, 'e.$1')} GROUP BY 1,2,3,4 ORDER BY clicks DESC, visitors DESC LIMIT 50`, p);

  const bySource = await db.all(`
    SELECT coalesce(traffic_source,'direto') AS source, count(DISTINCT session_id)::int AS sessions,
      count(*) FILTER (WHERE ${CONTACT})::int AS clicks
    FROM events WHERE ${sql} GROUP BY 1 ORDER BY sessions DESC LIMIT 15`, p);

  const byHour = await db.all(`
    SELECT extract(hour FROM ${LOCAL})::int AS h, count(*)::int AS clicks,
      count(*) FILTER (WHERE channel='televendas')::int AS televendas,
      count(*) FILTER (WHERE channel='assistencia')::int AS assistencia
    FROM events WHERE ${sql} AND ${CONTACT} GROUP BY 1 ORDER BY 1`, p);
  const byWeekday = await db.all(`
    SELECT extract(dow FROM ${LOCAL})::int AS d, count(*)::int AS clicks
    FROM events WHERE ${sql} AND ${CONTACT} GROUP BY 1 ORDER BY 1`, p);

  const dim = (col) => db.all(`SELECT coalesce(${col},'Desconhecido') AS k, count(DISTINCT visitor_hash)::int AS visitors,
      count(*) FILTER (WHERE ${CONTACT})::int AS clicks
    FROM events WHERE ${sql} GROUP BY 1 ORDER BY visitors DESC LIMIT 10`, p);
  const [byDevice, byOs, byBrowser, byUf] = await Promise.all([dim('device_type'), dim('os'), dim('browser'), dim('geo_uf')]);
  const byCity = await db.all(`SELECT geo_uf AS uf, geo_city AS city, count(DISTINCT visitor_hash)::int AS visitors
    FROM events WHERE ${sql} AND geo_city IS NOT NULL GROUP BY 1,2 ORDER BY visitors DESC LIMIT 10`, p);

  const stores = await db.all(`
    SELECT s.slug, s.name, s.city, s.status, s.rating, s.rating_count, s.rating_updated_at,
      coalesce(e.routes,0)::int AS routes, coalesce(e.reviews,0)::int AS reviews
    FROM stores s LEFT JOIN (
      SELECT store_slug, count(*) FILTER (WHERE event_type='store_maps_click') AS routes,
             count(*) FILTER (WHERE event_type='review_click') AS reviews
      FROM events WHERE ${sql} GROUP BY 1) e ON e.store_slug = s.slug
    WHERE s.status <> 'hidden' ORDER BY s.sort_order`, p);

  const destinations = await db.all(`SELECT cta_key, destination, destination_type, count(*)::int AS clicks
    FROM events WHERE ${sql} AND ${CONTACT} AND destination_type IN ('whatsapp','tel') GROUP BY 1,2,3 ORDER BY clicks DESC LIMIT 20`, p);

  const noise = await db.one(`SELECT count(*) FILTER (WHERE is_bot)::int AS bots, count(*) FILTER (WHERE is_internal)::int AS internal,
      count(*) FILTER (WHERE is_dup)::int AS dups
    FROM events WHERE occurred_at >= $1 AND occurred_at < $2`, [r.fromTs, r.toTs]);

  return {
    range: { from: r.from, to: r.to, days: r.days, gran, prev: { from: r.prev.from, to: r.prev.to } },
    kpis: cur, prev, today, byCta, series, byCampaign, bySource, byHour, byWeekday,
    byDevice, byOs, byBrowser, byUf, byCity, stores, destinations, noise,
  };
}

const EVENT_COLS = `id, occurred_at, event_type, cta_key, channel, store_slug, campaign_slug, destination, destination_type, traffic_source,
  referrer_host, utm_source, utm_medium, utm_campaign, utm_content, utm_term, device_type, os, browser, geo_uf, geo_city, consent_level,
  is_bot, is_internal, is_dup, left(session_id::text, 8) AS session`;

export async function listEvents(q) {
  const r = parseRange(q);
  const f = { cmp: q.cmp, source: q.source, device: q.device, cta: q.cta, type: q.type, store: q.store, uf: q.uf };
  const built = buildWhere(r, f, { includeNoise: q.noise === '1' });
  // Sem filtro de tipo, esconde eventos técnicos (visualização de botão e início de sessão)
  const sql = q.type ? built.sql : built.sql + " AND event_type NOT IN ('cta_impression','session_start')";
  const p = built.p;
  const limit = Math.min(200, Math.max(10, Number(q.limit) || 50));
  const page = Math.max(1, Number(q.page) || 1);
  const total = (await db.one(`SELECT count(*)::int AS n FROM events WHERE ${sql}`, p)).n;
  const rows = await db.all(`SELECT ${EVENT_COLS} FROM events WHERE ${sql} ORDER BY occurred_at DESC, id DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`, p);
  return { total, page, limit, rows };
}

export async function exportRows(kind, q) {
  const r = parseRange(q);
  const f = { cmp: q.cmp, source: q.source, device: q.device, cta: q.cta, type: q.type, store: q.store, uf: q.uf };
  const { sql, p } = buildWhere(r, f, { includeNoise: q.noise === '1' });
  if (kind === 'events') {
    return db.all(`SELECT to_char(${LOCAL}, 'YYYY-MM-DD HH24:MI:SS') AS data_hora, event_type AS evento, cta_key AS botao, channel AS canal,
      store_slug AS loja, campaign_slug AS campanha, destination AS destino, destination_type AS tipo_destino, traffic_source AS origem,
      referrer_host AS referencia, utm_source, utm_medium, utm_campaign, utm_content, utm_term, device_type AS dispositivo, os AS sistema,
      browser AS navegador, geo_uf AS uf, geo_city AS cidade, left(session_id::text,8) AS sessao,
      CASE WHEN is_bot THEN 'sim' ELSE 'não' END AS robo, CASE WHEN is_internal THEN 'sim' ELSE 'não' END AS interno,
      CASE WHEN is_dup THEN 'sim' ELSE 'não' END AS duplicado
      FROM events WHERE ${sql} ORDER BY occurred_at LIMIT 200000`, p);
  }
  if (kind === 'daily') {
    return db.all(`SELECT ${LOCAL}::date::text AS dia, count(DISTINCT visitor_hash)::int AS visitantes, count(DISTINCT session_id)::int AS sessoes,
      count(*) FILTER (WHERE event_type='page_view')::int AS acessos, count(*) FILTER (WHERE ${CONTACT})::int AS cliques_contato,
      count(*) FILTER (WHERE channel='televendas' AND ${CONTACT})::int AS televendas,
      count(*) FILTER (WHERE channel='assistencia' AND ${CONTACT})::int AS assistencia,
      count(*) FILTER (WHERE channel='ofertas')::int AS ofertas, count(*) FILTER (WHERE channel='lojas')::int AS lojas,
      count(*) FILTER (WHERE channel='site')::int AS site, count(*) FILTER (WHERE event_type='store_maps_click')::int AS rotas,
      count(*) FILTER (WHERE event_type='review_click')::int AS avaliacoes
      FROM events WHERE ${sql} GROUP BY 1 ORDER BY 1`, p);
  }
  if (kind === 'campaigns') {
    return db.all(`SELECT coalesce(e.campaign_slug,'(sem campanha)') AS campanha, max(c.name) AS nome, max(c.channel) AS canal_divulgacao,
      count(*) FILTER (WHERE event_type='campaign_hit')::int AS entradas, count(DISTINCT visitor_hash)::int AS visitantes,
      count(*) FILTER (WHERE event_type='page_view')::int AS acessos, count(*) FILTER (WHERE ${CONTACT})::int AS cliques_contato,
      count(*) FILTER (WHERE event_type='review_click')::int AS avaliacoes
      FROM events e LEFT JOIN campaigns c ON c.slug=e.campaign_slug WHERE ${sql.replace(/\b(campaign_slug|traffic_source|device_type|event_type)\b/g, 'e.$1')}
      GROUP BY 1 ORDER BY cliques_contato DESC`, p);
  }
  if (kind === 'stores') {
    return db.all(`SELECT s.name AS loja, s.city AS cidade, s.rating AS nota_google, s.rating_count AS avaliacoes_google,
      count(e.*) FILTER (WHERE e.event_type='store_maps_click')::int AS cliques_rota,
      count(e.*) FILTER (WHERE e.event_type='review_click')::int AS cliques_avaliar
      FROM stores s LEFT JOIN events e ON e.store_slug=s.slug AND ${sql.replace(/\b(occurred_at|campaign_slug|traffic_source|device_type|event_type|store_slug|cta_key|geo_uf|is_bot|is_internal|is_dup)\b/g, 'e.$1')}
      GROUP BY s.id ORDER BY s.sort_order`, p);
  }
  return [];
}

export function toCsv(rows) {
  if (!rows.length) return '﻿sem dados\n';
  const cols = Object.keys(rows[0]);
  const cell = (v) => {
    if (v == null) return '';
    let s = v instanceof Date ? v.toISOString() : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // evita injeção de fórmula no Excel
    return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  // ; como separador e BOM UTF-8: abre corretamente no Excel em português
  return '﻿' + [cols.join(';'), ...rows.map(r => cols.map(c => cell(r[c])).join(';'))].join('\r\n') + '\r\n';
}
