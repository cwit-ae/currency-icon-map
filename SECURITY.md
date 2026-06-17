# Security Policy

## Supported Versions

`currency-icon-map` is on a single active major version. We provide security
updates for the latest minor release on the `1.x` line.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

If you are running an older minor version, please upgrade to the latest `1.x`
release before opening a security report — the issue may already be resolved.

## Reporting a Vulnerability

**Please do not file public issues for security vulnerabilities.** Public issues
are indexed by search engines and notify every repository watcher, which can
give an attacker time to exploit the issue before users have updated.

Use one of the following private channels instead:

1. **Preferred — GitHub Security Advisories:** open a draft advisory at
   <https://github.com/cwit-ae/currency-icon-map/security/advisories/new>. Only
   the maintainers see the report. GitHub provides a private fork for
   coordinated patch development.
2. Email the maintainers privately. Refer to the maintainer contact listed on
   the [npm page for `currency-icon-map`](https://www.npmjs.com/package/currency-icon-map).

When you submit a report, please include — as much as is practical:

- A clear description of the issue and the impact you believe it has.
- Steps to reproduce, including the exact query string, configuration, and
  `currency-icon-map` + Node.js versions.
- A minimal proof-of-concept (a few lines of TypeScript or JavaScript).
- Whether you have disclosed the issue elsewhere, and if so, where.

## Scope

The following are in scope and welcomed as security reports:

- Inputs that cause `getCurrencyIcon`, `getCurrency`, or `resolveIconName` to
  crash, throw an uncaught error, or hang (e.g. regex catastrophic backtracking
  or allocation amplification in the normalization path).
- Any mapped icon name that does **not** exist in the pinned icon library it
  claims to target — i.e. a defect that would make a consumer render a missing
  or wrong icon. (The shipped `icon-name-validity` test suite is designed to
  prevent this; a bypass is a valid report.)
- Supply-chain integrity issues: a discrepancy between the published `dist/`
  output and the source, a compromised release, or missing/forged provenance.
- Vulnerabilities introduced through a transitive **runtime** dependency. (The
  package ships **zero** runtime dependencies, so this set should be empty —
  a finding here is by definition interesting.)

The following are **out of scope** and should be filed as ordinary GitHub
issues using the issue templates instead:

- A currency we do not yet ship, or a country that resolves to the wrong
  currency — file a [missing-currency](.github/ISSUE_TEMPLATE/missing_currency.yml)
  or data-correction issue.
- A currency that falls back to a generic coin/banknote icon because the target
  library ships no dedicated icon for it — this is expected behavior, not a
  vulnerability. File a [wrong-icon-mapping](.github/ISSUE_TEMPLATE/wrong_icon_mapping.yml)
  issue if you believe a *better* existing icon was missed.
- Symbol ambiguity (e.g. `$` resolving to USD rather than another dollar) — this
  is documented, intentional behavior. See the README "Limitations" section.
- Vulnerabilities in an icon library you installed as a peer dependency — report
  those to the respective project. We will, however, bump our validated versions
  and re-run the validity suite when an upstream advisory affects a pinned
  library.

## Disclosure Process

Once a report is submitted:

1. We aim to **acknowledge receipt within five business days**.
2. We work with the reporter to confirm the issue and agree on a remediation
   plan.
3. A fix is developed and tested in a private branch. For fixes that touch the
   data generators or icon maps, we regenerate and run the full Jest suite —
   including the icon-name-validity tests — before release.
4. A patched version is published to npm. The release notes credit the reporter
   (with their permission) and link to the advisory.
5. The advisory is published publicly once users have had a reasonable window to
   upgrade.

We do not currently operate a paid bug-bounty programme. Reporters are credited
in the release notes and the published advisory unless they prefer to remain
anonymous.

## Coordinated Disclosure Expectations

We ask that reporters give us a reasonable opportunity to remediate before any
public disclosure — typically 90 days from acknowledgement, shorter for clearly
low-risk issues. If you intend to disclose publicly, please tell us in advance
so the release and advisory can be coordinated with your timeline.

Thank you for helping keep `currency-icon-map` and its users safe.
