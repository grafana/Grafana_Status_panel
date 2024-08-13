import { FieldOverrideEditorProps } from '@grafana/data';
import React from 'react';
import { Button } from '@grafana/ui';

export interface StatusThresholdOptions {
  valueHandler: 'Number Threshold' | 'String Threshold' | 'Date Threshold' | 'Disable Criteria' | 'Text Only';
  warn: string;
  crit: string;
}

export const StatusThresholdOptionsEditor: React.FC<FieldOverrideEditorProps<StatusThresholdOptions, any>> = ({
  value,
  onChange,
}) => {
  return (
    <Button variant={'secondary'} size={'sm'} icon={'plus'} fullWidth>
      Add threshold
    </Button>
  );
};
