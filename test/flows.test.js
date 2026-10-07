// Testes dos fluxos principais: rastreamento, campanhas, privacidade, permissões e segurança.
// Rodar: npm test   (usa banco em memória; não toca nos seus dados)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'divan-test-'));
process.env.DATA_DIR = tmp;
process.env.ADMIN_EMAIL = 'admin@teste.com';
process.env.ADMIN_PASSWORD = 'SenhaForte123';
process.env.REQUIRE_2FA = 'true';
process.env.APP_URL = 'http://localhost:3000';

const { initDb, db, setSetting } = await import('../src/db.js');
const { seed } = await import('../src/seed.js');
const { buildApp } = await import('../src/app.js');
const { totpCode } = await import('../src/auth.js');
const { rollup, applyRetention } = await import('../src/jobs.js');
const { invalidateInternalCache } = await import('../src/tracking.js');

let app;
const PHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
let ipSeq = 10;
const visitor = () => ({ 'user-agent': PHONE_UA, 'x-forwarded-for': `200.150.10.${ipSeq++}` });
const lastEvent = (type) => db.one('SELECT * FROM events WHERE event_type=$1 ORDER BY id DESC LIMIT 1', [type]);

before(async () => {
  await initDb({ memory: !process.env.TEST_DATABASE_URL });
  await seed();
  app = await buildApp({ logger: false });
});
after(async () => { await app.close(); await db.close(); fs.rmSync(tmp, { recursive: true, force: true }); });

test('página pública abre, registra o acesso e não usa cache', async () => {
  const r = await app.inject({ url: '/', headers: visitor() });
  assert.equal(r.statusCode, 200);
  assert.match(r.body, /ACESSE AS OFERTAS DA SEMANA/);
  assert.match(r.body, /LOJAS|Lojas e contatos/);
  assert.match(r.headers['cache-control'], /no-store/);
  assert.ok(await lastEvent('page_view'));
});

test('clique em Televendas registra no servidor e abre o WhatsApp certo', async () => {
  const r = await app.inject({ url: '/r/televendas', headers: visitor() });
  assert.equal(r.statusCode, 302);
  assert.match(r.headers.location, /^https:\/\/wa\.me\/5528999384184\?text=/);
  const e = await lastEvent('cta_click');
  assert.equal(e.cta_key, 'televendas');
  assert.equal(e.channel, 'televendas');
  assert.equal(e.destination_type, 'whatsapp');
  assert.equal(e.device_type, 'mobile');
});

test('ligação vem desligada: sem botão na página e via=tel abre o WhatsApp', async () => {
  const page = await app.inject({ url: '/', headers: visitor() });
  assert.ok(!page.body.includes('btn-call'));
  const r = await app.inject({ url: '/r/assistencia?via=tel', headers: visitor() });
  assert.match(r.headers.location, /^https:\/\/wa\.me\//);
});

test('menu Lojas e contatos lista as 7 lojas com endereço, telefone, Maps e avaliação', async () => {
  const page = await app.inject({ url: '/', headers: visitor() });
  assert.match(page.body, /<details class="menu" id="lojas"/);
  assert.equal((page.body.match(/<details class="st"/g) || []).length, 7);
  assert.match(page.body, /Rodovia do Sol, 3076/);
  assert.match(page.body, /\(28\) 99977-9158/);
  assert.match(page.body, /\/rota\/anchieta/);
  assert.ok(!page.body.includes('/avaliar/anchieta'), 'Anchieta sem link de avaliação até ter Place ID');
  assert.ok(!page.body.includes('Nossas lojas'), 'lista antiga removida');
  const h = visitor();
  await app.inject({ method: 'POST', url: '/api/e', headers: { ...h, 'content-type': 'text/plain' }, payload: JSON.stringify({ t: 'menu_open', k: 'lojas' }) });
  const e = await lastEvent('cta_click');
  assert.equal(e.cta_key, 'lojas'); assert.equal(e.destination_type, 'menu');
  await app.inject({ method: 'POST', url: '/api/e', headers: { ...h, 'content-type': 'text/plain' }, payload: JSON.stringify({ t: 'store_view', s: 'anchieta' }) });
  assert.equal((await lastEvent('store_view')).store_slug, 'anchieta');
  const r = await app.inject({ url: '/rota/anchieta', headers: visitor() });
  assert.match(r.headers.location, /google\.com\/maps\/search/);
});

test('opção Ligar (quando ativada no painel) gera tel: e evento de ligação', async () => {
  await db.query("UPDATE ctas SET show_call=true WHERE key='assistencia'");
  const page = await app.inject({ url: '/', headers: visitor() });
  assert.ok(page.body.includes('btn-call'));
  const r = await app.inject({ url: '/r/assistencia?via=tel', headers: visitor() });
  assert.equal(r.headers.location, 'tel:+5528999625197');
  assert.equal((await lastEvent('call_click')).cta_key, 'assistencia');
});

test('link de campanha preserva campanha e UTM até o clique e põe o código na mensagem', async () => {
  await db.query(`INSERT INTO campaigns(slug,name,channel,short_code,default_utm) VALUES('gazeta-out26','Gazeta','jornal','GZ26','{"utm_source":"agazeta","utm_medium":"banner"}')`);
  const h = visitor();
  const r1 = await app.inject({ url: '/c/gazeta-out26', headers: h });
  assert.equal(r1.statusCode, 302);
  const loc = new URL(r1.headers.location, 'http://x');
  assert.equal(loc.pathname, '/');
  assert.equal(loc.searchParams.get('cmp'), 'gazeta-out26');
  assert.equal(loc.searchParams.get('utm_source'), 'agazeta');
  assert.equal(loc.searchParams.get('utm_medium'), 'banner');
  const hit = await lastEvent('campaign_hit');
  assert.equal(hit.campaign_slug, 'gazeta-out26');
  assert.equal(hit.traffic_source, 'agazeta');
  const page = await app.inject({ url: r1.headers.location, headers: h });
  assert.match(page.body, /\/r\/televendas\?cmp=gazeta-out26&amp;utm_/);
  const r2 = await app.inject({ url: '/r/televendas?cmp=gazeta-out26&utm_source=agazeta&utm_medium=banner', headers: h });
  assert.match(decodeURIComponent(r2.headers.location), /\[GZ26\]/);
  const e = await lastEvent('cta_click');
  assert.equal(e.campaign_slug, 'gazeta-out26');
  assert.equal(e.utm_source, 'agazeta');
  assert.equal(e.session_id, hit.session_id, 'mesma sessão da entrada até o clique');
});

test('UTMs são repassadas ao site da Divan', async () => {
  const r = await app.inject({ url: '/r/ofertas?utm_source=instagram&utm_medium=stories', headers: visitor() });
  assert.equal(r.headers.location, 'https://www.divanmoveis.com.br/campanha?utm_source=instagram&utm_medium=stories');
  const r2 = await app.inject({ url: '/r/site', headers: visitor() });
  assert.match(r2.headers.location, /utm_source=links_divan/);
});

test('campanha desativada ou inexistente leva à página, sem erro', async () => {
  await db.query(`INSERT INTO campaigns(slug,name,is_active) VALUES('velha','Velha',false)`);
  assert.equal((await app.inject({ url: '/c/velha', headers: visitor() })).headers.location, '/');
  assert.equal((await app.inject({ url: '/c/nao-existe', headers: visitor() })).headers.location, '/');
});

test('sem redirecionamento aberto: destino só vem do cadastro', async () => {
  const r = await app.inject({ url: '/r/https%3A%2F%2Fevil.com', headers: visitor() });
  assert.equal(r.headers.location, '/');
  const r2 = await app.inject({ url: '/c/x?go=https://evil.com', headers: visitor() });
  assert.equal(r2.headers.location, '/');
});

test('rota e avaliação por loja', async () => {
  const r = await app.inject({ url: '/avaliar/guacui', headers: visitor() });
  assert.match(r.headers.location, /writereview\?placeid=ChIJGdKCFQiTuwARD8tFXmBJR7U/);
  assert.equal((await lastEvent('review_click')).store_slug, 'guacui');
  const r2 = await app.inject({ url: '/rota/bnh', headers: visitor() });
  assert.match(r2.headers.location, /maps\/place/);
  const r3 = await app.inject({ url: '/avaliar/anchieta', headers: visitor() });
  assert.equal(r3.headers.location, '/#lojas', 'loja sem link de avaliação volta para a lista');
});

test('prévias de link e robôs ficam marcados e fora dos relatórios', async () => {
  for (const ua of ['facebookexternalhit/1.1', 'WhatsApp/2.23.20.0', 'curl/8.0']) {
    await app.inject({ url: '/r/televendas', headers: { 'user-agent': ua, 'x-forwarded-for': '1.2.3.4' } });
    assert.equal((await lastEvent('cta_click')).is_bot, true, ua);
  }
});

test('clique repetido em menos de 10 s é marcado como duplicado', async () => {
  const h = visitor();
  await app.inject({ url: '/r/site', headers: h });
  await app.inject({ url: '/r/site', headers: h });
  const rows = await db.all("SELECT is_dup FROM events WHERE event_type='cta_click' AND cta_key='site' ORDER BY id DESC LIMIT 2");
  assert.deepEqual(rows.map(r => r.is_dup), [true, false]);
});

test('IP interno fica fora dos relatórios', async () => {
  await setSetting('internal_ips', ['10.0.0.*']); invalidateInternalCache();
  await app.inject({ url: '/r/site', headers: { 'user-agent': PHONE_UA, 'x-forwarded-for': '10.0.0.7' } });
  assert.equal((await lastEvent('cta_click')).is_internal, true);
});

test('LGPD: nenhum IP é gravado no banco', async () => {
  const dump = JSON.stringify([
    await db.all('SELECT * FROM events'), await db.all('SELECT * FROM visitor_sessions'),
  ]);
  for (const ip of ['200.150.10.11', '200.150.10.12', '1.2.3.4', '10.0.0.7']) assert.ok(!dump.includes(ip), `IP ${ip} encontrado`);
  assert.ok(!dump.includes('iPhone; CPU'), 'user-agent bruto não deve ser gravado');
});

test('visualização de botões pelo beacon aceita só botões válidos', async () => {
  const r = await app.inject({ method: 'POST', url: '/api/e', headers: { ...visitor(), 'content-type': 'text/plain' }, payload: JSON.stringify({ t: 'cta_impression', k: ['televendas', 'inexistente'] }) });
  assert.equal(r.statusCode, 204);
  const rows = await db.all("SELECT cta_key FROM events WHERE event_type='cta_impression'");
  assert.deepEqual(rows.map(r => r.cta_key), ['televendas']);
});

// ---------- Painel ----------
function cookieFrom(res) { const c = res.headers['set-cookie']; return (Array.isArray(c) ? c[0] : c).split(';')[0]; }
const H = (cookie) => ({ cookie, 'x-dv': '1', 'content-type': 'application/json' });

let adminCookie;
test('login de admin exige configurar 2FA e só libera com código válido', async () => {
  const bad = await app.inject({ method: 'POST', url: '/admin/api/login', headers: H(''), payload: { email: 'admin@teste.com', password: 'errada' } });
  assert.equal(bad.statusCode, 401);
  const r = await app.inject({ method: 'POST', url: '/admin/api/login', headers: H(''), payload: { email: 'admin@teste.com', password: 'SenhaForte123' } });
  assert.equal(r.json().stage, 'setup_2fa');
  const c = cookieFrom(r);
  assert.equal((await app.inject({ url: '/admin/api/dashboard', headers: { cookie: c } })).statusCode, 401, 'sem 2FA não acessa');
  const setup = await app.inject({ url: '/admin/api/2fa/setup', headers: { cookie: c } });
  const { secret } = setup.json();
  assert.equal((await app.inject({ method: 'POST', url: '/admin/api/2fa/enable', headers: H(c), payload: { code: '000000' } })).statusCode, 400);
  const ok = await app.inject({ method: 'POST', url: '/admin/api/2fa/enable', headers: H(c), payload: { code: totpCode(secret) } });
  assert.equal(ok.json().stage, 'full');
  adminCookie = c;
  // novo login passa a pedir o código
  const r2 = await app.inject({ method: 'POST', url: '/admin/api/login', headers: H(''), payload: { email: 'admin@teste.com', password: 'SenhaForte123' } });
  assert.equal(r2.json().stage, 'pending_2fa');
  const c2 = cookieFrom(r2);
  const v = await app.inject({ method: 'POST', url: '/admin/api/login/2fa', headers: H(c2), payload: { code: totpCode(secret) } });
  assert.equal(v.json().stage, 'full');
});

test('proteção CSRF: alteração sem cabeçalho próprio ou de outra origem é recusada', async () => {
  const r = await app.inject({ method: 'PUT', url: '/admin/api/settings', headers: { cookie: adminCookie, 'content-type': 'application/json' }, payload: { retention_days: 90 } });
  assert.equal(r.statusCode, 403);
  const r2 = await app.inject({ method: 'PUT', url: '/admin/api/settings', headers: { ...H(adminCookie), origin: 'https://evil.com' }, payload: { retention_days: 90 } });
  assert.equal(r2.statusCode, 403);
});

let viewerCookie;
test('perfis: visualizador consulta, mas não altera nem vê telas de admin', async () => {
  const cr = await app.inject({ method: 'POST', url: '/admin/api/users', headers: H(adminCookie), payload: { name: 'Ana', email: 'ana@divan.com', password: 'Visualiza123', role: 'viewer' } });
  assert.equal(cr.statusCode, 200);
  const r = await app.inject({ method: 'POST', url: '/admin/api/login', headers: H(''), payload: { email: 'ana@divan.com', password: 'Visualiza123' } });
  assert.equal(r.json().stage, 'full', 'visualizador sem 2FA obrigatório');
  viewerCookie = cookieFrom(r);
  assert.equal((await app.inject({ url: '/admin/api/dashboard', headers: { cookie: viewerCookie } })).statusCode, 200);
  assert.equal((await app.inject({ url: '/admin/api/events', headers: { cookie: viewerCookie } })).statusCode, 200);
  assert.equal((await app.inject({ method: 'PUT', url: '/admin/api/ctas/1', headers: H(viewerCookie), payload: { label: 'x' } })).statusCode, 403);
  assert.equal((await app.inject({ url: '/admin/api/users', headers: { cookie: viewerCookie } })).statusCode, 403);
  assert.equal((await app.inject({ url: '/admin/api/audit', headers: { cookie: viewerCookie } })).statusCode, 403);
  assert.equal((await app.inject({ method: 'POST', url: '/admin/api/campaigns', headers: H(viewerCookie), payload: { slug: 'x', name: 'x' } })).statusCode, 403);
});

test('bloqueio após 5 senhas erradas', async () => {
  for (let i = 0; i < 5; i++) await app.inject({ method: 'POST', url: '/admin/api/login', headers: { ...H(''), 'x-forwarded-for': `9.9.9.${i}` }, payload: { email: 'ana@divan.com', password: 'errada' } });
  const r = await app.inject({ method: 'POST', url: '/admin/api/login', headers: { ...H(''), 'x-forwarded-for': '9.9.9.9' }, payload: { email: 'ana@divan.com', password: 'Visualiza123' } });
  assert.equal(r.statusCode, 401);
  assert.match(r.json().error, /bloquead|tentativas/i);
});

test('admin altera número do Televendas e o próximo clique já usa o novo número; fica na auditoria', async () => {
  const ctas = (await app.inject({ url: '/admin/api/ctas', headers: { cookie: adminCookie } })).json();
  const tv = ctas.find(c => c.key === 'televendas');
  const r = await app.inject({ method: 'PUT', url: `/admin/api/ctas/${tv.id}`, headers: H(adminCookie), payload: { destinations: [{ id: tv.destinations[0].id, label: 'Televendas', phone_e164: '+5528999257165', weight: 1, is_active: true }] } });
  assert.equal(r.statusCode, 200);
  const c = await app.inject({ url: '/r/televendas', headers: visitor() });
  assert.match(c.headers.location, /wa\.me\/5528999257165/);
  const audit = await db.one("SELECT * FROM audit_log WHERE action='alterou_numeros' ORDER BY id DESC LIMIT 1");
  assert.ok(audit && audit.user_email === 'admin@teste.com');
  const bad = await app.inject({ method: 'PUT', url: `/admin/api/ctas/${tv.id}`, headers: H(adminCookie), payload: { destinations: [{ phone_e164: '123' }] } });
  assert.equal(bad.statusCode, 400);
});

test('dashboard soma só cliques válidos (sem robôs, internos e duplicados)', async () => {
  const d = (await app.inject({ url: '/admin/api/dashboard', headers: { cookie: adminCookie } })).json();
  const valid = await db.one("SELECT count(*)::int n FROM events WHERE event_type IN ('cta_click','call_click') AND NOT is_bot AND NOT is_internal AND NOT is_dup");
  assert.equal(d.kpis.contact_clicks, valid.n);
  assert.ok(d.noise.bots >= 3 && d.noise.dups >= 1 && d.noise.internal >= 1);
  const gz = d.byCampaign.find(c => c.slug === 'gazeta-out26');
  assert.equal(gz.clicks, 1);
});

test('exportação CSV abre no Excel (BOM, ponto e vírgula) e fica na auditoria', async () => {
  const r = await app.inject({ url: '/admin/api/export.csv?kind=events', headers: { cookie: adminCookie } });
  assert.equal(r.statusCode, 200);
  assert.ok(r.body.startsWith('﻿data_hora;evento;'));
  assert.ok(await db.one("SELECT 1 x FROM audit_log WHERE action='exportou_csv'"));
  for (const k of ['daily', 'campaigns', 'stores']) assert.equal((await app.inject({ url: `/admin/api/export.csv?kind=${k}`, headers: { cookie: adminCookie } })).statusCode, 200);
});

test('retenção: consolida e apaga eventos antigos, mantendo os totais', async () => {
  await db.query(`INSERT INTO events(occurred_at,event_type,visitor_hash,session_id) VALUES(now() - interval '400 days','page_view','d_x','00000000-0000-0000-0000-000000000001')`);
  await rollup();
  const res = await applyRetention();
  assert.ok(res.deletedEvents >= 1);
  assert.equal((await db.one("SELECT count(*)::int n FROM events WHERE occurred_at < now() - interval '399 days'")).n, 0);
  assert.equal((await db.one("SELECT count(*)::int n FROM daily_totals WHERE day < now() - interval '399 days'")).n, 1);
});

test('cabeçalhos de segurança presentes', async () => {
  const r = await app.inject({ url: '/', headers: visitor() });
  assert.match(r.headers['content-security-policy'], /default-src 'self'/);
  assert.equal(r.headers['x-frame-options'], 'DENY');
  const a = await app.inject({ url: '/admin' });
  assert.equal(a.headers['x-robots-tag'], 'noindex, nofollow');
});

test('admin exclui campanha: link vira página normal, histórico fica e vai para a auditoria', async () => {
  const cr = await app.inject({ method: 'POST', url: '/admin/api/campaigns', headers: H(adminCookie), payload: { slug: 'apagar-teste', name: 'Apagar', channel: 'instagram' } });
  assert.equal(cr.statusCode, 200);
  const id = cr.json().id;
  await app.inject({ url: '/c/apagar-teste', headers: visitor() });
  const before = await db.one("SELECT count(*)::int n FROM events WHERE campaign_slug='apagar-teste'");
  assert.ok(before.n >= 1);
  assert.equal((await app.inject({ method: 'DELETE', url: `/admin/api/campaigns/${id}`, headers: { cookie: viewerCookie, 'x-dv': '1' } })).statusCode, 403);
  assert.equal((await app.inject({ method: 'DELETE', url: `/admin/api/campaigns/${id}`, headers: { cookie: adminCookie, 'x-dv': '1' } })).statusCode, 200);
  assert.equal((await app.inject({ method: 'DELETE', url: `/admin/api/campaigns/${id}`, headers: { cookie: adminCookie, 'x-dv': '1' } })).statusCode, 404);
  assert.ok(!(await db.one("SELECT 1 x FROM campaigns WHERE slug='apagar-teste'")));
  const after = await db.one("SELECT count(*)::int n FROM events WHERE campaign_slug='apagar-teste'");
  assert.equal(after.n, before.n, 'histórico preservado');
  const r = await app.inject({ url: '/c/apagar-teste', headers: visitor() });
  assert.ok([200, 302].includes(r.statusCode));
  if (r.statusCode === 302) assert.equal(r.headers.location, '/');
  assert.ok(await db.one("SELECT 1 x FROM audit_log WHERE action='excluiu' AND entity_id='apagar-teste'"));
});
