import { test, expect } from '@grafana/plugin-e2e';

test('should display "Prod Results" by default', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '3' });
  await expect(panelEditPage.panel.locator).toContainText('Prod Results');
});

test('should display Peak', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '3' });
  await expect(panelEditPage.panel.locator).toContainText('Peak -');
});

test('should display Current', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '3' });
  await expect(panelEditPage.panel.locator).toContainText('Current -');
});
