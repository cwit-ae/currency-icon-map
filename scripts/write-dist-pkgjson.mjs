/**
 * write-dist-pkgjson.mjs
 *
 * Writes a minimal package.json into each build output directory so Node
 * resolves the emitted files with the correct module system regardless of the
 * root package's "type":
 *
 *   dist/esm/package.json → { "type": "module" }      (ESNext output)
 *   dist/cjs/package.json → { "type": "commonjs" }    (CommonJS output)
 *
 * Without these, Node treats dist/esm/*.js as CommonJS (the root has no
 * "type": "module"), which breaks native `import "currency-icon-map"` on
 * Node 18/20 even though `require()` works. Run as a build post-step.
 */
import { writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'dist');

const targets = [
  ['esm', '{\n  "type": "module"\n}\n'],
  ['cjs', '{\n  "type": "commonjs"\n}\n'],
];

for (const [dir, contents] of targets) {
  const outDir = resolve(DIST, dir);
  if (!existsSync(outDir)) {
    throw new Error(`[write-dist-pkgjson] expected build output at ${outDir} — run the TS build first`);
  }
  writeFileSync(resolve(outDir, 'package.json'), contents);
  console.log(`✓ wrote dist/${dir}/package.json`);
}
