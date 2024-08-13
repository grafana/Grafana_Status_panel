import { PanelPlugin } from '@grafana/data';
import { StatusPanel } from './components/StatusPanel';
import { statusMigrationHandler } from 'lib/statusMigrationHandler';
import { statusPanelOptionsBuilder, StatusPanelOptions } from 'lib/statusPanelOptionsBuilder';
import { statusFieldOptionsBuilder, StatusFieldOptions } from 'lib/statusFieldOptionsBuilder';
import { statusPanelThresholdBuilder } from './lib/thresholdOptionsBuilder';

export const plugin = new PanelPlugin<StatusPanelOptions, StatusFieldOptions>(StatusPanel)
  .setMigrationHandler(statusMigrationHandler)
  .setPanelOptions(statusPanelOptionsBuilder)
  .setPanelOptions(statusPanelThresholdBuilder)
  .useFieldConfig({ useCustomConfig: statusFieldOptionsBuilder });
