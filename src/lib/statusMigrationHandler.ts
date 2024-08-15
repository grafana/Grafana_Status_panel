import { PanelMigrationHandler } from '@grafana/data';
import { StatusPanelOptions } from '../interfaces/statusPanelOptions';

export const statusMigrationHandler: PanelMigrationHandler<StatusPanelOptions> = (panel) => {
  return {};
};

/*const cleanupPanel = (panel: AngularPanelModel) => {
    // @ts-ignore
    delete panel.clusterName;
    // @ts-ignore
    delete panel.colorMode;
    // @ts-ignore
    delete panel.colors;
    // @ts-ignore
    delete panel.cornerRadius;
    // @ts-ignore
    delete panel.flipCard;
    // @ts-ignore
    delete panel.flipTime;
    // @ts-ignore
    delete panel.fontFormat;
    // @ts-ignore
    delete panel.isAutoScrollOnOverflow;
    // @ts-ignore
    delete panel.isGrayOnNoData;
    // @ts-ignore
    delete panel.isHideAlertsOnDisable;
    // @ts-ignore
    delete panel.isIgnoreOKColors;
    // @ts-ignore
    delete panel.maxAlertNumber;
    // @ts-ignore
    delete panel.namePrefix;
    // @ts-ignore
    delete panel.thresholds;
};

 */
