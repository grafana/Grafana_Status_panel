import { DataLink, PanelMigrationHandler, PanelModel } from '@grafana/data';
import { StatusPanelOptions } from '../interfaces/statusPanelOptions';
import { ThresholdConf } from '../components/ThresholdSetComponent';
import { StatusFieldOptions } from '../interfaces/statusFieldOptions';

interface AngularPanelModel extends Omit<PanelModel, 'targets'> {
  clusterName: string;
  namePrefix: string;
  maxAlertNumber: number;
  cornerRadius: number;
  flipCard: boolean;
  flipTime: number;
  colorMode: 'Panel' | 'Metric' | 'Disabled';
  colors: { crit: string; warn: string; ok: string; disable: string };
  isAutoScrollOnOverflow: boolean;
  isGrayOnNoData: boolean;
  isIgnoreOKColors: boolean;
  isHideAlertsOnDisable: boolean;
  links: DataLink[];
  thresholds: ThresholdConf[];
  targets?: [
    {
      aggregation?: Pick<StatusFieldOptions, 'aggregation'>;
      alias?: string;
      crit?: number;
      decimals?: number;
      displayValueWithAlias?: Pick<StatusFieldOptions, 'displayValueWithAlias'>;
      units?: string;
      warn?: number;
      url?: string;
    }
  ];
}

const isAngularModel = (panel: Omit<PanelModel, 'targets'>): panel is AngularPanelModel =>
  !!panel.options && 'clusterName' in panel;

const migrateFieldConfig = (panel: AngularPanelModel) => {
  const fieldConfig = {
    defaults: {},
    overrides: [] as any[],
  };

  if (!panel.targets) {
    return fieldConfig;
  }

  for (const target of panel.targets) {
    if (target.alias) {
      const fieldConfigOverride = {
        matcher: {
          id: 'byName',
          options: target.alias,
        },
        properties: [] as any[],
      };

      if (target.aggregation) {
        fieldConfigOverride.properties.push({
          id: 'custom.aggregation',
          value: target.aggregation,
        });
      }

      if (target.displayValueWithAlias) {
        fieldConfigOverride.properties.push({
          id: 'custom.displayValueWithAlias',
          value: target.displayValueWithAlias,
        });
      }

      if (target.decimals) {
        fieldConfigOverride.properties.push({
          id: 'decimals',
          value: target.decimals,
        });
      }

      if (target.units) {
        fieldConfigOverride.properties.push({
          id: 'unit',
          value: target.units,
        });
      }

      fieldConfig.overrides.push(fieldConfigOverride);
    }
  }

  return fieldConfig;
};

export const statusMigrationHandler: PanelMigrationHandler<StatusPanelOptions> = (panel) => {
  if (isAngularModel(panel)) {
    // DataLink cannot be null, create an empty one
    let clusterLink: DataLink<any> = {
      url: '',
      title: '',
    };
    if (panel.links && panel.links.length > 0) {
      clusterLink = panel.links[0];
    }
    const options: StatusPanelOptions = {
      title: panel.clusterName,
      url: clusterLink?.url,
      urlTargetBlank: !!clusterLink?.targetBlank,
      // namePrefix: panel.namePrefix,
      maxAlertNumber: panel?.maxAlertNumber,
      cornerRadius: `${panel.cornerRadius}%`,
      flipCard: panel.flipCard,
      flipTime: panel.flipTime,
      colorMode: panel.colorMode,
      colors: panel.colors,
      isAutoScrollOnOverflow: panel.isAutoScrollOnOverflow,
      isGrayOnNoData: panel.isGrayOnNoData,
      isHideAlertsOnDisable: panel.isHideAlertsOnDisable,
      fieldConfig: migrateFieldConfig(panel),
      thresholds: [],
    };

    // migrate overrides

    // remove old angular settings from panel json
    cleanupPanel(panel);
    return options;
  } else {
    return {};
  }
};

const cleanupPanel = (panel: AngularPanelModel) => {
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
