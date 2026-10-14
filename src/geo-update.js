// Baixa e mantém atualizada a base gratuita de localização por IP (DB-IP IP to City Lite, licença CC BY 4.0).
// Roda sozinho: no início do servidor e uma vez por dia (só baixa de novo quando a base tem mais de 32 dias).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { config } from './config.js';
import { initGeo } from './tracking.js';

const MAX_AGE_DAYS = 32;
const ym = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

export function geoAgeDays() {
  try { return (Date.now() - fs.statSync(config.geoDbPath).mtimeMs) / 86400000; } catch { return Infinity; }
}

export async function updateGeoIfNeeded({ force = false } = {}) {
  if (!config.geoAuto) return { skipped: 'desligado' };
  if (!force && geoAgeDays() < MAX_AGE_DAYS) return { skipped: 'atual' };
  const now = new Date();
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const tmp = config.geoDbPath + '.download';
  for (const month of [ym(now), ym(prev)]) {
    const url = `https://download.db-ip.com/free/dbip-city-lite-${month}.mmdb.gz`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(180000) });
      if (!res.ok || !res.body) continue;
      fs.mkdirSync(path.dirname(config.geoDbPath), { recursive: true });
      await pipeline(Readable.fromWeb(res.body), zlib.createGunzip(), fs.createWriteStream(tmp));
      if (fs.statSync(tmp).size < 1_000_000) { fs.rmSync(tmp, { force: true }); continue; }
      fs.renameSync(tmp, config.geoDbPath);
      const ok = await initGeo();
      if (!ok) { fs.rmSync(config.geoDbPath, { force: true }); continue; }
      console.log(`Geo: base de localização ${month} instalada`);
      return { updated: month, ok };
    } catch (e) {
      fs.rmSync(tmp, { force: true });
      console.warn('Geo: falha ao baixar', url, e.message);
    }
  }
  return { failed: true };
}
