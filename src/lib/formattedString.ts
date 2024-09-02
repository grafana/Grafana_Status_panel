import { FormattedStringVariables } from '../interfaces/formattedStringVariables';

/**
 * Render a formatted string with template
 * @param formatString A string {{formatted_value}} to render
 * @param variables some data to render
 */
export const formattedString = (formatString: string, variables: FormattedStringVariables): string => {
  return formatString.replace(/{{(.*?)}}/g, (match, token) => {
    let value;

    switch (token.trim()) {
      case 'query_name':
        value = variables.queryName;
        break;
      case 'query_value':
        value = variables.queryValue;
        break;
      case 'query_index':
        value = variables.queryIndex.toString();
        break;
      case 'interval':
        value = variables.interval;
        break;
      case 'time':
        value = variables.time.toString();
        break;
      case 'metric_name':
        value = variables.metricName;
        break;
      default:
        value = '';

        const regexLabel = /label:/;
        if (regexLabel.test(token.trim())) {
          const labelName: string = token.replace(/^label:/, '');
          const labelValue = variables.labels[labelName];
          value = labelValue ? labelValue.toString() : '';
        }

        break;
    }
    return value;
  });
};

export const provideFormattedStringVariables = (
  dataQueries: any,
  queryValues: number[]
): FormattedStringVariables[] => {
  return dataQueries.series.map((serie: any, index: number) => {
    let requestInfo = extractRequestInfo(dataQueries.request.targets[index]);

    return {
      queryIndex: index,
      queryName: serie.refId,
      queryValue: queryValues[index],
      interval: dataQueries.request.interval,
      time: dataQueries.request.startTime,
      metricName: requestInfo.metricName,
      labels: requestInfo.labels,
    };
  });
};

function extractRequestInfo(request: any): any {
  let object = {
    metricName: '',
    labels: {},
  };

  if (request && request.expr) {
    let match = request.expr.match(/^(?<metric_name>\w+)\{(?<labels>.*)\}$/);
    if (match) {
      const { metric_name, labels } = match.groups;

      // Extract labels name and value
      const labelRegex = /([^ =,]+)="([^"]+)"/g;
      let labelMatch;
      const labelsObject: { [key: string]: string } = {};
      while ((labelMatch = labelRegex.exec(labels)) !== null) {
        labelsObject[labelMatch[1]] = labelMatch[2];
      }

      object = {
        metricName: metric_name,
        labels: labelsObject,
      };
    }
  }

  return object;
}
