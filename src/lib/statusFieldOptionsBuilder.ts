import { FieldConfigEditorBuilder } from '@grafana/data';
import { StatusFieldOptions } from '../interfaces/statusFieldOptions';

export const statusFieldOptionsBuilder = (builder: FieldConfigEditorBuilder<StatusFieldOptions>) =>
  builder
    .addSelect({
      path: 'aggregation',
      name: 'Aggregation',
      description: 'What to do if the query returns multiple data points. Used for threshold calculation',
      defaultValue: 'last',
      settings: {
        options: [
          { label: 'Last', value: 'last' },
          { label: 'First', value: 'first' },
          { label: 'Max', value: 'max' },
          { label: 'Min', value: 'min' },
          { label: 'Sum', value: 'sum' },
          { label: 'Avg', value: 'mean' },
          { label: 'Delta', value: 'delta' },
        ],
      },
      category: ['Status Panel - display options'],
    })
    .addBooleanSwitch({
      path: 'displayValueMetric',
      name: 'Display value metric',
      description: '',
      defaultValue: true,
      category: ['Status Panel - display options'],
    })
    .addSelect({
      path: 'fontFormat',
      name: 'Metric font format',
      description: 'The metric text font format',
      defaultValue: 'Regular',
      settings: {
        options: [
          { label: 'Regular', value: 'Regular' },
          { label: 'Bold', value: 'Bold' },
          { label: 'Italic', value: 'Italic' },
        ],
      },
      category: ['Status Panel - display options'],
      showIf: ({ displayValueMetric }) => displayValueMetric,
    })
    .addUnitPicker({
      path: 'metricUnit',
      name: 'Metric Unit',
      defaultValue: '',
      settings: undefined,
      category: ['Status Panel - display options'],
      showIf: ({ displayValueMetric }) => displayValueMetric,
    });
