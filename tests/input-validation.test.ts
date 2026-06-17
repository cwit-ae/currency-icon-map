import { getCurrencyIcon, getCurrency, resolveIconName } from '../src/index';

describe('input validation', () => {
  it('throws TypeError on non-string queries', () => {
    // @ts-expect-error
    expect(() => getCurrencyIcon(42)).toThrow(TypeError);
    // @ts-expect-error
    expect(() => getCurrencyIcon(null)).toThrow(/must be a string/);
    // @ts-expect-error
    expect(() => getCurrency({})).toThrow(TypeError);
    // @ts-expect-error
    expect(() => getCurrencyIcon(undefined)).toThrow(TypeError);
  });

  it('throws RangeError on over-length queries', () => {
    const huge = 'a'.repeat(201);
    expect(() => getCurrencyIcon(huge)).toThrow(RangeError);
    expect(() => getCurrencyIcon(huge)).toThrow(/maximum length/);
  });

  it('accepts a query exactly at the limit', () => {
    expect(() => getCurrencyIcon('a'.repeat(200))).not.toThrow();
  });

  it('resolveIconName validates both query and library', () => {
    // @ts-expect-error
    expect(() => resolveIconName(123, 'lucide')).toThrow(TypeError);
    // @ts-expect-error
    expect(() => resolveIconName('USD', 123)).toThrow(/library must be one of/);
  });
});
