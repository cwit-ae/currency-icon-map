import { getCurrencyIcon, resolveIconName, listCurrencies } from '../src/index';
import { ICON_MAPS, DEFAULT_ICONS } from '../src/data/icons.generated';

const LIBRARIES = ['lucide', 'tabler', 'fontawesome', 'heroicons'] as const;

describe('icon resolution', () => {
  it('returns the dedicated icon per library for major currencies', () => {
    const usd = getCurrencyIcon('USD').icons;
    expect(usd.lucide).toBe('dollar-sign');
    expect(usd.tabler).toBe('currency-dollar');
    expect(usd.fontawesome).toBe('dollar-sign');
    expect(usd.heroicons).toBe('currency-dollar');

    const eur = getCurrencyIcon('EUR').icons;
    expect(eur.lucide).toBe('euro');
    expect(eur.tabler).toBe('currency-euro');
    expect(eur.fontawesome).toBe('euro-sign');
    expect(eur.heroicons).toBe('currency-euro');
  });

  it('falls back by symbol group for currencies without a dedicated icon', () => {
    // Australian dollar: Tabler has a dedicated icon; Lucide/Hero fall back to
    // the generic "$" icon.
    const aud = getCurrencyIcon('AUD').icons;
    expect(aud.tabler).toBe('currency-dollar-australian');
    expect(aud.lucide).toBe('dollar-sign');
    expect(aud.heroicons).toBe('currency-dollar');
  });

  it('returns default icons for an unmatched query', () => {
    const r = getCurrencyIcon('zzzzz');
    expect(r.matched).toBe(false);
    expect(r.icons).toEqual(DEFAULT_ICONS);
  });

  describe('resolveIconName', () => {
    it('returns kebab-case by default', () => {
      expect(resolveIconName('USD', 'tabler')).toBe('currency-dollar');
      expect(resolveIconName('EUR', 'lucide')).toBe('euro');
    });

    it('returns the library-specific PascalCase component name', () => {
      expect(resolveIconName('USD', 'lucide', { case: 'pascal' })).toBe('DollarSign');
      expect(resolveIconName('USD', 'tabler', { case: 'pascal' })).toBe('IconCurrencyDollar');
      expect(resolveIconName('USD', 'fontawesome', { case: 'pascal' })).toBe('faDollarSign');
      expect(resolveIconName('USD', 'heroicons', { case: 'pascal' })).toBe('CurrencyDollarIcon');
    });

    it('returns the default icon name when unmatched', () => {
      expect(resolveIconName('nope', 'tabler')).toBe(DEFAULT_ICONS.tabler);
    });

    it('throws on an unknown library', () => {
      // @ts-expect-error — invalid library at runtime
      expect(() => resolveIconName('USD', 'fontello')).toThrow(TypeError);
    });
  });

  describe('coverage', () => {
    it('maps every currency in every library', () => {
      const codes = listCurrencies().map((c) => c.code);
      for (const lib of LIBRARIES) {
        for (const code of codes) {
          expect(typeof ICON_MAPS[lib][code]).toBe('string');
          expect(ICON_MAPS[lib][code].length).toBeGreaterThan(0);
        }
      }
    });
  });
});
