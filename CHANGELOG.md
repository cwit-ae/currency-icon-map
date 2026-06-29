# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] — 2026-06-17

### Fixed

- **Dual-package (ESM/CJS) resolution.** The build now emits
  `dist/esm/package.json` (`type: module`) and `dist/cjs/package.json`
  (`type: commonjs`) so native `import "currency-icon-map"` works on Node 18/20,
  not only `require()`. Added a packed-tarball smoke test (`npm run smoke`, in
  CI) that installs the real tarball into ESM and CommonJS consumers.
- Added `@fortawesome/fontawesome-svg-core` as an optional peer dependency (the
  Font Awesome adapter and README require it).
- `configure()` now deep-merges `extraIcons` per currency code, so adding a
  later override for one library no longer wipes an earlier override for another.
- `extraIcons` keys are normalized (case-insensitive), so `doge` and `DOGE`
  address the same currency.
- Fuller validation of `extraCurrencies` (numeric, symbol, minorUnits, crypto,
  and array element types).

### Changed

- Documented that the React adapters are not tree-shakeable; the headless
  `resolveIconName` API is the recommended path for size-sensitive bundles.

## [1.0.1] — 2026-06-17

### Changed

- Upgraded validated icon libraries to `lucide-react@1.20.0`,
  `@tabler/icons-react@3.44.0`, and `@fortawesome/free-solid-svg-icons@7.2.0`
  (with `react@19` / FA v7 adapter stack) and regenerated the icon maps.

## [1.0.0] — 2026-06-17

Initial release.

### Added

- **Currency resolution** from four input forms — ISO 4217 alpha-3 code, ISO
  4217 numeric code, currency symbol, ISO 3166-1 country (alpha-2 or name),
  currency name, and curated colloquial aliases — with a deterministic
  resolution order and a guaranteed default fallback.
- **184 currencies**: all 179 active ISO 4217 entries plus a curated set of
  digital currencies (BTC, ETH, LTC, XRP, XMR).
- **Icon-name maps for four libraries** — Lucide, Tabler, Font Awesome (free
  solid), and Heroicons — generated and validated against the pinned versions
  `lucide-react@1.20.0`, `@tabler/icons-react@3.44.0`,
  `@fortawesome/free-solid-svg-icons@7.2.0`, and `@heroicons/react@2.2.0`.
- **Public API**: `getCurrencyIcon`, `getCurrency`, `resolveIconName`,
  `listCurrencies`, and `createCurrencyIconMap` for custom instances (custom
  default icons, extra currencies, and per-library icon overrides).
- **Optional React adapters** at `currency-icon-map/lucide`,
  `/tabler`, `/fontawesome`, and `/heroicons`, each exposing a `<CurrencyIcon>`
  component and `get*Icon` helpers. Icon libraries are optional peer
  dependencies and are never bundled.
- **Raw data subpath** `currency-icon-map/data` exposing the embedded datasets
  and `VALIDATED_VERSIONS`.
- **Zero runtime dependencies.** Dual ESM/CJS builds with first-class
  TypeScript types.
- Input validation (`TypeError` for non-strings, `RangeError` for over-length
  queries) and an icon-name-validity test suite that fails CI if any mapped name
  does not exist in its target library.

[1.0.2]: https://github.com/cwit-ae/currency-icon-map/releases/tag/v1.0.2
[1.0.1]: https://github.com/cwit-ae/currency-icon-map/releases/tag/v1.0.1
[1.0.0]: https://github.com/cwit-ae/currency-icon-map/releases/tag/v1.0.0
