/**
 * currency-icon-map — resolve any currency (ISO 4217 code, symbol, name, or
 * country) to the right icon name for Lucide, Tabler, Font Awesome, and
 * Heroicons, with a guaranteed default fallback. Zero runtime dependencies.
 *
 * @example
 * ```ts
 * import { getCurrencyIcon, resolveIconName } from 'currency-icon-map';
 *
 * getCurrencyIcon('USD').icons.tabler;   // "currency-dollar"
 * getCurrencyIcon('¥').currency?.code;    // "JPY"
 * getCurrencyIcon('Japan').matchType;     // "country"
 * getCurrencyIcon('???').matched;         // false (returns default icons)
 *
 * resolveIconName('eur', 'lucide');                 // "euro"
 * resolveIconName('eur', 'tabler', { case: 'pascal' }); // "IconCurrencyEuro"
 * ```
 */
import type {
  Currency,
  CurrencyIconMapConfig,
  CurrencyIconResult,
  IconLibrary,
  IconNameCase,
  IconNames,
} from './types.js';
import { CURRENCIES } from './data/index.js';
import {
  buildContext,
  resolveQuery,
  iconsFor,
  LIBRARIES,
  type ResolverContext,
} from './resolver/lookup.js';
import { kebabToPascal, normalizeCode } from './resolver/normalize.js';

export type {
  Currency,
  CurrencyIconMapConfig,
  CurrencyIconResult,
  IconLibrary,
  IconNameCase,
  IconNames,
  MatchType,
} from './types.js';

export { VALIDATED_VERSIONS, DEFAULT_ICONS } from './data/index.js';

/**
 * Hard cap on query length. A currency query is at most a short phrase
 * ("united states minor outlying islands" is ~37 chars); anything beyond this
 * is malformed input, and capping it keeps normalization (NFKD on a single
 * pathological token) from becoming a CPU sink.
 */
const MAX_QUERY_LENGTH = 200;

const VALID_LIBRARIES: ReadonlySet<string> = new Set(LIBRARIES);

function validateQuery(query: unknown): asserts query is string {
  if (typeof query !== 'string') {
    throw new TypeError(
      `currency-icon-map: query must be a string (got ${query === null ? 'null' : typeof query})`,
    );
  }
  if (query.length > MAX_QUERY_LENGTH) {
    throw new RangeError(
      `currency-icon-map: query exceeds maximum length of ${MAX_QUERY_LENGTH} characters (got ${query.length})`,
    );
  }
}

function validateLibrary(library: unknown): asserts library is IconLibrary {
  if (typeof library !== 'string' || !VALID_LIBRARIES.has(library)) {
    throw new TypeError(
      `currency-icon-map: library must be one of ${LIBRARIES.join(', ')} (got ${String(library)})`,
    );
  }
}

function applyCase(name: string, library: IconLibrary, nameCase: IconNameCase): string {
  if (nameCase === 'kebab') return name;
  const pascal = kebabToPascal(name);
  // PascalCase forms differ per library's component naming convention.
  switch (library) {
    case 'tabler':
      return `Icon${pascal}`;
    case 'fontawesome':
      return `fa${pascal}`;
    case 'heroicons':
      return `${pascal}Icon`;
    case 'lucide':
    default:
      return pascal;
  }
}

function validateExtraCurrencies(extra: Currency[]): void {
  for (let i = 0; i < extra.length; i++) {
    const c = extra[i];
    if (!c || typeof c !== 'object') {
      throw new TypeError(`currency-icon-map: extraCurrencies[${i}] is not an object`);
    }
    if (typeof c.code !== 'string' || c.code.length === 0) {
      throw new TypeError(`currency-icon-map: extraCurrencies[${i}] has invalid "code"`);
    }
    if (typeof c.name !== 'string' || c.name.length === 0) {
      throw new TypeError(`currency-icon-map: extra currency "${c.code}" has invalid "name"`);
    }
    if (!Array.isArray(c.countries) || !Array.isArray(c.aliases)) {
      throw new TypeError(`currency-icon-map: extra currency "${c.code}" has invalid countries/aliases`);
    }
  }
}

/** A currency-icon-map instance bound to a particular configuration. */
export interface CurrencyIconMap {
  /** Resolve a query to its currency and per-library icon names. */
  getCurrencyIcon(query: string): CurrencyIconResult;
  /** Resolve a query to its {@link Currency}, or `null` if unmatched. */
  getCurrency(query: string): Currency | null;
  /**
   * Resolve a query directly to one library's icon name. Returns the default
   * icon name when unmatched. Throws on an unknown library.
   */
  resolveIconName(
    query: string,
    library: IconLibrary,
    options?: { case?: IconNameCase },
  ): string;
  /** All currencies known to this instance (built-ins plus any extras). */
  listCurrencies(): Currency[];
  /** Create a new instance layered on this one's configuration. */
  configure(config: CurrencyIconMapConfig): CurrencyIconMap;
}

function createInstance(config?: CurrencyIconMapConfig): CurrencyIconMap {
  const extraCurrencies = config?.extraCurrencies ?? [];
  if (extraCurrencies.length) validateExtraCurrencies(extraCurrencies);

  const ctx: ResolverContext = buildContext(
    CURRENCIES,
    extraCurrencies,
    config?.extraIcons ?? {},
    config?.defaultIcons ?? {},
  );

  const instance: CurrencyIconMap = {
    getCurrencyIcon(query: string): CurrencyIconResult {
      validateQuery(query);
      const trimmed = query.trim();
      if (trimmed.length === 0) {
        return {
          matched: false,
          matchType: 'default',
          query: trimmed,
          currency: null,
          icons: { ...ctx.defaultIcons },
        };
      }
      const { currency, matchType } = resolveQuery(trimmed, ctx);
      return {
        matched: currency !== null,
        matchType,
        query: trimmed,
        currency,
        icons: iconsFor(currency, ctx),
      };
    },

    getCurrency(query: string): Currency | null {
      validateQuery(query);
      const trimmed = query.trim();
      if (trimmed.length === 0) return null;
      return resolveQuery(trimmed, ctx).currency;
    },

    resolveIconName(query, library, options) {
      validateQuery(query);
      validateLibrary(library);
      const nameCase = options?.case ?? 'kebab';
      const trimmed = query.trim();
      const currency = trimmed.length === 0 ? null : resolveQuery(trimmed, ctx).currency;
      const name = iconsFor(currency, ctx)[library];
      return applyCase(name, library, nameCase);
    },

    listCurrencies(): Currency[] {
      return ctx.currencies.map((c) => ({ ...c, countries: [...c.countries], aliases: [...c.aliases] }));
    },

    configure(next: CurrencyIconMapConfig): CurrencyIconMap {
      // Layer: merge extras and default-icon overrides over the current ones.
      return createInstance({
        defaultIcons: { ...config?.defaultIcons, ...next.defaultIcons },
        extraCurrencies: [...(next.extraCurrencies ?? []), ...extraCurrencies],
        extraIcons: { ...config?.extraIcons, ...next.extraIcons },
      });
    },
  };

  return instance;
}

/** The default, ready-to-use instance. */
const defaultInstance = createInstance();

/** Resolve a query to its currency and per-library icon names. */
export const getCurrencyIcon = (query: string): CurrencyIconResult =>
  defaultInstance.getCurrencyIcon(query);

/** Resolve a query to its {@link Currency}, or `null` if unmatched. */
export const getCurrency = (query: string): Currency | null =>
  defaultInstance.getCurrency(query);

/** Resolve a query directly to one library's icon name. */
export const resolveIconName = (
  query: string,
  library: IconLibrary,
  options?: { case?: IconNameCase },
): string => defaultInstance.resolveIconName(query, library, options);

/** All built-in currencies. */
export const listCurrencies = (): Currency[] => defaultInstance.listCurrencies();

/** Create a custom instance (custom default icons, extra currencies, overrides). */
export const createCurrencyIconMap = (config?: CurrencyIconMapConfig): CurrencyIconMap =>
  createInstance(config);

export { createInstance };
export default defaultInstance;

// Re-export the normalization helper consumers may want for their own keys.
export { normalizeCode };
