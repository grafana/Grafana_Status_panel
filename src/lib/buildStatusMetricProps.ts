import { PanelData, FieldConfigSource, FieldConfig, InterpolateFunction, LinkModel } from '@grafana/data';
import { css } from '@emotion/css';
import _ from 'lodash';
import { StatusFieldOptions } from 'interfaces/statusFieldOptions';
import { StatusPanelOptions } from 'interfaces/statusPanelOptions';

interface StatusMetricProp extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  alias: string;
  displayValue?: string | number;
  link?: LinkModel;
}

export function buildStatusMetricProps(
  data: PanelData,
  fieldConfig: FieldConfigSource,
  options: StatusPanelOptions,
  replaceVariables: InterpolateFunction
) {
  let annotations: StatusMetricProp[] = [];
  let displays: StatusMetricProp[] = [];
  let crits: StatusMetricProp[] = [];
  let warns: StatusMetricProp[] = [];
  let disables: StatusMetricProp[] = [];
  data.series.forEach((df) => {
    // find first non-time column
    const field = df.fields.find((field) => field.name.toLowerCase() !== 'time')!;
    if (!field?.state) {
      return;
    }

    const config: FieldConfig<StatusFieldOptions> = _.defaultsDeep({ ...field.config }, fieldConfig.defaults);
    if (!config.custom) {
      return;
    }

    let displayValue = '';

    // only display value when appropriate
    const withAlias = config.custom.displayValueWithAlias;
    const isDisplayValue = withAlias === 'When Alias Displayed';

    // get first link and interpolate variables
    const link = ((field.getLinks && field.getLinks({})) ?? [])[0];
    if (link) {
      link.href = replaceVariables(link.href);
    }

    // build props and place in correct bucket
    let props: StatusMetricProp = {
      alias: config.displayName || df.name || df.refId || '',
      displayValue: isDisplayValue ? displayValue : undefined,
      link,
    };

    // set font format for field
    if (config.custom.fontFormat === 'Bold') {
      props.className = css({ fontWeight: 'bold' });
    } else if (config.custom.fontFormat === 'Italic') {
      props.className = css({ fontStyle: 'italic' });
    }
  });

  return { annotations, disables, crits, warns, displays };
}
