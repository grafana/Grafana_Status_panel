# Status Panel Roadmap & Design

> Working document for the maintenance takeover of the Grafana Status Panel
> (`vonage-status-panel`). Consolidates the regression audit, the release
> roadmap, and the UX design decisions. Living document, refined as we go.

- **Fork**: `SckyzO/Grafana_Status_panel`, forked from `grafana/Grafana_Status_panel` at v2.0.4. Working branch `v2.1-stabilisation`, version 2.1.0.
- **Plugin id**: `vonage-status-panel` (kept for drop-in updates on existing dashboards)
- **Last updated**: 2026-07-12

---

## 1. Context & positioning

Three implementations exist in the wild:

| Implementation                              | State                 | Notes                                                                       |
| ------------------------------------------- | --------------------- | --------------------------------------------------------------------------- |
| **Vonage** (`Vonage/…`)                     | legacy                | original author, AngularJS then an unfinished React branch; abandoned       |
| **Grafana** (`grafana/…`)                   | official, best-effort | React rewrite, signed, **our fork base** (Grafana looking for a maintainer) |
| **BenjaminFourmaux** (`BenjaminFourmaux/…`) | active, divergent     | different plugin id, no migration, number-only, dropped several modes       |

Goal: **take over the official plugin**, stabilise it, and evolve it while keeping
existing dashboards working. Stabilising the documented regressions (incl. issue
[#9](https://github.com/grafana/Grafana_Status_panel/issues/9)) is what legitimises the takeover.

## 2. Strategy: two phases (non-regression first)

- **v2.1 Stabilisation**: fix regressions + small additive features. 100% backward-compatible, no forced migration.
- **v3.0 Evolution**: multi-metric card model, threshold steps, multicard, per-metric mappings, all behind an **automatic v2→v3 migration**, plugin id preserved.

## 3. Development environment

Reproducible, and doubles as CI/e2e/publish material (Grafana-recommended provisioning).

- Fork cloned in `dev/Grafana_Status_panel` (`origin` = SckyzO, `upstream` = grafana).
- Build with `make up` (builds `dist/` in a pinned Node 22 container tracking `.nvmrc`, then `docker compose up`) or the host npm scripts. `dist/` is not committed, so it is built before Grafana can load the plugin.
- **Grafana 13.1.0** container, plugin verified rendering on GF13 (no 12→13 regression).
- Provisioned demo dashboards (offline, TestData), each with a panel explaining its configuration: a host-health board (CPU / memory / disk, `percent` unit), a switch faceplate (one panel repeated over a `name : state` variable, single-sided threshold for up / down, grey through `isGrayOnNoData` for a port that returns nothing), and an AngularJS panel kept as a migration fixture.
- MCP: `chrome-devtools` (UI iteration, works under WSL) + `mcp-grafana` (API).

## 4. Regressions (AngularJS → React): the v2.1 backlog

Full analysis in [`REGRESSIONS.md`](./REGRESSIONS.md). Summary:

| #   | Regression                                                           | Severity | Silent |
| --- | -------------------------------------------------------------------- | :------: | :----: |
| 1   | `Value Regex` inverted (`replace` instead of keep-match)             |   High   |  yes   |
| 2   | `Date Threshold`: range check → strict string equality (never fires) |   High   |  yes   |
| 3   | `Disable Criteria` broken for numeric metrics (`===` vs `==`)        |   High   |  yes   |
| 4   | Single-sided / binary thresholds lost (issue #9)                     |   High   |  yes   |
| 5   | `Text Only`: field hidden entirely                                   |  Medium  | partly |
| 6   | `Remove Prefix` removed but still documented                         |  Medium  |   no   |
| 7   | Per-metric `Measurement URL` lost on migration                       |  Medium  |  yes   |
| 8   | Angular panels never detected → migration never ran                  | Critical |  yes   |
| 9   | Unset bound resurrects the registered default (`warn 70`)            | Critical |  yes   |
| 10  | `Text Only` value hidden by `Display Value`                          |  Medium  |  yes   |
| 11  | `warn == crit` → permanently critical, for any value                 | Critical |  yes   |
| 12  | Long alert lists bounce up/down instead of scrolling                 |  Medium  |   no   |
| 13  | Card text left-aligned; `text-align` rules never carried over        |  Medium  |   no   |

#1 to #4 all live in the same ~60-line `switch` in `buildStatusMetricProps.ts` and were fixed together, each with a failing-then-passing test.

**#8 to #13 were only found by running the migration over a dashboard genuinely saved by the AngularJS editor.** None of them reproduce on a small hand-built one: #8 needs a panel with no `options` key, #9 and #11 need bounds a synthetic fixture would never leave unset or set equal. Each is now pinned by a test.

## 5. Roadmap

### v2.1 Stabilisation (compat-strict, drop-in)

| Item                      | Notes                                                                   |  Effort  |
| ------------------------- | ----------------------------------------------------------------------- | :------: |
| **Unit test scaffold**    | none today; cover `buildStatusMetricProps` + migration handler fixtures |    M     |
| Fix regressions #1 to #13 | done; 29 tests                                                          | S/M each |
| **Grafana 13 support**    | CI matrix 10.4 / 12 / 13, validate `grafanaDependency`                  |    M     |
| Shape presets             | Square / Rounded / Round (formalises `cornerRadius`)                    |    S     |
| Emoji / icon per state    | additive, opt-in                                                        |    M     |
| Title templating          | `{{name}}` / `{{value}}` / labels (replaces Remove Prefix)              |    M     |
| a11y colour-blind (base)  | shape + texture in addition to colour                                   |    M     |
| **Scroll options**        | mode (none / continuous / bounce) + speed; default stays continuous     |    S     |

### v3.0 Evolution (managed break, v2→v3 migration)

| Item                          | Notes                                                             | Depends on |
| ----------------------------- | ----------------------------------------------------------------- | ---------- |
| **Value-handler registry**    | replace hardcoded `switch` → extensible without touching the core | none       |
| Per-metric **value mappings** | value→state, arbitrary & directional (see §6)                     | registry   |
| **Multi-step thresholds**     | Grafana-native steps model                                        | registry   |
| **Multicard**                 | responsive grid, 1 card per equipment                             | registry   |
| **Per-metric option box**     | auto-generated from `context.data`, keyed by `refId` (see §6)     | none       |
| Editor simplification         | 3-section layout, advanced collapsed                              | v3 models  |
| **v2→v3 migration**           | warn/crit → steps, options → multicard                            | all of v3  |

**Cross-cutting (continuous)**: honest README + provisioned sample dashboards · `plugincheck` validator in CI · signing status.

## 6. UX model (v3): decisions locked

Interactive prototype (internal design preview, private): <https://claude.ai/code/artifact/a617af77-41cc-4e13-9d55-2ef626a6ae1d>

- **Card = one equipment, N metrics**; card colour = **worst state** among its metrics.
- Per metric (one query = one logical metric): templated label (`CPU {{value}}%`), **show value** toggle, value→state mapping. Hiding a value does **not** remove the metric from the state computation (a background probe can drive the colour without cluttering the display).
- Mappings are directional and arbitrary per metric: IPMI `0→ok … 2→crit` (increasing) _and_ bonding `2→ok … 0→crit` (decreasing). No implicit direction.
- **Config ↔ metric binding = `refId`** (`byFrameRefID`), **never by order/position**. Adding a query surfaces its option box automatically via a custom editor reading `context.data`.
- **Multicard grouping = by label** (e.g. `instance`), **orthogonal to** Grafana panel repeat (they compose: repeat by `$datacenter` × group cards by `instance`).
- Appearance: shape presets · colour mode Fill(worst)/Text(per-metric) · **emoji per state, user-customisable** · colour-blind pattern · "only alerting metrics" mode.

## 7. Decision log

| Decision                                       | Rationale                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| Hybrid two-phase (v2.1 then v3.0)              | non-regression first; credible takeover story                      |
| No v2.2 milestone                              | two clean blocks are easier to read/communicate                    |
| Remove Prefix → **removed**, not reimplemented | title templating replaces it better; fixes doc/behaviour mismatch  |
| Binding by `refId`, not order                  | stable under query reordering/deletion                             |
| Grouping by label **+** panel repeat (both)    | they live at different layers and compose; not an exclusive toggle |
| Keep plugin id `vonage-status-panel`           | drop-in updates, no dashboard rewrites                             |

## 8. Open questions (defer)

- Signing: stay Grafana-signed vs community under own org?
- String/date threshold future in the v3 registry (keep, or fold into mappings)?
- Per-mapping-value emoji override (beyond per-state)?
- Sparkline / mini-trend inside a card?
