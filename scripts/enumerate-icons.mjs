/**
 * enumerate-icons.mjs
 *
 * Dumps the currency-relevant icon names actually exported by each pinned
 * icon library. Used while curating src/data/icons/*.ts so every mapped name
 * is guaranteed to exist in the installed version. Run:
 *
 *   node scripts/enumerate-icons.mjs
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const pascalToKebab = (s) =>
  s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();

function dump(title, names) {
  const sorted = [...new Set(names)].sort();
  console.log(`\n=== ${title} (${sorted.length}) ===`);
  console.log(sorted.join('\n'));
}

// Lucide — PascalCase named exports.
try {
  const lucide = require('lucide-react');
  const names = Object.keys(lucide)
    .filter((k) => /^[A-Z]/.test(k) && k !== 'Icon' && k !== 'LucideIcon' && k !== 'createLucideIcon')
    .map(pascalToKebab);
  dump('LUCIDE currency-ish', names.filter((n) =>
    /(dollar|euro|pound|yen|yuan|rupee|ruble|rouble|franc|cent|coin|bitcoin|banknote|wallet|money|currency|sterling|badge)/.test(n)));
  console.log('lucide version:', require('lucide-react/package.json').version);
} catch (e) { console.log('lucide error', e.message); }

// Tabler — "Icon" prefixed PascalCase named exports.
try {
  const tabler = require('@tabler/icons-react');
  const names = Object.keys(tabler)
    .filter((k) => k.startsWith('Icon'))
    .map((k) => pascalToKebab(k.slice(4)));
  dump('TABLER currency-*', names.filter((n) => n.startsWith('currency') || /(coin|cash|wallet|moneybag|pig-money|report-money|business-plan)/.test(n)));
  console.log('tabler version:', require('@tabler/icons-react/package.json').version);
} catch (e) { console.log('tabler error', e.message); }

// Font Awesome free-solid — "fa" prefixed exports each carrying .iconName.
try {
  const fa = require('@fortawesome/free-solid-svg-icons');
  const names = Object.keys(fa)
    .filter((k) => k.startsWith('fa') && fa[k] && fa[k].iconName)
    .map((k) => fa[k].iconName);
  dump('FONTAWESOME sign/money', names.filter((n) =>
    /(sign|coin|money|wallet|cash|sack|bitcoin|ethereum|piggy)/.test(n)));
  console.log('fontawesome version:', require('@fortawesome/free-solid-svg-icons/package.json').version);
} catch (e) { console.log('fa error', e.message); }

// Heroicons — "<Name>Icon" exports in /24/outline.
try {
  const hero = require('@heroicons/react/24/outline');
  const names = Object.keys(hero)
    .filter((k) => k.endsWith('Icon'))
    .map((k) => pascalToKebab(k.slice(0, -4)));
  dump('HEROICONS currency/money', names.filter((n) =>
    /(currency|banknote|wallet|coin|money)/.test(n)));
  console.log('heroicons version:', require('@heroicons/react/package.json').version);
} catch (e) { console.log('hero error', e.message); }
