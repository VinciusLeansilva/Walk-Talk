import { sites } from "@openai/sites-vite-plugin";
import tailwindcss from "@tailwindcss/postcss";
import vinext from "vinext";
import { defineConfig } from "vite";
import hosting from "./.openai/hosting.json";

// Logical binding names come from the Sites manifest. The ID is only a local
// emulator placeholder; Sites provisions the real database on deployment.
const localBindingConfig = {
  main: "worker/index.ts",
  compatibility_date: "2026-05-15",
  compatibility_flags: ["nodejs_compat"],
  assets: {
    directory: "dist/client",
    binding: "ASSETS",
    not_found_handling: "none" as const,
    html_handling: "none" as const,
  },
  d1_databases: hosting.d1
    ? [
        {
          binding: hosting.d1,
          database_name: "walk-talk-d1",
          database_id: "00000000-0000-4000-8000-000000000000",
        },
      ]
    : [],
};

export default defineConfig(async () => {
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";
  process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= "false";
  process.env.WRANGLER_SEND_METRICS ??= "false";
  const { cloudflare } = await import("@cloudflare/vite-plugin");
  return {
    css: { postcss: { plugins: [tailwindcss()] } },
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: localBindingConfig,
      }),
    ],
  };
});
