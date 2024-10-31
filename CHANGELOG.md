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
- Panel title and subtitle can be formatted with formatted variables (like Query name `{{query_name}}`, Query value
  aggregate `{{query_value}}` ...)

### Changed

- Fix the bug of non save panel flip state, by adding an option to save the flip state
- Multi panes in one panel
  - Each pane corresponds to a Query
  - Each pane share the same thresholds, unit, and title and subtitle
  - Panes are in grid layout (flexbox).
  - Panes size (height and width, and font size) are responsive according to the panel size

### Removed

- Defined weird thresholds
- Alert system
- Auto scroll feature
- Annotation display mode
- Things that make this plugin not simple to use.

## v2.0.0

Migrating Status Panel from Angular to react. This release includes automatic migrations for Angular panels, but please
make sure to have backups and test these migrations in a staging environment first as we can not guarantee that they
will
all be translated properly.

## 1.0.0 (Unreleased)

Initial release.
