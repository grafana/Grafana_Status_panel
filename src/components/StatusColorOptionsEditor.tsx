import { PanelOptionsEditorProps } from '@grafana/data';
import { ColorPicker, Label, Stack, useTheme2 } from '@grafana/ui';
import { StatusPanelOptions } from 'lib/statusPanelOptionsBuilder';

import React from 'react';

export const StatusColorOptionsEditor: React.FC<PanelOptionsEditorProps<StatusPanelOptions['colors']>> = ({
  value,
  onChange,
}) => {
  // get grafana color picker and theme
  // const colorPicker = standardEditorsRegistry.get('color').editor as any;
  const theme = useTheme2();

  // helper function to build the handler for each color
  // const buildHandler = (key: keyof StatusPanelOptions['colors']) => (color: ColorDefinition) =>
  //   onChange({ ...value, [key]: getColorForTheme(color, theme as any) });

  const buildHandler = (key: keyof StatusPanelOptions['colors']) => (color: string) => {
    onChange({
      ...value,
      [key]: color,
    });
  };

  return (
    <Stack gap={4}>
      <div>
        <Label>Critical</Label>
        <ColorPicker color={value?.crit || theme.visualization.getColorByName('red')} onChange={buildHandler('crit')} />
        {/* {colorPicker({ value: value.crit, onChange: buildHandler('crit') })} */}
      </div>
      <div>
        <Label>Warning</Label>
        {/* {colorPicker({ value: value.warn, onChange: buildHandler('warn') })} */}
        <ColorPicker
          color={value?.warn || theme.visualization.getColorByName('orange')}
          onChange={buildHandler('warn')}
        />
      </div>
      <div>
        <Label>OK</Label>
        {/* {colorPicker({ value: value.ok, onChange: buildHandler('ok') })} */}
        <ColorPicker color={value?.ok || theme.visualization.getColorByName('green')} onChange={buildHandler('ok')} />
      </div>
      <div>
        <Label>Disabled</Label>
        <ColorPicker
          color={value?.disable || theme.visualization.getColorByName('gray')}
          onChange={buildHandler('disable')}
        />
        {/* {colorPicker({ value: value.disable, onChange: buildHandler('disable') })} */}
      </div>
    </Stack>
  );
};
