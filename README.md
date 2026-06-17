<p align="center">
  <a href="https://www.npmjs.com/package/currency-icon-map"><img src="https://img.shields.io/npm/v/currency-icon-map?style=flat-square&color=1a1a2e" alt="npm version" /></a>
  <a href="https://github.com/cwit-ae/currency-icon-map/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/cwit-ae/currency-icon-map/ci.yml?branch=main&style=flat-square&color=1a1a2e&label=CI" alt="CI status" /></a>
  <a href="https://github.com/cwit-ae/currency-icon-map/actions/workflows/codeql.yml"><img src="https://img.shields.io/github/actions/workflow/status/cwit-ae/currency-icon-map/codeql.yml?branch=main&style=flat-square&color=1a1a2e&label=CodeQL" alt="CodeQL status" /></a>
  <a href="https://www.npmjs.com/package/currency-icon-map"><img src="https://img.shields.io/npm/dm/currency-icon-map?style=flat-square&color=1a1a2e" alt="npm downloads" /></a>
  <a href="https://bundlephobia.com/package/currency-icon-map"><img src="https://img.shields.io/bundlephobia/minzip/currency-icon-map?style=flat-square&color=1a1a2e&label=min%2Bgzip" alt="bundle size" /></a>
  <img src="https://img.shields.io/badge/zero-dependencies-1a1a2e?style=flat-square" alt="zero dependencies" />
  <img src="https://img.shields.io/npm/l/currency-icon-map?style=flat-square&color=1a1a2e" alt="license" />
</p>

<h1 align="center">currency-icon-map</h1>

<p align="center">
  <strong>Resolve any currency — by ISO 4217 code, symbol, name, or country — to the correct icon name for Lucide, Tabler, Font Awesome, and Heroicons, with a guaranteed default fallback.</strong>
</p>

<p align="center">
  One call returns the right icon name for all four libraries at once. 184 currencies (every active ISO 4217 entry plus major crypto). Optional React adapters render real components.<br/>
  Zero runtime dependencies. Fully offline. Icon libraries stay optional and are never bundled.
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#comparison-with-other-npm-packages">Comparison</a> ·
  <a href="#api-reference">API</a> ·
  <a href="#react-adapters">Adapters</a> ·
  <a href="#icon-coverage">Coverage</a> ·
  <a href="#contributing">Contributing</a>
</p>

---

<p align="center">
  <strong>Why currency-icon-map</strong>
</p>

- **Four input forms, one resolver.** Pass an ISO 4217 code (`"USD"`), a numeric code (`"840"`), a symbol (`"$"`, `"€"`, `"₹"`), an ISO 3166 country (`"JP"` or `"Japan"`), a name (`"japanese yen"`), or a nickname (`"quid"`) — all resolved case-, accent-, and whitespace-insensitively, with a documented priority order.
- **All four icon libraries at once.** Every result carries the icon name for Lucide, Tabler, Font Awesome, and Heroicons. Pick the library you use; switch later without remapping.
- **Every mapped name is verified to exist.** The icon maps are generated from — and validated against — the pinned icon packages. A shipped test suite fails CI if any name a currency maps to is missing from its target library, so you never render a broken icon.
- **Guaranteed fallback, never a blank.** Unknown query? You get a sensible generic coin/banknote icon and `matched: false`, never `undefined`.
- **Zero runtime dependencies, fully offline.** The icon libraries are *optional peer dependencies* used only by the React adapters — the core ships no icon artwork and pulls in nothing at runtime.

```ts
import { getCurrencyIcon, resolveIconName } from "currency-icon-map";

getCurrencyIcon("USD").icons;
// { lucide: "dollar-sign", tabler: "currency-dollar", fontawesome: "dollar-sign", heroicons: "currency-dollar" }

getCurrencyIcon("¥").currency?.code;     // "JPY"   (resolved by symbol)
getCurrencyIcon("Japan").matchType;       // "country"
getCurrencyIcon("quid").currency?.code;   // "GBP"   (resolved by alias)
getCurrencyIcon("???").matched;           // false  → default icons

resolveIconName("eur", "tabler");                      // "currency-euro"
resolveIconName("eur", "tabler", { case: "pascal" });  // "IconCurrencyEuro"
```

---

## Table of Contents

- [Overview](#overview)
- [Comparison with Other npm Packages](#comparison-with-other-npm-packages)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [React Adapters](#react-adapters)
- [Resolution Order](#resolution-order)
- [Icon Coverage](#icon-coverage)
- [How the Maps Are Built and Verified](#how-the-maps-are-built-and-verified)
- [Custom Instances](#custom-instances)
- [Supported Currencies](#supported-currencies)
- [Use Cases](#use-cases)
- [Limitations](#limitations)
- [Contributing](#contributing)
- [Data Sources and Attribution](#data-sources-and-attribution)
- [Security](#security)
- [License](#license)

---

## Overview

Rendering a currency icon in a UI usually means hand-maintaining a `switch` that
maps `"USD" → <DollarSign/>`, `"EUR" → <Euro/>`, and so on — and then doing it
again for every icon library, every new currency, and every time a user types a
symbol or a country instead of a code. `currency-icon-map` collapses all of that
into a single lookup.

You give it a currency in whatever form you have it; it gives you back the
currency record and the icon name in **every** supported library at once. If you
use React, the adapters turn that into a rendered component from your installed
icon package. If the currency has no dedicated icon in a given library, you get
that library's generic coin/banknote icon rather than a blank.

| Challenge | How currency-icon-map addresses it |
| --------- | ---------------------------------- |
| Users provide currencies in inconsistent forms (code, symbol, name, country) | A single resolver tries code → symbol → numeric → country → name → alias, in a documented priority order |
| The same symbol means different currencies (`$`, `¥`, `kr`) | Curated symbol primaries (`$ → USD`, `¥ → JPY`, …) so the common case is unambiguous; codes always win over symbols |
| Each icon library names icons differently (`dollar-sign` vs `currency-dollar` vs `IconCurrencyDollar`) | One result carries the correct name per library, in kebab-case or each library's PascalCase component form |
| Icon libraries rename or remove icons between versions | Maps are generated from the pinned packages and a test asserts every name still exists; upgrades are caught in CI |
| Most currencies have no dedicated icon | Symbol-group fallback (any `$` currency → the generic dollar icon) then a generic coin/banknote, never `undefined` |
| Bundling an icon library bloats consumers who use a different one | Icon libraries are optional peer dependencies; the core ships zero icon assets and zero runtime deps |

---

## Comparison with Other npm Packages

The table below compares `currency-icon-map` with packages commonly reached for
when mapping currencies to symbols or icons, based on each package's README, npm
metadata, and source repository as of 2026-06-17. A cell reads ✅ where the
capability is documented and shipped, ⚠️ where it is partial, ❌ where the public
API confirms the feature is absent, and "n/a" where it does not apply.

| Capability | **currency-icon-map** | `currency-symbol-map` | `currency-icons` | `country-currency-map` |
| ---------- | --------------------- | --------------------- | ---------------- | ---------------------- |
| Maps currency → **icon** (not just symbol) | ✅ | ❌ (symbol string only) | ✅ (ships SVGs) | ❌ |
| Targets multiple icon libraries from one call | ✅ (Lucide, Tabler, FA, Heroicons) | n/a | ❌ (own icon set) | n/a |
| Resolve by ISO 4217 code | ✅ | ✅ | ⚠️ | ✅ |
| Resolve by symbol | ✅ | ❌ (reverse only) | ❌ | ❌ |
| Resolve by country (code or name) | ✅ | ❌ | ❌ | ✅ |
| Resolve by name / colloquial alias | ✅ | ❌ | ❌ | ❌ |
| Guaranteed default fallback icon | ✅ | n/a | ⚠️ | n/a |
| Every mapped icon name verified to exist upstream | ✅ | n/a | not documented | n/a |
| Ships icon artwork (and its weight) | ❌ (names only) | ❌ | ✅ (bundled SVGs) | ❌ |
| Runtime dependencies | 0 | 0 | varies | 0 |
| Optional React adapters | ✅ | ❌ | ⚠️ | ❌ |
| First-class TypeScript types | ✅ | ✅ | ⚠️ | ⚠️ |

`currency-symbol-map` is excellent at exactly one thing — code → symbol — and is
in fact used here as a *build-time* data source. `currency-icons` ships its own
SVG set, which is convenient if you want artwork in the package but means you
adopt its icon style and bundle weight rather than reusing the icon library your
app already uses. `country-currency-map` focuses on the country ↔ currency
relationship without any icon mapping. `currency-icon-map`'s distinguishing
properties are: resolution from four input forms, simultaneous mapping to four
mainstream icon libraries by name, a verified-against-upstream guarantee, and
zero bundled artwork or runtime dependencies.

> Comparisons are derived from each package's published documentation, npm
> metadata, and source as of the date noted above. Consumers are encouraged to
> re-verify against the latest upstream releases before relying on these figures.

---

## Installation

```bash
npm install currency-icon-map
```

The core has **zero runtime dependencies**. To render real React components,
install only the icon library you actually use (they are optional peer
dependencies):

```bash
# Pick the one(s) you use:
npm install lucide-react
npm install @tabler/icons-react
npm install @heroicons/react
npm install @fortawesome/react-fontawesome @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons
```

---

## Quick Start

```ts
import { getCurrencyIcon } from "currency-icon-map";

const result = getCurrencyIcon("USD");
// {
//   matched: true,
//   matchType: "code",
//   query: "USD",
//   currency: { code: "USD", name: "US Dollar", symbol: "$", numeric: "840", minorUnits: 2, countries: [...], aliases: [...], crypto: false },
//   icons: { lucide: "dollar-sign", tabler: "currency-dollar", fontawesome: "dollar-sign", heroicons: "currency-dollar" }
// }
```

All of these resolve to the same currency:

```ts
getCurrencyIcon("EUR");      // by code
getCurrencyIcon("978");      // by ISO numeric code
getCurrencyIcon("€");        // by symbol
getCurrencyIcon("DE");       // by country code (Germany)
getCurrencyIcon("Germany");  // by country name
getCurrencyIcon("euro");     // by name / alias
```

Need just one library's name?

```ts
import { resolveIconName } from "currency-icon-map";

resolveIconName("GBP", "lucide");                       // "pound-sterling"
resolveIconName("GBP", "lucide", { case: "pascal" });   // "PoundSterling"
resolveIconName("GBP", "tabler", { case: "pascal" });   // "IconCurrencyPound"
resolveIconName("GBP", "heroicons", { case: "pascal" });// "CurrencyPoundIcon"
```

---

## API Reference

### `getCurrencyIcon(query: string): CurrencyIconResult`

Resolves a query to a currency and the icon names for all four libraries.

```ts
interface CurrencyIconResult {
  matched: boolean;           // false when nothing matched
  matchType: "code" | "symbol" | "country" | "name" | "alias" | "default";
  query: string;              // the trimmed query
  currency: Currency | null;  // null when unmatched
  icons: IconNames;           // per-library icon name (defaults when unmatched)
}

interface IconNames {
  lucide: string;
  tabler: string;
  fontawesome: string;
  heroicons: string;
}
```

### `getCurrency(query: string): Currency | null`

Resolves a query to its currency record, or `null` if nothing matched.

```ts
interface Currency {
  code: string;        // ISO 4217 alpha-3, or a crypto ticker
  numeric: string;     // ISO 4217 numeric code ("" for non-ISO entries)
  name: string;        // "US Dollar"
  symbol: string;      // "$" (falls back to the code if none exists)
  minorUnits: number;  // 2
  countries: string[]; // ISO 3166-1 alpha-2 codes
  aliases: string[];   // curated nicknames (lowercase)
  crypto: boolean;     // true for BTC/ETH/…
}
```

### `resolveIconName(query, library, options?): string`

Resolves a query directly to one library's icon name. Returns the library's
default icon name when unmatched. Throws `TypeError` on an unknown library.

```ts
type IconLibrary = "lucide" | "tabler" | "fontawesome" | "heroicons";

resolveIconName(query: string, library: IconLibrary, options?: {
  case?: "kebab" | "pascal";   // default "kebab"
}): string;
```

The PascalCase form follows each library's component naming convention:
`lucide → DollarSign`, `tabler → IconCurrencyDollar`,
`fontawesome → faDollarSign`, `heroicons → CurrencyDollarIcon`.

### `listCurrencies(): Currency[]`

Returns a copy of all known currencies (mutating the result is safe).

### `createCurrencyIconMap(config?): CurrencyIconMap`

Creates a custom instance. See [Custom Instances](#custom-instances).

### Input validation

All entry points validate input: a non-string query throws `TypeError`; a query
longer than 200 characters throws `RangeError`. Empty or whitespace-only queries
return an unmatched result with default icons rather than throwing.

---

## React Adapters

Each adapter is a separate subpath import and requires its icon library as a
peer dependency. Importing an adapter without its peer installed fails fast with
a clear "Cannot find module" error.

```tsx
import { CurrencyIcon, getLucideIcon } from "currency-icon-map/lucide";

// Component — extra props pass straight through to the underlying icon:
<CurrencyIcon currency="USD" size={20} strokeWidth={1.5} />

// Or grab the component yourself:
const Icon = getLucideIcon("jpy");
<Icon size={16} />
```

```tsx
import { CurrencyIcon } from "currency-icon-map/tabler";
<CurrencyIcon currency="EUR" size={20} />        // <IconCurrencyEuro/>

import { CurrencyIcon } from "currency-icon-map/heroicons";
<CurrencyIcon currency="GBP" variant="solid" className="w-5 h-5" />

import { CurrencyIcon } from "currency-icon-map/fontawesome";
<CurrencyIcon currency="INR" />                  // faIndianRupeeSign
```

Each adapter also exports name/definition helpers: `getLucideIcon` /
`getLucideIconName`, `getTablerIcon` / `getTablerIconName`,
`getFontAwesomeIconDefinition` / `getFontAwesomeIconName`, and `getHeroIcon` /
`getHeroIconName`.

---

## Resolution Order

A query is tried against each index in turn; the first hit wins:

1. **ISO 4217 / ticker code** — `"USD"`, `"btc"` (case-insensitive)
2. **Exact symbol** — `"$"`, `"€"`, `"₹"` (matched exactly, not folded)
3. **ISO 4217 numeric code** — `"840"`
4. **ISO 3166-1 alpha-2 country code** — `"US"`, `"jp"`
5. **Currency name** — `"us dollar"`, `"euro"` (accent/case/space-insensitive)
6. **Alias / nickname** — `"buck"`, `"quid"`
7. **Country name** — `"united states"`, `"japan"`

No match → `matched: false`, `matchType: "default"`, and the default icons.

Because codes are tried first, a three-letter currency code is never shadowed by
anything else; because symbols are tried before country codes, `"$"` resolves to
USD rather than being mistaken for a country.

---

## Icon Coverage

All 184 currencies map to *some* icon in every library. The number with a
**dedicated or symbol-specific** icon (rather than the generic coin/banknote
fallback) varies by how rich each library's currency set is:

| Library | Currencies with a specific icon | Distinct icons used | Generic fallback | Default (unmatched) |
| ------- | ------------------------------: | ------------------: | ---------------- | ------------------- |
| **Tabler** | 111 | 56 | `coin` | `coins` |
| **Font Awesome** | 89 | 30 | `coins` | `coins` |
| **Lucide** | 52 | 9 | `coins` | `coins` |
| **Heroicons** | 50 | 7 | `banknotes` | `banknotes` |

Tabler ships by far the richest currency set (dedicated icons for the baht,
hryvnia, naira, taka, tenge, tugrik, and dozens more), so it gives the most
visually specific result. Lucide and Heroicons have a handful of dedicated
currency icons and otherwise resolve `$`/`€`/`£`/`¥`/`₹` currencies to the
matching generic symbol icon.

---

## How the Maps Are Built and Verified

The icon maps are not hand-typed. Two scripts generate the embedded data:

- `scripts/generate-currencies.mjs` builds the currency and country datasets from
  ISO 4217 / ISO 3166 data sources (used only as dev dependencies).
- `scripts/generate-icon-maps.mjs` resolves each currency to an icon per library
  and **validates every produced name against the installed icon package**,
  aborting if any name does not exist.

That same guarantee ships as a test: `tests/icon-name-validity.test.ts` loads
each pinned icon library and asserts every mapped name (and the default) resolves
to a real export, using the exact name→component conversion the adapters use. If
an upstream library renames an icon, the next dependency bump fails CI before it
can reach you. The versions the current maps were validated against are exported
as `VALIDATED_VERSIONS` from `currency-icon-map/data`.

---

## Custom Instances

```ts
import { createCurrencyIconMap } from "currency-icon-map";

const map = createCurrencyIconMap({
  // Override the default icons returned for unmatched queries (partial — the
  // rest keep the built-in defaults):
  defaultIcons: { lucide: "wallet", tabler: "wallet" },

  // Register currencies the dataset doesn't include:
  extraCurrencies: [{
    code: "DOGE", numeric: "", name: "Dogecoin", symbol: "Ð",
    minorUnits: 8, countries: [], aliases: ["doge"], crypto: true,
  }],

  // Override or add icon names per currency code:
  extraIcons: { DOGE: { tabler: "currency-dogecoin" } },
});

map.getCurrencyIcon("doge").currency?.code;     // "DOGE"
map.getCurrencyIcon("DOGE").icons.tabler;        // "currency-dogecoin"
```

Instances are isolated — extras registered on one instance never leak into the
default `getCurrencyIcon`. Use `instance.configure({...})` to layer further
configuration on top of an existing instance.

---

## Supported Currencies

- **All 179 active ISO 4217 currencies**, including precious-metal and fund codes
  (`XAU` gold, `XAG` silver, `XDR` SDR) which carry no symbol or country and fall
  back to a generic coin.
- **5 digital currencies**: `BTC`, `ETH`, `LTC`, `XRP`, `XMR`.
- **246 country → currency mappings** (ISO 3166-1 alpha-2 and country name).

Need one we don't ship? Register it on a custom instance, or open a
[missing-currency issue](https://github.com/cwit-ae/currency-icon-map/issues/new/choose).

---

## Use Cases

- **Fintech dashboards & wallets** — render the right icon next to balances,
  transactions, and exchange rates regardless of how the currency is stored.
- **E-commerce & checkout** — show a currency icon from a locale, country, or
  price symbol without a per-library `switch`.
- **Admin panels & data tables** — accept whatever currency representation your
  data has (code, symbol, country) and render consistently.
- **Design systems** — expose one `<CurrencyIcon>` that works with whichever icon
  library your team standardized on.

---

## Limitations

- **Symbol ambiguity is resolved to a documented primary.** `$` resolves to USD,
  `¥` to JPY, and so on. If you need AUD vs USD disambiguation, resolve by code
  or country, not symbol.
- **Most currencies fall back to a generic icon in Lucide and Heroicons.** Those
  libraries simply do not ship a dedicated icon for, say, the Kazakhstani tenge.
  This is expected — Tabler or Font Awesome give more specific results. See
  [Icon Coverage](#icon-coverage).
- **Mappings target specific pinned icon-library versions.** If you install a
  much newer or older icon library, an icon name could differ. The maps are
  validated against the versions in `VALIDATED_VERSIONS`; peer-dependency ranges
  are deliberately permissive, and the adapters fall back gracefully to the
  generic icon if a specific name is absent in your installed version.
- **This package ships no icon artwork.** It maps to names; the actual icons come
  from your installed icon library.

---

## Contributing

Contributions are welcome — new or corrected icon mappings, missing currencies,
new aliases, country-mapping fixes, and new adapters. Please read
[CONTRIBUTING.md](./CONTRIBUTING.md) first. The short version: never edit
`src/data/*.generated.ts` by hand — edit the generator script and regenerate, then
run `npm run lint && npm test && npm run build`.

---

## Data Sources and Attribution

This package ships **no icon artwork**; it references icon names from four
libraries, each provided by the consumer under its own license. The embedded
currency data is derived at build time from public, factual standards (ISO 4217,
ISO 3166). Full attribution and license texts are in [NOTICES/](./NOTICES/):

- **Lucide** (`lucide-react`) — ISC
- **Tabler Icons** (`@tabler/icons-react`) — MIT
- **Heroicons** (`@heroicons/react`) — MIT
- **Font Awesome Free** (`@fortawesome/free-solid-svg-icons`) — CC BY 4.0 (icons) / MIT (code)

---

## Security

Found a vulnerability — an input that crashes the resolver, or a mapped icon name
that does not exist upstream? Please report it privately. See
[SECURITY.md](./SECURITY.md).

---

## License

[MIT](./LICENSE) © Bilal Subhani — CWIT
