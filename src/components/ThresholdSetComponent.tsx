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
  handleChangeColor: (color: string) => void;
}

export const ThresholdSet: React.FC<ThresholdSetProps> = (props) => {
  const isBaseThreshold = props.threshold.id === 1 && props.threshold.severity === 'Base';

  return (
    <>
      <Input
        defaultValue={props.threshold.severity}
        placeholder={'Severity'}
        prefix={<ColorPicker color={props.threshold.color} onChange={props.handleChangeColor} />}
        onChange={(event) => {
          props.threshold.severity = event.currentTarget.value;
        }}
        disabled={isBaseThreshold}
      />
      {isBaseThreshold ? null : (
        <Input
          defaultValue={props.threshold.value}
          placeholder={'value'}
          type={'number'}
          onChange={(event) => {
            props.threshold.value = Number(event.currentTarget.value);
          }}
        />
      )}
      {/* Button remove this threshold */}
      {isBaseThreshold ? null : (
        <Button
          icon={'trash-alt'}
          variant={'secondary'}
          fill={'text'}
          size={'md'}
          onClick={props.handleDeleteThreshold}
          tooltip={'Remove threshold'}
        />
      )}
    </>
  );
};
