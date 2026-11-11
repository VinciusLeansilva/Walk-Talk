/** Static first paint; interactive hydration still runs in the browser. */
import { createServer } from "vite";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const originalMatchMedia = globalThis.matchMedia;
const originalLocation = globalThis.location;
// Only browser values needed to create the initial, non-interactive HTML shell.
globalThis.matchMedia = () => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {},
});
globalThis.location = { hash: "" };
const server = await createServer({
  configFile: false,
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { default: App } = await server.ssrLoadModule("/src/App.tsx");
  const shell = renderToString(createElement(App));
  const file = new URL("../dist/index.html", import.meta.url);
  const html = (await readFile(file, "utf8")).replace(
    '<div id="root"></div>',
    `<div id="root">${shell}</div>`,
  );
  await writeFile(file, html);
  // The PWA build precedes prerendering: update this asset's cache revision.
  const swFile = new URL("../dist/sw.js", import.meta.url);
  const sw = await readFile(swFile, "utf8");
  const revision = createHash("md5").update(html).digest("hex");
  const updated = sw.replace(
    /(url:["']index\.html["'],revision:["'])[^"']+/,
    `$1${revision}`,
  );
  if (updated === sw)
    throw new Error(
      "Precache entry for index.html was not found; update the revision matcher.",
    );
  await writeFile(swFile, updated);
  console.log(
    "Prerendered accessible initial HTML and updated the service worker revision.",
  );
} finally {
  await server.close();
  globalThis.matchMedia = originalMatchMedia;
  globalThis.location = originalLocation;
}
