import { PanelOptionsEditorBuilder } from '@grafana/data';
import { ThresholdOptionsEditor } from '../components/ThresholdOptionsEditor';
import { StatusPanelOptions } from './statusPanelOptionsBuilder';

// Represent a Option part
export const statusPanelThresholdBuilder = (builder: PanelOptionsEditorBuilder<StatusPanelOptions>) =>
  builder.addCustomEditor({
    id: 'thresholds',
    name: '',
    description: 'Add thresholds to display different status on the panel depending on the query result',
    path: '',
    category: ['Status Panel - Thresholds'],
    editor: ThresholdOptionsEditor,
  });
