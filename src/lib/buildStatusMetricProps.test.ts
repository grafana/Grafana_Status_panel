import { FieldType, toDataFrame, PanelData, LoadingState, FieldConfigSource } from '@grafana/data';
import { buildStatusMetricProps } from './buildStatusMetricProps';
import { StatusFieldOptions } from './statusFieldOptionsBuilder';
import { StatusPanelOptions } from './statusPanelOptionsBuilder';
import { resetMisconfigurationReports } from './diagnostics';

const baseCustom: StatusFieldOptions = {
  aggregation: 'last',
  valueDisplayRegex: '',
  thresholds: { valueHandler: 'Number Threshold', warn: '70', crit: '90' },
  displayType: 'Regular',
  fontFormat: 'Regular',
  dateFormat: 'YYYY-MM-DD HH:mm:ss',
  displayAliasType: 'Warning / Critical',
  displayValueWithAlias: 'When Alias Displayed',
  disabledValue: '',
};

const noopColors = { ok: '', warn: '', crit: '', disable: '', noData: '', hide: '' };
const baseOptions = {
  colorMode: 'Panel',
  isIgnoreOKColors: false,
  colors: { ok: '', warn: '', crit: '', disable: '' },
} as StatusPanelOptions;

/**
 * Build the props for a single numeric metric with the given values and custom
 * field config, running it through the real buildStatusMetricProps pipeline.
 */
function run(values: Array<number | string>, custom: Partial<StatusFieldOptions>) {
  const frame = toDataFrame({
    refId: 'A',
    fields: [
      { name: 'time', type: FieldType.time, values: values.map((_, i) => i) },
      { name: 'value', type: FieldType.number, values },
    ],
  });
  // buildStatusMetricProps skips fields whose `state` is falsy.
  frame.fields.forEach((f) => {
    f.state = f.state ?? {};
  });

  const data = { series: [frame], state: LoadingState.Done } as unknown as PanelData;
  const fieldConfig: FieldConfigSource = {
    defaults: {
      custom: {
        ...baseCustom,
        ...custom,
        thresholds: { ...baseCustom.thresholds, ...(custom.thresholds ?? {}) },
      },
    },
    overrides: [],
  } as unknown as FieldConfigSource;

  return buildStatusMetricProps(data, fieldConfig, baseOptions, noopColors, (s: string) => s, 'browser');
}

describe('Number Threshold — single-sided thresholds (regression #4 / issue #9)', () => {
  test('crit=0 with empty warn does NOT alert a value that differs from the threshold', () => {
    const res = run([1], { thresholds: { valueHandler: 'Number Threshold', crit: '0', warn: '' } });
    expect(res.crits).toHaveLength(0);
    expect(res.warns).toHaveLength(0);
  });

  test('crit=0 with empty warn DOES flag the exact matching value', () => {
    const res = run([0], { thresholds: { valueHandler: 'Number Threshold', crit: '0', warn: '' } });
    expect(res.crits).toHaveLength(1);
  });
});

describe('Disable Criteria — numeric metric (regression #3)', () => {
  test('a numeric 0 matches disabledValue "0"', () => {
    const res = run([0], {
      thresholds: { valueHandler: 'Disable Criteria', crit: '', warn: '' },
      disabledValue: '0',
    });
    expect(res.disables).toHaveLength(1);
  });

  test('a numeric value that differs is not disabled', () => {
    const res = run([1], {
      thresholds: { valueHandler: 'Disable Criteria', crit: '', warn: '' },
      disabledValue: '0',
    });
    expect(res.disables).toHaveLength(0);
  });
});

describe('Value Regex — keeps the match, not the remainder (regression #1)', () => {
  test('displays only the matched part of the value', () => {
    const res = run([12345], {
      thresholds: { valueHandler: 'Number Threshold', crit: '', warn: '' },
      displayAliasType: 'Always',
      valueDisplayRegex: '^123',
    });
    expect(res.displays).toHaveLength(1);
    expect(res.displays[0].displayValue).toBe('123');
  });

  test('falls back to the full value when the regex does not match', () => {
    const res = run([12345], {
      thresholds: { valueHandler: 'Number Threshold', crit: '', warn: '' },
      displayAliasType: 'Always',
      valueDisplayRegex: 'zzz',
    });
    expect(res.displays[0].displayValue).toBe('12345');
  });
});

describe('Text Only handler (regression #5)', () => {
  test('displays the metric value unconditionally', () => {
    const res = run([42], { thresholds: { valueHandler: 'Text Only', crit: '', warn: '' } });
    expect(res.displays).toHaveLength(1);
    expect(res.displays[0].displayValue).toBe('42');
  });

  test('routes to annotations when displayType is Annotation', () => {
    const res = run([42], {
      thresholds: { valueHandler: 'Text Only', crit: '', warn: '' },
      displayType: 'Annotation',
    });
    expect(res.annotations).toHaveLength(1);
    expect(res.displays).toHaveLength(0);
  });
});

describe('Date Threshold — chronological range comparison (regression #2)', () => {
  const epoch = (iso: string) => new Date(iso).getTime();
  const dateThresholds = {
    valueHandler: 'Date Threshold' as const,
    warn: '2024-05-01T00:00:00Z',
    crit: '2024-06-01T00:00:00Z',
  };

  test('flags crit when the date is at/after the crit bound', () => {
    const res = run([epoch('2024-06-15T00:00:00Z')], { thresholds: dateThresholds });
    expect(res.crits).toHaveLength(1);
  });

  test('flags warn when the date is between the warn and crit bounds', () => {
    const res = run([epoch('2024-05-15T00:00:00Z')], { thresholds: dateThresholds });
    expect(res.warns).toHaveLength(1);
  });

  test('stays OK before the warn bound', () => {
    const res = run([epoch('2024-04-15T00:00:00Z')], { thresholds: dateThresholds });
    expect(res.crits).toHaveLength(0);
    expect(res.warns).toHaveLength(0);
  });
});

describe('Number Threshold — equal warn and crit bounds (regression #11)', () => {
  // The AngularJS panel compared the value against each bound (`value >= crit`,
  // then `value >= warn`). The React rewrite turned that into a range check whose
  // two branches are BOTH true when warn === crit, so every value came out crit.
  // Real dashboards use warn === crit for binary error counters (a filesystem
  // error flag, a dead-process count), so those panels were permanently red.
  test('a value below an equal warn/crit bound is not an alert', () => {
    const res = run([0], { thresholds: { valueHandler: 'Number Threshold', warn: '1', crit: '1' } });
    expect(res.crits).toHaveLength(0);
    expect(res.warns).toHaveLength(0);
  });

  test('a value at an equal warn/crit bound is critical', () => {
    const res = run([1], { thresholds: { valueHandler: 'Number Threshold', warn: '1', crit: '1' } });
    expect(res.crits).toHaveLength(1);
  });

  test('a value above an equal warn/crit bound is critical', () => {
    const res = run([5], { thresholds: { valueHandler: 'Number Threshold', warn: '1', crit: '1' } });
    expect(res.crits).toHaveLength(1);
  });
});

describe('Number Threshold — direction is taken from the bounds', () => {
  test('higher is worse: warn 80 / crit 90', () => {
    expect(run([50], { thresholds: { valueHandler: 'Number Threshold', warn: '80', crit: '90' } }).warns).toHaveLength(
      0
    );
    expect(run([85], { thresholds: { valueHandler: 'Number Threshold', warn: '80', crit: '90' } }).warns).toHaveLength(
      1
    );
    expect(run([95], { thresholds: { valueHandler: 'Number Threshold', warn: '80', crit: '90' } }).crits).toHaveLength(
      1
    );
  });

  test('lower is worse: warn 1 / crit 0, as used for bonding and process counts', () => {
    expect(run([2], { thresholds: { valueHandler: 'Number Threshold', warn: '1', crit: '0' } }).warns).toHaveLength(0);
    expect(run([1], { thresholds: { valueHandler: 'Number Threshold', warn: '1', crit: '0' } }).warns).toHaveLength(1);
    expect(run([0], { thresholds: { valueHandler: 'Number Threshold', warn: '1', crit: '0' } }).crits).toHaveLength(1);
  });

  test('a healthy process count well above the bounds stays OK', () => {
    const res = run([89], { thresholds: { valueHandler: 'Number Threshold', warn: '1', crit: '0' } });
    expect(res.crits).toHaveLength(0);
    expect(res.warns).toHaveLength(0);
  });
});

describe('Text Only — the value is always shown (regression #10)', () => {
  // handleTextOnly in the Angular panel pushed the series straight to the display
  // list without ever looking at displayValueWithAlias, so the value showed up
  // even when the option said "Never".
  test('shows the value even when displayValueWithAlias is Never', () => {
    const res = run([480], {
      thresholds: { valueHandler: 'Text Only', warn: '', crit: '' },
      displayValueWithAlias: 'Never',
      displayAliasType: 'Warning / Critical',
    });
    expect(res.displays).toHaveLength(1);
    expect(res.displays[0].displayValue).toBe('480');
  });
});

describe('Misconfiguration is reported, not swallowed', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    resetMisconfigurationReports();
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => warn.mockRestore());

  test('an invalid Value Regex is reported instead of being caught and dropped', () => {
    // This used to be an empty `catch {}`: the pattern was ignored in complete silence.
    const res = run([42], { valueDisplayRegex: '[unclosed', displayAliasType: 'Always' });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('is not a valid regular expression');
    // and the value still shows, in full
    expect(res.displays[0].displayValue).toBe('42');
  });

  test('a threshold bound that is not a number is reported', () => {
    // A non-numeric bound reads as "not set", which silently changes how the value is
    // graded. Left unsaid, the card just shows the wrong colour.
    run([42], { thresholds: { valueHandler: 'Number Threshold', warn: 'abc', crit: '90' } });

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('the Warning threshold "abc" is not a number');
  });

  test('an empty bound is a legitimate single-sided threshold, not a mistake', () => {
    run([1], { thresholds: { valueHandler: 'Number Threshold', warn: '', crit: '0' } });

    expect(warn).not.toHaveBeenCalled();
  });

  test('the same problem is reported once, not on every refresh', () => {
    const misconfigured = { valueDisplayRegex: '[unclosed', displayAliasType: 'Always' as const };
    run([42], misconfigured);
    run([42], misconfigured);
    run([42], misconfigured);

    expect(warn).toHaveBeenCalledTimes(1);
  });
});
