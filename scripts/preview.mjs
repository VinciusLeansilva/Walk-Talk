import "./sites-env.mjs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv
  .slice(2)
  .map((arg) => (arg === "--host" ? "--ip" : arg));
const command = [
  "node_modules/wrangler/bin/wrangler.js",
  "dev",
  "--config",
  "dist/server/wrangler.json",
  "--local",
  "--persist-to",
  ".wrangler/state",
  "--inspector-port",
  "0",
];
if (!args.includes("--port")) command.push("--port", "4173");
if (!args.includes("--ip")) command.push("--ip", "127.0.0.1");
const child = spawn(process.execPath, [...command, ...args], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 1));
