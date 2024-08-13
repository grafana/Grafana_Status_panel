import { PanelOptionsEditorProps } from '@grafana/data';
import { StatusPanelOptions } from 'lib/statusPanelOptionsBuilder';

import React from 'react';

export const StatusColorOptionsEditor: React.FC<PanelOptionsEditorProps<StatusPanelOptions['colors']>> = ({
  value,
  onChange,
}) => {
  return <></>;
};
