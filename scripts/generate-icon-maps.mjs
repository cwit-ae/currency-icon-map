/**
 * generate-icon-maps.mjs
 *
 * Produces src/data/icons.generated.ts: for every currency, the icon NAME
 * (kebab-case) in each supported library. Resolution per library:
 *   1. an explicit, dedicated currency icon if the library ships one;
 *   2. a symbol-group fallback (e.g. any "$" currency → the generic dollar icon);
 *   3. the library's generic coin/banknote icon.
 *
 * CRITICAL: every produced name is validated against the icon names actually
 * exported by the installed (pinned) library. A typo or a name the library
 * renamed/removed aborts generation — this is what makes the "mapped properly"
 * guarantee real. The shipped tests re-assert the same property in CI.
 *
 * Run:  node scripts/generate-icon-maps.mjs
 */
import { createRequire } from 'node:module';
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '..', 'src', 'data');

const pascalToKebab = (s) =>
  s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();

// --- Load the generated currency list ------------------------------------
const currenciesSrc = readFileSync(resolve(DATA_DIR, 'currencies.generated.ts'), 'utf8');
const CURRENCIES = JSON.parse(currenciesSrc.match(/= (\[[\s\S]*\]) as const/)[1]);

// --- Build the set of valid kebab names actually exported by each lib -----
function lucideValid() {
  const lucide = require('lucide-react');
  const set = new Set();
  for (const k of Object.keys(lucide)) {
    if (!/^[A-Z]/.test(k)) continue;
    const kebab = pascalToKebab(k);
    if (kebab.endsWith('-icon') || kebab.startsWith('lucide-')) continue;
    set.add(kebab);
  }
  return set;
}
function tablerValid() {
  const tabler = require('@tabler/icons-react');
  const set = new Set();
  for (const k of Object.keys(tabler)) {
    if (k.startsWith('Icon')) set.add(pascalToKebab(k.slice(4)));
  }
  return set;
}
function faValid() {
  const fa = require('@fortawesome/free-solid-svg-icons');
  const set = new Set();
  for (const k of Object.keys(fa)) {
    if (k.startsWith('fa') && fa[k] && fa[k].iconName) set.add(fa[k].iconName);
  }
  return set;
}
function heroValid() {
  const hero = require('@heroicons/react/24/outline');
  const set = new Set();
  for (const k of Object.keys(hero)) {
    if (k.endsWith('Icon')) set.add(pascalToKebab(k.slice(0, -4)));
  }
  return set;
}

// --- Per-library resolution rules ----------------------------------------
const sym = (c, ...glyphs) => glyphs.some((g) => c.symbol.includes(g));

const LUCIDE_BY_CODE = {
  USD: 'dollar-sign', EUR: 'euro', GBP: 'pound-sterling', JPY: 'japanese-yen',
  INR: 'indian-rupee', RUB: 'russian-ruble', CHF: 'swiss-franc', BTC: 'bitcoin',
};
function lucideFor(c) {
  if (LUCIDE_BY_CODE[c.code]) return LUCIDE_BY_CODE[c.code];
  if (sym(c, '$')) return 'dollar-sign';
  if (sym(c, '€')) return 'euro';
  if (sym(c, '£')) return 'pound-sterling';
  if (sym(c, '¥')) return 'japanese-yen';
  if (sym(c, '₹')) return 'indian-rupee';
  if (sym(c, '₽')) return 'russian-ruble';
  return 'coins';
}

const TABLER_BY_CODE = {
  USD: 'currency-dollar', AUD: 'currency-dollar-australian', CAD: 'currency-dollar-canadian',
  SGD: 'currency-dollar-singapore', BND: 'currency-dollar-brunei', GYD: 'currency-dollar-guyanese',
  ZWL: 'currency-dollar-zimbabwean', ZWG: 'currency-dollar-zimbabwean',
  EUR: 'currency-euro', GBP: 'currency-pound', JPY: 'currency-yen', CNY: 'currency-renminbi',
  INR: 'currency-rupee', NPR: 'currency-rupee-nepalese', RUB: 'currency-rubel', CHF: 'currency-frank',
  BTC: 'currency-bitcoin', ETH: 'currency-ethereum', LTC: 'currency-litecoin', XMR: 'currency-monero',
  XRP: 'currency-xrp', THB: 'currency-baht', BHD: 'currency-bahraini', AFN: 'currency-afghani',
  LYD: 'currency-lyd', AED: 'currency-dirham', MAD: 'currency-dirham', VND: 'currency-dong',
  AMD: 'currency-dram', ANG: 'currency-florin', AWG: 'currency-florin', HUF: 'currency-forint',
  PYG: 'currency-guarani', UAH: 'currency-hryvnia', IRR: 'currency-iranian-rial', LAK: 'currency-kip',
  CZK: 'currency-krone-czech', DKK: 'currency-krone-danish', SEK: 'currency-krone-swedish',
  GEL: 'currency-lari', RON: 'currency-leu', MDL: 'currency-leu', TRY: 'currency-lira',
  AZN: 'currency-manat', TMT: 'currency-manat', NGN: 'currency-naira', BRL: 'currency-real',
  ILS: 'currency-shekel', KZT: 'currency-tenge', MNT: 'currency-tugrik', KRW: 'currency-won',
  KPW: 'currency-won', PLN: 'currency-zloty', BDT: 'currency-taka', KGS: 'currency-som',
  UZS: 'currency-som', MVR: 'currency-rufiyaa', GTQ: 'currency-quetzal', TOP: 'currency-paanga',
};
const TABLER_DINAR = ['KWD', 'IQD', 'JOD', 'DZD', 'TND', 'RSD', 'MKD'];
const TABLER_RIYAL = ['SAR', 'QAR', 'OMR', 'YER'];
const TABLER_PESO = ['MXN', 'ARS', 'CLP', 'COP', 'PHP', 'UYU', 'DOP', 'CUP'];
const TABLER_RUPEE = ['PKR', 'LKR', 'MUR', 'SCR'];
function tablerFor(c) {
  if (TABLER_BY_CODE[c.code]) return TABLER_BY_CODE[c.code];
  if (TABLER_DINAR.includes(c.code)) return 'currency-dinar';
  if (TABLER_RIYAL.includes(c.code)) return 'currency-riyal';
  if (TABLER_PESO.includes(c.code)) return 'currency-peso';
  if (TABLER_RUPEE.includes(c.code)) return 'currency-rupee';
  if (sym(c, '$')) return 'currency-dollar';
  if (sym(c, '€')) return 'currency-euro';
  if (sym(c, '£')) return 'currency-pound';
  if (sym(c, '¥')) return 'currency-yen';
  if (sym(c, '₹')) return 'currency-rupee';
  return 'coin';
}

const FA_BY_CODE = {
  USD: 'dollar-sign', EUR: 'euro-sign', GBP: 'sterling-sign', JPY: 'yen-sign', CNY: 'yen-sign',
  INR: 'indian-rupee-sign', RUB: 'ruble-sign', TRY: 'turkish-lira-sign', ILS: 'shekel-sign',
  NGN: 'naira-sign', GHS: 'cedi-sign', VND: 'dong-sign', PYG: 'guarani-sign', UAH: 'hryvnia-sign',
  LAK: 'kip-sign', GEL: 'lari-sign', LTC: 'litecoin-sign', BTC: 'bitcoin-sign', THB: 'baht-sign',
  BDT: 'bangladeshi-taka-sign', BRL: 'brazilian-real-sign', KZT: 'tenge-sign', KRW: 'won-sign',
  KPW: 'won-sign', IDR: 'rupiah-sign', CRC: 'colon-sign', SVC: 'colon-sign', ANG: 'florin-sign',
  AWG: 'florin-sign',
};
const FA_MANAT = ['AZN', 'TMT'];
const FA_PESO = ['MXN', 'ARS', 'CLP', 'COP', 'PHP', 'UYU', 'DOP', 'CUP'];
const FA_RUPEE = ['PKR', 'LKR', 'NPR', 'MUR', 'SCR'];
const FA_FRANC = ['CHF', 'XOF', 'XAF', 'XPF', 'KMF', 'DJF', 'GNF', 'RWF', 'BIF', 'CDF'];
function faFor(c) {
  if (FA_BY_CODE[c.code]) return FA_BY_CODE[c.code];
  if (FA_MANAT.includes(c.code)) return 'manat-sign';
  if (FA_PESO.includes(c.code)) return 'peso-sign';
  if (FA_RUPEE.includes(c.code)) return 'rupee-sign';
  if (FA_FRANC.includes(c.code)) return 'franc-sign';
  if (sym(c, '$')) return 'dollar-sign';
  if (sym(c, '€')) return 'euro-sign';
  if (sym(c, '£')) return 'sterling-sign';
  if (sym(c, '¥')) return 'yen-sign';
  if (sym(c, '₹')) return 'rupee-sign';
  return 'coins';
}

const HERO_BY_CODE = {
  USD: 'currency-dollar', EUR: 'currency-euro', GBP: 'currency-pound', JPY: 'currency-yen',
  CNY: 'currency-yen', INR: 'currency-rupee', BDT: 'currency-bangladeshi',
};
function heroFor(c) {
  if (HERO_BY_CODE[c.code]) return HERO_BY_CODE[c.code];
  if (sym(c, '$')) return 'currency-dollar';
  if (sym(c, '€')) return 'currency-euro';
  if (sym(c, '£')) return 'currency-pound';
  if (sym(c, '¥')) return 'currency-yen';
  if (sym(c, '₹')) return 'currency-rupee';
  return 'banknotes';
}

const DEFAULT_ICONS = {
  lucide: 'coins', tabler: 'coins', fontawesome: 'coins', heroicons: 'banknotes',
};

// --- Generate + validate -------------------------------------------------
const valid = {
  lucide: lucideValid(), tabler: tablerValid(), fontawesome: faValid(), heroicons: heroValid(),
};
const resolvers = {
  lucide: lucideFor, tabler: tablerFor, fontawesome: faFor, heroicons: heroFor,
};

const maps = { lucide: {}, tabler: {}, fontawesome: {}, heroicons: {} };
const errors = [];
const stats = {
  lucide: { specific: 0 }, tabler: { specific: 0 }, fontawesome: { specific: 0 }, heroicons: { specific: 0 },
};

for (const lib of Object.keys(maps)) {
  // Validate the default icon too.
  if (!valid[lib].has(DEFAULT_ICONS[lib])) {
    errors.push(`[${lib}] default icon "${DEFAULT_ICONS[lib]}" not found in installed library`);
  }
  for (const c of CURRENCIES) {
    const name = resolvers[lib](c);
    if (!valid[lib].has(name)) {
      errors.push(`[${lib}] ${c.code} → "${name}" does not exist in the installed library`);
      continue;
    }
    maps[lib][c.code] = name;
    if (name !== DEFAULT_ICONS[lib]) stats[lib].specific++;
  }
}

if (errors.length) {
  console.error('✗ Icon-map generation failed — invalid icon names:');
  for (const e of errors) console.error('   ' + e);
  process.exit(1);
}

const versions = {
  lucide: require('lucide-react/package.json').version,
  tabler: require('@tabler/icons-react/package.json').version,
  fontawesome: require('@fortawesome/free-solid-svg-icons/package.json').version,
  heroicons: require('@heroicons/react/package.json').version,
};

const out =
  `/**\n * AUTO-GENERATED by scripts/generate-icon-maps.mjs — DO NOT EDIT BY HAND.\n` +
  ` *\n * Per-library currency → icon name (kebab-case) maps. Every name is\n` +
  ` * validated at generation time against the installed icon library.\n` +
  ` *\n * Validated against: lucide-react@${versions.lucide}, @tabler/icons-react@${versions.tabler},\n` +
  ` * @fortawesome/free-solid-svg-icons@${versions.fontawesome}, @heroicons/react@${versions.heroicons}.\n` +
  ` * Regenerate with: node scripts/generate-icon-maps.mjs\n */\n\n` +
  `import type { IconLibrary, IconNames } from '../types.js';\n\n` +
  `/** Icon library versions these maps were validated against. */\n` +
  `export const VALIDATED_VERSIONS: Readonly<Record<IconLibrary, string>> = ${JSON.stringify(versions, null, 2)};\n\n` +
  `/** Icon names returned when a query matches no currency. */\n` +
  `export const DEFAULT_ICONS: IconNames = ${JSON.stringify(DEFAULT_ICONS, null, 2)};\n\n` +
  `/** currency code → icon name, per library. */\n` +
  `export const ICON_MAPS: Readonly<Record<IconLibrary, Readonly<Record<string, string>>>> = ${JSON.stringify(maps, null, 2)};\n`;

writeFileSync(resolve(DATA_DIR, 'icons.generated.ts'), out);

console.log('✓ Icon maps generated and validated against installed libraries:');
for (const lib of Object.keys(maps)) {
  console.log(`   ${lib.padEnd(12)} ${Object.keys(maps[lib]).length} currencies, ${stats[lib].specific} with a dedicated (non-default) icon`);
}
