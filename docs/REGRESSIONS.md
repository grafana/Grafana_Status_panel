# Status Panel — Regressions introduced by the AngularJS → React rewrite

**Scope**: comparison of the last AngularJS release (`Vonage_Grafana_Status_panel` @ tag `1.0.8`, `src/status_ctrl.js`) against the current React implementation (`Grafana_Status_panel/src`, branch `main`). The Vonage `master` React branch is identical to Grafana's on every point below — the regressions date from the React rewrite (Vonage commit `3de80f9 "migration to React"`), which Grafana inherited and published under the same plugin id.

**Verification legend**:

- ✅ _confirmed by code reading_ (deterministic from the source)
- ⚠️ _type-level certainty_ (follows from the runtime types, not yet exercised in a live Grafana)
- ℹ️ _behavioural change, needs a live repro to rate severity_

---

## 1. `Value Regex` does the opposite of what it documents — **HIGH** ✅

The README (Grafana repo) states: _"if there is match, **only the first match will be displayed**. Otherwise, the original value will be displayed."_ AngularJS implemented exactly that; React does the inverse.

**AngularJS** (`numberOrTextWithRegex` filter, `status_ctrl.js:103-107`) — keeps the match:

```js
let matchResults = input.match(regex);
if (matchResults == null) {
  return input;
} else {
  return matchResults[0];
} // display ONLY the match
```

**React** (`lib/buildStatusMetricProps.ts:122`) — strips the match:

```js
displayValue = displayValue.replace(new RegExp(config.custom.valueDisplayRegex), '');
```

**Impact**: value `www.prefix.server.com` + regex `server` →

- Angular: `server` (the match)
- React: `www.prefix..com` (everything _except_ the match)

Completely inverted output. Silent — no error, just wrong text on every panel using the feature. Also contradicts the shipped README.

**Fix**: replace the `.replace(regex, '')` with a `match()` returning `matchResults[0]` when it matches, else the original value.

---

## 2. `Date Threshold` no longer does range comparison — **HIGH** ⚠️

**AngularJS**: `Date Threshold` went through `handleThresholdStatus` like numbers. `parseThresholds` converts `Date` thresholds to numbers via `.valueOf()` and sets `warnIsNumber/critIsNumber = true` (`status_ctrl.js:568-571`), so dates used the **numeric range check** (`>=` / `<=`) — i.e. "alert if the date is after/before the threshold".

**React** (`lib/buildStatusMetricProps.ts:99-103`) — strict string equality:

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

## 3. `Disable Criteria` broken for numeric metrics (`==` → `===`) — **HIGH** ⚠️

**AngularJS** (`status_ctrl.js:461`) — loose equality:

```js
if (series.display_value == series.disabledValue) {
  this.disabled.push(series);
}
```

`0 == "0"` → `true`, so a numeric metric returning `0` matched a `disabledValue` of `"0"`.

**React** (`lib/buildStatusMetricProps.ts:106`) — strict equality:

```js
if (fieldCalcs[config.custom.aggregation] === config.custom.disabledValue) {
  fieldStatus = 'disable';
}
```

`fieldCalcs[...]` is a `number` for a numeric field; `disabledValue` comes from a text input (`string`). `0 === "0"` → `false`.

**Impact**: the most common disable case — a `0/1` metric with `disabledValue = 0` — never triggers. (Note: this is the same family of use case as issue #9.)

**Fix**: coerce/compare with matching types (e.g. `String(value) === disabledValue`), or parse `disabledValue` to the field type.

---

## 4. Single-sided thresholds / binary 2-colour display lost — **HIGH** ✅ (issue #9)

**AngularJS** (`status_ctrl.js:363-390`): a dual mode driven by `isCheckRanges = warnIsNumber && critIsNumber`. If only one threshold is numeric, it falls back to **exact equality** instead of a range check. That is what made `crit=0` + empty `warn` behave as "red when value == 0, green otherwise".

**React** (`lib/buildStatusMetricProps.ts:61-68`): the dual mode is gone. Empty thresholds are coerced with `+config.custom.thresholds.crit` (`+'' === 0`) and always treated as a numeric range.

**Impact**: impossible to configure a single alert level / binary display. Detailed in [issue #9](https://github.com/grafana/Grafana_Status_panel/issues/9).

**Fix**: reintroduce the "non-numeric threshold ⇒ exact-equality" fallback and distinguish _empty_ (`''`/`undefined`) from _zero_ before coercion.

---

## 5. `Text Only` handler no longer shows the value (and often hides the metric) — **MEDIUM** ✅

`Text Only` is still offered in the editor (`StatusThresholdOptionsEditor.tsx:35-39`, described as _"Show the alias + the value on the panel without any condition"_) and in the type union — but `buildStatusMetricProps.ts`'s `switch (valueHandler)` (lines 59-110) has **no `Text Only` case**.

Consequences for a `Text Only` field:

- `displayValue` stays `''` → the value is **never rendered**, only the alias.
- `fieldStatus` stays at its init value `displayAliasType === 'Always' ? 'ok' : 'hide'`. With the default `displayAliasType = 'Warning / Critical'`, it resolves to `'hide'` → the field is dropped from **every** bucket and doesn't appear at all.

**AngularJS** (`handleTextOnly`, `status_ctrl.js:466-472`) pushed the series (with its computed `display_value`, `isDisplayValue = true`) into `display`/`annotation` unconditionally.

**Impact**: `Text Only` shows, at best, the alias with no value; with default options it shows nothing.

**Fix**: add a `Text Only` case that computes/formats `displayValue` and forces `fieldStatus = 'ok'`.

---

## 6. `Remove Prefix` (namePrefix) feature removed but still documented — **MEDIUM** ✅

**AngularJS** (`status_ctrl.js:220-222`): `displayName = interpolate(clusterName).replace(new RegExp(namePrefix, 'i'), '')` — the documented "Remove Prefix" feature (still in the README).

**React**: `namePrefix` is **commented out** everywhere — `statusPanelOptionsBuilder.ts:47-53` (editor) and `statusMigrationHandler.ts:8,47` (migration). The option cannot be set, and any saved `namePrefix` is silently dropped on migration.

**Impact**: a documented feature is gone; dead/commented code left in place; README now lies. Regression for anyone relying on prefix stripping when repeating panels over a template.

**Fix**: either re-implement the option, or remove it from the README and delete the commented blocks (decide, don't leave it half-there).

---

## 7. Per-metric `Measurement URL` dropped during migration — **MEDIUM** ⚠️

**AngularJS**: each target had a `url` field rendered as a clickable link (README "Measurement URL"); `status_ctrl.js:252` `s.url = target.url`.

**React**: per-metric links now flow through Grafana's standard field **Data Links** (`field.getLinks()`, `buildStatusMetricProps.ts:127`). That is a reasonable modernisation — **but** `migrateFieldConfig` (`statusMigrationHandler.ts:51-134`) maps `aggregation`, `thresholds`, `displayType`, `displayAliasType`, `displayValueWithAlias`, `decimals`, `units` … and **never maps `target.url`**. The panel-level `panel.links[0]` is migrated to `clusterUrl`, but per-target URLs are lost.

**Impact**: users upgrading from Angular silently lose all per-metric measurement links.

**Fix**: in `migrateFieldConfig`, translate `target.url` into a `links` field-config override (data link) per refId.

---

## Minor / to confirm

- **8. `Delta` aggregation semantics changed** ℹ️ — Angular `Delta = s.stats.diff` (last − first). The migration map (`statusMigrationHandler.ts:38-46`) and the field editor map `Delta → 'delta'`, but Grafana's `delta` reducer sums only _positive_ consecutive deltas, which is **not** last − first. The behaviour-preserving reducer is `'diff'`. Worth a live check.
- **9. Duplicate-alias validation removed** ℹ️ — Angular flagged duplicate aliases as an `error-state` (`postRefresh`, `status_ctrl.js:125-140` + `updatePanelState:475`). React has no equivalent guard. Loss of a footgun warning, not a functional break.

---

## Summary

| #   | Regression                                          | Severity | Silent? | Root cause                               |
| --- | --------------------------------------------------- | -------- | ------- | ---------------------------------------- |
| 1   | Value Regex inverted (`replace` vs keep-match)      | High     | Yes     | `buildStatusMetricProps.ts:122`          |
| 2   | Date Threshold: range → strict string equality      | High     | Yes     | `buildStatusMetricProps.ts:99-103`       |
| 3   | Disable Criteria broken for numeric metrics (`===`) | High     | Yes     | `buildStatusMetricProps.ts:106`          |
| 4   | Single-sided / binary thresholds lost (issue #9)    | High     | Yes     | `buildStatusMetricProps.ts:61-68`        |
| 5   | Text Only: value not shown / field hidden           | Medium   | Partly  | missing `switch` case                    |
| 6   | Remove Prefix feature removed (still documented)    | Medium   | No      | commented-out option + migration         |
| 7   | Per-metric Measurement URL lost on migration        | Medium   | Yes     | `statusMigrationHandler.ts` no `url` map |
| 8   | Delta reducer semantics (`delta` vs `diff`)         | Low      | Yes     | migration map + field editor             |
| 9   | Duplicate-alias validation removed                  | Low      | No      | not reimplemented                        |

**Common thread**: the rewrite ported the _shape_ of the value handlers but dropped the AngularJS branching that made partial/typed configs work (the `isCheckRanges` dual mode, loose equality, per-type formatting, `Text Only`). #1–#4 all live in the same ~60-line `switch` in `buildStatusMetricProps.ts` and could be fixed together with tests per case.
