import { createCurrencyIconMap } from '../src/index';
import type { Currency } from '../src/index';

const DOGE: Currency = {
  code: 'DOGE',
  numeric: '',
  name: 'Dogecoin',
  symbol: 'Ð',
  minorUnits: 8,
  countries: [],
  aliases: ['doge', 'dogecoin'],
  crypto: true,
};

describe('createCurrencyIconMap', () => {
  it('honours custom default icons for unmatched queries', () => {
    const map = createCurrencyIconMap({
      defaultIcons: { lucide: 'wallet', tabler: 'wallet' },
    });
    const r = map.getCurrencyIcon('nope');
    expect(r.matched).toBe(false);
    expect(r.icons.lucide).toBe('wallet');
    expect(r.icons.tabler).toBe('wallet');
    // Unspecified libraries keep the built-in defaults.
    expect(r.icons.heroicons).toBe('banknotes');
  });

  it('registers extra currencies resolvable by code and alias', () => {
    const map = createCurrencyIconMap({
      extraCurrencies: [DOGE],
      extraIcons: { DOGE: { tabler: 'currency-dogecoin' } },
    });
    expect(map.getCurrency('DOGE')?.name).toBe('Dogecoin');
    expect(map.getCurrencyIcon('doge').currency?.code).toBe('DOGE');
    expect(map.getCurrencyIcon('DOGE').icons.tabler).toBe('currency-dogecoin');
    // Unspecified library falls back to default.
    expect(map.getCurrencyIcon('DOGE').icons.heroicons).toBe('banknotes');
  });

  it('does not leak extras into the default instance', () => {
    createCurrencyIconMap({ extraCurrencies: [DOGE] });
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getCurrency } = require('../src/index');
    expect(getCurrency('DOGE')).toBeNull();
  });

  it('validates extra currencies', () => {
    expect(() =>
      // @ts-expect-error — missing required fields
      createCurrencyIconMap({ extraCurrencies: [{ code: '' }] }),
    ).toThrow(TypeError);
  });

  it('layers configuration via configure()', () => {
    const base = createCurrencyIconMap({ defaultIcons: { lucide: 'wallet' } });
    const layered = base.configure({ extraCurrencies: [DOGE] });
    expect(layered.getCurrency('DOGE')?.code).toBe('DOGE');
    expect(layered.getCurrencyIcon('nope').icons.lucide).toBe('wallet');
  });
});
