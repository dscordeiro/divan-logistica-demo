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
