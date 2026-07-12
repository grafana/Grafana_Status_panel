# Changelog

## v2.1.0 (unreleased)

A stabilisation release. Thirteen behaviours broke during the Angular-to-React rewrite, most of them silently. They work again, and each one now has a unit test holding it in place.

The five migration and threshold bugs at the top of this list were all found by running the handler over a real 92-panel Angular dashboard. None of them show up on a small hand-built one, which is why they survived a whole major version.

### Fixed

- **Angular panels are recognised again.** The migration checked for an `options` object that no genuine Angular panel has, so it never ran on a single one of them. Every threshold was dropped and every metric fell back to the built-in defaults of `warn 70 / crit 90`. This is the one that made the others invisible.
- **Thresholds compare against each bound, not against a range.** The rewrite recast the Angular comparison as a range check whose two ends are both true when `Warning` equals `Critical`, so such a metric was critical for every possible value, forever. Binary error counters are normally configured that way.
- **An unset bound stays unset through the migration.** It is written as an empty string, the same thing the option editor stores when you clear the field. Left empty in any other way it comes back as the registered default and quietly turns a single-sided threshold into a two-sided one.
- **Single-sided thresholds.** An empty `Warning` or `Critical` bound used to be read as `0`. It now means "not set": leave one bound empty and the panel matches the value exactly against the other one. That is what brings back a two-colour, binary status. Set `Critical` to `0`, leave `Warning` empty, and the panel only turns red when the metric really is `0`. ([#9](https://github.com/grafana/Grafana_Status_panel/issues/9))
- **Text Only shows its value.** It is a metric with nothing but a value, so it ignores `Display Value`. Hiding the number left a bare label.
- **Long alert lists scroll again.** They loop from the bottom of the card to the top, instead of jittering up and down. Hovering pauses them.
- **Card text is centred again.** Metric lines were left-aligned inside a box that hugs the longest one, which showed up as soon as one line ran much longer than the others. Annotations stay in their left-aligned column.
- **Date Threshold.** Bounds are compared chronologically instead of by exact string match, so the handler actually fires.
- **Disable Criteria.** A numeric metric of `0` matches a `Disable Value` of `0`.
- **Value Regex.** The panel shows the part of the value that matches the regex, as the README always claimed, rather than everything that does not match.
- **Text Only renders.** These metrics were dropped entirely.
- **Measurement URL.** A per-query URL survives migration from an Angular panel. It is carried over as a standard field data link.

### Removed

- **Remove Prefix.** The option had already disappeared in the React rewrite, but the README still promised it. It no longer does.

### Upgrading

Grafana does not save a migration on its own. Open each dashboard that still holds Angular panels and save it once, so the converted panel JSON is written back.

## v2.0.0

Migrating Status Panel from Angular to react. This release includes automatic migrations for Angular panels, but please make sure to have backups and test this migrations in a staging environment first as we can not guarantee that they will all be translated properly.

## 1.0.0 (Unreleased)

Initial release.
