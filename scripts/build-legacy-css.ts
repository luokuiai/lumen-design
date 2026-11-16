import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buildLegacyCss } from "./legacy-css";

const source = new URL("../packages/lumen-ui/src/styles/base.css", import.meta.url);
const modern = new URL("../packages/lumen-ui/dist/lumen-ui.css", import.meta.url);
const output = new URL("../packages/lumen-ui/dist/lumen-ui.legacy.css", import.meta.url);
const css = await buildLegacyCss(await readFile(modern, "utf8"), await readFile(source, "utf8"));
await writeFile(output, css);
console.log(`Built ${fileURLToPath(output)} (${(Buffer.byteLength(css) / 1024).toFixed(1)} kB)`);
