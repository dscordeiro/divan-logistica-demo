import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { db, getSetting, setSetting } from './db.js';
import { config } from './config.js';
import { hashPassword } from './auth.js';

const WEEK = { 1: [['08:00', '18:00']], 2: [['08:00', '18:00']], 3: [['08:00', '18:00']], 4: [['08:00', '18:00']], 5: [['08:00', '18:00']], 6: [['08:00', '12:00']] };

const CTAS = [
  { key: 'televendas', label: 'Falar com Televendas', subtitle: 'Atendimento pelo WhatsApp', icon: 'whatsapp', style: 'primary', sort_order: 1,
    type: 'whatsapp_tel', channel: 'televendas', hours: WEEK,
    wa_message: 'Olá! Vim pelo link da Divan e quero falar com o Televendas.{codigo}',
    outside_hours_msg: 'Fora do horário: deixe sua mensagem, respondemos no próximo atendimento.',
    phones: [['Televendas', '+5528999384184']] },
  { key: 'ofertas', label: 'ACESSE AS OFERTAS DA SEMANA', icon: 'tag', style: 'highlight', sort_order: 2,
    type: 'url', url: 'https://www.divanmoveis.com.br/campanha', channel: 'ofertas' },
  { key: 'lojas', label: 'Lojas e contatos', icon: 'store', style: 'dark', sort_order: 3,
    type: 'url', url: 'https://divanmoveis.com.br/pages/institucional/nossas-lojas', channel: 'lojas' },
  { key: 'assistencia', label: 'Assistência: entrega, montagem e defeito', icon: 'tool', style: 'dark', sort_order: 4,
    type: 'whatsapp_tel', channel: 'assistencia', hours: WEEK,
    wa_message: 'Olá! Preciso de assistência (entrega, montagem ou defeito).{codigo}',
    outside_hours_msg: 'Fora do horário: deixe sua mensagem, respondemos no próximo atendimento.',
    phones: [['Assistência', '+5528999625197']] },
  { key: 'site', label: 'Acessar o site', icon: 'globe', style: 'dark', sort_order: 5,
    type: 'url', url: 'https://divanmoveis.com.br/', channel: 'site' },
];

const pid = (id) => ({
  google_place_id: id,
  maps_url: `https://www.google.com/maps/place/?q=place_id:${id}`,
  review_url: `https://search.google.com/local/writereview?placeid=${id}`,
  reviews_url: `https://search.google.com/local/reviews?placeid=${id}`,
});

const STORE_INFO = {
  'nova-brasilia': { address: 'Av. Dr. Aristides Campos, 60 - Santo Antônio, Cachoeiro de Itapemirim - ES, 29300-700', phone: '(28) 99941-4323', hours_text: 'Seg a sex 8h às 18h · Sáb 8h às 12h' },
  'alto-novo-parque': { address: 'R. José Rosa Machado, 130 - Alto Novo Parque, Cachoeiro de Itapemirim - ES, 29308-830', phone: '(28) 3522-8118', hours_text: 'Seg a sex 8h às 18h · Sáb 8h às 12h' },
  guandu: { address: 'Rua Bernardo Horta, 302 - Guandú, Cachoeiro de Itapemirim - ES, 29300-794', phone: '(28) 99944-7175', hours_text: 'Seg a sex 8h às 18h · Sáb 8h às 13h' },
  bnh: { address: 'Rod. Eng. Fabiano Vivacqua, 529 - Lj 11 - Centro Comercial Itabira, Cachoeiro de Itapemirim - ES, 29313-656', phone: '(28) 99922-2033', hours_text: 'Seg a sex 8h às 18h · Sáb 8h às 12h30' },
  marataizes: { address: 'Av. Simão Soares, 1144 - Areias Negras, Marataízes - ES, 29345-000', phone: '(28) 99911-5044', hours_text: 'Seg a sex 8h às 18h · Sáb 8h às 16h' },
  guacui: { address: 'R. Rio Grande do Norte, 2 - Rio Grande do Norte, Guaçuí - ES, 29560-000', phone: '(28) 99951-2811', hours_text: 'Seg a sex 8h às 18h · Sáb 8h às 12h' },
  anchieta: { address: 'Rodovia do Sol, 3076 - Ponta dos Castelhanos, Anchieta - ES, 29230-000', phone: '(28) 99977-9158', hours_text: '8h às 18h',
    status: 'active', maps_url: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Divan Móveis, Rodovia do Sol, 3076 - Ponta dos Castelhanos, Anchieta - ES, 29230-000') },
};

const STORES = [
  { slug: 'nova-brasilia', name: 'Nova Brasília', city: 'Cachoeiro de Itapemirim', address: 'Av. Dr. Aristides Campos', rating: 4.5, rating_count: 142, ...pid('ChIJD-Y510dduQARBqZVbqc05gg') },
  { slug: 'alto-novo-parque', name: 'Alto Novo Parque', city: 'Cachoeiro de Itapemirim', address: 'R. José Rosa Machado', rating: 4.5, rating_count: 131, ...pid('ChIJzfws761CuQARJkkI_jlrfQI') },
  { slug: 'guandu', name: 'Guandu', city: 'Cachoeiro de Itapemirim', address: 'Rua Bernardo Horta, 302', rating: 4.5, rating_count: 27, ...pid('ChIJeY8mnrZDuQAR0koaj63M4G0') },
  { slug: 'bnh', name: 'BNH', city: 'Cachoeiro de Itapemirim', address: 'Rod. Eng. Fabiano Vivacqua, 529 - Lj 11', rating: 5.0, rating_count: 4, ...pid('ChIJ7xClHgtduQAR0gjF2BefMXg') },
  { slug: 'marataizes', name: 'Marataízes', city: 'Marataízes', address: 'Av. Simão Soares, 1144', rating: 4.6, rating_count: 65, ...pid('ChIJcxzXalY7uQARfP1HjSLCJZg') },
  { slug: 'guacui', name: 'Guaçuí', city: 'Guaçuí', address: 'R. Rio Grande do Norte, 2', rating: 5.0, rating_count: 2, ...pid('ChIJGdKCFQiTuwARD8tFXmBJR7U') },
  { slug: 'anchieta', name: 'Anchieta', city: 'Anchieta', status: 'coming_soon' },
];

export async function seed() {
  const { n } = await db.one('SELECT count(*)::int AS n FROM ctas');
  if (n === 0) {
    for (const c of CTAS) {
      const r = await db.one(
        `INSERT INTO ctas(key,label,subtitle,icon,style,sort_order,type,url,wa_message,hours,outside_hours_msg,channel)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12) RETURNING id`,
        [c.key, c.label, c.subtitle || null, c.icon, c.style, c.sort_order, c.type, c.url || null, c.wa_message || null,
         c.hours ? JSON.stringify(c.hours) : null, c.outside_hours_msg || null, c.channel]);
      for (const [label, phone] of c.phones || []) {
        await db.query('INSERT INTO cta_destinations(cta_id,label,phone_e164) VALUES($1,$2,$3)', [r.id, label, phone]);
      }
    }
  }
  const s = await db.one('SELECT count(*)::int AS n FROM stores');
  if (s.n === 0) {
    let i = 0;
    for (const st of STORES) {
      const r = await db.one(
        `INSERT INTO stores(slug,name,city,address,google_place_id,maps_url,review_url,reviews_url,rating,rating_count,rating_updated_at,status,sort_order)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,CASE WHEN $9::numeric IS NULL THEN NULL ELSE now() END,$11,$12) RETURNING id`,
        [st.slug, st.name, st.city, st.address || null, st.google_place_id || null, st.maps_url || null, st.review_url || null,
         st.reviews_url || null, st.rating ?? null, st.rating_count ?? null, st.status || 'active', ++i]);
      if (st.rating != null) await db.query('INSERT INTO store_rating_history(store_id,rating,rating_count) VALUES($1,$2,$3)', [r.id, st.rating, st.rating_count]);
    }
  }
  const defaults = {
    retention_days: 180,
    internal_ips: [],
    page: {
      intro: 'Móveis, colchões e eletro com montagem e frete inclusos no sul do ES.',
      footer: 'VF Comercial Ltda · CNPJ 39.694.852/0001-61',
      privacy_contact: 'privacidade@divanmoveis.com.br',
      reviews_title: 'Comprou com a gente?',
      reviews_text: 'Sua avaliação no Google ajuda outras famílias a escolher.',
    },
  };
  for (const [k, v] of Object.entries(defaults)) {
    if ((await getSetting(k)) === null) await setSetting(k, v);
  }

  await migrateData();

  // Primeiro administrador
  const u = await db.one('SELECT count(*)::int AS n FROM users');
  if (u.n === 0) {
    const pass = config.adminPassword || crypto.randomBytes(9).toString('base64url');
    await db.query('INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,$4)',
      [process.env.ADMIN_NAME || 'Daniel Cordeiro', config.adminEmail.toLowerCase(), await hashPassword(pass), 'admin']);
    if (!config.adminPassword) {
      const f = path.join(config.dataDir, 'PRIMEIRO-ACESSO.txt');
      fs.writeFileSync(f, `Painel: ${config.appUrl}/admin\nE-mail: ${config.adminEmail}\nSenha: ${pass}\n\nTroque a senha no primeiro acesso (Minha conta) e apague este arquivo.\n`, { mode: 0o600 });
      console.log(`\n  Primeiro acesso ao painel → e-mail: ${config.adminEmail}  senha: ${pass}\n  (também salvo em ${f})\n`);
    }
  }
}

// Atualizações de dados entre versões (rodam uma vez, também em bancos já existentes)
async function migrateData() {
  const v = Number(await getSetting('data_version', 1));
  if (v < 2) {
    // Ligação desligada por padrão; "Lojas e contatos" abre a lista de lojas
    await db.query('UPDATE ctas SET show_call=false');
    await db.query("UPDATE ctas SET opens_stores=true WHERE key='lojas'");
    for (const [slug, info] of Object.entries(STORE_INFO)) {
      await db.query(
        `UPDATE stores SET address=$2, phone=$3, hours_text=$4,
           status = coalesce($5, status), maps_url = coalesce(maps_url, $6), updated_at=now() WHERE slug=$1`,
        [slug, info.address, info.phone, info.hours_text, info.status || null, info.maps_url || null]);
    }
    await setSetting('data_version', 2);
  }
}
