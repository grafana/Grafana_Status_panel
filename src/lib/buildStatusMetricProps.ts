import {
  PanelData,
  FieldConfigSource,
  FieldConfig,
  formattedValueToString,
  toFixed,
  dateTimeAsMoment,
  InterpolateFunction,
  LinkModel,
  getValueFormat,
  reduceField,
} from '@grafana/data';
import { css, cx } from '@emotion/css';
import _ from 'lodash';

import { StatusFieldOptions } from 'lib/statusFieldOptionsBuilder';
import { StatusPanelOptions } from 'lib/statusPanelOptionsBuilder';
import { DataQuery } from '@grafana/schema';

type StatusType = 'ok' | 'hide' | 'warn' | 'crit' | 'disable' | 'noData';
interface StatusMetricProp extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  alias: string;
  displayValue?: string | number;
  link?: LinkModel;
}

/** A bound left empty in the editor means "not set", so never coerce it to 0. */
const toBound = (raw: unknown): number => (raw === '' || raw == null ? NaN : Number(raw));

/**
 * Grade a value against its two bounds the way the AngularJS panel did: compare it
 * against each bound in turn, taking the direction from whichever bound is larger.
 * A single bound falls back to exact equality. Returns null when the value clears
 * both bounds, which leaves the caller's initial status untouched.
 */
function classifySeverity(value: number, warn: number, crit: number): 'warn' | 'crit' | null {
  const warnIsSet = _.isFinite(warn);
  const critIsSet = _.isFinite(crit);

  if (warnIsSet && critIsSet) {
    // `crit < warn` means a lower value is the worse one (bonded slaves, healthy
    // process counts). Comparing against each bound instead of testing a range
    // matters when warn === crit: both ends of a range check are then true at
    // once, which reports crit for every possible value.
    const lowerIsWorse = crit < warn;
    if (lowerIsWorse ? value <= crit : value >= crit) {
      return 'crit';
    }
    if (lowerIsWorse ? value <= warn : value >= warn) {
      return 'warn';
    }
    return null;
  }

  if (critIsSet && value === crit) {
    return 'crit';
  }
  if (warnIsSet && value === warn) {
    return 'warn';
  }
  return null;
}

export function buildStatusMetricProps(
  data: PanelData,
  fieldConfig: FieldConfigSource,
  options: StatusPanelOptions,
  colorClasses: { ok: string; warn: string; crit: string; disable: string; noData: string; hide: string },
  replaceVariables: InterpolateFunction,
  timeZone: string
) {
  let annotations: StatusMetricProp[] = [];
  let displays: StatusMetricProp[] = [];
  let crits: StatusMetricProp[] = [];
  let warns: StatusMetricProp[] = [];
  let disables: StatusMetricProp[] = [];
  data.series.forEach((df) => {
    // find first non-time column
    const field = df.fields.find((field) => field.name.toLowerCase() !== 'time')!;
    if (!field?.state) {
      return;
    }
    const fieldCalcs = reduceField({ field: field!, reducers: ['bogus'] });

    const config: FieldConfig<StatusFieldOptions> = _.defaultsDeep({ ...field.config }, fieldConfig.defaults);
    if (!config.custom) {
      return;
    }

    // if (!field.state?.calcs) {
    //   return;
    // }
    // determine field status & handle formatting based on value handler
    let fieldStatus: StatusType = config.custom.displayAliasType === 'Always' ? 'ok' : 'hide';
    let displayValue = '';
    switch (config.custom.thresholds.valueHandler) {
      case 'Number Threshold': {
        const value: number = fieldCalcs[config.custom.aggregation];
        const severity = classifySeverity(
          value,
          toBound(config.custom.thresholds.warn),
          toBound(config.custom.thresholds.crit)
        );
        if (severity) {
          fieldStatus = severity;
        }

        if (!_.isFinite(value)) {
          displayValue = 'Invalid Number';
        } else if (config.unit) {
          displayValue = formattedValueToString(getValueFormat(config.unit)(value, config.decimals));
        } else {
          displayValue = toFixed(value, config.decimals);
        }
        break;
      }
      case 'String Threshold':
        displayValue = fieldCalcs[config.custom.aggregation];
        if (displayValue === undefined || displayValue === null || displayValue !== displayValue) {
          displayValue = 'Invalid String';
        }

        if (displayValue === config.custom.thresholds.crit) {
          fieldStatus = 'crit';
        } else if (displayValue === config.custom.thresholds.warn) {
          fieldStatus = 'warn';
        }
        break;
      case 'Date Threshold': {
        const val = fieldCalcs[config.custom.aggregation];
        let date = dateTimeAsMoment(val);
        if (timeZone === 'utc') {
          date = date.utc();
        }

        displayValue = date.format(config.custom.dateFormat);

        // Compare chronologically (epoch millis) so the bounds grade the same way
        // the numeric ones do.
        const toDateBound = (raw: string) => (raw ? dateTimeAsMoment(raw).valueOf() : NaN);
        const severity = classifySeverity(
          date.valueOf(),
          toDateBound(config.custom.thresholds.warn),
          toDateBound(config.custom.thresholds.crit)
        );
        if (severity) {
          fieldStatus = severity;
        }
        break;
      }
      case 'Disable Criteria':
        // Compare as strings so a numeric metric (e.g. 0) matches a text disabledValue ("0").
        if (String(fieldCalcs[config.custom.aggregation]) === config.custom.disabledValue) {
          fieldStatus = 'disable';
        }
        break;
      case 'Text Only':
        // Always show the metric, with no threshold condition.
        fieldStatus = 'ok';
        displayValue = String(fieldCalcs[config.custom.aggregation]);
        break;
    }

    // only display value when appropriate
    const withAlias = config.custom.displayValueWithAlias;
    const isDisplayValue =
      // A Text Only metric is nothing but its value, so it ignores this option. The
      // Angular panel pushed it straight to the display list without ever reading it.
      config.custom.thresholds.valueHandler === 'Text Only' ||
      withAlias === 'When Alias Displayed' ||
      (fieldStatus === 'warn' && withAlias === 'Warning / Critical') ||
      (fieldStatus === 'crit' && (withAlias === 'Warning / Critical' || withAlias === 'Critical Only'));

    // apply RegEx if value will be displayed
    if (isDisplayValue && config.custom.valueDisplayRegex) {
      try {
        // Display only the matched part of the value; fall back to the full value when no match.
        const match = displayValue.match(new RegExp(config.custom.valueDisplayRegex));
        if (match) {
          displayValue = match[0];
        }
      } catch {}
    }

    // get first link and interpolate variables
    const link = ((field.getLinks && field.getLinks({})) ?? [])[0];
    if (link) {
      link.href = replaceVariables(link.href);
    }

    const target: (DataQuery & { alias?: string }) | undefined = data.request?.targets?.find(
      (target) => target.refId === df.refId
    );

    // build props and place in correct bucket
    let props: StatusMetricProp = {
      alias: config.displayName || target?.alias || df.name || df.refId || '',
      displayValue: isDisplayValue ? displayValue : undefined,
      link,
    };

    // set font format for field
    if (fieldStatus !== 'ok') {
      if (config.custom.fontFormat === 'Bold') {
        props.className = css({ fontWeight: 'bold' });
      } else if (config.custom.fontFormat === 'Italic') {
        props.className = css({ fontStyle: 'italic' });
      }
    }
    // set color for field when colormode is Metric
    if (options.colorMode === 'Metric') {
      props.className = cx(props.className, colorClasses[fieldStatus]);
    }

    // add to appropriate section
    if (fieldStatus === 'ok') {
      if (config.custom.displayType === 'Regular') {
        displays.push(props);
      } else {
        annotations.push(props);
      }
    } else if (fieldStatus === 'warn') {
      warns.push(props);
    } else if (fieldStatus === 'crit') {
      crits.push(props);
    } else if (fieldStatus === 'disable') {
      disables.push(props);
    }
  });

  return { annotations, disables, crits, warns, displays };
}
