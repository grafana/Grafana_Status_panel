import { PanelPlugin } from '@grafana/data';
import { StatusPanel } from './components/StatusPanel';
import { statusMigrationHandler } from 'lib/statusMigrationHandler';
import { StatusPanelOptions } from './interfaces/statusPanelOptions';
import { StatusFieldOptions } from './interfaces/statusFieldOptions';
import { statusPanelOptionsBuilder } from './lib/statusPanelOptionsBuilder';
import { statusFieldOptionsBuilder } from './lib/statusFieldOptionsBuilder';

export const plugin = new PanelPlugin<StatusPanelOptions, StatusFieldOptions>(StatusPanel)
  .setMigrationHandler(statusMigrationHandler)
  .setPanelOptions(statusPanelOptionsBuilder)
  .useFieldConfig({ useCustomConfig: statusFieldOptionsBuilder });
