// Gera dados FICTÍCIOS para demonstração do painel. Não use em produção.
// Uso: node scripts/demo-data.js  (com o servidor parado)
import crypto from 'node:crypto';
import { initDb, db } from '../src/db.js';
import { seed } from '../src/seed.js';
await initDb(); await seed();
if (process.argv[2] !== '--force' && (await db.one('SELECT count(*)::int n FROM events')).n > 50) { console.log('Já há eventos; use --force'); process.exit(0); }
await db.query(`INSERT INTO campaigns(slug,name,channel,short_code,default_utm,landing) VALUES
 ('gazeta-out26','A Gazeta · Aniversário','jornal','GZ26','{"utm_source":"agazeta","utm_medium":"banner","utm_campaign":"aniversario"}','page'),
 ('insta-stories-out','Stories Aniversário','instagram','IG10','{"utm_source":"instagram","utm_medium":"stories","utm_campaign":"aniversario"}','page'),
 ('qr-loja-guacui','QR caixa Guaçuí','qr_loja',NULL,'{}','review'),
 ('meta-ads-black','Meta Ads Esquenta Black','meta_ads','MB01','{"utm_source":"meta","utm_medium":"cpc","utm_campaign":"esquenta_black"}','cta')
 ON CONFLICT DO NOTHING`);
await db.query("UPDATE campaigns SET landing_store='guacui' WHERE slug='qr-loja-guacui'");
await db.query("UPDATE campaigns SET landing_cta='televendas' WHERE slug='meta-ads-black'");
const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const w = (pairs) => { const t = pairs.reduce((s, p) => s + p[1], 0); let r = Math.random() * t; for (const p of pairs) { r -= p[1]; if (r <= 0) return p[0]; } return pairs[0][0]; };
const ctas = [['televendas', 'televendas', 34], ['ofertas', 'ofertas', 22], ['lojas', 'lojas', 9], ['assistencia', 'assistencia', 12], ['site', 'site', 8]];
const stores = ['nova-brasilia', 'alto-novo-parque', 'guandu', 'bnh', 'marataizes', 'guacui'];
const geo = [[['ES', 'Cachoeiro de Itapemirim'], 40], [['ES', 'Vitória'], 22], [['ES', 'Marataízes'], 8], [['ES', 'Guaçuí'], 5], [['RJ', 'Rio de Janeiro'], 6], [['ES', null], 10], [[null, null], 9]];
let total = 0;
for (let d = 34; d >= 0; d--) {
  const base = 25 + Math.round(15 * Math.sin(d / 4)) + (d < 6 ? 30 : 0);
  for (let v = 0; v < base; v++) {
    const hour = w([[9, 6], [10, 8], [11, 9], [12, 7], [13, 6], [14, 7], [15, 9], [16, 12], [17, 11], [18, 8], [19, 9], [20, 10], [21, 8], [22, 4], [8, 3], [7, 1]]);
    const ts = new Date(Date.now() - d * 864e5); ts.setUTCHours(hour + 3, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
    if (ts > new Date()) continue;
    const camp = w([[null, 50], ['gazeta-out26', 12], ['insta-stories-out', 22], ['meta-ads-black', 10], ['qr-loja-guacui', 3]]);
    const src = camp === 'gazeta-out26' ? 'agazeta' : camp === 'insta-stories-out' ? 'instagram' : camp === 'meta-ads-black' ? 'meta' : camp === 'qr-loja-guacui' ? 'qr_loja' : w([['instagram', 40], ['direto', 25], ['whatsapp', 15], ['facebook', 10], ['google', 10]]);
    const device = w([['mobile', 86], ['desktop', 11], ['tablet', 3]]);
    const os = device === 'mobile' ? w([['Android 14', 55], ['iOS 18', 45]]) : 'Windows 10';
    const browser = src === 'instagram' ? 'Instagram (app)' : w([['Chrome', 60], ['Mobile Safari', 30], ['Samsung Browser', 10]]);
    const [uf, city] = w(geo);
    const sid = crypto.randomUUID(); const vh = 'd_' + crypto.randomBytes(8).toString('hex');
    const ins = async (type, extra = {}, offset = 0) => {
      total++;
      await db.query(`INSERT INTO events(occurred_at,event_type,session_id,visitor_hash,cta_key,channel,store_slug,campaign_slug,destination,destination_type,traffic_source,utm_source,device_type,os,browser,geo_uf,geo_city,consent_level,is_bot)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'none',$18)`,
        [new Date(ts.getTime() + offset * 1000), type, sid, vh, extra.cta || null, extra.ch || null, extra.store || null, camp, extra.dest || null, extra.dt || null, src, camp ? src : null, device, os, browser, uf, city, !!extra.bot]);
    };
    if (camp) await ins('campaign_hit');
    if (camp === 'qr-loja-guacui') { await ins('review_click', { cta: 'avaliar:guacui', ch: 'avaliacao', store: 'guacui', dest: 'Guaçuí', dt: 'review' }, 2); continue; }
    if (camp === 'meta-ads-black' && Math.random() < .6) { await ins('cta_click', { cta: 'televendas', ch: 'televendas', dest: 'Televendas: +5528999384184', dt: 'whatsapp' }, 1); continue; }
    await ins('session_start'); await ins('page_view', {}, 1);
    for (const [k] of ctas) await ins('cta_impression', { cta: k }, 2);
    if (Math.random() < 0.58) {
      const [k, ch] = w(ctas.map(c => [[c[0], c[1]], c[2]]));
      const phone = k === 'televendas' ? '+5528999384184' : k === 'assistencia' ? '+5528999625197' : null;
      const tel = phone && Math.random() < 0.12;
      await ins(tel ? 'call_click' : 'cta_click', { cta: k, ch, dest: phone ? (k === 'televendas' ? 'Televendas: ' : 'Assistência: ') + phone : null, dt: phone ? (tel ? 'tel' : 'whatsapp') : 'url' }, 8);
    }
    if (Math.random() < 0.10) { const s = rnd(stores); await ins('store_maps_click', { cta: 'rota:' + s, ch: 'rota', store: s, dest: s, dt: 'maps' }, 20); }
    if (Math.random() < 0.04) { const s = rnd(stores); await ins('review_click', { cta: 'avaliar:' + s, ch: 'avaliacao', store: s, dest: s, dt: 'review' }, 25); }
  }
  if (d === 5) for (let b = 0; b < 140; b++) { const ts = new Date(Date.now() - d * 864e5); ts.setUTCHours(19, b % 60); await db.query(`INSERT INTO events(occurred_at,event_type,visitor_hash,cta_key,traffic_source,device_type,is_bot) VALUES($1,'cta_click','bot','televendas','whatsapp','bot',true)`, [ts]); }
}
console.log('Eventos fictícios criados:', total);
await db.close();
