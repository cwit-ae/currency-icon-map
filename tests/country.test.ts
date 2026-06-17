import { getCurrencyIcon, getCurrency } from '../src/index';

describe('country resolution', () => {
  it('resolves an ISO 3166-1 alpha-2 country code', () => {
    expect(getCurrencyIcon('JP').currency?.code).toBe('JPY');
    expect(getCurrencyIcon('jp').matchType).toBe('country');
    expect(getCurrencyIcon('GB').currency?.code).toBe('GBP');
    expect(getCurrencyIcon('IN').currency?.code).toBe('INR');
  });

  it('resolves a country name', () => {
    expect(getCurrency('Japan')?.code).toBe('JPY');
    expect(getCurrencyIcon('Japan').matchType).toBe('country');
    expect(getCurrency('united states of america')?.code).toBe('USD');
  });

  it('maps multi-country currencies from any member', () => {
    // Both Germany and France use the euro.
    expect(getCurrency('DE')?.code).toBe('EUR');
    expect(getCurrency('FR')?.code).toBe('EUR');
  });

  it('does not treat a currency code as a country', () => {
    // "US" is a country (→ USD); "USD" is a code (→ USD). Both land on USD but
    // via different paths.
    expect(getCurrencyIcon('US').matchType).toBe('country');
    expect(getCurrencyIcon('USD').matchType).toBe('code');
  });
});
