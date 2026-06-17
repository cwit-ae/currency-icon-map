/**
 * Font Awesome adapter — `currency-icon-map/fontawesome`.
 *
 * Requires the optional peer dependencies `@fortawesome/react-fontawesome`,
 * `@fortawesome/fontawesome-svg-core`, and `@fortawesome/free-solid-svg-icons`.
 * Font Awesome renders from an icon *definition* (not a component), so this
 * adapter resolves the definition and renders it via `<FontAwesomeIcon>`.
 *
 * @example
 * ```tsx
 * import { CurrencyIcon, getFontAwesomeIconDefinition } from 'currency-icon-map/fontawesome';
 *
 * <CurrencyIcon currency="INR" />                        // faIndianRupeeSign
 * const def = getFontAwesomeIconDefinition('btc');       // faBitcoinSign... (solid)
 * ```
 */
import * as React from 'react';
import { FontAwesomeIcon, type FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import * as SolidIcons from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { resolveIconName } from '../index.js';

const REGISTRY = SolidIcons as unknown as Record<string, IconDefinition>;

/** The Font Awesome export name (e.g. "faDollarSign") for a currency query. */
export function getFontAwesomeIconName(currency: string): string {
  return resolveIconName(currency, 'fontawesome', { case: 'pascal' });
}

/** The Font Awesome icon definition for a currency query (default coins if unmatched). */
export function getFontAwesomeIconDefinition(currency: string): IconDefinition {
  const name = getFontAwesomeIconName(currency);
  return REGISTRY[name] ?? SolidIcons.faCoins;
}

export interface CurrencyIconProps extends Omit<FontAwesomeIconProps, 'icon'> {
  /** Currency query: ISO code, symbol, name, or country. */
  currency: string;
}

/** Renders the Font Awesome icon for a currency. Extra props pass through. */
export const CurrencyIcon: React.FC<CurrencyIconProps> = ({ currency, ...props }) => {
  const icon = getFontAwesomeIconDefinition(currency);
  return React.createElement(FontAwesomeIcon, { icon, ...props });
};

CurrencyIcon.displayName = 'CurrencyIcon(fontawesome)';
