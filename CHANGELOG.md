# Changelog

## v2.1.0 (unreleased)

A stabilisation release. Seven behaviours broke during the Angular-to-React rewrite, most of them silently. They work again, and each one now has a unit test holding it in place.

### Fixed

- **Single-sided thresholds.** An empty `Warning` or `Critical` bound used to be read as `0`. It now means "not set": leave one bound empty and the panel matches the value exactly against the other one. That is what brings back a two-colour, binary status. Set `Critical` to `0`, leave `Warning` empty, and the panel only turns red when the metric really is `0`. ([#9](https://github.com/grafana/Grafana_Status_panel/issues/9))
- **Date Threshold.** Bounds are compared chronologically instead of by exact string match, so the handler actually fires.
- **Disable Criteria.** A numeric metric of `0` matches a `Disable Value` of `0`.
- **Value Regex.** The panel shows the part of the value that matches the regex, as the README always claimed, rather than everything that does not match.
- **Text Only.** These metrics render, value included.
- **Measurement URL.** A per-query URL survives migration from an Angular panel. It is carried over as a standard field data link.

### Removed

- **Remove Prefix.** The option had already disappeared in the React rewrite, but the README still promised it. It no longer does.

## v2.0.0

Migrating Status Panel from Angular to react. This release includes automatic migrations for Angular panels, but please make sure to have backups and test this migrations in a staging environment first as we can not guarantee that they will all be translated properly.

## 1.0.0 (Unreleased)

Initial release.
