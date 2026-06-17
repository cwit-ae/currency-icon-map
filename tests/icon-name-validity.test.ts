/**
 * The integrity guarantee: every icon name this package maps a currency to must
 * actually exist in the installed (pinned) icon library. If an upstream library
 * renames or removes an icon, or a map entry is mistyped, this test fails in CI
 * before the package can ship. It mirrors scripts/generate-icon-maps.mjs and
 * exercises the exact name→component conversion the adapters use.
 */
import { ICON_MAPS, DEFAULT_ICONS, VALIDATED_VERSIONS } from '../src/data/icons.generated';
import { kebabToPascal } from '../src/resolver/normalize';

import * as LucideIcons from 'lucide-react';
import * as TablerIcons from '@tabler/icons-react';
import * as FaSolid from '@fortawesome/free-solid-svg-icons';
import * as HeroOutline from '@heroicons/react/24/outline';

const lucideHas = (kebab: string) =>
  (LucideIcons as Record<string, unknown>)[kebabToPascal(kebab)] !== undefined;

const tablerHas = (kebab: string) =>
  typeof (TablerIcons as Record<string, unknown>)[`Icon${kebabToPascal(kebab)}`] !== 'undefined';

const faHas = (kebab: string) => {
  const registry = FaSolid as unknown as Record<string, { iconName?: string }>;
  const def = registry[`fa${kebabToPascal(kebab)}`];
  return Boolean(def && def.iconName);
};

const heroHas = (kebab: string) =>
  typeof (HeroOutline as Record<string, unknown>)[`${kebabToPascal(kebab)}Icon`] !== 'undefined';

const CHECKS = {
  lucide: lucideHas,
  tabler: tablerHas,
  fontawesome: faHas,
  heroicons: heroHas,
} as const;

describe('icon-name validity', () => {
  for (const lib of Object.keys(CHECKS) as (keyof typeof CHECKS)[]) {
    describe(lib, () => {
      it('default icon exists in the installed library', () => {
        expect(CHECKS[lib](DEFAULT_ICONS[lib])).toBe(true);
      });

      it('every mapped icon name exists in the installed library', () => {
        const missing: string[] = [];
        const seen = new Set<string>();
        for (const [code, name] of Object.entries(ICON_MAPS[lib])) {
          if (seen.has(name)) continue;
          seen.add(name);
          if (!CHECKS[lib](name)) missing.push(`${code} → ${name}`);
        }
        expect(missing).toEqual([]);
      });
    });
  }

  it('records the versions the maps were validated against', () => {
    expect(VALIDATED_VERSIONS.lucide).toMatch(/^\d+\.\d+\.\d+/);
    expect(VALIDATED_VERSIONS.tabler).toMatch(/^\d+\.\d+\.\d+/);
    expect(VALIDATED_VERSIONS.fontawesome).toMatch(/^\d+\.\d+\.\d+/);
    expect(VALIDATED_VERSIONS.heroicons).toMatch(/^\d+\.\d+\.\d+/);
  });
});
