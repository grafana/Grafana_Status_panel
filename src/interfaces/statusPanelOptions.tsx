import { ThresholdConf } from '../components/ThresholdSetComponent';

/*
    Represent options of the status panel (stored and shared between panel and options editor)
 */
export interface StatusPanelOptions {
  title: string;
  subtitle: string;
  url: string;
  urlTargetBlank: boolean;
  // namePrefix: string;
  cornerRadius: string;
  flipCard: boolean;
  flipTime: number;
  colorMode: 'Panel' | 'Metric' | 'Disabled';
  isGrayOnNoData: boolean;
  thresholds: ThresholdConf[];
  fieldConfig: {
    defaults: {};
    overrides: unknown[];
  };
}
