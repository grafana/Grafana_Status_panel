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
