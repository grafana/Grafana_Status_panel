import { DataLink, PanelMigrationHandler, PanelModel } from '@grafana/data';
import { StatusPanelOptions } from './statusPanelOptionsBuilder';
import { StatusThresholdOptions } from 'components/StatusThresholdOptionsEditor';
import { StatusFieldOptions } from './statusFieldOptionsBuilder';

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
  targets?: [
    {
      aggregation?: Pick<StatusFieldOptions, 'aggregation'>;
      alias?: string;
      crit?: number;
      decimals?: number;
      displayType?: Pick<StatusFieldOptions, 'displayType'>;
      displayAliasType?: Pick<StatusFieldOptions, 'displayAliasType'>;
      displayValueWithAlias?: Pick<StatusFieldOptions, 'displayValueWithAlias'>;
      units?: string;
      warn?: number;
      valueHandler?: Pick<StatusThresholdOptions, 'valueHandler'>;
      url?: string;
      refId?: string;
    }
  ];
}

const aggregationMigrationMap = {
  Last: 'last',
  First: 'first',
  Max: 'max',
  Min: 'min',
  Sum: 'sum',
  Avg: 'mean',
  Delta: 'delta',
};

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
    if (target.refId) {
      const fieldConfigOverride = {
        matcher: {
          id: 'byFrameRefID',
          options: target.refId,
        },
        properties: [] as any[],
      };

      if (target.aggregation) {
        let newAggregationName =
          aggregationMigrationMap[String(target.aggregation) as keyof typeof aggregationMigrationMap];
        if (newAggregationName?.length === 0) {
          newAggregationName = String(target.aggregation);
        }
        fieldConfigOverride.properties.push({
          id: 'custom.aggregation',
          value: newAggregationName,
        });
      }

      if (target.crit || target.warn || target.valueHandler) {
        fieldConfigOverride.properties.push({
          id: 'custom.thresholds',
          value: {
            valueHandler: target.valueHandler,
            crit: target.crit,
            warn: target.warn,
          },
        });
      }

      if (target.displayType) {
        fieldConfigOverride.properties.push({
          id: 'custom.displayType',
          value: target.displayType,
        });
      }

      if (target.displayAliasType) {
        fieldConfigOverride.properties.push({
          id: 'custom.displayAliasType',
          value: target.displayAliasType,
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
      clusterName: panel.clusterName,
      clusterUrl: clusterLink?.url,
      clusterTargetBlank: !!clusterLink?.targetBlank,
      // namePrefix: panel.namePrefix,
      maxAlertNumber: panel?.maxAlertNumber,
      cornerRadius: `${panel.cornerRadius}%`,
      flipCard: panel.flipCard,
      flipTime: panel.flipTime,
      colorMode: panel.colorMode,
      colors: panel.colors,
      isAutoScrollOnOverflow: panel.isAutoScrollOnOverflow,
      isGrayOnNoData: panel.isGrayOnNoData,
      isIgnoreOKColors: panel.isIgnoreOKColors,
      isHideAlertsOnDisable: panel.isHideAlertsOnDisable,
    };

    // migrate overwrites
    panel.fieldConfig = migrateFieldConfig(panel);

    // remove old angular settings from panel json
    cleanupPanel(panel);
    return options;
  }
  return panel.options;
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

  if (panel.targets) {
    for (const target of panel.targets) {
      // @ts-ignore
      delete target['$$hashKey'];
    }
  }
};
