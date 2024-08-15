import { FieldConfigEditorProps } from '@grafana/data';
import React from 'react';
import { StatusFieldOptions } from '../interfaces/statusFieldOptions';
import { UnitPicker } from '@grafana/ui';

export const MetricUnitOptionsEditor: React.FC<FieldConfigEditorProps<StatusFieldOptions['metricUnit'], any>> = ({
  value,
  onChange,
}) => {
  const handleOnSelectUnit = (val: string | undefined) => {
    if (val) {
      value = val;
    } else {
      value = '';
    }
    onChange(value);
  };

  return (
    <>
      <UnitPicker value={value} onChange={handleOnSelectUnit} />
    </>
  );
};
