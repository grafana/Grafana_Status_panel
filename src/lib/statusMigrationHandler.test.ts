import { PanelModel } from '@grafana/data';
import { statusMigrationHandler } from './statusMigrationHandler';
import { StatusPanelOptions } from './statusPanelOptionsBuilder';

/** Minimal AngularJS-era panel model recognised by the migration handler. */
function angularPanel(targets: any[]): PanelModel<StatusPanelOptions> {
  return {
    options: {},
    clusterName: 'Prod',
    colors: { crit: '', warn: '', ok: '', disable: '' },
    targets,
  } as unknown as PanelModel<StatusPanelOptions>;
}

describe('Angular panel detection (regression #8)', () => {
  test('detects a real AngularJS panel, which has no "options" key at all', () => {
    // A genuine AngularJS panel model: settings live at the root, and there is
    // no `options` object (that is a React-era concept).
    const panel = {
      clusterName: 'DA20',
      colors: { crit: '', warn: '', ok: '', disable: '' },
      targets: [{ refId: 'A', valueHandler: 'Number Threshold', warn: 1 }],
    } as unknown as PanelModel<StatusPanelOptions>;

    statusMigrationHandler(panel);

    expect(panel.fieldConfig?.overrides).toHaveLength(1);
    const props = (panel.fieldConfig.overrides as any[])[0].properties;
    expect(props.find((p: any) => p.id === 'custom.thresholds').value.warn).toBe(1);
  });
});

describe('Angular migration — unset thresholds stay unset (regression #9)', () => {
  test('a bound the Angular panel did not set is migrated as an empty string', () => {
    // Only an empty string survives Grafana's field config pipeline as "unset".
    // Left undefined or null, the bound comes back as the registered default
    // (crit=90), which turns a single-sided threshold into a two-sided one and
    // flags perfectly healthy values as warnings.
    const panel = angularPanel([{ refId: 'A', valueHandler: 'Number Threshold', warn: 1 }]);

    statusMigrationHandler(panel);

    const th = (panel.fieldConfig.overrides as any[])[0].properties.find(
      (p: any) => p.id === 'custom.thresholds'
    ).value;
    expect(th.warn).toBe(1);
    expect(th.crit).toBe('');
  });
});

describe('Angular migration — per-metric URL (regression #7)', () => {
  test("migrates a target's url into a field data link", () => {
    const panel = angularPanel([{ refId: 'A', url: 'https://wiki/runbook' }]);

    statusMigrationHandler(panel);

    const override = (panel.fieldConfig.overrides as any[]).find((o) => o.matcher.options === 'A');
    expect(override).toBeDefined();
    const links = override.properties.find((p: any) => p.id === 'links');
    expect(links).toBeDefined();
    expect(links.value[0].url).toBe('https://wiki/runbook');
  });

  test('targets without a url produce no data link', () => {
    const panel = angularPanel([{ refId: 'A', warn: 1, crit: 2 }]);

    statusMigrationHandler(panel);

    const override = (panel.fieldConfig.overrides as any[]).find((o) => o.matcher.options === 'A');
    expect(override.properties.find((p: any) => p.id === 'links')).toBeUndefined();
  });
});
