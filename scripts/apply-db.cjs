// CommonJS version — runs migration + seed against DATABASE_URL.
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

function run(label, path) {
  const sql = readFileSync(path, "utf8");
  console.log(`\n=== ${label} (${sql.length} bytes) ===`);
  const t0 = Date.now();
  return client
    .query(sql)
    .then(() => console.log(`OK ${label} in ${Date.now() - t0}ms`))
    .catch((err) => {
      console.error(`FAIL ${label}: ${err.message}`);
      if (err.position) console.error(`  at position ${err.position}`);
      if (err.detail) console.error(`  detail: ${err.detail}`);
      if (err.where) console.error(`  where: ${err.where}`);
      throw err;
    });
}

function counts() {
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
  return tables.reduce(
    (p, t) =>
      p.then(() =>
        client
          .query(`select count(*)::int as n from public.${t}`)
          .then((r) => console.log(`  ${t.padEnd(20)} ${r.rows[0].n}`))
      ),
    Promise.resolve()
  );
}

console.log("connecting...");
client
  .connect()
  .then(() => console.log("connected"))
  .then(() => run("migration", "supabase/migrations/00001_initial_schema.sql"))
  .then(() => run("seed", "supabase/seed.sql"))
  .then(counts)
  .then(() => console.log("\nDone."))
  .catch((err) => {
    process.exitCode = 1;
  })
  .finally(() => client.end());
