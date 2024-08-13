import { PanelOptionsEditorProps } from '@grafana/data';
import React, { useState } from 'react';
import { Button, VerticalGroup } from '@grafana/ui';
import { ThresholdConf, ThresholdSetComponent } from './ThresholdSetComponent';

export const ThresholdOptionsEditor: React.FC<PanelOptionsEditorProps<any>> = ({ value, onChange }) => {
  const defaultThresholdConf: ThresholdConf = {
    id: Math.floor(Math.random() * 1000000),
    color: '#00ff00',
    value: 0,
    severity: 'base',
  };

  const [thresholdsList, setThresholdsList] = useState([defaultThresholdConf]);

  // Handlers
  const handleAddThreshold = () => {
    const newThreshold: ThresholdConf = {
      id: Math.floor(Math.random() * 1000000),
      color: defaultThresholdConf.color,
      value: undefined,
      severity: undefined,
    };
    setThresholdsList([...thresholdsList, newThreshold]);
  };

  const handleRemoveThreshold = (index: number) => () => {
    console.log('issou');
    console.log(thresholdsList);
    thresholdsList.splice(index, 1);
    console.log(thresholdsList);
    setThresholdsList(thresholdsList);
    console.log('set');
  };

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
        {thresholdsList.map((threshold, index) => (
          <ThresholdSetComponent
            threshold={threshold}
            handleDeleteThreshold={handleRemoveThreshold(index)}
            key={index}
          />
        ))}
      </VerticalGroup>
    </>
  );
};
