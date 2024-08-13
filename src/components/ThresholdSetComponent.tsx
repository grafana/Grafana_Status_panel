import { Button, ColorPicker, Input } from '@grafana/ui';
import React from 'react';

export interface ThresholdConf {
  id: number;
  color: string;
  value?: number;
  severity?: string;
}

export interface ThresholdSetProps {
  threshold: ThresholdConf;
  handleDeleteThreshold: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const ThresholdSetComponent: React.FC<ThresholdSetProps> = (props) => {
  return (
    <>
      <Input
        defaultValue={props.threshold.severity}
        placeholder={'severity'}
        prefix={<ColorPicker color={props.threshold.color} onChange={() => {}} />}
        onChange={(event) => {
          props.threshold.severity = event.currentTarget.value;
        }}
      />
      <Input
        defaultValue={props.threshold.value}
        placeholder={'value'}
        type={'number'}
        onChange={(event) => {
          props.threshold.value = Number(event.currentTarget.value);
        }}
      />
      {/* Button remove this threshold */}
      <Button
        icon={'trash-alt'}
        variant={'secondary'}
        fill={'text'}
        size={'md'}
        onClick={props.handleDeleteThreshold}
        tooltip={'Remove threshold'}
      />
    </>
  );
};
