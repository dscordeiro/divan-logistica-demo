import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Carrega .env simples (sem dependência externa)
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || line.trim().startsWith('#')) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
}

const env = process.env;
const isProd = env.NODE_ENV === 'production';
const dataDir = path.resolve(ROOT, env.DATA_DIR || 'data');
fs.mkdirSync(dataDir, { recursive: true });

// Segredo da aplicação: usa .env; se não houver, gera um e guarda em data/ (só para uso local)
function loadSecret() {
  if (env.APP_SECRET && env.APP_SECRET.length >= 32) return env.APP_SECRET;
  // Sem APP_SECRET: gera um segredo forte e guarda na pasta de dados (persistente no volume)
  const f = path.join(dataDir, '.secret');
  if (!fs.existsSync(f)) fs.writeFileSync(f, crypto.randomBytes(48).toString('hex'), { mode: 0o600 });
  return fs.readFileSync(f, 'utf8').trim();
}

export const config = {
  isProd,
  port: Number(env.PORT || 3000),
  host: env.HOST || (isProd ? '0.0.0.0' : '127.0.0.1'),
  appUrl: (env.APP_URL || `http://localhost:${env.PORT || 3000}`).replace(/\/$/, ''),
  dataDir,
  databaseUrl: env.DATABASE_URL || '',
  secret: loadSecret(),
  require2fa: env.REQUIRE_2FA ? env.REQUIRE_2FA === 'true' : isProd,
  trustProxy: env.TRUST_PROXY ? env.TRUST_PROXY === 'true' : true,
  adminAllowedIps: (env.ADMIN_ALLOWED_IPS || '').split(',').map(s => s.trim()).filter(Boolean),
  geoDbPath: env.GEOIP_DB ? path.resolve(ROOT, env.GEOIP_DB) : path.join(dataDir, 'geo.mmdb'),
  adminEmail: env.ADMIN_EMAIL || 'daniel@agencialeaf.com.br',
  adminPassword: env.ADMIN_PASSWORD || '',
  tz: 'America/Sao_Paulo',
  tzOffset: '-03:00', // Brasil sem horário de verão desde 2019
  sessionIdleHours: 8,
};
