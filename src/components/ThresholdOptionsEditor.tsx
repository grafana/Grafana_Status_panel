import { PanelOptionsEditorProps } from '@grafana/data';
import React, { useEffect, useState } from 'react';
import { Button, Input, VerticalGroup, ColorPicker } from '@grafana/ui';

export interface ThresholdConf {
  color: string;
  value: number;
}

export const ThresholdOptionsEditor: React.FC<PanelOptionsEditorProps<any>> = ({ value, onChange }) => {
  const defaultThresholdConf: ThresholdConf = {
    color: '#00ff00',
    value: 0,
  };

  const [thresholdsList, setThresholdsList] = useState([defaultThresholdConf]);

  // Handlers
  const handleAddThreshold = () => {
    // reuse defaultThresholdConf and update id
    setThresholdsList([...thresholdsList, defaultThresholdConf]);
  };

  const handleRemoveThreshold = (id: number) => {
    console.log('Removing threshold at index', id);
    setThresholdsList(thresholdsList.filter((threshold) => threshold.id !== id));
  };

  useEffect(() => {
    console.log('Updated thresholdsList:', thresholdsList);
  }, [thresholdsList]);

  return (
    <>
      <VerticalGroup>
        <Button
          variant={'secondary'}
          style={{ width: '100%' }}
          size={'sm'}
          icon={'plus'}
          onClick={handleAddThreshold}
          fullWidth
        >
          Add threshold
        </Button>

        {thresholdsList.map((thresholdConf, index) => (
          <Input
            defaultValue={thresholdConf.value}
            prefix={<ColorPicker color={thresholdConf.color} onChange={() => {}} />}
            suffix={
              <Button
                icon={'trash-alt'}
                variant={'secondary'}
                fill={'text'}
                size={'sm'}
                onClick={() => handleRemoveThreshold(index)}
                tooltip={'Remove threshold'}
              />
            }
            onChange={(event) => {
              thresholdConf.value = parseFloat(event.currentTarget.value);
              onChange(thresholdsList);
            }}
            aria-label={index.toString()}
            key={index}
          />
        ))}
      </VerticalGroup>
    </>
  );
};
