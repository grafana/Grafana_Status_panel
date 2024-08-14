import { PanelOptionsEditorProps } from '@grafana/data';
import React, { useEffect, useState } from 'react';
import { Button, VerticalGroup } from '@grafana/ui';
import { ThresholdConf, ThresholdSet } from './ThresholdSetComponent';
import { StatusPanelOptions } from '../interfaces/statusPanelOptions';

export const ThresholdOptionsEditor: React.FC<PanelOptionsEditorProps<StatusPanelOptions['thresholds']>> = ({
  value,
  onChange,
}) => {
  const [thresholdsList, setThresholdsList] = useState<ThresholdConf[]>(value || []);

  let thresholdId = thresholdsList.length;

  // Init thresholdsList with base threshold if empty
  if (thresholdsList.length === 0) {
    thresholdId = thresholdId + 1;
    let baseThreshold: ThresholdConf = {
      id: thresholdId,
      color: '#73bf69',
      value: undefined,
      severity: 'Base',
    };
    setThresholdsList([baseThreshold]);
    onChange(thresholdsList);
  }

  useEffect(() => {
    setThresholdsList(value || []);
  }, [value]);

  // Handlers
  const handleAddThreshold = () => {
    thresholdId = thresholdId + 1;
    const newThreshold: ThresholdConf = {
      id: thresholdId,
      color: '#73bf69',
      value: undefined,
      severity: undefined,
    };
    const newThresholdsList = [...thresholdsList, newThreshold];
    setThresholdsList(newThresholdsList);
    onChange(newThresholdsList);
  };

  const handleRemoveThreshold = (index: number) => () => {
    const newThresholdsList = thresholdsList.filter((obj) => obj.id !== index);
    setThresholdsList(newThresholdsList);
    onChange(newThresholdsList);
  };

  const handleChangeThresholdColor = (index: number) => (color: string) => {
    const newThresholdsList = thresholdsList.map((threshold) => {
      if (threshold.id === index) {
        threshold.color = color;
      }
      return threshold;
    });
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
        {thresholdsList
          .slice()
          .reverse()
          .map((threshold, index) => (
            <ThresholdSet
              threshold={threshold}
              handleDeleteThreshold={handleRemoveThreshold(threshold.id)}
              handleChangeColor={handleChangeThresholdColor(threshold.id)}
              key={threshold.id}
            />
          ))}
      </VerticalGroup>
    </>
  );
};
