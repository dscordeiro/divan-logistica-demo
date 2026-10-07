import fs from 'node:fs';
import { config as appConfig } from './config.js';
import path from 'node:path';
import QRCode from 'qrcode';
import { db, getSetting, setSetting } from './db.js';
import { config, ROOT } from './config.js';
import {
  hashPassword, verifyPassword, passwordProblem, encrypt, decrypt, verifyTotp, newTotpSecret, newToken, sha256,
} from './auth.js';
import { ipPrefix, invalidateInternalCache, cleanSlug } from './tracking.js';
import { dashboard, listEvents, exportRows, toCsv } from './stats.js';

const COOKIE = 'dv_admin';
function removeFirstAccessFile() {
  try { fs.unlinkSync(path.join(appConfig.dataDir, 'PRIMEIRO-ACESSO.txt')); } catch { /* já removido */ }
}
const LOCK_AFTER = 5, LOCK_MIN = 15;

// ---------- Auditoria ----------
async function audit(req, action, entity = null, entityId = null, diff = null) {
  await db.query('INSERT INTO audit_log(user_id,user_email,action,entity,entity_id,diff,ip_prefix) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7)',
    [req.user?.id || null, req.user?.email || null, action, entity, entityId == null ? null : String(entityId), diff ? JSON.stringify(diff) : null, ipPrefix(req.ip)]);
}
function changes(before, after, fields) {
  const d = {};
  for (const f of fields) if (after[f] !== undefined && JSON.stringify(before?.[f]) !== JSON.stringify(after[f])) d[f] = { de: before?.[f] ?? null, para: after[f] };
  return Object.keys(d).length ? d : null;
}

// ---------- Sessão do painel ----------
async function createSession(reply, req, userId, stage) {
  const token = newToken();
  await db.query(`INSERT INTO admin_sessions(user_id,token_hash,stage,ip_prefix,ua_summary,expires_at)
    VALUES($1,$2,$3,$4,$5, now() + interval '${config.sessionIdleHours} hours')`,
    [userId, sha256(token), stage, ipPrefix(req.ip), String(req.headers['user-agent'] || '').slice(0, 120)]);
  reply.setCookie(COOKIE, token, { path: '/admin', httpOnly: true, sameSite: 'strict', secure: config.isProd || req.protocol === 'https', maxAge: 60 * 60 * 24 });
}
async function loadSession(req) {
  const token = req.cookies?.[COOKIE];
  if (!token || token.length > 100) return null;
  const s = await db.one(`SELECT s.id AS sid, s.stage, u.* FROM admin_sessions s JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=$1 AND s.revoked_at IS NULL AND s.expires_at > now()`, [sha256(token)]);
  if (!s || s.status !== 'active') return null;
  await db.query(`UPDATE admin_sessions SET last_seen_at=now(), expires_at = now() + interval '${config.sessionIdleHours} hours' WHERE id=$1`, [s.sid]);
  return s;
}
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, totp_enabled: u.totp_enabled });

function ipAllowed(req) {
  if (!config.adminAllowedIps.length) return true;
  return config.adminAllowedIps.some(p => req.ip === p || (p.endsWith('*') && req.ip.startsWith(p.slice(0, -1))));
}

export default async function adminRoutes(app) {
  // Restrição opcional por IP + proteção CSRF (cabeçalho próprio + checagem de origem)
  app.addHook('onRequest', async (req, reply) => {
    if (!req.url.startsWith('/admin')) return;
    if (!ipAllowed(req)) return reply.code(403).type('text/plain').send('Acesso restrito.');
    if (req.url.startsWith('/admin/api') && req.method !== 'GET') {
      if (req.headers['x-dv'] !== '1') return reply.code(403).send({ error: 'Requisição inválida' });
      const origin = req.headers.origin;
      if (origin) { let ok = false; try { ok = new URL(origin).host === req.headers.host; } catch {} if (!ok) return reply.code(403).send({ error: 'Origem inválida' }); }
    }
    reply.header('cache-control', 'no-store');
    reply.header('x-robots-tag', 'noindex, nofollow');
  });

  const auth = (roles = ['admin', 'viewer']) => async (req, reply) => {
    const s = await loadSession(req);
    if (!s || s.stage !== 'full') return reply.code(401).send({ error: 'Faça login' });
    if (!roles.includes(s.role)) return reply.code(403).send({ error: 'Sem permissão' });
    req.user = s;
  };
  const adminOnly = { preHandler: auth(['admin']) };
  const anyRole = { preHandler: auth() };

  // ---------- Páginas ----------
  const indexHtml = () => fs.readFileSync(path.join(ROOT, 'admin', 'index.html'), 'utf8');
  app.get('/admin', async (req, reply) => reply.type('text/html; charset=utf-8').send(indexHtml()));
  app.get('/admin/', async (req, reply) => reply.redirect('/admin', 302));

  // ---------- Login ----------
  app.post('/admin/api/login', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (req, reply) => {
    const email = String(req.body?.email || '').toLowerCase().trim().slice(0, 200);
    const password = String(req.body?.password || '').slice(0, 200);
    const u = await db.one('SELECT * FROM users WHERE email=$1', [email]);
    const fail = async (msg = 'E-mail ou senha incorretos.') => {
      await db.query('INSERT INTO audit_log(user_email,action,ip_prefix) VALUES($1,$2,$3)', [email, 'login_falhou', ipPrefix(req.ip)]);
      return reply.code(401).send({ error: msg });
    };
    if (!u) { await hashPassword('x'); return fail(); }
    if (u.status !== 'active') return fail('Usuário bloqueado. Fale com o administrador.');
    if (u.locked_until && new Date(u.locked_until) > new Date()) return fail(`Muitas tentativas. Tente novamente em ${LOCK_MIN} minutos.`);
    if (!(await verifyPassword(password, u.password_hash))) {
      const n = u.failed_attempts + 1;
      await db.query(`UPDATE users SET failed_attempts=$2, locked_until = CASE WHEN $2 >= ${LOCK_AFTER} THEN now() + interval '${LOCK_MIN} minutes' ELSE NULL END WHERE id=$1`, [u.id, n]);
      return fail(n >= LOCK_AFTER ? `Muitas tentativas. Acesso bloqueado por ${LOCK_MIN} minutos.` : undefined);
    }
    await db.query('UPDATE users SET failed_attempts=0, locked_until=NULL WHERE id=$1', [u.id]);
    const need2fa = u.totp_enabled ? 'pending_2fa' : ((config.require2fa && u.role === 'admin') ? 'setup_2fa' : 'full');
    await createSession(reply, req, u.id, need2fa);
    await setSetting('setup_open', false);
    if (need2fa === 'full') {
      removeFirstAccessFile();
      await db.query('UPDATE users SET last_login_at=now() WHERE id=$1', [u.id]);
      req.user = u; await audit(req, 'login');
    }
    return { stage: need2fa, user: need2fa === 'full' ? publicUser(u) : null };
  });

  app.post('/admin/api/login/2fa', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (req, reply) => {
    const s = await loadSession(req);
    if (!s || s.stage !== 'pending_2fa') return reply.code(401).send({ error: 'Sessão expirada. Entre novamente.' });
    if (!verifyTotp(decrypt(s.totp_secret_enc), req.body?.code)) {
      const n = s.failed_attempts + 1;
      await db.query(`UPDATE users SET failed_attempts=$2, locked_until = CASE WHEN $2 >= ${LOCK_AFTER} THEN now() + interval '${LOCK_MIN} minutes' ELSE NULL END WHERE id=$1`, [s.id, n]);
      if (n >= LOCK_AFTER) await db.query('UPDATE admin_sessions SET revoked_at=now() WHERE id=$1', [s.sid]);
      return reply.code(401).send({ error: 'Código inválido.' });
    }
    await db.query("UPDATE admin_sessions SET stage='full' WHERE id=$1", [s.sid]);
    await db.query('UPDATE users SET last_login_at=now(), failed_attempts=0 WHERE id=$1', [s.id]);
    req.user = s; await audit(req, 'login');
    return { stage: 'full', user: publicUser(s) };
  });

  // Configuração de 2FA (obrigatória para admin quando REQUIRE_2FA=true; opcional para os demais)
  app.get('/admin/api/2fa/setup', async (req, reply) => {
    const s = await loadSession(req);
    if (!s || !['setup_2fa', 'full'].includes(s.stage)) return reply.code(401).send({ error: 'Faça login' });
    const secret = newTotpSecret();
    await db.query('UPDATE users SET totp_secret_enc=$2 WHERE id=$1 AND NOT totp_enabled', [s.id, encrypt(secret)]);
    const fresh = await db.one('SELECT totp_enabled FROM users WHERE id=$1', [s.id]);
    if (fresh.totp_enabled) return reply.code(400).send({ error: '2FA já está ativo.' });
    const uri = `otpauth://totp/${encodeURIComponent('Divan Links:' + s.email)}?secret=${secret}&issuer=${encodeURIComponent('Divan Links')}`;
    return { secret, qr: await QRCode.toDataURL(uri, { margin: 1, width: 220 }) };
  });
  app.post('/admin/api/2fa/enable', async (req, reply) => {
    const s = await loadSession(req);
    if (!s || !['setup_2fa', 'full'].includes(s.stage)) return reply.code(401).send({ error: 'Faça login' });
    if (!s.totp_secret_enc || !verifyTotp(decrypt(s.totp_secret_enc), req.body?.code)) return reply.code(400).send({ error: 'Código inválido. Confira o horário do celular.' });
    await db.query('UPDATE users SET totp_enabled=true WHERE id=$1', [s.id]);
    await db.query("UPDATE admin_sessions SET stage='full' WHERE id=$1", [s.sid]);
    removeFirstAccessFile();
    req.user = s; await audit(req, '2fa_ativado', 'user', s.id);
    if (s.stage === 'setup_2fa') { await db.query('UPDATE users SET last_login_at=now() WHERE id=$1', [s.id]); await audit(req, 'login'); }
    return { stage: 'full', user: publicUser({ ...s, totp_enabled: true }) };
  });

  app.get('/admin/api/me', async (req, reply) => {
    const s = await loadSession(req);
    if (!s) return { stage: null, user: null, setup: (await getSetting('setup_open', false)) === true ? { email: config.adminEmail } : null };
    return { stage: s.stage, user: s.stage === 'full' ? publicUser(s) : null, require2fa: config.require2fa };
  });
  // Primeiro acesso: o administrador define a própria senha (só enquanto ninguém entrou no painel)
  app.post('/admin/api/setup', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (req, reply) => {
    if ((await getSetting('setup_open', false)) !== true) return reply.code(403).send({ error: 'O primeiro acesso já foi configurado. Faça login.' });
    const pw = String(req.body?.password || '');
    const prob = passwordProblem(pw); if (prob) return reply.code(400).send({ error: prob });
    const u = await db.one("SELECT * FROM users WHERE email=$1 AND role='admin'", [config.adminEmail.toLowerCase()]);
    if (!u) return reply.code(400).send({ error: 'Administrador não encontrado.' });
    await db.query('UPDATE users SET password_hash=$2, failed_attempts=0, locked_until=NULL, updated_at=now() WHERE id=$1', [u.id, await hashPassword(pw)]);
    await setSetting('setup_open', false);
    removeFirstAccessFile();
    const stage = u.totp_enabled ? 'pending_2fa' : (config.require2fa ? 'setup_2fa' : 'full');
    await createSession(reply, req, u.id, stage);
    req.user = u; await audit(req, 'senha_definida_primeiro_acesso', 'user', u.id);
    if (stage === 'full') { await db.query('UPDATE users SET last_login_at=now() WHERE id=$1', [u.id]); await audit(req, 'login'); }
    return { stage, user: stage === 'full' ? publicUser(u) : null };
  });

  app.post('/admin/api/logout', async (req, reply) => {
    const s = await loadSession(req);
    if (s) { await db.query('UPDATE admin_sessions SET revoked_at=now() WHERE id=$1', [s.sid]); req.user = s; await audit(req, 'logout'); }
    reply.clearCookie(COOKIE, { path: '/admin' });
    return { ok: true };
  });
  app.post('/admin/api/password', anyRole, async (req, reply) => {
    const { current, next } = req.body || {};
    if (!(await verifyPassword(String(current || ''), req.user.password_hash))) return reply.code(400).send({ error: 'Senha atual incorreta.' });
    const prob = passwordProblem(next); if (prob) return reply.code(400).send({ error: prob });
    await db.query('UPDATE users SET password_hash=$2, updated_at=now() WHERE id=$1', [req.user.id, await hashPassword(next)]);
    await db.query('UPDATE admin_sessions SET revoked_at=now() WHERE user_id=$1 AND id<>$2 AND revoked_at IS NULL', [req.user.id, req.user.sid]);
    await audit(req, 'senha_alterada', 'user', req.user.id);
    return { ok: true };
  });

  // ---------- Métricas ----------
  app.get('/admin/api/meta', anyRole, async () => ({
    ctas: await db.all('SELECT key, label, channel FROM ctas ORDER BY sort_order'),
    campaigns: await db.all('SELECT slug, name, is_active FROM campaigns ORDER BY created_at DESC'),
    stores: await db.all("SELECT slug, name, city FROM stores WHERE status<>'hidden' ORDER BY sort_order"),
    sources: (await db.all("SELECT DISTINCT traffic_source AS s FROM events WHERE traffic_source IS NOT NULL ORDER BY 1 LIMIT 100")).map(r => r.s),
    appUrl: config.appUrl,
  }));
  app.get('/admin/api/dashboard', anyRole, async (req) => dashboard(req.query));
  app.get('/admin/api/events', anyRole, async (req) => listEvents(req.query));
  app.get('/admin/api/export.csv', anyRole, async (req, reply) => {
    const kind = ['events', 'daily', 'campaigns', 'stores'].includes(req.query.kind) ? req.query.kind : 'events';
    const rows = await exportRows(kind, req.query);
    await audit(req, 'exportou_csv', kind, null, { de: req.query.from, ate: req.query.to, linhas: rows.length });
    reply.header('content-disposition', `attachment; filename="divan-${kind}-${req.query.from || ''}_${req.query.to || ''}.csv"`);
    return reply.type('text/csv; charset=utf-8').send(toCsv(rows));
  });

  // ---------- Campanhas ----------
  const CHANNELS = ['instagram', 'facebook', 'whatsapp', 'meta_ads', 'google_ads', 'google_perfil', 'radio', 'tv', 'jornal', 'impresso', 'qr_loja', 'email', 'sms', 'site', 'outro'];
  app.get('/admin/api/campaigns', anyRole, async () => ({
    channels: CHANNELS,
    rows: await db.all(`SELECT c.*, u.name AS created_by_name,
        (SELECT count(*) FROM events e WHERE e.campaign_slug=c.slug AND e.event_type='campaign_hit' AND NOT e.is_bot AND NOT e.is_internal)::int AS hits,
        (SELECT count(*) FROM events e WHERE e.campaign_slug=c.slug AND e.event_type IN ('cta_click','call_click') AND NOT e.is_bot AND NOT e.is_internal AND NOT e.is_dup)::int AS clicks
      FROM campaigns c LEFT JOIN users u ON u.id=c.created_by ORDER BY c.created_at DESC`),
  }));
  function campaignInput(b) {
    const slug = cleanSlug(String(b.slug || '').toLowerCase());
    if (!slug) return { error: 'Identificador inválido: use letras minúsculas, números e hífen (ex.: gazeta-out26).' };
    const name = String(b.name || '').trim().slice(0, 120);
    if (!name) return { error: 'Informe o nome da campanha.' };
    const utm = {};
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const v = String(b.default_utm?.[k] || '').trim().slice(0, 100);
      if (v) utm[k] = v;
    }
    const landing = ['page', 'cta', 'review'].includes(b.landing) ? b.landing : 'page';
    const code = String(b.short_code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || null;
    const date = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d || '') ? d : null);
    return {
      slug, name, channel: CHANNELS.includes(b.channel) ? b.channel : 'outro', short_code: code, default_utm: utm, landing,
      landing_cta: landing === 'cta' ? String(b.landing_cta || '') || null : null,
      landing_store: landing === 'review' ? cleanSlug(b.landing_store) : null,
      starts_at: date(b.starts_at), ends_at: date(b.ends_at), notes: String(b.notes || '').slice(0, 500) || null,
      is_active: b.is_active !== false,
    };
  }
  const CF = ['slug', 'name', 'channel', 'short_code', 'default_utm', 'landing', 'landing_cta', 'landing_store', 'starts_at', 'ends_at', 'notes', 'is_active'];
  app.post('/admin/api/campaigns', adminOnly, async (req, reply) => {
    const c = campaignInput(req.body || {}); if (c.error) return reply.code(400).send(c);
    if (await db.one('SELECT 1 AS x FROM campaigns WHERE slug=$1', [c.slug])) return reply.code(400).send({ error: 'Já existe uma campanha com esse identificador.' });
    const r = await db.one(`INSERT INTO campaigns(${CF.join(',')},created_by) VALUES($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [...CF.map(f => f === 'default_utm' ? JSON.stringify(c[f]) : c[f]), req.user.id]);
    await audit(req, 'criou', 'campanha', r.slug, c);
    return r;
  });
  app.put('/admin/api/campaigns/:id', adminOnly, async (req, reply) => {
    const before = await db.one('SELECT * FROM campaigns WHERE id=$1', [Number(req.params.id)]);
    if (!before) return reply.code(404).send({ error: 'Campanha não encontrada' });
    const c = campaignInput({ ...before, ...req.body, slug: before.slug }); if (c.error) return reply.code(400).send(c);
    const r = await db.one(`UPDATE campaigns SET name=$2, channel=$3, short_code=$4, default_utm=$5::jsonb, landing=$6, landing_cta=$7, landing_store=$8,
      starts_at=$9, ends_at=$10, notes=$11, is_active=$12, updated_at=now() WHERE id=$1 RETURNING *`,
      [before.id, c.name, c.channel, c.short_code, JSON.stringify(c.default_utm), c.landing, c.landing_cta, c.landing_store, c.starts_at, c.ends_at, c.notes, c.is_active]);
    await audit(req, 'alterou', 'campanha', r.slug, changes(before, c, CF.slice(1)));
    return r;
  });
  app.delete('/admin/api/campaigns/:id', adminOnly, async (req, reply) => {
    const before = await db.one('SELECT * FROM campaigns WHERE id=$1', [Number(req.params.id)]);
    if (!before) return reply.code(404).send({ error: 'Campanha não encontrada' });
    await db.query('DELETE FROM campaigns WHERE id=$1', [before.id]);
    await audit(req, 'excluiu', 'campanha', before.slug, { nome: before.name, canal: before.channel, codigo: before.short_code });
    return { ok: true };
  });
  app.get('/admin/api/qr', anyRole, async (req, reply) => {
    const p = String(req.query.path || '');
    if (!/^\/(c|avaliar)\/[a-z0-9-]{1,60}$/.test(p) && p !== '/') return reply.code(400).send({ error: 'Caminho inválido' });
    const png = await QRCode.toBuffer(config.appUrl + p, { width: 900, margin: 2, errorCorrectionLevel: 'M' });
    reply.header('content-disposition', `attachment; filename="qr${p.replace(/\//g, '-') || '-home'}.png"`);
    return reply.type('image/png').send(png);
  });

  // ---------- Atalhos ----------
  app.get('/admin/api/ctas', anyRole, async () => {
    const ctas = await db.all('SELECT * FROM ctas ORDER BY sort_order, id');
    const dest = await db.all('SELECT * FROM cta_destinations ORDER BY id');
    for (const c of ctas) c.destinations = dest.filter(d => d.cta_id === c.id);
    return ctas;
  });
  const CTAF = ['label', 'subtitle', 'style', 'sort_order', 'url', 'wa_message', 'distribution', 'hours', 'outside_hours_msg', 'is_active', 'show_call', 'opens_stores'];
  app.put('/admin/api/ctas/:id', adminOnly, async (req, reply) => {
    const before = await db.one('SELECT * FROM ctas WHERE id=$1', [Number(req.params.id)]);
    if (!before) return reply.code(404).send({ error: 'Atalho não encontrado' });
    const b = req.body || {};
    const v = {
      label: String(b.label ?? before.label).trim().slice(0, 80) || before.label,
      subtitle: b.subtitle === undefined ? before.subtitle : (String(b.subtitle).slice(0, 120) || null),
      style: ['primary', 'highlight', 'dark', 'light'].includes(b.style) ? b.style : before.style,
      sort_order: Number.isInteger(b.sort_order) ? b.sort_order : before.sort_order,
      url: before.type === 'url' ? String(b.url ?? before.url) : null,
      wa_message: before.type.startsWith('whatsapp') ? String(b.wa_message ?? before.wa_message ?? '').slice(0, 500) : null,
      distribution: ['round_robin', 'weighted', 'first'].includes(b.distribution) ? b.distribution : before.distribution,
      hours: b.hours === undefined ? before.hours : (b.hours && typeof b.hours === 'object' ? b.hours : null),
      outside_hours_msg: b.outside_hours_msg === undefined ? before.outside_hours_msg : String(b.outside_hours_msg).slice(0, 200),
      is_active: typeof b.is_active === 'boolean' ? b.is_active : before.is_active,
      show_call: before.type === 'whatsapp_tel' && typeof b.show_call === 'boolean' ? b.show_call : before.show_call,
      opens_stores: before.type === 'url' && typeof b.opens_stores === 'boolean' ? b.opens_stores : before.opens_stores,
    };
    if (before.type === 'url' && !/^https:\/\/[^\s]+$/.test(v.url)) return reply.code(400).send({ error: 'O destino precisa começar com https://' });
    if (v.hours) {
      for (const [d, slots] of Object.entries(v.hours)) {
        if (!/^[0-6]$/.test(d) || !Array.isArray(slots) || slots.some(s => !Array.isArray(s) || s.length !== 2 || s.some(t => !/^\d{2}:\d{2}$/.test(t)))) {
          return reply.code(400).send({ error: 'Horário inválido.' });
        }
      }
    }
    await db.query(`UPDATE ctas SET label=$2, subtitle=$3, style=$4, sort_order=$5, url=$6, wa_message=$7, distribution=$8, hours=$9::jsonb,
      outside_hours_msg=$10, is_active=$11, show_call=$12, opens_stores=$13, updated_at=now() WHERE id=$1`,
      [before.id, v.label, v.subtitle, v.style, v.sort_order, v.url, v.wa_message, v.distribution, v.hours ? JSON.stringify(v.hours) : null, v.outside_hours_msg, v.is_active, v.show_call, v.opens_stores]);
    if (Array.isArray(b.destinations) && before.type !== 'url') {
      const list = b.destinations.slice(0, 10).map(d => ({
        id: Number(d.id) || null, label: String(d.label || '').slice(0, 60), phone: String(d.phone_e164 || '').replace(/[^\d+]/g, ''),
        weight: Math.max(0, Math.min(100, Number(d.weight) || 1)), is_active: d.is_active !== false,
      }));
      for (const d of list) if (!/^\+55\d{10,11}$/.test(d.phone)) return reply.code(400).send({ error: `Telefone inválido: ${d.phone || '(vazio)'}. Use o formato +5528999999999.` });
      const old = await db.all('SELECT * FROM cta_destinations WHERE cta_id=$1', [before.id]);
      const keep = new Set(list.filter(d => d.id).map(d => d.id));
      for (const o of old) if (!keep.has(o.id)) await db.query('DELETE FROM cta_destinations WHERE id=$1', [o.id]);
      for (const d of list) {
        if (d.id && old.some(o => o.id === d.id)) await db.query('UPDATE cta_destinations SET label=$2, phone_e164=$3, weight=$4, is_active=$5 WHERE id=$1', [d.id, d.label, d.phone, d.weight, d.is_active]);
        else await db.query('INSERT INTO cta_destinations(cta_id,label,phone_e164,weight,is_active) VALUES($1,$2,$3,$4,$5)', [before.id, d.label, d.phone, d.weight, d.is_active]);
      }
      const diff = JSON.stringify(old.map(o => [o.label, o.phone_e164, o.is_active])) !== JSON.stringify(list.map(o => [o.label, o.phone, o.is_active]));
      if (diff) await audit(req, 'alterou_numeros', 'atalho', before.key, { de: old.map(o => o.phone_e164), para: list.map(o => o.phone) });
    }
    const ch = changes(before, v, CTAF);
    if (ch) await audit(req, 'alterou', 'atalho', before.key, ch);
    return { ok: true };
  });

  // ---------- Lojas ----------
  app.get('/admin/api/stores', anyRole, async () => db.all('SELECT * FROM stores ORDER BY sort_order, id'));
  app.put('/admin/api/stores/:id', adminOnly, async (req, reply) => {
    const before = await db.one('SELECT * FROM stores WHERE id=$1', [Number(req.params.id)]);
    if (!before) return reply.code(404).send({ error: 'Loja não encontrada' });
    const b = req.body || {};
    const url = (u, cur) => (u === undefined ? cur : (u ? String(u).trim() : null));
    const v = {
      name: String(b.name ?? before.name).trim().slice(0, 80), city: String(b.city ?? before.city).trim().slice(0, 80),
      address: b.address === undefined ? before.address : String(b.address).slice(0, 200),
      phone: b.phone === undefined ? before.phone : (String(b.phone).trim().slice(0, 30) || null),
      hours_text: b.hours_text === undefined ? before.hours_text : (String(b.hours_text).trim().slice(0, 120) || null),
      google_place_id: b.google_place_id === undefined ? before.google_place_id : (String(b.google_place_id).trim() || null),
      maps_url: url(b.maps_url, before.maps_url), review_url: url(b.review_url, before.review_url), reviews_url: url(b.reviews_url, before.reviews_url),
      rating: b.rating === undefined ? before.rating : (b.rating === '' || b.rating === null ? null : Number(b.rating)),
      rating_count: b.rating_count === undefined ? before.rating_count : (b.rating_count === '' || b.rating_count === null ? null : parseInt(b.rating_count, 10)),
      status: ['active', 'coming_soon', 'hidden'].includes(b.status) ? b.status : before.status,
      sort_order: Number.isInteger(b.sort_order) ? b.sort_order : before.sort_order,
    };
    // Place ID preenche os links automaticamente
    if (b.google_place_id && b.google_place_id !== before.google_place_id) {
      const id = encodeURIComponent(v.google_place_id);
      v.maps_url = `https://www.google.com/maps/place/?q=place_id:${id}`;
      v.review_url = `https://search.google.com/local/writereview?placeid=${id}`;
      v.reviews_url = `https://search.google.com/local/reviews?placeid=${id}`;
    }
    for (const k of ['maps_url', 'review_url', 'reviews_url']) if (v[k] && !/^https:\/\/[^\s]+$/.test(v[k])) return reply.code(400).send({ error: 'Os links precisam começar com https://' });
    if (v.rating != null && (isNaN(v.rating) || v.rating < 1 || v.rating > 5)) return reply.code(400).send({ error: 'Nota deve ficar entre 1 e 5.' });
    if (v.status === 'active' && !v.review_url && !v.maps_url) return reply.code(400).send({ error: 'Loja ativa precisa de pelo menos um link do Google.' });
    const ratingChanged = String(v.rating) !== String(before.rating) || v.rating_count !== before.rating_count;
    await db.query(`UPDATE stores SET name=$2, city=$3, address=$4, google_place_id=$5, maps_url=$6, review_url=$7, reviews_url=$8, rating=$9,
      rating_count=$10, status=$11, sort_order=$12, rating_updated_at = CASE WHEN $13 THEN now() ELSE rating_updated_at END, phone=$14, hours_text=$15, updated_at=now() WHERE id=$1`,
      [before.id, v.name, v.city, v.address, v.google_place_id, v.maps_url, v.review_url, v.reviews_url, v.rating, v.rating_count, v.status, v.sort_order, ratingChanged, v.phone, v.hours_text]);
    if (ratingChanged && v.rating != null) await db.query('INSERT INTO store_rating_history(store_id,rating,rating_count) VALUES($1,$2,$3)', [before.id, v.rating, v.rating_count]);
    const ch = changes({ ...before, rating: before.rating == null ? null : Number(before.rating) }, v, Object.keys(v));
    if (ch) await audit(req, 'alterou', 'loja', before.slug, ch);
    return { ok: true };
  });
  app.get('/admin/api/stores/:id/history', anyRole, async (req) =>
    db.all('SELECT recorded_at, rating, rating_count FROM store_rating_history WHERE store_id=$1 ORDER BY recorded_at', [Number(req.params.id)]));

  // ---------- Usuários ----------
  app.get('/admin/api/users', adminOnly, async () =>
    db.all('SELECT id,name,email,role,status,totp_enabled,last_login_at,created_at,locked_until FROM users ORDER BY created_at'));
  app.post('/admin/api/users', adminOnly, async (req, reply) => {
    const b = req.body || {};
    const email = String(b.email || '').toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply.code(400).send({ error: 'E-mail inválido.' });
    const prob = passwordProblem(b.password); if (prob) return reply.code(400).send({ error: prob });
    if (await db.one('SELECT 1 AS x FROM users WHERE email=$1', [email])) return reply.code(400).send({ error: 'Já existe um usuário com esse e-mail.' });
    const role = b.role === 'admin' ? 'admin' : 'viewer';
    const r = await db.one('INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id', [String(b.name || email).slice(0, 80), email, await hashPassword(b.password), role]);
    await audit(req, 'criou', 'usuario', r.id, { email, role });
    return { id: r.id };
  });
  app.put('/admin/api/users/:id', adminOnly, async (req, reply) => {
    const id = Number(req.params.id);
    const before = await db.one('SELECT * FROM users WHERE id=$1', [id]);
    if (!before) return reply.code(404).send({ error: 'Usuário não encontrado' });
    const b = req.body || {};
    const v = {
      name: String(b.name ?? before.name).slice(0, 80),
      role: ['admin', 'viewer'].includes(b.role) ? b.role : before.role,
      status: ['active', 'blocked'].includes(b.status) ? b.status : before.status,
    };
    if (id === req.user.id && (v.role !== 'admin' || v.status !== 'active')) return reply.code(400).send({ error: 'Você não pode remover o próprio acesso de administrador.' });
    if (before.role === 'admin' && (v.role !== 'admin' || v.status !== 'active')) {
      const { n } = await db.one("SELECT count(*)::int AS n FROM users WHERE role='admin' AND status='active' AND id<>$1", [id]);
      if (n === 0) return reply.code(400).send({ error: 'É preciso manter pelo menos um administrador ativo.' });
    }
    await db.query('UPDATE users SET name=$2, role=$3, status=$4, updated_at=now() WHERE id=$1', [id, v.name, v.role, v.status]);
    if (b.password) {
      const prob = passwordProblem(b.password); if (prob) return reply.code(400).send({ error: prob });
      await db.query('UPDATE users SET password_hash=$2, failed_attempts=0, locked_until=NULL WHERE id=$1', [id, await hashPassword(b.password)]);
      await audit(req, 'redefiniu_senha', 'usuario', id);
    }
    if (b.unlock) await db.query('UPDATE users SET failed_attempts=0, locked_until=NULL WHERE id=$1', [id]);
    if (b.reset2fa) { await db.query('UPDATE users SET totp_enabled=false, totp_secret_enc=NULL WHERE id=$1', [id]); await audit(req, 'redefiniu_2fa', 'usuario', id); }
    if (v.status === 'blocked' || b.password || b.reset2fa) await db.query('UPDATE admin_sessions SET revoked_at=now() WHERE user_id=$1 AND revoked_at IS NULL', [id]);
    const ch = changes(before, v, ['name', 'role', 'status']);
    if (ch) await audit(req, 'alterou', 'usuario', id, ch);
    return { ok: true };
  });

  // ---------- Auditoria e configurações ----------
  app.get('/admin/api/audit', adminOnly, async (req) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const rows = await db.all(`SELECT id, created_at, user_email, action, entity, entity_id, diff, ip_prefix FROM audit_log ORDER BY id DESC LIMIT 50 OFFSET ${(page - 1) * 50}`);
    const { n } = await db.one('SELECT count(*)::int AS n FROM audit_log');
    return { rows, total: n, page };
  });
  app.get('/admin/api/settings', adminOnly, async () => ({
    retention_days: await getSetting('retention_days', 180),
    internal_ips: await getSetting('internal_ips', []),
    page: await getSetting('page', {}),
    your_ip: null,
    consent: await db.all("SELECT choice, sum(count)::int AS n FROM consent_stats WHERE day > now() - interval '30 days' GROUP BY 1"),
    require2fa: config.require2fa, db: db.kind,
  }));
  app.get('/admin/api/my-ip', adminOnly, async (req) => ({ ip: req.ip }));
  app.put('/admin/api/settings', adminOnly, async (req, reply) => {
    const b = req.body || {};
    const before = { retention_days: await getSetting('retention_days'), internal_ips: await getSetting('internal_ips'), page: await getSetting('page') };
    if (b.retention_days !== undefined) {
      const n = Number(b.retention_days);
      if (!Number.isInteger(n) || n < 30 || n > 730) return reply.code(400).send({ error: 'Retenção entre 30 e 730 dias.' });
      await setSetting('retention_days', n, req.user.id);
    }
    if (Array.isArray(b.internal_ips)) {
      const ips = b.internal_ips.map(s => String(s).trim()).filter(Boolean).slice(0, 50);
      if (ips.some(ip => !/^[0-9a-fA-F:.]+\*?$/.test(ip))) return reply.code(400).send({ error: 'IP inválido na lista.' });
      await setSetting('internal_ips', ips, req.user.id); invalidateInternalCache();
    }
    if (b.page && typeof b.page === 'object') {
      const p = {};
      for (const k of ['intro', 'footer', 'privacy_contact', 'reviews_title', 'reviews_text']) p[k] = String(b.page[k] ?? before.page?.[k] ?? '').slice(0, 300);
      await setSetting('page', p, req.user.id);
    }
    const after = { retention_days: await getSetting('retention_days'), internal_ips: await getSetting('internal_ips'), page: await getSetting('page') };
    const ch = changes(before, after, ['retention_days', 'internal_ips', 'page']);
    if (ch) await audit(req, 'alterou', 'configuracoes', null, ch);
    return { ok: true };
  });
}
