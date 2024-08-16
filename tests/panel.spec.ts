import { expect, test } from '@grafana/plugin-e2e';

test('should display Base severity', async ({ gotoPanelEditPage, readProvisionedDashboard }) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '3' });
  await expect(panelEditPage.panel.locator).toContainText('Base');
});
