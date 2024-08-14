/*
    Represent field options of the status panel (stored and shared between panel and options editor)
 */
export interface StatusFieldOptions {
  aggregation:
    | 'sum'
    | 'max'
    | 'min'
    | 'logmin'
    | 'mean'
    | 'last'
    | 'first'
    | 'lastNotNull'
    | 'firstNotNull'
    | 'count'
    | 'nonNullCount'
    | 'allIsNull'
    | 'allIsZero'
    | 'range'
    | 'diff'
    | 'delta'
    | 'step'
    | 'previousDeltaUp';
  valueDisplayRegex: string;
  displayType: 'Regular' | 'Annotation';
  fontFormat: 'Regular' | 'Bold' | 'Italic';
  dateFormat: string;
  displayAliasType: 'Warning / Critical' | 'Always';
  displayValueWithAlias: 'Never' | 'When Alias Displayed' | 'Warning / Critical' | 'Critical Only';
  disabledValue: string;
}