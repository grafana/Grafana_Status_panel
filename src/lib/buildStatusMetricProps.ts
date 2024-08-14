import { PanelData, FieldConfigSource, FieldConfig, InterpolateFunction, LinkModel } from '@grafana/data';
import { css, cx } from '@emotion/css';
import _ from 'lodash';
import { StatusFieldOptions } from 'interfaces/statusFieldOptions';
import { StatusPanelOptions } from 'interfaces/statusPanelOptions';

type StatusType = 'ok' | 'hide' | 'warn' | 'crit' | 'disable' | 'noData';

interface StatusMetricProp extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  alias: string;
  displayValue?: string | number;
  link?: LinkModel;
}

export function buildStatusMetricProps(
  data: PanelData,
  fieldConfig: FieldConfigSource,
  options: StatusPanelOptions,
  colorClasses: { ok: string; warn: string; crit: string; disable: string; noData: string; hide: string },
  replaceVariables: InterpolateFunction,
  timeZone: string
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

    // if (!field.state?.calcs) {
    //   return;
    // }
    // determine field status & handle formatting based on value handler
    let fieldStatus: StatusType = config.custom.displayAliasType === 'Always' ? 'ok' : 'hide';
    let displayValue = '';

    // only display value when appropriate
    const withAlias = config.custom.displayValueWithAlias;
    const isDisplayValue = withAlias === 'When Alias Displayed';

    // apply RegEx if value will be displayed
    if (isDisplayValue && config.custom.valueDisplayRegex) {
      try {
        displayValue = displayValue.replace(new RegExp(config.custom.valueDisplayRegex), '');
      } catch {}
    }

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
    if (fieldStatus !== 'ok') {
      if (config.custom.fontFormat === 'Bold') {
        props.className = css({ fontWeight: 'bold' });
      } else if (config.custom.fontFormat === 'Italic') {
        props.className = css({ fontStyle: 'italic' });
      }
    }
    // set color for field when colormode is Metric
    if (options.colorMode === 'Metric') {
      props.className = cx(props.className, colorClasses[fieldStatus]);
    }

    // add to appropriate section
    if (fieldStatus === 'ok') {
      if (config.custom.displayType === 'Regular') {
        displays.push(props);
      } else {
        annotations.push(props);
      }
    }
  });

  console.log(crits);
  return { annotations, disables, crits, warns, displays };
}
