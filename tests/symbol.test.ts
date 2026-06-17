import { getCurrencyIcon } from '../src/index';

describe('symbol resolution', () => {
  it('resolves unambiguous symbols', () => {
    expect(getCurrencyIcon('€').currency?.code).toBe('EUR');
    expect(getCurrencyIcon('£').currency?.code).toBe('GBP');
    expect(getCurrencyIcon('₹').currency?.code).toBe('INR');
    expect(getCurrencyIcon('€').matchType).toBe('symbol');
  });

  it('resolves shared "$" to USD (documented primary)', () => {
    const r = getCurrencyIcon('$');
    expect(r.currency?.code).toBe('USD');
    expect(r.matchType).toBe('symbol');
  });

  it('resolves shared "¥" to JPY (documented primary)', () => {
    expect(getCurrencyIcon('¥').currency?.code).toBe('JPY');
  });

  it('resolves the Bitcoin symbol', () => {
    expect(getCurrencyIcon('₿').currency?.code).toBe('BTC');
  });

  it('prefers a code over a symbol when both could match', () => {
    // Codes are tried before symbols; "USD" is a code, never a symbol.
    expect(getCurrencyIcon('USD').matchType).toBe('code');
  });
});
