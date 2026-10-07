import { db, getSetting } from './db.js';

const DAY_EXPR = `(occurred_at AT TIME ZONE 'America/Sao_Paulo')::date`;
const CLEAN = `NOT is_bot AND NOT is_internal AND NOT is_dup`;

// Consolida em totais diários todos os dias completos ainda não consolidados (ou recalcula os últimos 3)
export async function rollup() {
  const days = await db.all(
    `SELECT DISTINCT ${DAY_EXPR}::text AS day FROM events
     WHERE ${DAY_EXPR} < (now() AT TIME ZONE 'America/Sao_Paulo')::date
       AND (${DAY_EXPR} NOT IN (SELECT day FROM daily_totals) OR ${DAY_EXPR} >= (now() AT TIME ZONE 'America/Sao_Paulo')::date - 3)
     ORDER BY 1`);
  for (const { day } of days) {
    await db.query('DELETE FROM daily_stats WHERE day=$1', [day]);
    await db.query(
      `INSERT INTO daily_stats(day,event_type,cta_key,store_slug,campaign_slug,traffic_source,device_type,geo_uf,count)
       SELECT $1::date, event_type, coalesce(cta_key,''), coalesce(store_slug,''), coalesce(campaign_slug,''),
              coalesce(traffic_source,''), coalesce(device_type,''), coalesce(geo_uf,''), count(*)
       FROM events WHERE ${DAY_EXPR} = $1::date AND ${CLEAN}
       GROUP BY 2,3,4,5,6,7,8`, [day]);
    await db.query(
      `INSERT INTO daily_totals(day,visitors,sessions)
       SELECT $1::date, count(DISTINCT visitor_hash), count(DISTINCT session_id) FROM events
       WHERE ${DAY_EXPR} = $1::date AND ${CLEAN}
       ON CONFLICT(day) DO UPDATE SET visitors=EXCLUDED.visitors, sessions=EXCLUDED.sessions`, [day]);
  }
  return days.length;
}

// Apaga dados brutos além do prazo de retenção (depois de consolidados)
export async function applyRetention() {
  const days = Math.max(30, Math.min(730, Number(await getSetting('retention_days', 180)) || 180));
  const ev = await db.query(`DELETE FROM events WHERE occurred_at < now() - ($1 || ' days')::interval
    AND ${DAY_EXPR} IN (SELECT day FROM daily_totals)`, [String(days)]);
  await db.query(`DELETE FROM visitor_sessions WHERE last_seen_at < now() - ($1 || ' days')::interval`, [String(days)]);
  await db.query(`DELETE FROM admin_sessions WHERE expires_at < now() - interval '7 days' OR revoked_at < now() - interval '7 days'`);
  return { deletedEvents: ev.affectedRows ?? ev.rowCount ?? 0, retentionDays: days };
}

export function startJobs() {
  const run = async () => {
    try { await rollup(); await applyRetention(); } catch (e) { console.error('Rotina de consolidação falhou:', e.message); }
  };
  setTimeout(run, 10_000);
  setInterval(run, 6 * 3600e3).unref();
}
