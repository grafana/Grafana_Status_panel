import { PanelMigrationHandler } from '@grafana/data';
import { StatusPanelOptions } from '../interfaces/statusPanelOptions';

export const statusMigrationHandler: PanelMigrationHandler<StatusPanelOptions> = (panel) => {
  return {};
};
