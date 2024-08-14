import { ThresholdConf } from '../components/ThresholdSetComponent';

/*
    Represent options of the status panel (stored and shared between panel and options editor)
 */
export interface StatusPanelOptions {
  title: string;
  url: string;
  urlTargetBlank: boolean;
  // namePrefix: string;
  maxAlertNumber: number;
  cornerRadius: string;
  flipCard: boolean;
  flipTime: number;
  colorMode: 'Panel' | 'Metric' | 'Disabled';
  colors: { crit: string; warn: string; ok: string; disable: string };
  isAutoScrollOnOverflow: boolean;
  isGrayOnNoData: boolean;
  isHideAlertsOnDisable: boolean;
  thresholds: ThresholdConf[];
  fieldConfig: {
    defaults: {};
    overrides: unknown[];
  };
}
