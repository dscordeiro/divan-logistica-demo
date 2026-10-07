import fs from 'node:fs';
import crypto from 'node:crypto';
import UAParser from 'ua-parser-js';
import { db, getSetting, setSetting } from './db.js';
import { config } from './config.js';

// ---------- Robôs e prévias de link ----------
const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|facebookcatalog|meta-externalagent|whatsapp\/|telegram|discord|skype|slack|linkedin|pinterest|embedly|vkshare|quora link|outbrain|headless|phantom|puppeteer|playwright|selenium|lighthouse|pagespeed|gtmetrix|python-|python\/|curl\/|wget|go-http|java\/|okhttp|axios|node-fetch|undici|libwww|httpclient|scrapy|uptime|monitor|pingdom|statuscake|kuma/i;
export function isBotUA(ua) { return !ua || ua.length < 12 || BOT_RE.test(ua); }

// ---------- Geolocalização local (opcional; arquivo .mmdb DB-IP Lite ou GeoLite2) ----------
let geoReader = null;
export async function initGeo() {
  if (!fs.existsSync(config.geoDbPath)) return false;
  try {
    const maxmind = (await import('maxmind')).default;
    geoReader = await maxmind.open(config.geoDbPath);
    return true;
  } catch (e) { console.warn('Geo: não foi possível abrir', config.geoDbPath, e.message); return false; }
}
function geoLookup(ip) {
  if (!geoReader || !ip) return { uf: null, city: null };
  try {
    const r = geoReader.get(ip);
    if (!r) return { uf: null, city: null };
    const sub = r.subdivisions?.[0];
    const country = r.country?.iso_code;
    const uf = country === 'BR' ? (sub?.iso_code || null) : (country ? `${country}` : null);
    const city = r.city?.names?.['pt-BR'] || r.city?.names?.en || null;
    return { uf, city };
  } catch { return { uf: null, city: null }; }
}

// ---------- Utilidades ----------
export const sha = (s, n = 32) => crypto.createHash('sha256').update(s).digest('hex').slice(0, n);
export function ipPrefix(ip) {
  if (!ip) return null;
  if (ip.includes('.')) return ip.split('.').slice(0, 3).join('.') + '.0';
  return ip.split(':').slice(0, 3).join(':') + '::';
}
function localDay(d = new Date()) {
  return new Date(d.getTime() - 3 * 3600e3).toISOString().slice(0, 10);
}

let saltCache = null;
async function dailySalt() {
  const today = localDay();
  if (saltCache?.day === today) return saltCache.salt;
  let s = await getSetting('daily_salt');
  if (!s || s.day !== today) {
    s = { day: today, salt: crypto.randomBytes(16).toString('hex') };
    await setSetting('daily_salt', s);
  }
  saltCache = s;
  return s.salt;
}

let internalCache = { at: 0, list: [] };
async function isInternalIp(ip) {
  if (Date.now() - internalCache.at > 60e3) internalCache = { at: Date.now(), list: (await getSetting('internal_ips', [])) || [] };
  return internalCache.list.some(p => p && (ip === p || (p.endsWith('*') && ip.startsWith(p.slice(0, -1)))));
}
export function invalidateInternalCache() { internalCache.at = 0; }

const SOURCE_MAP = [
  [/(^|\.)instagram\.com$|^l\.instagram/, 'instagram'],
  [/(^|\.)facebook\.com$|^l\.facebook|^lm\.facebook|^m\.facebook|(^|\.)fb\.com$/, 'facebook'],
  [/whatsapp|wa\.me/, 'whatsapp'],
  [/(^|\.)google\./, 'google'],
  [/(^|\.)youtube\.com$|youtu\.be/, 'youtube'],
  [/(^|\.)tiktok\.com$/, 'tiktok'],
  [/divanmoveis\.com\.br$/, 'site_divan'],
  [/(^|\.)bing\.com$/, 'bing'],
  [/agazeta\.com\.br$/, 'a_gazeta'],
];
export function classifySource(utmSource, referrerHost, campaignChannel) {
  if (utmSource) return String(utmSource).toLowerCase().trim().slice(0, 40);
  if (campaignChannel) return campaignChannel;
  if (!referrerHost) return 'direto';
  for (const [re, name] of SOURCE_MAP) if (re.test(referrerHost)) return name;
  return referrerHost.slice(0, 60);
}
export function refHost(ref, selfHost) {
  try {
    if (!ref) return null;
    const h = new URL(ref).hostname.toLowerCase();
    return h === selfHost ? null : h;
  } catch { return null; }
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
export function pickUtm(q = {}) {
  const u = {};
  for (const k of UTM_KEYS) if (q[k]) u[k] = String(q[k]).slice(0, 100);
  return u;
}
export const cleanSlug = (s) => (typeof s === 'string' && /^[a-z0-9][a-z0-9-]{0,59}$/.test(s) ? s : null);

// ---------- Contexto da requisição ----------
export async function requestContext(req) {
  const ua = req.headers['user-agent'] || '';
  const ip = req.ip || '';
  const p = new UAParser(ua).getResult();
  const device = p.device.type === 'mobile' ? 'mobile' : p.device.type === 'tablet' ? 'tablet' : (isBotUA(ua) ? 'bot' : 'desktop');
  let browser = p.browser.name || 'Outro';
  if (/Instagram/i.test(ua)) browser = 'Instagram (app)';
  else if (/FBAN|FBAV/i.test(ua)) browser = 'Facebook (app)';
  const os = [p.os.name, (p.os.version || '').split('.')[0]].filter(Boolean).join(' ') || 'Outro';
  const consent = req.cookies?.dv_consent === 'analytics' ? 'analytics' : (req.cookies?.dv_consent === 'essential' ? 'essential' : 'none');
  const vid = consent === 'analytics' && /^[A-Za-z0-9_-]{16,64}$/.test(req.cookies?.dv_vid || '') ? req.cookies.dv_vid : null;
  const salt = await dailySalt();
  // Chave anônima do dia: hash(salt diário + IP + navegador). O IP nunca é gravado.
  const anonKey = sha(`${salt}|${ip}|${ua}`);
  const geo = geoLookup(ip);
  return {
    anonKey,
    visitorHash: vid ? 'v_' + sha(`vid|${vid}`) : 'd_' + anonKey,
    isBot: isBotUA(ua),
    isInternal: await isInternalIp(ip),
    device, os, browser: browser.slice(0, 40),
    consent,
    geo,
    selfHost: (req.headers.host || '').split(':')[0].toLowerCase(),
  };
}

// Sessão = mesma chave anônima com menos de 30 min de inatividade
export async function touchSession(ctx, attrs = {}) {
  const s = await db.one(
    `SELECT id, campaign_slug, traffic_source, utm, referrer_host FROM visitor_sessions
     WHERE anon_key=$1 AND last_seen_at > now() - interval '30 minutes' ORDER BY last_seen_at DESC LIMIT 1`, [ctx.anonKey]);
  if (s) {
    // Uma nova campanha dentro da mesma sessão passa a valer (último toque)
    if (attrs.campaign_slug && attrs.campaign_slug !== s.campaign_slug) {
      await db.query('UPDATE visitor_sessions SET last_seen_at=now(), campaign_slug=$2 WHERE id=$1', [s.id, attrs.campaign_slug]);
      s.campaign_slug = attrs.campaign_slug;
    } else {
      await db.query('UPDATE visitor_sessions SET last_seen_at=now(), visitor_hash=$2 WHERE id=$1', [s.id, ctx.visitorHash]);
    }
    return { ...s, isNew: false };
  }
  const id = crypto.randomUUID();
  const source = classifySource(attrs.utm?.utm_source, attrs.referrer_host, attrs.campaign_channel);
  await db.query(
    `INSERT INTO visitor_sessions(id,anon_key,visitor_hash,campaign_slug,traffic_source,referrer_host,utm,device_type,os,browser,geo_uf,geo_city,consent_level,is_bot,is_internal)
     VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11,$12,$13,$14,$15)`,
    [id, ctx.anonKey, ctx.visitorHash, attrs.campaign_slug || null, source, attrs.referrer_host || null, JSON.stringify(attrs.utm || {}),
     ctx.device, ctx.os, ctx.browser, ctx.geo.uf, ctx.geo.city, ctx.consent, ctx.isBot, ctx.isInternal]);
  const sess = { id, campaign_slug: attrs.campaign_slug || null, traffic_source: source, utm: attrs.utm || {}, referrer_host: attrs.referrer_host || null, isNew: true };
  await recordEvent('session_start', ctx, sess, {});
  return sess;
}

export async function recordEvent(type, ctx, sess, e = {}) {
  const utm = Object.keys(e.utm || {}).length ? e.utm : (sess?.utm || {});
  const campaign = e.campaign_slug || sess?.campaign_slug || null;
  await db.query(
    `INSERT INTO events(event_type,session_id,visitor_hash,cta_key,channel,store_slug,campaign_slug,destination,destination_type,
       traffic_source,referrer_host,utm_source,utm_medium,utm_campaign,utm_content,utm_term,device_type,os,browser,geo_uf,geo_city,
       consent_level,is_bot,is_internal,is_dup,meta)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26::jsonb)`,
    [type, sess?.id || null, ctx.visitorHash, e.cta_key || null, e.channel || null, e.store_slug || null, campaign,
     e.destination || null, e.destination_type || null, sess?.traffic_source || classifySource(utm.utm_source, null),
     sess?.referrer_host || null, utm.utm_source || null, utm.utm_medium || null, utm.utm_campaign || null, utm.utm_content || null,
     utm.utm_term || null, ctx.device, ctx.os, ctx.browser, ctx.geo.uf, ctx.geo.city, ctx.consent, ctx.isBot, ctx.isInternal,
     !!e.is_dup, e.meta ? JSON.stringify(e.meta) : null]);
}

// Clique repetido do mesmo botão na mesma sessão em menos de 10 s = duplicado (fora dos relatórios)
export async function isDuplicateClick(sessionId, key) {
  const r = await db.one(
    `SELECT 1 AS x FROM events WHERE session_id=$1 AND cta_key=$2 AND event_type IN ('cta_click','call_click','store_maps_click','review_click')
     AND occurred_at > now() - interval '10 seconds' LIMIT 1`, [sessionId, key]);
  return !!r;
}

// ---------- Horário de atendimento ----------
export function openNow(hours, now = new Date()) {
  if (!hours) return true;
  const local = new Date(now.getTime() - 3 * 3600e3);
  const dow = local.getUTCDay();
  const hm = local.toISOString().slice(11, 16);
  return (hours[dow] || []).some(([a, b]) => hm >= a && hm < b);
}
export function nextOpening(hours, now = new Date()) {
  if (!hours) return null;
  const names = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const local = new Date(now.getTime() - 3 * 3600e3);
  const hm = local.toISOString().slice(11, 16);
  for (let d = 0; d < 8; d++) {
    const dow = (local.getUTCDay() + d) % 7;
    for (const [a] of hours[dow] || []) {
      if (d === 0 && a <= hm) continue;
      const h = a.endsWith(':00') ? `${Number(a.slice(0, 2))}h` : `${Number(a.slice(0, 2))}h${a.slice(3)}`;
      return d === 0 ? `hoje às ${h}` : d === 1 ? `amanhã às ${h}` : `${names[dow]} às ${h}`;
    }
  }
  return null;
}
export { localDay };
