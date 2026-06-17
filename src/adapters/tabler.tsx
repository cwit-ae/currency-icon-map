/**
 * Tabler adapter — `currency-icon-map/tabler`.
 *
 * Requires the optional peer dependency `@tabler/icons-react`.
 *
 * @example
 * ```tsx
 * import { CurrencyIcon, getTablerIcon } from 'currency-icon-map/tabler';
 *
 * <CurrencyIcon currency="EUR" size={20} />          // renders <IconCurrencyEuro/>
 * const Icon = getTablerIcon('thb'); <Icon size={16} />
 * ```
 */
import * as React from 'react';
import * as TablerIcons from '@tabler/icons-react';
import type { Icon, IconProps } from '@tabler/icons-react';
import { resolveIconName } from '../index.js';

const REGISTRY = TablerIcons as unknown as Record<string, Icon>;

/** The Tabler component name (e.g. "IconCurrencyDollar") for a currency query. */
export function getTablerIconName(currency: string): string {
  return resolveIconName(currency, 'tabler', { case: 'pascal' });
}

/** The Tabler React component for a currency query (default coin if unmatched). */
export function getTablerIcon(currency: string): Icon {
  const name = getTablerIconName(currency);
  return REGISTRY[name] ?? TablerIcons.IconCoins;
}

export interface CurrencyIconProps extends IconProps {
  /** Currency query: ISO code, symbol, name, or country. */
  currency: string;
}

/** Renders the Tabler icon for a currency. Extra props pass through to Tabler. */
export const CurrencyIcon: React.FC<CurrencyIconProps> = ({ currency, ...props }) => {
  const IconComponent = getTablerIcon(currency);
  return React.createElement(IconComponent, props);
};

CurrencyIcon.displayName = 'CurrencyIcon(tabler)';
