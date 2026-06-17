/**
 * generate-currencies.mjs
 *
 * Builds the embedded currency dataset that ships with the package from
 * authoritative, dev-only data sources:
 *
 *   - currency-codes        ISO 4217 codes, names, numeric codes, minor units,
 *                           and the list of countries that use each currency.
 *   - currency-symbol-map   the conventional symbol for each ISO code.
 *   - i18n-iso-countries    canonical country names + ISO 3166-1 alpha-2 codes,
 *                           used to convert currency-codes' free-text country
 *                           names into stable alpha-2 codes.
 *
 * The output is committed source (`src/data/currencies.generated.ts` and
 * `src/data/countries.generated.ts`). The runtime ships these embedded copies
 * and has ZERO runtime dependencies — the three packages above are devDeps
 * used only here and are removed before publishing.
 *
 * Run:  node scripts/generate-currencies.mjs
 */

import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const cc = require('currency-codes');
const symbolMap = require('currency-symbol-map');
const isoCountries = require('i18n-iso-countries');

const getSymbol = symbolMap.default ?? symbolMap;
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '..', 'src', 'data');

// --- Country name → alpha-2 resolution ----------------------------------
// currency-codes ships free-text names like "United States of America (The)"
// and "Virgin Islands (u.s.)". Strip the "(The)" article and normalize so
// i18n-iso-countries can resolve them. Names that still fail to resolve are
// kept as normalized strings so name-based country lookup still works.
function cleanCountryName(raw) {
  return raw
    .replace(/\s*\(the\)\s*/i, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const unresolved = new Set();

function toAlpha2(rawName) {
  const cleaned = cleanCountryName(rawName);
  const direct = isoCountries.getAlpha2Code(cleaned, 'en');
  if (direct) return direct;
  // A few currency-codes spellings differ from the ISO English short name.
  const aliases = {
    'Virgin Islands (British)': 'VG',
    'Virgin Islands (u.s.)': 'VI',
    'Bonaire, Sint Eustatius and Saba': 'BQ',
    'Congo (The Democratic Republic Of The)': 'CD',
    'Tanzania, United Republic Of': 'TZ',
    'Bolivia (Plurinational State Of)': 'BO',
    'Venezuela (Bolivarian Republic Of)': 'VE',
    'Iran (Islamic Republic Of)': 'IR',
    "Korea (The Democratic People's Republic Of)": 'KP',
    'Korea (The Republic Of)': 'KR',
    'Moldova (The Republic Of)': 'MD',
    'Taiwan (Province Of China)': 'TW',
    'Palestine, State Of': 'PS',
    'Sint Maarten (Dutch Part)': 'SX',
    'Saint Martin (French Part)': 'MF',
    'Heard Island and Mcdonald Islands': 'HM',
    'Holy See (The)': 'VA',
    'Lao People’s Democratic Republic (The)': 'LA',
    "Lao People's Democratic Republic (The)": 'LA',
    'Syrian Arab Republic': 'SY',
    'Eswatini': 'SZ',
    'Türkiye': 'TR',
    'Turkey': 'TR',
    // Real countries whose currency-codes spelling differs from ISO short name.
    'United Kingdom of Great Britain and Northern Ireland (The)': 'GB',
    'Congo (The Democratic Republic of The)': 'CD',
    'Congo (The Democratic Republic Of The)': 'CD',
    'Cabo Verde': 'CV',
    'Réunion': 'RE',
    'Falkland Islands (The) [Malvinas]': 'FK',
    'Korea (The Democratic People’s Republic Of)': 'KP',
    "Korea (The Democratic People's Republic Of)": 'KP',
    'Saint Helena, Ascension and Tristan Da Cunha': 'SH',
    'Türki̇ye': 'TR',
    'Taiwan (Province of China)': 'TW',
    'Micronesia (Federated States Of)': 'FM',
    'Micronesia (Federated States of)': 'FM',
    'Viet Nam': 'VN',
  };
  const aliased = aliases[rawName] || aliases[cleaned];
  if (aliased) return aliased;
  unresolved.add(rawName);
  return null;
}

// --- Currency aliases (curated colloquial names) ------------------------
// Common informal names users may type. Keep conservative — only widely
// recognised, unambiguous nicknames.
const ALIASES = {
  USD: ['us dollar', 'american dollar', 'buck', 'bucks', 'greenback'],
  EUR: ['euro', 'euros'],
  GBP: ['pound', 'pound sterling', 'sterling', 'quid', 'british pound'],
  JPY: ['yen', 'japanese yen'],
  CNY: ['yuan', 'renminbi', 'rmb', 'chinese yuan'],
  INR: ['rupee', 'indian rupee', 'rs'],
  CHF: ['swiss franc', 'franc'],
  RUB: ['ruble', 'rouble', 'russian ruble'],
  KRW: ['won', 'korean won', 'south korean won'],
  BRL: ['real', 'brazilian real'],
  AUD: ['australian dollar', 'aussie dollar'],
  CAD: ['canadian dollar', 'loonie'],
  MXN: ['mexican peso', 'peso'],
  ZAR: ['rand', 'south african rand'],
  TRY: ['turkish lira', 'lira'],
  AED: ['dirham', 'uae dirham', 'emirati dirham'],
  SAR: ['riyal', 'saudi riyal'],
  THB: ['baht', 'thai baht'],
  NGN: ['naira', 'nigerian naira'],
  PLN: ['zloty', 'polish zloty'],
  ILS: ['shekel', 'israeli shekel', 'new shekel'],
  UAH: ['hryvnia', 'ukrainian hryvnia'],
  VND: ['dong', 'vietnamese dong'],
  HUF: ['forint', 'hungarian forint'],
  CZK: ['czech koruna', 'koruna'],
  SEK: ['swedish krona', 'krona'],
  NOK: ['norwegian krone'],
  DKK: ['danish krone'],
  PHP: ['philippine peso'],
  IDR: ['rupiah', 'indonesian rupiah'],
  MYR: ['ringgit', 'malaysian ringgit'],
  SGD: ['singapore dollar'],
  HKD: ['hong kong dollar'],
  NZD: ['new zealand dollar', 'kiwi dollar'],
  PKR: ['pakistani rupee'],
  BDT: ['taka', 'bangladeshi taka'],
  EGP: ['egyptian pound'],
  GHS: ['cedi', 'ghanaian cedi'],
  KZT: ['tenge', 'kazakhstani tenge'],
  GEL: ['lari', 'georgian lari'],
  AMD: ['dram', 'armenian dram'],
  AZN: ['manat', 'azerbaijani manat'],
  PYG: ['guarani', 'paraguayan guarani'],
  LAK: ['kip', 'lao kip'],
  MNT: ['tugrik', 'mongolian tugrik'],
  AFN: ['afghani', 'afghan afghani'],
  RON: ['leu', 'romanian leu'],
};

// --- Non-ISO digital currencies (curated; have real icons in some libs) --
const CRYPTO = [
  { code: 'BTC', numeric: '', name: 'Bitcoin', symbol: '₿', minorUnits: 8, countries: [], aliases: ['bitcoin', 'btc', 'xbt'], crypto: true },
  { code: 'ETH', numeric: '', name: 'Ethereum', symbol: 'Ξ', minorUnits: 18, countries: [], aliases: ['ethereum', 'eth', 'ether'], crypto: true },
  { code: 'LTC', numeric: '', name: 'Litecoin', symbol: 'Ł', minorUnits: 8, countries: [], aliases: ['litecoin', 'ltc'], crypto: true },
  { code: 'XRP', numeric: '', name: 'Ripple', symbol: '✕', minorUnits: 6, countries: [], aliases: ['ripple', 'xrp'], crypto: true },
  { code: 'XMR', numeric: '', name: 'Monero', symbol: 'ɱ', minorUnits: 12, countries: [], aliases: ['monero', 'xmr'], crypto: true },
];

// --- Build currency records ---------------------------------------------
const records = [];
for (const code of cc.codes().sort()) {
  const entry = cc.code(code);
  if (!entry) continue;
  const symbol = getSymbol(code);
  const alpha2 = (entry.countries || [])
    .map(toAlpha2)
    .filter((c) => c !== null);
  records.push({
    code: entry.code,
    numeric: String(entry.number ?? ''),
    name: entry.currency,
    // currency-symbol-map returns "$" with the code prefixed when it has no
    // mapping (e.g. "BHD" → "BHD"). Treat a returned value equal to the code
    // as "no symbol" and fall back to the code itself.
    symbol: symbol && symbol !== code ? symbol : code,
    minorUnits: typeof entry.digits === 'number' ? entry.digits : 2,
    countries: alpha2,
    aliases: ALIASES[entry.code] || [],
    crypto: false,
  });
}
for (const c of CRYPTO) records.push(c);

// --- Build country index (alpha-2 → currency code) ----------------------
// First ISO currency that lists a country wins as that country's "primary"
// currency (currency-codes orders sensibly; USD-using territories already
// have their own entries where applicable).
const countryToCurrency = {};
const countryNames = {};
for (const rec of records) {
  for (const a2 of rec.countries) {
    if (!countryToCurrency[a2]) countryToCurrency[a2] = rec.code;
  }
}
for (const a2 of Object.keys(countryToCurrency)) {
  countryNames[a2] = isoCountries.getName(a2, 'en') || a2;
}

// --- Emit TypeScript -----------------------------------------------------
const header = (extra) =>
  `/**\n * AUTO-GENERATED by scripts/generate-currencies.mjs — DO NOT EDIT BY HAND.\n` +
  ` *\n * Source: ISO 4217 (currency-codes), currency-symbol-map, i18n-iso-countries.\n` +
  ` * Regenerate with: node scripts/generate-currencies.mjs\n${extra ? ` *\n * ${extra}\n` : ''} */\n\n`;

const currenciesTs =
  header('Embedded ISO 4217 currency dataset plus a small curated crypto set.') +
  `import type { Currency } from '../types.js';\n\n` +
  `export const CURRENCIES: readonly Currency[] = ${JSON.stringify(records, null, 2)} as const;\n`;

const countriesTs =
  header('country (ISO 3166-1 alpha-2) → primary ISO 4217 currency code.') +
  `export const COUNTRY_TO_CURRENCY: Readonly<Record<string, string>> = ${JSON.stringify(countryToCurrency, null, 2)};\n\n` +
  `export const COUNTRY_NAMES: Readonly<Record<string, string>> = ${JSON.stringify(countryNames, null, 2)};\n`;

writeFileSync(resolve(OUT_DIR, 'currencies.generated.ts'), currenciesTs);
writeFileSync(resolve(OUT_DIR, 'countries.generated.ts'), countriesTs);

console.log(`✓ Wrote ${records.length} currencies (${CRYPTO.length} crypto, ${records.length - CRYPTO.length} ISO 4217)`);
console.log(`✓ Wrote ${Object.keys(countryToCurrency).length} country → currency mappings`);
if (unresolved.size) {
  console.log(`\n⚠ ${unresolved.size} country names could not be resolved to alpha-2 (kept out of country index):`);
  for (const n of unresolved) console.log(`   - ${n}`);
}
