import { PanelOptionsEditorBuilder } from '@grafana/data';
import { ThresholdOptionsEditor } from '../components/ThresholdOptionsEditor';
import { StatusPanelOptions } from '../interfaces/statusPanelOptions';
import { FormattedStringHelpEditor } from '../components/FormattedStringHelpEditor';

export const statusPanelOptionsBuilder = (builder: PanelOptionsEditorBuilder<StatusPanelOptions>) =>
  builder
    .addTextInput({
      path: 'title',
      name: 'Title',
      description: '',
      defaultValue: '',
      category: ['Status Panel - options'],
      settings: { expandTemplateVars: true },
    })
    .addTextInput({
      path: 'subtitle',
      name: 'Subtitle',
      description: '',
      defaultValue: '',
      category: ['Status Panel - options'],
    })
    .addTextInput({
      path: 'url',
      name: 'URL',
      description: '',
      defaultValue: '',
      category: ['Status Panel - options'],
      settings: { expandTemplateVars: true, placeholder: 'https://' },
    })
    .addBooleanSwitch({
      path: 'urlTargetBlank',
      name: 'Open URL in new tab',
      defaultValue: false,
      category: ['Status Panel - options'],
      showIf: ({ url }) => !!url,
    })
    .addCustomEditor({
      id: 'formatted string help',
      name: '',
      description: 'In above text fields, you can use formatted string to include variables. Useful for multi panes',
      path: 'string_help',
      category: ['Status Panel - options'],
      editor: FormattedStringHelpEditor,
    })
    // .addTextInput({
    //   path: 'namePrefix',
    //   name: 'Remove Prefix',
    //   defaultValue: '',
    //   description: 'A prefix to remove from the name (helpful when repeating panel over a template)',
    //   category: ['Status Panel - Options'],
    // })
    .addTextInput({
      path: 'cornerRadius',
      name: 'Corner Radius',
      defaultValue: '0rem',
      description: 'The corner radius to apply the panel. Values are used for the border-radius CSS attribute.',
      category: ['Status Panel - options'],
    })
    .addBooleanSwitch({
      path: 'flipCard',
      name: 'Flip Panel',
      defaultValue: false,
      category: ['Status Panel - options'],
    })
    .addNumberInput({
      path: 'flipTime',
      name: 'Flip interval',
      defaultValue: 5,
      category: ['Status Panel - options'],
      showIf: ({ flipCard }) => flipCard,
    })
    .addRadio({
      path: 'flipState',
      name: 'Stay on',
      defaultValue: false,
      settings: {
        options: [
          {
            label: 'Front',
            value: false,
          },
          {
            label: 'Back',
            value: true,
          },
        ],
      },
      category: ['Status Panel - options'],
      showIf: ({ flipCard }) => !flipCard,
    })
    .addBooleanSwitch({
      path: 'isGrayOnNoData',
      name: "Use 'Disable' color if no data",
      defaultValue: false,
      category: ['Status Panel - options'],
    })
    /* ---- Thresholds options ---- */
    .addCustomEditor({
      id: 'thresholds',
      name: '',
      description: 'Add thresholds to display different status on the panel depending on the query result',
      path: 'thresholds',
      category: ['Status Panel - thresholds'],
      editor: ThresholdOptionsEditor,
      defaultValue: [
        {
          id: 1,
          color: '#73bf69',
          value: undefined,
          severity: 'Base',
        },
      ],
    });
