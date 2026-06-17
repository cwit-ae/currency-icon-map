/**
 * Index construction and query resolution.
 *
 * Resolution order (first hit wins):
 *   1. ISO 4217 / ticker code   ("USD", "btc")
 *   2. Exact symbol             ("$", "€", "₹")
 *   3. ISO 4217 numeric code    ("840")
 *   4. ISO 3166-1 alpha-2       ("US", "jp")
 *   5. Currency name            ("us dollar", "euro")
 *   6. Alias / nickname         ("buck", "quid")
 *   7. Country name             ("united states", "japan")
 * Nothing matched → the configured default icons.
 */
import type { Currency, IconLibrary, IconNames, MatchType } from '../types.js';
import { ICON_MAPS, DEFAULT_ICONS, COUNTRY_TO_CURRENCY, COUNTRY_NAMES } from '../data/index.js';
import { normalizeName, normalizeCode } from './normalize.js';

const LIBRARIES: readonly IconLibrary[] = ['lucide', 'tabler', 'fontawesome', 'heroicons'];

// For symbols shared across many currencies (notably "$"), the primary
// currency that should win. Without this, the alphabetically-first currency
// using "$" (e.g. ARS) would shadow USD.
const PRIMARY_FOR_SYMBOL: Record<string, string> = {
  $: 'USD', '€': 'EUR', '£': 'GBP', '¥': 'JPY', '₹': 'INR', '₽': 'RUB',
  '₩': 'KRW', '₺': 'TRY', '₫': 'VND', '฿': 'THB', '₴': 'UAH', '₦': 'NGN',
  '₱': 'PHP', '₪': 'ILS', '₡': 'CRC', '₲': 'PYG', '₸': 'KZT', '₭': 'LAK',
  '₮': 'MNT', '₾': 'GEL', '₵': 'GHS', 'R$': 'BRL', '₿': 'BTC',
};

export interface ResolverContext {
  /** All known currencies (extras first, then built-ins; deduped by code). */
  currencies: Currency[];
  byCode: Map<string, Currency>;
  bySymbol: Map<string, Currency>;
  byNumeric: Map<string, Currency>;
  byName: Map<string, Currency>;
  byAlias: Map<string, Currency>;
  byCountryCode: Map<string, Currency>;
  byCountryName: Map<string, Currency>;
  /** code → IconNames (precomputed, including extras/overrides). */
  iconsByCode: Map<string, IconNames>;
  defaultIcons: IconNames;
}

function iconsForCode(
  code: string,
  defaults: IconNames,
  overrides?: Partial<IconNames>,
): IconNames {
  const icons = {} as IconNames;
  for (const lib of LIBRARIES) {
    icons[lib] = overrides?.[lib] ?? ICON_MAPS[lib][code] ?? defaults[lib];
  }
  return icons;
}

export function buildContext(
  baseCurrencies: readonly Currency[],
  extraCurrencies: Currency[] = [],
  extraIcons: Record<string, Partial<IconNames>> = {},
  defaultIconsOverride: Partial<IconNames> = {},
): ResolverContext {
  const defaultIcons: IconNames = { ...DEFAULT_ICONS, ...defaultIconsOverride };

  // Extras take priority over built-ins on code collision.
  const byCode = new Map<string, Currency>();
  const currencies: Currency[] = [];
  for (const c of [...extraCurrencies, ...baseCurrencies]) {
    const code = normalizeCode(c.code);
    if (byCode.has(code)) continue;
    byCode.set(code, c);
    currencies.push(c);
  }

  const bySymbol = new Map<string, Currency>();
  const byNumeric = new Map<string, Currency>();
  const byName = new Map<string, Currency>();
  const byAlias = new Map<string, Currency>();
  const byCountryCode = new Map<string, Currency>();
  const byCountryName = new Map<string, Currency>();

  // Seed symbol primaries first so they cannot be shadowed.
  for (const [symbol, code] of Object.entries(PRIMARY_FOR_SYMBOL)) {
    const cur = byCode.get(code);
    if (cur) bySymbol.set(symbol, cur);
  }

  for (const c of currencies) {
    if (c.symbol && c.symbol !== c.code && !bySymbol.has(c.symbol)) {
      bySymbol.set(c.symbol, c);
    }
    if (c.numeric && !byNumeric.has(c.numeric)) byNumeric.set(c.numeric, c);
    const name = normalizeName(c.name);
    if (name && !byName.has(name)) byName.set(name, c);
    for (const alias of c.aliases) {
      const a = normalizeName(alias);
      if (a && !byAlias.has(a)) byAlias.set(a, c);
    }
  }

  // Country indexes are derived from the built-in country table, mapped to
  // whichever currency record is now active for that code.
  for (const [alpha2, code] of Object.entries(COUNTRY_TO_CURRENCY)) {
    const cur = byCode.get(code);
    if (!cur) continue;
    byCountryCode.set(alpha2, cur);
    const countryName = COUNTRY_NAMES[alpha2];
    if (countryName) {
      const n = normalizeName(countryName);
      if (n && !byCountryName.has(n)) byCountryName.set(n, cur);
    }
  }

  const iconsByCode = new Map<string, IconNames>();
  for (const c of currencies) {
    const code = normalizeCode(c.code);
    iconsByCode.set(code, iconsForCode(code, defaultIcons, extraIcons[code]));
  }

  return {
    currencies, byCode, bySymbol, byNumeric, byName, byAlias,
    byCountryCode, byCountryName, iconsByCode, defaultIcons,
  };
}

export interface Resolution {
  currency: Currency | null;
  matchType: MatchType;
}

/** Resolve a (already non-empty, trimmed) query against the context. */
export function resolveQuery(query: string, ctx: ResolverContext): Resolution {
  const code = normalizeCode(query);
  const name = normalizeName(query);

  const byCodeHit = ctx.byCode.get(code);
  if (byCodeHit) return { currency: byCodeHit, matchType: 'code' };

  // Symbols are matched on the raw (trimmed) query, not folded.
  const bySymbolHit = ctx.bySymbol.get(query.trim());
  if (bySymbolHit) return { currency: bySymbolHit, matchType: 'symbol' };

  const byNumericHit = ctx.byNumeric.get(code);
  if (byNumericHit) return { currency: byNumericHit, matchType: 'code' };

  const byCountryCodeHit = ctx.byCountryCode.get(code);
  if (byCountryCodeHit) return { currency: byCountryCodeHit, matchType: 'country' };

  const byNameHit = ctx.byName.get(name);
  if (byNameHit) return { currency: byNameHit, matchType: 'name' };

  const byAliasHit = ctx.byAlias.get(name);
  if (byAliasHit) return { currency: byAliasHit, matchType: 'alias' };

  const byCountryNameHit = ctx.byCountryName.get(name);
  if (byCountryNameHit) return { currency: byCountryNameHit, matchType: 'country' };

  return { currency: null, matchType: 'default' };
}

/** Icon names for a resolved currency (or defaults when null). */
export function iconsFor(currency: Currency | null, ctx: ResolverContext): IconNames {
  if (!currency) return { ...ctx.defaultIcons };
  const icons = ctx.iconsByCode.get(normalizeCode(currency.code));
  return icons ? { ...icons } : { ...ctx.defaultIcons };
}

export { LIBRARIES };
