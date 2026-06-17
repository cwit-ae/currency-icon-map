/**
 * Adapter wiring tests. These assert that each adapter resolves a currency to
 * the *correct* component/definition from the real icon library (by reference
 * equality) and that the React wrapper builds an element without throwing — no
 * DOM renderer required.
 */
import * as React from 'react';

import * as LucideIcons from 'lucide-react';
import * as TablerIcons from '@tabler/icons-react';
import * as FaSolid from '@fortawesome/free-solid-svg-icons';
import * as HeroOutline from '@heroicons/react/24/outline';

import * as Lucide from '../src/adapters/lucide';
import * as Tabler from '../src/adapters/tabler';
import * as Fa from '../src/adapters/fontawesome';
import * as Hero from '../src/adapters/heroicons';

describe('lucide adapter', () => {
  it('resolves the correct component', () => {
    expect(Lucide.getLucideIcon('USD')).toBe(LucideIcons.DollarSign);
    expect(Lucide.getLucideIcon('EUR')).toBe(LucideIcons.Euro);
  });
  it('falls back to Coins when unmatched', () => {
    expect(Lucide.getLucideIcon('nope')).toBe(LucideIcons.Coins);
  });
  it('builds an element', () => {
    const el = React.createElement(Lucide.CurrencyIcon, { currency: 'USD', size: 20 });
    expect(el.type).toBe(Lucide.CurrencyIcon);
  });
});

describe('tabler adapter', () => {
  it('resolves the correct component', () => {
    expect(Tabler.getTablerIcon('EUR')).toBe(TablerIcons.IconCurrencyEuro);
    expect(Tabler.getTablerIcon('THB')).toBe(TablerIcons.IconCurrencyBaht);
  });
  it('falls back to IconCoins when unmatched', () => {
    expect(Tabler.getTablerIcon('nope')).toBe(TablerIcons.IconCoins);
  });
});

describe('fontawesome adapter', () => {
  it('resolves the correct icon definition', () => {
    expect(Fa.getFontAwesomeIconDefinition('INR')).toBe(FaSolid.faIndianRupeeSign);
    expect(Fa.getFontAwesomeIconDefinition('GBP')).toBe(FaSolid.faSterlingSign);
  });
  it('falls back to faCoins when unmatched', () => {
    expect(Fa.getFontAwesomeIconDefinition('nope')).toBe(FaSolid.faCoins);
  });
});

describe('heroicons adapter', () => {
  it('resolves the correct component', () => {
    expect(Hero.getHeroIcon('GBP')).toBe(HeroOutline.CurrencyPoundIcon);
    expect(Hero.getHeroIcon('USD')).toBe(HeroOutline.CurrencyDollarIcon);
  });
  it('falls back to BanknotesIcon when unmatched', () => {
    expect(Hero.getHeroIcon('nope')).toBe(HeroOutline.BanknotesIcon);
  });
});
