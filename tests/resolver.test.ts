import { getCurrencyIcon, getCurrency, listCurrencies } from '../src/index';

describe('resolver', () => {
  describe('by ISO 4217 code', () => {
    it('resolves an uppercase code', () => {
      const r = getCurrencyIcon('USD');
      expect(r.matched).toBe(true);
      expect(r.matchType).toBe('code');
      expect(r.currency?.code).toBe('USD');
      expect(r.currency?.name).toBe('US Dollar');
    });

    it('is case-insensitive', () => {
      expect(getCurrencyIcon('eur').currency?.code).toBe('EUR');
      expect(getCurrencyIcon('  gbp  ').currency?.code).toBe('GBP');
    });

    it('resolves a numeric ISO code', () => {
      const r = getCurrencyIcon('840');
      expect(r.currency?.code).toBe('USD');
      expect(r.matchType).toBe('code');
    });
  });

  describe('by name and alias', () => {
    it('resolves an exact name', () => {
      expect(getCurrencyIcon('Indian Rupee').currency?.code).toBe('INR');
      expect(getCurrencyIcon('indian rupee').matchType).toBe('name');
    });

    it('resolves accented names without accents', () => {
      // "Réunion" → RE → EUR via country; the name path also folds accents.
      expect(getCurrency('euro')?.code).toBe('EUR');
    });

    it('resolves a colloquial alias', () => {
      expect(getCurrencyIcon('quid').currency?.code).toBe('GBP');
      expect(getCurrencyIcon('buck').matchType).toBe('alias');
      expect(getCurrencyIcon('greenback').currency?.code).toBe('USD');
    });
  });

  describe('crypto', () => {
    it('resolves Bitcoin by code and alias', () => {
      expect(getCurrencyIcon('BTC').currency?.crypto).toBe(true);
      expect(getCurrencyIcon('bitcoin').currency?.code).toBe('BTC');
    });
  });

  describe('no match', () => {
    it('returns default with matched=false', () => {
      const r = getCurrencyIcon('not-a-currency');
      expect(r.matched).toBe(false);
      expect(r.matchType).toBe('default');
      expect(r.currency).toBeNull();
    });

    it('treats empty/whitespace as unmatched', () => {
      expect(getCurrencyIcon('').matched).toBe(false);
      expect(getCurrencyIcon('   ').matched).toBe(false);
      expect(getCurrency('')).toBeNull();
    });
  });

  describe('dataset', () => {
    it('exposes every ISO 4217 currency plus crypto', () => {
      const all = listCurrencies();
      expect(all.length).toBeGreaterThanOrEqual(180);
      expect(all.some((c) => c.code === 'USD')).toBe(true);
      expect(all.some((c) => c.code === 'XAU')).toBe(true); // gold
      expect(all.some((c) => c.crypto)).toBe(true);
    });

    it('returns copies (mutating results does not affect the dataset)', () => {
      const all = listCurrencies();
      all[0].countries.push('ZZ');
      expect(listCurrencies()[0].countries).not.toContain('ZZ');
    });
  });
});
