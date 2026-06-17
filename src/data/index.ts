/**
 * Raw embedded datasets. Exposed via the `currency-icon-map/data` subpath for
 * consumers who want to build their own indexes or render custom UI.
 *
 * Every export is deeply frozen so a consumer cannot mutate the shared,
 * module-level data and affect other importers. The internal resolver never
 * mutates these (it builds its own Maps and returns copies), so freezing the
 * shared instances is safe.
 */
import { CURRENCIES as RAW_CURRENCIES } from './currencies.generated.js';
import { COUNTRY_TO_CURRENCY as RAW_COUNTRY_TO_CURRENCY, COUNTRY_NAMES as RAW_COUNTRY_NAMES } from './countries.generated.js';
import { ICON_MAPS as RAW_ICON_MAPS, DEFAULT_ICONS as RAW_DEFAULT_ICONS, VALIDATED_VERSIONS as RAW_VALIDATED_VERSIONS } from './icons.generated.js';

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value as Record<string, unknown>)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

export const CURRENCIES = deepFreeze(RAW_CURRENCIES);
export const COUNTRY_TO_CURRENCY = deepFreeze(RAW_COUNTRY_TO_CURRENCY);
export const COUNTRY_NAMES = deepFreeze(RAW_COUNTRY_NAMES);
export const ICON_MAPS = deepFreeze(RAW_ICON_MAPS);
export const DEFAULT_ICONS = deepFreeze(RAW_DEFAULT_ICONS);
export const VALIDATED_VERSIONS = deepFreeze(RAW_VALIDATED_VERSIONS);
