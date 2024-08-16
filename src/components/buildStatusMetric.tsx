import React from 'react';

interface StatusMetricProps {
  fontStyle: string;
  children: React.ReactNode;
}

/**
 * Apply font style on metric value and unit
 * @param fontStyle Bold, Italic, Underline
 * @param children Metric value and unit
 */
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
  if (unit === undefined || unit === 'none') {
    unit = ' ';
  }
  return `${value} ${unit}`.trim();
}
