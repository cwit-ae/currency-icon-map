/**
 * Query normalization helpers. Lookups are case-, accent-, and
 * whitespace-insensitive for names/codes/countries, while symbol matching is
 * exact (symbols are intentionally not folded).
 */

// Combining diacritical marks (U+0300–U+036F), stripped after NFKD so that
// "é" → "e", "ü" → "u", etc.
const COMBINING_MARKS = /[̀-ͯ]/g;

/**
 * Normalize a name/code/country query: lowercase, strip diacritics, collapse
 * internal whitespace, and trim. Used for the name/alias/country indexes.
 */
export function normalizeName(input: string): string {
  return input
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Normalize an ISO-style code: uppercase + trim. */
export function normalizeCode(input: string): string {
  return input.trim().toUpperCase();
}

/** Convert a kebab-case icon name to PascalCase (dollar-sign → DollarSign). */
export function kebabToPascal(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}
