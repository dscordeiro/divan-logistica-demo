// Executa manualmente a consolidação diária e a limpeza por retenção.
import { initDb, db } from '../src/db.js';
import { rollup, applyRetention } from '../src/jobs.js';
await initDb();
console.log('Dias consolidados:', await rollup());
console.log(await applyRetention());
await db.close();
