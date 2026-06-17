/**
 * Heroicons adapter — `currency-icon-map/heroicons`.
 *
 * Requires the optional peer dependency `@heroicons/react`. Defaults to the
 * 24px outline set; pass `variant` to switch.
 *
 * @example
 * ```tsx
 * import { CurrencyIcon, getHeroIcon } from 'currency-icon-map/heroicons';
 *
 * <CurrencyIcon currency="GBP" className="w-5 h-5" />            // CurrencyPoundIcon
 * <CurrencyIcon currency="GBP" variant="solid" className="w-5 h-5" />
 * ```
 */
import * as React from 'react';
import * as Outline from '@heroicons/react/24/outline';
import * as Solid from '@heroicons/react/24/solid';
import * as SolidMini from '@heroicons/react/20/solid';
import { resolveIconName } from '../index.js';

/** Heroicons render variant. */
export type HeroVariant = 'outline' | 'solid' | 'mini';

type HeroComponent = React.ComponentType<React.SVGProps<SVGSVGElement> & { title?: string }>;

const SETS: Record<HeroVariant, Record<string, HeroComponent>> = {
  outline: Outline as unknown as Record<string, HeroComponent>,
  solid: Solid as unknown as Record<string, HeroComponent>,
  mini: SolidMini as unknown as Record<string, HeroComponent>,
};

/** The Heroicons component name (e.g. "CurrencyDollarIcon") for a query. */
export function getHeroIconName(currency: string): string {
  return resolveIconName(currency, 'heroicons', { case: 'pascal' });
}

/** The Heroicons React component for a currency query (default banknotes if unmatched). */
export function getHeroIcon(currency: string, variant: HeroVariant = 'outline'): HeroComponent {
  const set = SETS[variant] ?? SETS.outline;
  const name = getHeroIconName(currency);
  return set[name] ?? set.BanknotesIcon;
}

export interface CurrencyIconProps extends React.SVGProps<SVGSVGElement> {
  /** Currency query: ISO code, symbol, name, or country. */
  currency: string;
  /** Heroicons variant (default `'outline'`). */
  variant?: HeroVariant;
  title?: string;
}

/** Renders the Heroicons icon for a currency. Extra props pass through. */
export const CurrencyIcon: React.FC<CurrencyIconProps> = ({ currency, variant = 'outline', ...props }) => {
  const Icon = getHeroIcon(currency, variant);
  return React.createElement(Icon, props);
};

CurrencyIcon.displayName = 'CurrencyIcon(heroicons)';
