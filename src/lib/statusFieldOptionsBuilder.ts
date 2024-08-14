import { FieldConfigEditorBuilder } from '@grafana/data';
import { StatusFieldOptions } from '../interfaces/statusFieldOptions';

export const statusFieldOptionsBuilder = (builder: FieldConfigEditorBuilder<StatusFieldOptions>) =>
  builder
    .addSelect({
      path: 'aggregation',
      name: 'Aggregation',
      description: 'What to do if the query returns multiple data points.',
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
    .addSelect({
      path: 'fontFormat',
      name: 'Font Format',
      description: 'The metric text font format in disable, warning or critical state',
      defaultValue: 'Regular',
      settings: {
        options: [
          { label: 'Regular', value: 'Regular' },
          { label: 'Bold', value: 'Bold' },
          { label: 'Italic', value: 'Italic' },
        ],
      },
      category: ['Status Panel - display options'],
    })
    .addSelect({
      path: 'displayValueWithAlias',
      name: 'Display Value',
      description: 'When to display the value along with the alias',
      defaultValue: 'When Alias Displayed',
      settings: {
        options: [
          { label: 'Never', value: 'Never', description: 'The value will never be displayed' },
          {
            label: 'When Alias Displayed',
            value: 'When Alias Displayed',
            description: 'The value will be displayed always when alias is displayed',
          },
          {
            label: 'Warning / Critical',
            value: 'Warning / Critical',
            description: 'The value will be displayed in warning or critical state',
          },
          {
            label: 'Critical Only',
            value: 'Critical Only',
            description: 'The value will be displayed in critical only',
          },
        ],
      },
      category: ['Status Panel - display options'],
    });
