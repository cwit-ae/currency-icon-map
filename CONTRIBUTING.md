# Contributing to currency-icon-map

Thank you for considering a contribution to currency-icon-map. This project is a zero-runtime-dependency, fully offline library that resolves any currency — by ISO 4217 code, symbol, name, or country — to the correct icon **name** for Lucide, Tabler, Font Awesome, and Heroicons, with a guaranteed default fallback and optional React adapters. We welcome help in every part of it: icon mappings, currency coverage, colloquial aliases, country-mapping fixes, adapters, documentation, and bug reports.

This document explains how to report problems, propose changes, and get a pull request merged.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Reporting Issues](#reporting-issues)
- [Proposing a Change](#proposing-a-change)
- [Development Setup](#development-setup)
- [Generated Data: Never Edit by Hand](#generated-data-never-edit-by-hand)
- [Adding or Fixing an Icon Mapping](#adding-or-fixing-an-icon-mapping)
- [Adding a Currency, Alias, or Crypto](#adding-a-currency-alias-or-crypto)
- [Tests](#tests)
- [Pull Request Checklist](#pull-request-checklist)
- [Icon Library Licensing](#icon-library-licensing)
- [Releases](#releases)
- [Security Disclosures](#security-disclosures)
- [License](#license)

---

## Code of Conduct

Participation in this project is governed by the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). In short: be respectful, be patient, and assume good faith. Reporting channels and enforcement guidelines are documented in [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

---

## Ways to Contribute

You do not need to be a TypeScript expert to help. Useful contributions include:

- **New or corrected icon mappings** — a currency that maps to the wrong icon, or to the generic fallback when a dedicated icon exists in one of the supported libraries.
- **Missing currencies** — an ISO 4217 code (or a crypto-asset) that the dataset does not yet resolve.
- **New colloquial aliases** — common informal names people search by (for example "buck", "quid", "sat").
- **Country-mapping fixes** — a country that resolves to the wrong currency, or a country name that fails to resolve.
- **New adapters** — bindings for an additional icon library or framework.
- **Improving documentation, examples, or types.**
- **Filing reproductions for resolution bugs or regressions.**

If you are not sure whether something is in scope, open a discussion-style issue first and ask.

---

## Reporting Issues

Please use the [issue tracker](https://github.com/bilalsubhani-cwit/currency-icon-map/issues) and pick the template that best matches what you are reporting:

- **Bug report** — for crashes, incorrect resolutions, type-definition issues.
- **Wrong icon** — for a currency that resolves to the wrong (or fallback) icon name.
- **Missing currency** — for an ISO 4217 code or crypto-asset that is not resolved.
- **Feature request** — for new capabilities, adapters, or APIs.

A good issue includes:

1. The exact query string you passed (escaped if it contains unusual characters).
2. The result you observed (`getCurrencyIcon()` / `resolveIconName()` / `getCurrency()` output).
3. The result you expected, and why.
4. The currency-icon-map version (`npm ls currency-icon-map`) and Node.js version (`node -v`).
5. The icon library and version involved, and the configuration you passed, if any (`case`, `defaultIcons`, `extraCurrencies`, `extraIcons`).

For an icon-mapping issue, please name the icon that *should* be used and confirm it exists in the relevant library's version we pin (see [`devDependencies`](./package.json)). The generator validates every mapped name against the installed library, so a suggested name that the library does not export cannot be accepted.

---

## Proposing a Change

For anything beyond a one-line fix, please open an issue first to confirm direction before opening a pull request. Larger changes — new adapters, resolver changes, public-API additions — should start as a short proposal so we can agree on scope, semantics, and test coverage before implementation begins.

For small, self-contained changes (typo fixes, additional regression tests, narrow mapping or alias fixes), a pull request directly is fine.

---

## Development Setup

currency-icon-map requires Node.js 18 or later.

```bash
git clone https://github.com/bilalsubhani-cwit/currency-icon-map.git
cd currency-icon-map
npm install
npm run lint
npm test
npm run build
```

The repository contains:

- [`src/`](./src) — TypeScript source: the resolver, types, React adapters, and the generated data under [`src/data/`](./src/data).
- [`scripts/`](./scripts) — the data generators (see below).
- [`tests/`](./tests) — Jest test suites, including the icon-name-validity tests.
- [`dist/`](./dist) — compiled ESM/CJS output and type declarations (generated; do not edit by hand).

Useful scripts:

| Command              | Purpose                                                          |
| -------------------- | --------------------------------------------------------------- |
| `npm install`        | Install dependencies, including the dev-only data and icon libraries. |
| `npm run lint`       | Type-check the project without emitting output (`tsc --noEmit`). |
| `npm test`           | Run the full Jest test suite.                                   |
| `npm run test:watch` | Re-run tests on file changes during development.                |
| `npm run build`      | Compile both ESM and CJS output and emit `.d.ts` declarations.  |

---

## Generated Data: Never Edit by Hand

The dataset that ships with this package is **generated**, not hand-maintained. The files

- `src/data/currencies.generated.ts`
- `src/data/countries.generated.ts`
- `src/data/icons.generated.ts`

are produced by the scripts in [`scripts/`](./scripts) and are committed source. **Do not edit any `*.generated.ts` file by hand** — your change would be silently overwritten the next time the generators run. Instead, edit the generator and regenerate, then commit the regenerated output alongside your script change.

The generators read from **dev-only** data dependencies (`currency-codes`, `currency-symbol-map`, `i18n-iso-countries`) and from the pinned icon libraries. None of these are runtime dependencies: the package ships only the embedded, generated copies and has **zero runtime dependencies**.

---

## Adding or Fixing an Icon Mapping

Icon names are resolved per library in `scripts/generate-icon-maps.mjs`, which picks, for each currency: a dedicated currency icon if the library ships one, otherwise a symbol-group fallback (for example, any "$" currency falls back to the generic dollar icon), otherwise the library's generic coin/banknote icon.

To add or fix a mapping:

1. Edit the rule sets in [`scripts/generate-icon-maps.mjs`](./scripts/generate-icon-maps.mjs).
2. Regenerate: `node scripts/generate-icon-maps.mjs`.
3. Run the suite: `npm test`.
4. Commit the regenerated `src/data/icons.generated.ts` together with your script change.

The generator validates **every** produced name against the icon names actually exported by the installed, pinned library — a typo, or a name the library renamed or removed, aborts generation. The shipped icon-name-validity tests re-assert the same property, so `npm test` will fail if any mapped name does not exist in the pinned library. This is what makes the "mapped to a real icon" guarantee real; please do not weaken it.

---

## Adding a Currency, Alias, or Crypto

Currencies, colloquial aliases, and crypto-assets are produced by `scripts/generate-currencies.mjs`.

- To add a **colloquial alias** for an existing currency, extend the `ALIASES` map.
- To add a **crypto-asset** (or another non-ISO entry), add it to the `CRYPTO` list.
- ISO 4217 codes, names, symbols, and the countries that use each currency come from the dev-only data sources and generally should not be hard-coded — fix the resolution logic rather than the output.

After editing:

1. Regenerate: `node scripts/generate-currencies.mjs`.
2. If your change can affect icon resolution, also regenerate icons: `node scripts/generate-icon-maps.mjs`.
3. Run `npm test`.
4. Commit the regenerated `src/data/currencies.generated.ts` (and `countries.generated.ts` / `icons.generated.ts` if they changed) together with your script change.

---

## Tests

Every change should keep the test suite green:

```bash
npm test
```

The suite includes (among other things):

- **Icon-name validity** ([`tests/icon-name-validity.test.ts`](./tests/icon-name-validity.test.ts)) — asserts that every mapped icon name exists in the pinned icon library.
- Resolver tests for code, symbol, name, and country lookups, including the default fallback.
- Input-validation, custom-instance, and React-adapter tests.

If your change touches the resolver, the generators, or the public API, please:

1. Add at least one regression test that fails without your change and passes with it.
2. Re-run the generators if you changed them, and confirm the regenerated data is committed.

---

## Pull Request Checklist

Before requesting review, please confirm:

- [ ] The change is scoped to a single concern.
- [ ] `npm run lint` passes locally.
- [ ] `npm test` passes locally.
- [ ] `npm run build` succeeds.
- [ ] No `*.generated.ts` file was edited by hand; any data change was made in the generator and the regenerated output is committed.
- [ ] New or changed behaviour is covered by at least one test.
- [ ] If the public API changed, the README and inline TypeScript types were updated together.
- [ ] If the change is user-visible, a one-line entry was added to the changelog (or the pull-request description states why one is not needed).
- [ ] The pull-request description explains *why* the change matters, not only *what* it does.

The `main` branch is protected: changes land through pull requests that pass review and CI, not by direct pushes.

---

## Icon Library Licensing

The supported icon libraries are **optional peer dependencies** and are **never bundled** into this package — currency-icon-map only ever resolves to an icon *name*, and the consuming application installs whichever icon libraries it actually uses.

Their licenses are their own and apply to the consumer who installs them:

- **Lucide** — ISC
- **Tabler Icons** — MIT
- **Heroicons** — MIT
- **Font Awesome** (free icons) — CC-BY-4.0

currency-icon-map itself is distributed under the MIT License and bundles none of these assets.

---

## Releases

Contributors do not publish releases. Releases are cut by the maintainers and go through the process documented in [`PUBLISHING.md`](./PUBLISHING.md). Please do not bump the package version in a feature or fix pull request unless a maintainer asks you to.

---

## Security Disclosures

If you believe you have found a security issue — for example, an input that causes the resolver to crash, hang, or consume unbounded memory — please **do not** open a public issue. Instead, contact the maintainers privately via the email listed on the npm page for `currency-icon-map`, or open a GitHub Security Advisory at <https://github.com/bilalsubhani-cwit/currency-icon-map/security/advisories>.

We aim to acknowledge security reports within five business days.

---

## License

By contributing to currency-icon-map, you agree that your contribution will be licensed under the [MIT License](./LICENSE) under which the project is distributed.
