import { ThresholdConf } from '../components/ThresholdSetComponent';

/**
 * Get the query value with selected aggregation (last, min, max, etc.)
 * @param data Data from the query
 * @param aggregation Type of chosen aggregation
 * @returns Value of the query with selected aggregation. Undefined if no data
 */
export const getQueryValueAggregation = (data: any, aggregation: string): number | undefined => {
  const frame = data.series[data.series.length - 1]; // Get the last Expression query result
  if (!frame) {
    return undefined;
  }

  const rows = frame.fields.find((field: { type: string }) => field.type === 'number');
  if (!rows) {
    return undefined;
  }

  switch (aggregation) {
    case 'last':
      return rows.values[rows.values.length - 1];
    case 'first':
      return rows.values[0];
    case 'max':
      return rows.values.reduce((prev: number, curr: number) => {
        return prev > curr ? prev : curr;
      });
    case 'min':
      return rows.values.reduce((prev: number, curr: number) => {
        return prev > curr ? curr : prev;
      });
    case 'sum':
      return rows.values.reduce((prev: number, curr: number) => prev + curr, 0);
    case 'mean':
      const sum = rows.values.reduce((prev: number, curr: number) => prev + curr, 0);
      return sum / rows.values.length;
    case 'delta':
      const orderedValues = rows.values.sort((a: number, b: number) => a - b);
      return Math.abs(orderedValues[orderedValues.length - 1] - orderedValues[0]);
    default:
      return rows.values[rows.values.length - 1];
  }
};

/**
 * Get actual threshold depending on the query data
 * @param thresholds List of thresholds
 * @param value query value
 */
export const getActualThreshold = (thresholds: ThresholdConf[], value: number | undefined): ThresholdConf => {
  const baseThreshold = thresholds[0];
  if (value === undefined) {
    return baseThreshold;
  }

  // Remove base threshold from the list (no used in actual threshold computing)
  thresholds = thresholds.slice(1);

  // Order thresholds by value from lowest to highest (make sure to handle null and wrong value before)
  let sortedThresholds = thresholds.sort((a, b) => (a.value || 0) - (b.value || 0));

  // Compare thresholds with data and return threshold that data is on the slice
  const reverseSortedThresholds = sortedThresholds.slice().reverse();
  for (let i = 0; i < reverseSortedThresholds.length; i++) {
    if (value >= (reverseSortedThresholds[i].value || 0)) {
      return reverseSortedThresholds[i];
    }
  }
  return baseThreshold;
};
