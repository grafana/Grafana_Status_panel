# Grafana Status Panel

One panel that shows the health of many components at once. You give it a set of queries, tell it how to grade each one, and it boils the whole thing down to a single coloured card: green when everything is fine, yellow when something needs a look, red when something is wrong, grey when a component is switched off.

![A dashboard of status cards, most of them green](https://github.com/grafana/Grafana_Status_panel/blob/main/src/img/environment_snapshot.png?raw=true)

> This project was originally contributed by [Vonage](https://github.com/Vonage/Grafana_Status_panel) - thanks for all your great work!
>
> The previous published version of the plugin relied on AngularJS which is [deprecated](https://grafana.com/docs/grafana/latest/developers/angular_deprecation/). We reached out to Vonage to support publishing an updated version based on the changes made in the source repo, but they were unable to pursue this at the time.
>
> We have stepped up for the time being to minimize disruption, but would be happy to hand maintainership back at any point in the future.
>
> We have republished under the same plugin ID, but with the Grafana signature. This means you can simply update your plugin version. A new ID would have required manual updates to your dashboards. We changed the signature to Grafana to reflect the change in publisher and so that it is clear we are not impersonating the original authors. For additional information on the changes, see the [Notices](https://github.com/grafana/Grafana_Status_panel/blob/main/NOTICES).

⚠️ This project is not actively maintained by Grafana Labs. Pull requests are welcome and will be reviewed on a best-effort basis. Contact integrations@grafana.com if you are interested in taking on this project longer term. We will be happy to work with and eventually hand over to people who are interested in maintaining it again.

## Why you might want it

Say you watch a fleet of servers and track several metrics on each one: CPU, memory, disk, a couple of health probes. A Single Stat panel shows you one of those numbers. This panel holds all of them in one card and colours it by the worst thing it finds, so a wall of green tells you at a glance that nothing needs you right now.

Each query you add can play one of three roles:

- **A severity marker.** Set a warning and a critical threshold, and the metric pushes the card toward yellow or red once it crosses them.
- **A disable marker.** Set the exact value that means "switched off", and the card goes grey. A disabled component is never also shown as failing, because disable wins over severity.
- **Plain text.** Show a value on the card with no grading at all, for context.

Severity and text can appear in two places: under the panel title, which is the default, or as a small annotation in the top-left corner. You can also repeat the panel over a template variable to get one card per instance.

## Installation

The plugin is published in the Grafana catalog under the id `vonage-status-panel`. Install it with the Grafana CLI:

```bash
grafana-cli plugins install vonage-status-panel
```

Then restart Grafana. If you already run an older release, this installs as an update in place, so your existing dashboards keep working without any edits.

To run a local build instead, for development or to try an unreleased change, see [Contributing](#contributing) below.

## Configuring a panel

1. Add your queries and give each one a unique alias. The alias is the label the card shows for that metric.
2. Set the **Panel Title**. It supports Grafana template variables, so a repeated panel shows the right name on each card.
3. Open the panel options and decide how to treat each metric.

### Grading a metric

Each query has its own **Threshold Type** in the field options. Pick the one that matches the data:

- **Number Threshold** and **Date Threshold** compare the value against a **Warning** and a **Critical** bound. The panel works out on its own whether higher or lower is worse, from whichever of the two bounds is larger. If higher values are healthy for your metric, put the smaller number in **Critical**. Setting both bounds to the same value is allowed and means "critical from this value on".
- Leave one of the two bounds empty for a single-sided check. The panel then matches the value exactly against the bound you did set, instead of testing a range. That is how you build a binary red/green light: set **Critical** to `0`, leave **Warning** empty, and the card turns red only when the metric reads exactly `0`.
- **String Threshold** checks the value for equality against the **Warning** and **Critical** strings.
- **Disable Criteria** turns the card grey when the value equals the string you enter in the **Disable Criteria** field. Use it for a maintenance flag.
- **Text Only** shows the alias and value with no grading, placed by the **Display Position** setting.

### Controlling what the card shows

- **Display Position** puts the metric under the title (**Regular**) or in the top-left corner (**Annotation**).
- **Display Alias** and **Display Value** decide when the alias and its number appear: always, or only while the metric is in warning or critical.
- **Aggregation** picks the single value to grade when a query returns more than one data point. It defaults to **Last**.

## Features

### Value Regex

To show only part of a value, put a regular expression in the **Value Regex** field. The card displays the first match. If the expression is empty or matches nothing, the whole value is shown.

### Per-metric links

Each query can carry its own link through Grafana's standard **Data links** in the field options. The metric name becomes clickable and opens that URL, which is a natural place to point at a runbook for the metric. Panels migrated from the AngularJS version keep their old per-metric `Measurement URL` as a data link.

### Colours and text format

Under the threshold options you can set the colour for each state (`ok`, `warning`, `critical`, `disabled`), choose with **Coloring Mode** whether that colour fills the card background or tints the metric text, and make warning, critical and disabled text **bold** or **italic** with **Font Format**.

### Show the card as disabled when there is no data

Turn on **Use 'Disable' color if no data** in the panel options, and a card that gets no data from any of its metrics goes grey instead of staying in its last state.

## Panel states

![A card in the OK state, green](https://github.com/grafana/Grafana_Status_panel/blob/main/src/img/ok.png?raw=true)
![A card in the warning state, yellow](https://github.com/grafana/Grafana_Status_panel/blob/main/src/img/warning.png?raw=true)
![A card in the critical state, red](https://github.com/grafana/Grafana_Status_panel/blob/main/src/img/error.png?raw=true)

## Supported data sources

Any data source works. The panel reads whatever your queries return and reduces each one to a single value, so it makes no assumption about where the data came from. It is exercised against Prometheus and the Grafana TestData source.

## Upgrading from the AngularJS version

Export your dashboards before you upgrade and keep the JSON somewhere safe until you have confirmed the new version renders them the way you expect.

Panels saved by the old AngularJS version are converted when the dashboard is opened, but **Grafana does not save that conversion on its own**. Open each dashboard once and save it, so the converted panel JSON is written back.

## Contributing

Pull requests are welcome. To build and run the plugin locally:

```bash
npm install
npm run build      # or: npm run dev  (webpack watch)
npm run server     # boots Grafana on localhost:3000 with the plugin mounted
```

`npm run test:ci` runs the unit tests and `npm run e2e` runs the Playwright tests against the local server.

## Release notes

See the [CHANGELOG](https://github.com/grafana/Grafana_Status_panel/blob/main/CHANGELOG.md).

## License

See the [LICENSE](https://github.com/grafana/Grafana_Status_panel/blob/main/LICENSE) file for license rights and limitations (Apache License, Version 2.0).
