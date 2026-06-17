/** Supported icon libraries. */
export type IconLibrary = 'lucide' | 'tabler' | 'fontawesome' | 'heroicons';

/** How a query was resolved to a currency. */
export type MatchType = 'code' | 'symbol' | 'country' | 'name' | 'alias' | 'default';

/** A single currency record. */
export interface Currency {
  /** ISO 4217 alpha-3 code, or a ticker for crypto (e.g. "USD", "BTC"). */
  code: string;
  /** ISO 4217 numeric code (e.g. "840"); empty string for non-ISO entries. */
  numeric: string;
  /** Human-readable currency name (e.g. "US Dollar"). */
  name: string;
  /** Conventional symbol (e.g. "$"); falls back to the code when none exists. */
  symbol: string;
  /** Number of minor-unit digits (e.g. 2 for cents). */
  minorUnits: number;
  /** ISO 3166-1 alpha-2 codes of countries that use this currency. */
  countries: string[];
  /** Curated colloquial names/nicknames (lowercase). */
  aliases: string[];
  /** True for non-ISO digital currencies (Bitcoin, Ethereum, …). */
  crypto: boolean;
}

/** The icon name for a currency in each supported library. */
export interface IconNames {
  /** Lucide icon name (kebab-case, e.g. "dollar-sign"). */
  lucide: string;
  /** Tabler icon name (kebab-case, e.g. "currency-dollar"). */
  tabler: string;
  /** Font Awesome (free) solid icon name (kebab-case, e.g. "dollar-sign"). */
  fontawesome: string;
  /** Heroicons (outline/solid) icon name (kebab-case, e.g. "currency-dollar"). */
  heroicons: string;
}

/** Result of resolving a query to a currency and its icons. */
export interface CurrencyIconResult {
  /** Whether the query matched a known currency. */
  matched: boolean;
  /** How the match was made (`'default'` when nothing matched). */
  matchType: MatchType;
  /** The original query, trimmed. */
  query: string;
  /**
   * The resolved currency, or `null` when nothing matched.
   * When `matched` is false the icons are the configured defaults.
   */
  currency: Currency | null;
  /** Icon name per library (defaults when unmatched). */
  icons: IconNames;
}

/** Casing for a returned icon name. */
export type IconNameCase = 'kebab' | 'pascal';

/** Configuration for a {@link createCurrencyIconMap} instance. */
export interface CurrencyIconMapConfig {
  /**
   * Icon names to return when a query does not match any currency.
   * Partial — unspecified libraries keep the built-in generic coin defaults.
   */
  defaultIcons?: Partial<IconNames>;
  /** Extra currencies to register (merged ahead of the built-in dataset). */
  extraCurrencies?: Currency[];
  /** Extra per-library icon overrides/additions, keyed by currency code. */
  extraIcons?: Record<string, Partial<IconNames>>;
}
