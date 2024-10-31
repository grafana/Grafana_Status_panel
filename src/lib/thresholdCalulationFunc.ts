import { ThresholdConf } from '../components/ThresholdSetComponent';

/**
 * Get queries (if there are multiple queries) values with selected aggregation (last, min, max, etc.)
 * @param data Data from the query
 * @param aggregation Type of chosen aggregation
 * @returns Values of the queries with selected aggregation
 */
export const getQueriesValuesAggregation = (data: any, aggregation: string): number[] => {
  let queriesValues: number[] = [];

  // Browse series
  data.series.forEach((frame: any) => {
    if (!frame) {
      return;
    }
    const rows = frame.fields.find((field: { type: string }) => field.type === 'number');
    if (rows) {
      queriesValues.push(AggregationFunctions(rows, aggregation));
    }
  });

  return queriesValues;
};

/**
 * Return the value of the query with selected aggregation
 * @param rows Data from series of a query
 * @param aggregation Aggregation type
 * @returns Value of the query with selected aggregation
 */
const AggregationFunctions = (rows: any, aggregation: string): number => {
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
 * Get actual threshold depending on the query data (where the magic happens)
 * @param thresholds List of thresholds
 * @param value query value
 */
export const getActualThreshold = (thresholds: ThresholdConf[], value: number | undefined): ThresholdConf => {
  const baseThreshold = thresholds[0];
  if (value === undefined || value === null) {
    return {
      ...baseThreshold,
      severity: undefined,
    };
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
