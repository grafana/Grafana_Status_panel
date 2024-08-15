import React from 'react';

interface StatusMetricProps {
  fontStyle: string;
  children: React.ReactNode;
}

export const StatusMetric: React.FC<StatusMetricProps> = ({ fontStyle, children }) => {
  const childrenArray = React.Children.toArray(children);
  let style = {};

  switch (fontStyle) {
    case 'Bold':
      style = { fontWeight: 'bold' };
      break;
    case 'Italic':
      style = { fontStyle: 'italic' };
      break;
    case 'Underline':
      style = { textDecoration: 'underline' };
      break;
    default:
      break;
  }

  return <span style={style}>{formatString(childrenArray[0], childrenArray[1])}</span>;
};

function formatString(value: any, unit: any) {
  if (unit === undefined) {
    unit = ' ';
  }
  return `${value} ${unit}`.trim();
}
