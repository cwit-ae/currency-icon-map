/**
 * Lucide adapter — `currency-icon-map/lucide`.
 *
 * Requires the optional peer dependency `lucide-react`. Importing this subpath
 * without it installed will fail with a clear "Cannot find module 'lucide-react'".
 *
 * @example
 * ```tsx
 * import { CurrencyIcon, getLucideIcon } from 'currency-icon-map/lucide';
 *
 * <CurrencyIcon currency="USD" size={20} />          // renders <DollarSign/>
 * const Icon = getLucideIcon('jpy'); <Icon size={16} />
 * ```
 */
import * as React from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { resolveIconName } from '../index.js';

const REGISTRY = LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>;

/** The Lucide component name (PascalCase) for a currency query. */
export function getLucideIconName(currency: string): string {
  return resolveIconName(currency, 'lucide', { case: 'pascal' });
}

/** The Lucide React component for a currency query (default coin if unmatched). */
export function getLucideIcon(currency: string): React.ComponentType<LucideProps> {
  const name = getLucideIconName(currency);
  return REGISTRY[name] ?? LucideIcons.Coins;
}

export interface CurrencyIconProps extends LucideProps {
  /** Currency query: ISO code, symbol, name, or country. */
  currency: string;
}

/** Renders the Lucide icon for a currency. Extra props pass through to Lucide. */
export const CurrencyIcon: React.FC<CurrencyIconProps> = ({ currency, ...props }) => {
  const Icon = getLucideIcon(currency);
  return React.createElement(Icon, props);
};

CurrencyIcon.displayName = 'CurrencyIcon(lucide)';
