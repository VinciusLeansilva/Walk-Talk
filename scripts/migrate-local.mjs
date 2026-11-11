import "./sites-env.mjs";
import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const generated = path.join(root, "dist/server/wrangler.json");
const source = JSON.parse(await readFile(generated, "utf8"));
const config = {
  name: "walk-talk-local-migrations",
  compatibility_date: source.compatibility_date,
  compatibility_flags: source.compatibility_flags,
  main: path.join(root, "dist/server/index.js"),
  d1_databases: source.d1_databases.map((db) => ({
    ...db,
    migrations_dir: path.join(root, "drizzle"),
  })),
};
const target = path.join(root, ".wrangler/local-migrations.json");
await writeFile(target, JSON.stringify(config, null, 2));
const result = spawnSync(
  process.execPath,
  [
    "node_modules/wrangler/bin/wrangler.js",
    "d1",
    "migrations",
    "apply",
    "DB",
    "--local",
    "--config",
    target,
    "--persist-to",
    ".wrangler/state",
  ],
  { cwd: root, stdio: "inherit", env: process.env },
);
process.exit(result.status ?? 1);
