/**
 * Guards the deep-freeze hardening on the public `currency-icon-map/data`
 * exports. A consumer must not be able to mutate the shared, module-level
 * datasets and affect other importers.
 */
import {
  CURRENCIES,
  COUNTRY_TO_CURRENCY,
  COUNTRY_NAMES,
  ICON_MAPS,
  DEFAULT_ICONS,
  VALIDATED_VERSIONS,
} from '../src/data/index';

describe('data immutability', () => {
  it('top-level exports are frozen', () => {
    expect(Object.isFrozen(CURRENCIES)).toBe(true);
    expect(Object.isFrozen(COUNTRY_TO_CURRENCY)).toBe(true);
    expect(Object.isFrozen(COUNTRY_NAMES)).toBe(true);
    expect(Object.isFrozen(ICON_MAPS)).toBe(true);
    expect(Object.isFrozen(DEFAULT_ICONS)).toBe(true);
    expect(Object.isFrozen(VALIDATED_VERSIONS)).toBe(true);
  });

  it('nested currency records and their arrays are deep-frozen', () => {
    expect(Object.isFrozen(CURRENCIES[0])).toBe(true);
    expect(Object.isFrozen(CURRENCIES[0].countries)).toBe(true);
    expect(Object.isFrozen(CURRENCIES[0].aliases)).toBe(true);
  });

  it('per-library icon maps are deep-frozen', () => {
    expect(Object.isFrozen(ICON_MAPS.tabler)).toBe(true);
    expect(Object.isFrozen(ICON_MAPS.lucide)).toBe(true);
  });

  it('mutations have no effect (strict mode throws; sloppy mode no-ops)', () => {
    const code = CURRENCIES[0].code;
    try {
      (CURRENCIES[0] as { code: string }).code = 'HACKED';
    } catch {
      /* strict mode throws — also acceptable */
    }
    expect(CURRENCIES[0].code).toBe(code);

    const usdTabler = ICON_MAPS.tabler.USD;
    try {
      (ICON_MAPS.tabler as Record<string, string>).USD = 'nope';
    } catch {
      /* ignore */
    }
    expect(ICON_MAPS.tabler.USD).toBe(usdTabler);
  });
});
