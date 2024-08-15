import React from 'react';

interface StatusMetricProp {
  value: number;
}

export const StatusMetric: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = (props) => {
  return props.children;
};
