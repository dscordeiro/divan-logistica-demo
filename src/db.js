import fs from 'node:fs';
import path from 'node:path';
import { config, ROOT } from './config.js';

// Adaptador único: PostgreSQL real (DATABASE_URL) ou PGlite embutido (arquivo local, sem instalar nada).
// As duas opções expõem query(sql, params) -> { rows } e exec(sql).
let impl;

export async function initDb({ memory = false } = {}) {
  const url = process.env.TEST_DATABASE_URL || config.databaseUrl;
  if (url && !memory) {
    const pg = (await import('pg')).default;
    const pool = new pg.Pool({ connectionString: url, max: 10 });
    impl = {
      kind: 'postgres',
      query: (sql, params = []) => pool.query(sql, params),
      exec: (sql) => pool.query(sql),
      close: () => pool.end(),
    };
  } else {
    const { PGlite } = await import('@electric-sql/pglite');
    const db = memory ? new PGlite() : new PGlite(path.join(config.dataDir, 'pgdata'));
    await db.waitReady;
    impl = {
      kind: memory ? 'pglite-memory' : 'pglite',
      query: (sql, params = []) => db.query(sql, params),
      exec: (sql) => db.exec(sql),
      close: () => db.close(),
    };
  }
  const schema = fs.readFileSync(path.join(ROOT, 'src', 'schema.sql'), 'utf8');
  await impl.exec(schema);
  return impl;
}

export const db = {
  query: (sql, params) => impl.query(sql, params),
  exec: (sql) => impl.exec(sql),
  one: async (sql, params) => (await impl.query(sql, params)).rows[0] || null,
  all: async (sql, params) => (await impl.query(sql, params)).rows,
  get kind() { return impl?.kind; },
  close: () => impl?.close(),
};

export async function getSetting(key, fallback = null) {
  const r = await db.one('SELECT value FROM settings WHERE key=$1', [key]);
  return r ? r.value : fallback;
}
export async function setSetting(key, value, userId = null) {
  await db.query(
    `INSERT INTO settings(key,value,updated_by,updated_at) VALUES($1,$2::jsonb,$3,now())
     ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value, updated_by=EXCLUDED.updated_by, updated_at=now()`,
    [key, JSON.stringify(value), userId]
  );
}
