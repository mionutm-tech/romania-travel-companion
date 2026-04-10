// Applies the Stage 2 migration (00002_content_pipeline.sql) and the
// idempotent planner-attribute UPDATE block from seed.sql.
//
// Usage: DATABASE_URL='postgres://...' node scripts/apply-stage2.cjs
const { readFileSync } = require("node:fs");
const { Client } = require("pg");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function run(label, sql) {
  console.log(`\n=== ${label} (${sql.length} bytes) ===`);
  const t0 = Date.now();
  return client
    .query(sql)
    .then(() => console.log(`OK ${label} in ${Date.now() - t0}ms`))
    .catch((err) => {
      console.error(`FAIL ${label}: ${err.message}`);
      if (err.position) console.error(`  at position ${err.position}`);
      if (err.detail) console.error(`  detail: ${err.detail}`);
      throw err;
    });
}

// Extract the planner-attribute UPDATE block from seed.sql
function extractPlannerBackfill() {
  const seed = readFileSync("supabase/seed.sql", "utf8");
  const marker = "-- Planner attribute backfill (Stage 2)";
  const idx = seed.indexOf(marker);
  if (idx === -1) throw new Error("planner backfill block not found in seed.sql");
  return seed.slice(idx);
}

const migration = readFileSync(
  "supabase/migrations/00002_content_pipeline.sql",
  "utf8"
);

console.log("connecting...");
client
  .connect()
  .then(() => console.log("connected"))
  .then(() => run("00002_content_pipeline", migration))
  .then(() => run("planner_backfill", extractPlannerBackfill()))
  .then(() =>
    client.query(
      "select publish_status, count(*)::int as n from public.pois group by publish_status order by publish_status"
    )
  )
  .then((r) => {
    console.log("\n=== POI counts by publish_status ===");
    for (const row of r.rows) console.log(`  ${row.publish_status.padEnd(12)} ${row.n}`);
  })
  .then(() =>
    client.query(
      "select table_name from information_schema.tables where table_schema = 'public' and table_name in ('poi_drafts','import_jobs','import_rows','generated_trip_plans','generated_trip_stops') order by table_name"
    )
  )
  .then((r) => {
    console.log("\n=== New tables present ===");
    for (const row of r.rows) console.log(`  ${row.table_name}`);
  })
  .then(() => console.log("\nDone."))
  .catch(() => {
    process.exitCode = 1;
  })
  .finally(() => client.end());
