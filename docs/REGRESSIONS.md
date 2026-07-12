# Status Panel: regressions introduced by the AngularJS → React rewrite

**Scope**: the last AngularJS release (`Vonage_Grafana_Status_panel` @ tag `1.0.8`, `src/status_ctrl.js`) compared against the React implementation **as published in v2.0.4**. The Vonage `master` React branch matches Grafana's on every point below. The regressions date from the React rewrite (Vonage commit `3de80f9 "migration to React"`), which Grafana inherited and published under the same plugin id.

> **Every line number below refers to v2.0.4, the version being audited, not to the current
> source.** These regressions are fixed in v2.1.0, so following a reference against `main`
> today lands on the corrected code. Check out the `v2.0.4` tag to read along.

**Verification legend**:

- ✅ _reproduced_: confirmed against the source and exercised, by a failing-then-passing test or on a live dashboard
- ℹ️ _behavioural change, not yet reproduced_: follows from the source, severity not rated

---

## 1. `Value Regex` does the opposite of what it documents (**HIGH**) ✅

The README (Grafana repo) states: _"if there is match, **only the first match will be displayed**. Otherwise, the original value will be displayed."_ AngularJS implemented exactly that; React does the inverse.

**AngularJS** (`numberOrTextWithRegex` filter, `status_ctrl.js:103-107`) keeps the match:

```js
let matchResults = input.match(regex);
if (matchResults == null) {
  return input;
} else {
  return matchResults[0];
} // display ONLY the match
```

**React** (`lib/buildStatusMetricProps.ts:122`) strips the match:

```js
displayValue = displayValue.replace(new RegExp(config.custom.valueDisplayRegex), '');
```

**Impact**: value `www.prefix.server.com` + regex `server` →

- Angular: `server` (the match)
- React: `www.prefix..com` (everything _except_ the match)

Completely inverted output. Silent: no error, just wrong text on every panel using the feature. Also contradicts the shipped README.

**Fix**: replace the `.replace(regex, '')` with a `match()` returning `matchResults[0]` when it matches, else the original value.

---

## 2. `Date Threshold` no longer does range comparison (**HIGH**) ✅

**AngularJS**: `Date Threshold` went through `handleThresholdStatus` like numbers. `parseThresholds` converts `Date` thresholds to numbers via `.valueOf()` and sets `warnIsNumber/critIsNumber = true` (`status_ctrl.js:568-571`), so dates used the **numeric range check** (`>=` / `<=`), i.e. "alert if the date is after/before the threshold".

**React** (`lib/buildStatusMetricProps.ts:99-103`) uses strict string equality:

```js
const val: string = fieldCalcs[config.custom.aggregation];
...
if (val === config.custom.thresholds.crit) { fieldStatus = 'crit'; }
else if (val === config.custom.thresholds.warn) { fieldStatus = 'warn'; }
```

`val` is the reduced field value (a numeric timestamp for a numeric field); `thresholds.crit` is the raw string from a `datetime-local` input. `number === string` is **never** true, and even for equal types, exact-to-the-second equality is unusable for a threshold.

**Impact**: `Date Threshold` effectively never fires. The whole "alert when a date crosses a bound" use case is dead.

**Fix**: parse both sides to epoch millis and restore the `>= / <=` range logic (auto-direction like the numeric handler).

---

## 3. `Disable Criteria` broken for numeric metrics, `==` → `===` (**HIGH**) ✅

**AngularJS** (`status_ctrl.js:461`) uses loose equality:

```js
if (series.display_value == series.disabledValue) {
  this.disabled.push(series);
}
```

`0 == "0"` → `true`, so a numeric metric returning `0` matched a `disabledValue` of `"0"`.

**React** (`lib/buildStatusMetricProps.ts:106`) uses strict equality:

```js
if (fieldCalcs[config.custom.aggregation] === config.custom.disabledValue) {
  fieldStatus = 'disable';
}
```

`fieldCalcs[...]` is a `number` for a numeric field; `disabledValue` comes from a text input (`string`). `0 === "0"` → `false`.

**Impact**: the most common disable case, a `0/1` metric with `disabledValue = 0`, never triggers. (Note: this is the same family of use case as issue #9.)

**Fix**: coerce/compare with matching types (e.g. `String(value) === disabledValue`), or parse `disabledValue` to the field type.

---

## 4. Single-sided thresholds / binary 2-colour display lost (**HIGH**, issue #9) ✅

**AngularJS** (`status_ctrl.js:363-390`): a dual mode driven by `isCheckRanges = warnIsNumber && critIsNumber`. If only one threshold is numeric, it falls back to **exact equality** instead of a range check. That is what made `crit=0` + empty `warn` behave as "red when value == 0, green otherwise".

**React** (`lib/buildStatusMetricProps.ts:61-68`): the dual mode is gone. Empty thresholds are coerced with `+config.custom.thresholds.crit` (`+'' === 0`) and always treated as a numeric range.

**Impact**: impossible to configure a single alert level / binary display. Detailed in [issue #9](https://github.com/grafana/Grafana_Status_panel/issues/9).

**Fix**: reintroduce the "non-numeric threshold ⇒ exact-equality" fallback and distinguish _empty_ (`''`/`undefined`) from _zero_ before coercion.

---

## 5. `Text Only` handler no longer shows the value, and often hides the metric (**MEDIUM**) ✅

`Text Only` is still offered in the editor (`StatusThresholdOptionsEditor.tsx:35-39`, described as _"Show the alias + the value on the panel without any condition"_) and in the type union, but `buildStatusMetricProps.ts`'s `switch (valueHandler)` (lines 59-110) has **no `Text Only` case**.

Consequences for a `Text Only` field:

- `displayValue` stays `''` → the value is **never rendered**, only the alias.
- `fieldStatus` stays at its init value `displayAliasType === 'Always' ? 'ok' : 'hide'`. With the default `displayAliasType = 'Warning / Critical'`, it resolves to `'hide'` → the field is dropped from **every** bucket and doesn't appear at all.

**AngularJS** (`handleTextOnly`, `status_ctrl.js:466-472`) pushed the series (with its computed `display_value`, `isDisplayValue = true`) into `display`/`annotation` unconditionally.

**Impact**: `Text Only` shows, at best, the alias with no value; with default options it shows nothing.

**Fix**: add a `Text Only` case that computes/formats `displayValue` and forces `fieldStatus = 'ok'`.

---

## 6. `Remove Prefix` (namePrefix) feature removed but still documented (**MEDIUM**) ✅

**AngularJS** (`status_ctrl.js:220-222`): `displayName = interpolate(clusterName).replace(new RegExp(namePrefix, 'i'), '')`, the documented "Remove Prefix" feature (still in the README).

**React**: `namePrefix` is **commented out** everywhere, in `statusPanelOptionsBuilder.ts:47-53` (editor) and in `statusMigrationHandler.ts:8,47` (migration). The option cannot be set, and any saved `namePrefix` is silently dropped on migration.

**Impact**: a documented feature is gone; dead/commented code left in place; README now lies. Regression for anyone relying on prefix stripping when repeating panels over a template.

**Fix**: either re-implement the option, or remove it from the README and delete the commented blocks (decide, don't leave it half-there).

---

## 7. Per-metric `Measurement URL` dropped during migration (**MEDIUM**) ✅

**AngularJS**: each target had a `url` field rendered as a clickable link (README "Measurement URL"); `status_ctrl.js:252` `s.url = target.url`.

**React**: per-metric links now flow through Grafana's standard field **Data Links** (`field.getLinks()`, `buildStatusMetricProps.ts:127`). That is a reasonable modernisation. **But** `migrateFieldConfig` (`statusMigrationHandler.ts:51-134`) maps `aggregation`, `thresholds`, `displayType`, `displayAliasType`, `displayValueWithAlias`, `decimals`, `units` … and **never maps `target.url`**. The panel-level `panel.links[0]` is migrated to `clusterUrl`, but per-target URLs are lost.

**Impact**: users upgrading from Angular silently lose all per-metric measurement links.

**Fix**: in `migrateFieldConfig`, translate `target.url` into a `links` field-config override (data link) per refId.

---

## Found only by migrating a real dashboard

Regressions 1 to 7 come from reading the two sources side by side. The six below were
invisible that way. They surfaced the first time the migration handler ran over a real
AngularJS dashboard: 92 panels, 574 queries, exported from production.

None of them reproduce on a hand-built fixture, and that is the point. #8 needs a panel
saved by the Angular editor, which no fixture writes by hand. #9 and #11 need bounds a
fixture author would never think to leave empty or to set equal. A synthetic test
dashboard is written by someone who already knows what the options mean.

### 8. AngularJS panels were never detected, so the migration never ran (**CRITICAL**) ✅

```ts
const isAngularModel = (panel) => !!panel.options && 'clusterName' in panel;
```

`options` is a React-era concept. A genuine AngularJS panel keeps its settings at the
root of the panel model and has **no `options` key at all**, so the guard matched nothing
and `statusMigrationHandler` returned early on every real panel. Zero of the 92 production
panels were migrated.

The consequence is total: no `fieldConfig.overrides` are written, so every metric falls
back to the registered defaults of `warn 70 / crit 90`. Every threshold in the dashboard
is silently replaced by two numbers the user never chose.

This is also what hid #9 and #11: while no threshold was ever migrated, no one could
observe a migrated threshold being misread.

**Fix**: the root `clusterName` is the real marker, since a React panel keeps it inside
`options`.

### 9. An unset bound comes back as the registered default (**CRITICAL**) ✅

The Angular model stores only the bounds the user set. `migrateFieldConfig` left the other
one `undefined`, and an `undefined` bound is refilled with the option's `defaultValue`
(`warn: 70`) by the time the panel reads it. A single-sided threshold silently becomes a
two-sided one.

Measured on a live panel, reading the effective field config the plugin receives:

| written to the dashboard JSON  | what the panel actually reads |
| ------------------------------ | ----------------------------- |
| `{ crit: 0, warn: undefined }` | `{ crit: 0, warn: 70 }`       |
| `{ crit: 0, warn: null }`      | `{ crit: 0, warn: 70 }`       |
| `{ crit: 0, warn: '' }`        | `{ crit: 0, warn: '' }`       |

Only the **empty string** survives as "unset", and it is exactly what the option editor
stores when the field is cleared (`onChange` forwards `currentTarget.value`, a string).
On the production dashboard, **294 of the 574 migrated bounds are unset**, so every one of
them was picking up a default.

Combined with #11, a healthy `Port Enable - 27` (`warn: 1`, no `crit`) was graded against
`1..70` and reported as a warning.

### 10. `Text Only` loses its value to `Display Value` (**MEDIUM**) ✅

**AngularJS** (`handleTextOnly`, `status_ctrl.js:473`) pushes the series straight to the
display list and never reads `displayValueWithAlias`:

```js
handleTextOnly(series, target) {
  if (series.displayType == "Annotation") { this.annotation.push(series); }
  else { this.display.push(series); }
}
```

**React** runs `Text Only` through the same `isDisplayValue` test as every other handler,
so a metric configured with `Display Value: Never` renders a bare label. A `Text Only`
metric is nothing but its value. On the production dashboard some thirty panels showed a
disk-count label with no number next to it.

### 11. `warn == crit` grades every value as critical (**CRITICAL**) ✅

**AngularJS** (`status_ctrl.js:372-382`) compares the value against each bound, taking the
direction from which bound is larger:

```js
series.inverted = series.thresholds.crit < series.thresholds.warn;
if (!series.inverted) {
  if (value >= crit) {
    isCritical = true;
  } else if (value >= warn) {
    isWarning = true;
  }
} else {
  if (value <= crit) {
    isCritical = true;
  } else if (value <= warn) {
    isWarning = true;
  }
}
```

**React** recast this as a range check:

```ts
if ((warn <= crit && crit <= value) || (warn >= crit && crit >= value)) {
  fieldStatus = 'crit';
}
```

The two agree everywhere **except when `warn === crit`**. Both `warn <= crit` and
`warn >= crit` are then true, so the condition collapses to `crit <= value || crit >= value`,
which is true for every real number. Such a metric is critical forever, whatever it reads.

`warn == crit` is the normal way to configure a binary error counter: a filesystem error
flag, a dead-process count. On the production dashboard a single such metric, a mount-point
error flag set to `warn: 1` / `crit: 1` and reading a healthy `0`, pinned 8 panels
permanently red.

### 12. Long alert lists bounce instead of scrolling (**MEDIUM**) ✅

**AngularJS** (`status_panel.scss`) loops the list from the bottom edge of the card to the
top, and pauses on hover:

```scss
.marquee_element {
  animation: marquee_container 15s linear infinite;
}
.marquee_element:hover {
  animation-play-state: paused;
}
@keyframes marquee_container {
  0% {
    transform: translate(0, 100%);
  }
  100% {
    transform: translate(0, -100%);
  }
}
```

**React** (`Marquee.tsx`) replaced it with a 30fps `setInterval` driving `scrollTop` and
flipping direction at each end, so the text jitters up and down. It also runs a timer per
card, on every card of the dashboard.

The overflow guard the Angular panel ran (`isAutoScrollAlerts`, only animate when the
content does not fit) must be kept, or a card that fits scrolls itself off its own edges.

### 13. Card text is no longer centred (**MEDIUM**) ✅

**AngularJS** centred from the root of the card and let only the annotation column opt
back out:

```scss
.status-panel {
  text-align: center;
}
.status-panel-annotation_row {
  text-align: left;
}
```

**React** carried neither rule. Each metric line is left-aligned inside a box that shrinks
to its longest line, so a card whose lines differ in length looks ragged. It goes unnoticed
while the lines happen to be about the same width, and is obvious as soon as one line runs
much longer than the rest.

## Minor / to confirm

- **14. `Delta` aggregation semantics changed** ℹ️: Angular `Delta = s.stats.diff` (last − first). The migration map (`statusMigrationHandler.ts:38-46`) and the field editor map `Delta → 'delta'`, but Grafana's `delta` reducer sums only _positive_ consecutive deltas, which is **not** last − first. The behaviour-preserving reducer is `'diff'`. Worth a live check.
- **15. Duplicate-alias validation removed** ℹ️: Angular flagged duplicate aliases as an `error-state` (`postRefresh`, `status_ctrl.js:125-140` + `updatePanelState:475`). React has no equivalent guard. Loss of a footgun warning, not a functional break.

---

## Summary

| #   | Regression                                          | Severity | Silent? | Found by       |
| --- | --------------------------------------------------- | -------- | ------- | -------------- |
| 1   | Value Regex inverted (`replace` vs keep-match)      | High     | Yes     | code reading   |
| 2   | Date Threshold: range → strict string equality      | High     | Yes     | code reading   |
| 3   | Disable Criteria broken for numeric metrics (`===`) | High     | Yes     | code reading   |
| 4   | Single-sided / binary thresholds lost (issue #9)    | High     | Yes     | code reading   |
| 5   | Text Only: field not rendered at all                | Medium   | Partly  | code reading   |
| 6   | Remove Prefix feature removed (still documented)    | Medium   | No      | code reading   |
| 7   | Per-metric Measurement URL lost on migration        | Medium   | Yes     | code reading   |
| 8   | AngularJS panels never detected → migration is dead | Critical | Yes     | real dashboard |
| 9   | Unset bound comes back as the default (`warn 70`)   | Critical | Yes     | real dashboard |
| 10  | Text Only value hidden by `Display Value`           | Medium   | Yes     | real dashboard |
| 11  | `warn == crit` → critical for every value           | Critical | Yes     | real dashboard |
| 12  | Alert lists bounce instead of scrolling             | Medium   | No      | real dashboard |
| 13  | Card text left-aligned (`text-align` rules dropped) | Medium   | No      | real dashboard |
| 14  | Delta reducer semantics (`delta` vs `diff`)         | Low      | Yes     | code reading   |
| 15  | Duplicate-alias validation removed                  | Low      | No      | code reading   |

**Common thread**: the rewrite ported the _shape_ of the value handlers but dropped the AngularJS branching that made partial and typed configs work (the `isCheckRanges` dual mode, the direction taken from the bounds, loose equality, per-type formatting, `Text Only`). #1 to #4 all live in the same ~60-line `switch` in `buildStatusMetricProps.ts` and were fixed together, with a test per case.

**Eleven of the fifteen are silent.** They raise nothing and log nothing: they render a colour, and the colour is wrong. That is the worst failure mode a monitoring panel can have, because an operator reads a green square and moves on. v2.1 therefore also reports a metric it could not make sense of, on the console and through Grafana's frontend observability, rather than quietly grading it against a bound it invented.

**Read #8 first.** While the migration never ran, no migrated threshold could be observed being misread, which is why #9 and #11 stayed hidden through an entire major version.
