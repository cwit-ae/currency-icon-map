/**
 * Ruleset regression guards. These pin the parts of the resolver and icon-map
 * that are easy to break silently with a dataset or rule change: the curated
 * symbol primaries, the resolution priority order, accent/whitespace folding,
 * the documented alpha-3 limitation, and the generic-vs-default icon tiers.
 */
import { getCurrencyIcon, getCurrency, resolveIconName } from '../src/index';

describe('symbol primaries', () => {
  // Every curated symbol in PRIMARY_FOR_SYMBOL must resolve to its declared
  // currency via the symbol path — not the alphabetically-first currency that
  // happens to share the glyph.
  const PRIMARIES: ReadonlyArray<[string, string]> = [
    ['$', 'USD'], ['€', 'EUR'], ['£', 'GBP'], ['¥', 'JPY'], ['₹', 'INR'],
    ['₽', 'RUB'], ['₩', 'KRW'], ['₺', 'TRY'], ['₫', 'VND'], ['฿', 'THB'],
    ['₴', 'UAH'], ['₦', 'NGN'], ['₱', 'PHP'], ['₪', 'ILS'], ['₡', 'CRC'],
    ['₲', 'PYG'], ['₸', 'KZT'], ['₭', 'LAK'], ['₮', 'MNT'], ['₾', 'GEL'],
    ['₵', 'GHS'], ['R$', 'BRL'], ['₿', 'BTC'],
  ];

  it.each(PRIMARIES)('symbol %s resolves to %s', (symbol, code) => {
    const r = getCurrencyIcon(symbol);
    expect(r.currency?.code).toBe(code);
    expect(r.matchType).toBe('symbol');
  });
});

describe('resolution priority', () => {
  it('matches a numeric ISO code (with leading zero) before country/name', () => {
    expect(getCurrencyIcon('036').currency?.code).toBe('AUD'); // Australia
    expect(getCurrencyIcon('008').currency?.code).toBe('ALL'); // Albania
  });

  it('prefers a 3-letter currency code over everything else', () => {
    expect(getCurrencyIcon('USD').matchType).toBe('code');
    expect(getCurrencyIcon('eur').matchType).toBe('code');
  });

  it('prefers an exact symbol over a country code', () => {
    // "$" is a symbol (→ USD); it must not be mistaken for anything else.
    expect(getCurrencyIcon('$').matchType).toBe('symbol');
  });
});

describe('normalization (accent / case / whitespace)', () => {
  it('folds accents in country names', () => {
    expect(getCurrency('reunion')?.code).toBe('EUR');  // Réunion
    expect(getCurrency('turkiye')?.code).toBe('TRY');  // Türkiye
  });

  it('collapses whitespace and ignores case in names', () => {
    expect(getCurrency('  us   dollar ')?.code).toBe('USD');
    expect(getCurrency('JAPANESE YEN')?.code).toBe('JPY');
  });
});

describe('documented limitations', () => {
  it('does not resolve ISO 3166 alpha-3 country codes (alpha-2 only)', () => {
    const r = getCurrencyIcon('USA');
    expect(r.matched).toBe(false);
    expect(r.matchType).toBe('default');
  });

  it('does not resolve a partial country name', () => {
    // The dataset name is "Åland Islands"; the bare word does not match.
    expect(getCurrency('aland')).toBeNull();
  });
});

describe('icon tiers: dedicated vs generic vs default', () => {
  it('a known currency with no dedicated icon returns the generic (matched) icon', () => {
    // XAU (gold) has no symbol/country and no dedicated icon in any library.
    const r = getCurrencyIcon('XAU');
    expect(r.matched).toBe(true);
    expect(r.matchType).toBe('code');
    expect(r.icons).toEqual({
      lucide: 'coins',
      tabler: 'coin',        // generic differs from the unmatched default ("coins")
      fontawesome: 'coins',
      heroicons: 'banknotes',
    });
  });

  it('the generic (known-currency) tier differs from the unmatched default in Tabler', () => {
    const known = getCurrencyIcon('XAU');     // matched, generic → "coin"
    const unknown = getCurrencyIcon('zzzzz');  // unmatched, default → "coins"
    expect(known.icons.tabler).toBe('coin');
    expect(unknown.icons.tabler).toBe('coins');
    expect(unknown.matched).toBe(false);
  });
});

describe('PascalCase conversion for hyphenated icon names', () => {
  it('converts multi-segment names per library convention', () => {
    expect(resolveIconName('AUD', 'tabler', { case: 'pascal' })).toBe('IconCurrencyDollarAustralian');
    expect(resolveIconName('INR', 'fontawesome', { case: 'pascal' })).toBe('faIndianRupeeSign');
    expect(resolveIconName('NPR', 'tabler', { case: 'pascal' })).toBe('IconCurrencyRupeeNepalese');
  });
});
