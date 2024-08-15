import { FieldConfigEditorProps } from '@grafana/data';
import React from 'react';
import { StatusFieldOptions } from '../interfaces/statusFieldOptions';
import { Cascader, CascaderOption } from '@grafana/ui';

export const MetricUnitOptionsEditor: React.FC<FieldConfigEditorProps<StatusFieldOptions, any>> = ({
  value,
  onChange,
}) => {
  const unitOptions: CascaderOption[] = [
    {
      label: 'Misc',
      value: 'misc',
      items: [
        {
          label: 'Number',
          value: 'number',
        },
      ],
    },
  ];

  return (
    <>
      <Cascader onSelect={() => {}} options={unitOptions} placeholder={'Choose'} />
    </>
  );
};
