import { PanelOptionsEditorProps } from '@grafana/data';
import React, { useEffect, useState } from 'react';
import { Button, VerticalGroup } from '@grafana/ui';
import { ThresholdConf, ThresholdSetComponent } from './ThresholdSetComponent';
import { StatusPanelOptions } from '../lib/statusPanelOptionsBuilder';

export const ThresholdOptionsEditor: React.FC<PanelOptionsEditorProps<StatusPanelOptions['threshold']>> = ({
  value,
  onChange,
}) => {
  const defaultThresholdConf: ThresholdConf = {
    id: Math.floor(Math.random() * 1000000),
    color: '#00ff00',
    value: 0,
    severity: 'base',
  };

  const [thresholdsList, setThresholdsList] = useState<ThresholdConf[]>(value || []);

  useEffect(() => {
    setThresholdsList(value || []);
  }, [value]);

  // Handlers
  const handleAddThreshold = () => {
    const newThreshold: ThresholdConf = {
      id: Math.floor(Math.random() * 1000000),
      color: defaultThresholdConf.color,
      value: undefined,
      severity: undefined,
    };
    const newThresholdsList = [...thresholdsList, newThreshold];
    setThresholdsList(newThresholdsList);
    onChange(newThresholdsList);
  };

  const handleRemoveThreshold = (index: number) => () => {
    const newThresholdsList = thresholdsList.filter((_, i) => i !== index);
    setThresholdsList(newThresholdsList);
    onChange(newThresholdsList);
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
