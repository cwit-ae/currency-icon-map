# Third-Party Notices

`currency-icon-map` ships **no icon artwork**. It maps currencies to the *icon
names* used by four popular icon libraries. The actual icons are provided at
runtime by whichever of those libraries you install as a peer dependency, each
under its own license. These notices are included for transparency and to make
attribution easy for downstream consumers.

## Icon libraries (optional peer dependencies)

| Library | npm package | License | Notice |
| ------- | ----------- | ------- | ------ |
| Lucide | `lucide-react` | ISC | [lucide-LICENSE](./lucide-LICENSE) |
| Tabler Icons | `@tabler/icons-react` | MIT | [tabler-LICENSE](./tabler-LICENSE) |
| Heroicons | `@heroicons/react` | MIT | [heroicons-LICENSE](./heroicons-LICENSE) |
| Font Awesome Free | `@fortawesome/free-solid-svg-icons` | CC&nbsp;BY&nbsp;4.0 (icons) AND MIT (code) | [fontawesome-LICENSE](./fontawesome-LICENSE) |

The icon-name maps in this package were generated and validated against:

- `lucide-react@1.20.0`
- `@tabler/icons-react@3.44.0`
- `@fortawesome/free-solid-svg-icons@7.2.0`
- `@heroicons/react@2.2.0`

> **Font Awesome attribution:** Font Awesome Free icons are licensed under
> CC BY 4.0, which requires attribution when you *use the icons*. Because this
> package does not redistribute any Font Awesome assets — it only references
> icon names — the obligation falls on the consuming application that renders
> them. See the [Font Awesome Free license](https://fontawesome.com/license/free)
> for details. Brand icons are trademarks of their respective owners.

## Currency and country data

The embedded currency dataset (`src/data/*.generated.ts`) is derived at build
time from public, factual sources:

- **ISO 4217** currency codes, names, numeric codes, and minor units — via the
  `currency-codes` package (used only as a dev dependency).
- Currency symbols — via the `currency-symbol-map` package (dev only).
- **ISO 3166-1** country names and alpha-2 codes — via the `i18n-iso-countries`
  package (dev only).

These dev-only packages are not part of the published runtime and are removed
before release. ISO 4217 and ISO 3166 codes are factual standards and are not
themselves copyrightable; the curated aliases, crypto entries, and icon
mappings in this package are original work licensed under the project's MIT
license.
