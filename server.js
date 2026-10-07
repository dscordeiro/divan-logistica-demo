import { config } from './src/config.js';
import { initDb } from './src/db.js';
import { seed } from './src/seed.js';
import { initGeo } from './src/tracking.js';
import { startJobs } from './src/jobs.js';
import { buildApp } from './src/app.js';

const db = await initDb();
await seed();
const geo = await initGeo();
const app = await buildApp();
startJobs();

// Enquanto o primeiro acesso não acontecer, mostra os dados de entrada no log a cada início (o arquivo some após o 1º login)
import fs from 'node:fs';
import path from 'node:path';
const firstAccess = path.join(config.dataDir, 'PRIMEIRO-ACESSO.txt');
if (fs.existsSync(firstAccess)) console.log('\n=== PRIMEIRO ACESSO AO PAINEL ===\n' + fs.readFileSync(firstAccess, 'utf8'));

await app.listen({ port: config.port, host: config.host });
console.log(`
  Divan Links rodando
  • Página pública: ${config.appUrl}/
  • Painel:         ${config.appUrl}/admin
  • Banco:          ${db.kind === 'postgres' ? 'PostgreSQL' : 'embutido (pasta data/pgdata)'}
  • Geolocalização: ${geo ? 'ativa' : 'desativada (sem arquivo data/geo.mmdb)'}
`);

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, async () => { await app.close(); await db.close(); process.exit(0); });
}
