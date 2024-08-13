import { PanelOptionsEditorBuilder } from '@grafana/data';

export interface StatusPanelOptions {
  clusterName: string;
  clusterUrl: string;
  clusterTargetBlank: boolean;
  // namePrefix: string;
  maxAlertNumber: number;
  cornerRadius: string;
  flipCard: boolean;
  flipTime: number;
  colorMode: 'Panel' | 'Metric' | 'Disabled';
  colors: { crit: string; warn: string; ok: string; disable: string };
  isAutoScrollOnOverflow: boolean;
  isGrayOnNoData: boolean;
  isIgnoreOKColors: boolean;
  isHideAlertsOnDisable: boolean;
  fieldConfig: {
    defaults: {};
    overrides: unknown[];
  };
}

export const statusPanelOptionsBuilder = (builder: PanelOptionsEditorBuilder<StatusPanelOptions>) =>
  builder
    .addTextInput({
      path: 'clusterName',
      name: 'Cluster Name',
      description: '',
      defaultValue: '',
      category: ['Status Panel options'],
      settings: { expandTemplateVars: true },
    })
    .addTextInput({
      path: 'clusterUrl',
      name: 'Cluster URL',
      description: '',
      defaultValue: '',
      category: ['Status Panel options'],
      settings: { expandTemplateVars: true },
    })
    .addBooleanSwitch({
      path: 'clusterTargetBlank',
      name: 'Open Cluster URL in new tab',
      defaultValue: false,
      category: ['Status Panel options'],
      showIf: ({ clusterUrl }) => !!clusterUrl,
    })
    // .addTextInput({
    //   path: 'namePrefix',
    //   name: 'Remove Prefix',
    //   defaultValue: '',
    //   description: 'A prefix to remove from the name (helpful when repeating panel over a template)',
    //   category: ['Status Panel Options'],
    // })
    .addNumberInput({
      path: 'maxAlertNumber',
      name: 'Max Alerts',
      defaultValue: -1,
      description: 'Max alerts number to show in the panel. In case value is less than zero, show all alerts',
      category: ['Status Panel options'],
    })
    .addTextInput({
      path: 'cornerRadius',
      name: 'Corner Radius',
      defaultValue: '0rem',
      description: 'The corner radius to apply the panel. Values are used for the border-radius CSS attribute.',
      category: ['Status Panel options'],
    })
    .addBooleanSwitch({ path: 'flipCard', name: 'Flip Panel', defaultValue: false, category: ['Status Panel options'] })
    .addNumberInput({
      path: 'flipTime',
      name: 'Flip interval',
      defaultValue: 5,
      category: ['Status Panel options'],
      showIf: ({ flipCard }) => flipCard,
    })
    // Default colors match Table Panel so colorized text is easier to read
    .addBooleanSwitch({
      path: 'isAutoScrollOnOverflow',
      name: 'Auto scroll alerts on overflow',
      defaultValue: false,
      category: ['Status Panel options'],
    })
    .addBooleanSwitch({
      path: 'isGrayOnNoData',
      name: "Use 'Disable' color if no data",
      defaultValue: false,
      category: ['Status Panel options'],
    })
    .addBooleanSwitch({
      path: 'isIgnoreOKColors',
      name: 'Ignore color in OK state',
      defaultValue: false,
      category: ['Status Panel options'],
    })
    .addBooleanSwitch({
      path: 'isHideAlertsOnDisable',
      name: 'Hide alerts in Disabled state',
      defaultValue: false,
      category: ['Status Panel options'],
    });
