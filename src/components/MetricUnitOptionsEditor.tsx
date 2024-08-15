import { FieldConfigEditorProps } from '@grafana/data';
import React from 'react';
import { StatusFieldOptions } from '../interfaces/statusFieldOptions';
import { Cascader, CascaderOption } from '@grafana/ui';

export const MetricUnitOptionsEditor: React.FC<FieldConfigEditorProps<StatusFieldOptions['metricUnit'], any>> = ({
  value,
  onChange,
}) => {
  //const [selectedUnit, setSelectedUnit] = useState(value);

  /*useEffect(() => {
        setSelectedUnit(value);
    }, [value]);*/

  const unitOptions: CascaderOption[] = [
    {
      label: 'Misc',
      value: undefined,
      items: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'Number',
          value: 'number',
        },
      ],
    },
  ];

  /* Handlers */
  const handleOnSelectUnit = (val: string) => {
    value = val;
    onChange(value);
  };

  return (
    <>
      <Cascader options={unitOptions} allowCustomValue={true} onSelect={handleOnSelectUnit} placeholder={'Choose'} />
    </>
  );
};
