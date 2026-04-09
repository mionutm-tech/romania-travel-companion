// One-shot migration + seed runner.
// Reads supabase/migrations/00001_initial_schema.sql and supabase/seed.sql
// and applies them to the Postgres URL in env DATABASE_URL.
//
// Usage: DATABASE_URL='postgres://...' node scripts/apply-db.mjs

import { readFile } from "node:fs/promises";
import { Client } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run(label, path) {
  const sql = await readFile(path, "utf8");
  console.log(`\n=== ${label} (${sql.length} bytes) ===`);
  const t0 = Date.now();
  try {
    await client.query(sql);
    console.log(`OK ${label} in ${Date.now() - t0}ms`);
  } catch (err) {
    console.error(`FAIL ${label}:`, err.message);
    if (err.position) console.error(`  at position ${err.position}`);
    if (err.detail) console.error(`  detail: ${err.detail}`);
    if (err.where) console.error(`  where: ${err.where}`);
    throw err;
  }
}

async function counts() {
  const tables = [
    "destinations",
    "poi_categories",
    "poi_tags",
    "pois",
    "poi_tag_links",
    "itineraries",
    "itinerary_stops",
  ];
  console.log("\n=== Row counts ===");
  for (const t of tables) {
    const r = await client.query(`select count(*)::int as n from public.${t}`);
    console.log(`  ${t.padEnd(20)} ${r.rows[0].n}`);
  }
}

try {
  await client.connect();
  console.log("Connected to Postgres.");
  await run("migration", "supabase/migrations/00001_initial_schema.sql");
  await run("seed", "supabase/seed.sql");
  await counts();
  console.log("\nDone.");
} catch (err) {
  process.exitCode = 1;
} finally {
  await client.end();
}
