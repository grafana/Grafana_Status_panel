# Changelog

## v3.0.0

**Breaking Changes**

Make this plugin **more simple and easy to use**.
The plugin now only supports the `number` type of data. The plugin will not work with other types of data.

### Added

- Customizable thresholds (Severity color, Severity text, Value threshold). like the threshold editor of Grafana default
  option
- Select metric unit to be displayed (like the unit selector of Grafana default option)
- Panel subtitle (to display a metric category or whatever you want)

### Changed

- Fix the bug of non save panel flip state, by adding an option to save the flip state

### Removed

- Defined weird thresholds
- Alert system
- Display multiple panels
- Auto scroll feature
- Annotation display mode
- Things that make this plugin not simple to use (no offense Vonage :) )

## v2.0.0

Migrating Status Panel from Angular to react. This release includes automatic migrations for Angular panels, but please
make sure to have backups and test these migrations in a staging environment first as we can not guarantee that they
will
all be translated properly.

## 1.0.0 (Unreleased)

Initial release.
