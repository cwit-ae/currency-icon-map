/**
 * smoke-pack.mjs
 *
 * Packs the package exactly as it would publish, then installs the resulting
 * tarball into a throwaway ESM consumer and a throwaway CommonJS consumer and
 * runs real `import` / `require` against it. This catches dual-package
 * (ESM/CJS) packaging defects that source-level Jest tests and
 * `npm pack --dry-run` cannot — e.g. a missing `dist/esm/package.json` causing
 * native `import` to fail on Node 18/20.
 *
 * Run:  npm run smoke
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'pipe'] }).toString();

const EXPECT = 'currency-dollar';
const ESM_SRC = `import { getCurrencyIcon } from 'currency-icon-map';
import { CURRENCIES } from 'currency-icon-map/data';
const r = getCurrencyIcon('USD');
if (r.icons.tabler !== '${EXPECT}') { console.error('ESM main wrong:', r.icons.tabler); process.exit(1); }
if (!Array.isArray(CURRENCIES) || CURRENCIES.length < 180) { console.error('ESM /data wrong'); process.exit(1); }
console.log('ESM ok');
`;
const CJS_SRC = `const { getCurrencyIcon } = require('currency-icon-map');
const { CURRENCIES } = require('currency-icon-map/data');
const r = getCurrencyIcon('USD');
if (r.icons.tabler !== '${EXPECT}') { console.error('CJS main wrong:', r.icons.tabler); process.exit(1); }
if (!Array.isArray(CURRENCIES) || CURRENCIES.length < 180) { console.error('CJS /data wrong'); process.exit(1); }
console.log('CJS ok');
`;

let tmp;
try {
  console.log('• building…');
  run('npm run build', ROOT);

  console.log('• packing…');
  const tgzName = run('npm pack --silent', ROOT).trim().split('\n').pop().trim();
  const tgz = join(ROOT, tgzName);

  tmp = mkdtempSync(join(tmpdir(), 'cim-smoke-'));

  // --- ESM consumer ---
  const esmDir = join(tmp, 'esm');
  mkdirSync(esmDir);
  writeFileSync(join(esmDir, 'package.json'), JSON.stringify({ name: 'esm-consumer', private: true, type: 'module' }) + '\n');
  writeFileSync(join(esmDir, 'test.mjs'), ESM_SRC);
  run(`npm install "${tgz}" --no-save --ignore-scripts --no-audit --no-fund`, esmDir);
  process.stdout.write('  ' + run('node test.mjs', esmDir));

  // --- CJS consumer ---
  const cjsDir = join(tmp, 'cjs');
  mkdirSync(cjsDir);
  writeFileSync(join(cjsDir, 'package.json'), JSON.stringify({ name: 'cjs-consumer', private: true }) + '\n');
  writeFileSync(join(cjsDir, 'test.cjs'), CJS_SRC);
  run(`npm install "${tgz}" --no-save --ignore-scripts --no-audit --no-fund`, cjsDir);
  process.stdout.write('  ' + run('node test.cjs', cjsDir));

  rmSync(tgz, { force: true });
  console.log(`✓ smoke passed (ESM + CJS) for currency-icon-map@${pkg.version}`);
} catch (err) {
  console.error('✗ smoke FAILED');
  if (err.stdout) console.error(err.stdout.toString());
  if (err.stderr) console.error(err.stderr.toString());
  process.exitCode = 1;
} finally {
  if (tmp) rmSync(tmp, { recursive: true, force: true });
}
