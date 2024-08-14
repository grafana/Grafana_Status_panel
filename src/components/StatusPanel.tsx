import { PanelProps } from '@grafana/data';
import { IconButton } from '@grafana/ui';
import { css } from '@emotion/css';
import React from 'react';
import ReactCardFlip from 'react-card-flip';
import { ReactMarquee } from 'components/Marquee';
import { useHover, useInterval } from 'hooks/index';
import { StatusPanelOptions } from 'interfaces/statusPanelOptions';
import { buildStatusMetricProps } from 'lib/buildStatusMetricProps';
import { MaybeAnchor } from './MaybeAnchor';
import { ThresholdConf } from './ThresholdSetComponent';

type Props = PanelProps<StatusPanelOptions>;

export const StatusPanel: React.FC<Props> = ({
  data,
  options,
  fieldConfig,
  width,
  height,
  replaceVariables,
  timeZone,
}) => {
  // Get actual threshold depending on the query data
  const getActualThreshold = (data: any, thresholds: ThresholdConf[]): ThresholdConf => {
    const baseThreshold = thresholds[0];
    const frame = data.series[data.series.length - 1];
    const row = frame.fields.find((field: { type: string }) => field.type === 'number');
    const queryValue = row.values[row.values.length - 1];

    // Remove base threshold from the list (no used in actual threshold computing)
    thresholds = thresholds.slice(1);

    // Order thresholds by value from lowest to highest (make sure to handle null and wrong value before)
    let sortedThresholds = thresholds.sort((a, b) => (a.value || 0) - (b.value || 0));

    // Compare thresholds with data and return threshold that data is on the slice
    const reverSortedThresholds = sortedThresholds.slice().reverse();
    for (let i = 0; i < reverSortedThresholds.length; i++) {
      if (queryValue >= (reverSortedThresholds[i].value || 0)) {
        return sortedThresholds[i];
      }
    }
    return baseThreshold;
  };

  const actualThreshold = getActualThreshold(data, options.thresholds);

  // build props
  let { annotations, disables, crits, warns, displays } = buildStatusMetricProps(
    data,
    fieldConfig,
    options,
    replaceVariables,
    timeZone
  );

  // clear other metrics when disabled and hide on disable
  if (options.isHideAlertsOnDisable && disables.length > 0) {
    crits = warns = displays = [];
  }

  // flatten and slice sections as needed
  let alerts = [disables, crits, warns, displays].flat(1);
  let extraMoreAlerts = null;
  if (0 <= options.maxAlertNumber && options.maxAlertNumber < alerts.length) {
    extraMoreAlerts = alerts.length - options.maxAlertNumber;
    alerts = alerts.slice(0, options.maxAlertNumber);
  }

  // setup flipper
  const [flipped, setFlipped] = React.useState(true);
  const wrapper = React.useRef<HTMLDivElement>(null);
  const isHover = useHover(wrapper);
  useInterval(() => options.flipCard && !isHover && setFlipped(!flipped), 1000 * options.flipTime);

  // Retrieve colors
  const backgroundColor = actualThreshold.color;
  //const backgroundColor = "#ffffff";

  return (
    <div
      ref={wrapper}
      className={css(
        {
          width,
          height,
          boxSizing: 'border-box',
          borderRadius: options.cornerRadius,
          overflow: 'hidden',
          zIndex: 10,
        },
        !options.isGrayOnNoData && {
          backgroundColor: backgroundColor,
        }
      )}
    >
      <ReactCardFlip isFlipped={flipped}>
        <div
          className={css({
            width,
            height,
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '2rem',
          })}
        >
          <MaybeAnchor href={options.url} target={options.urlTargetBlank ? '_blank' : '_self'} title={options.title}>
            {actualThreshold.severity}
          </MaybeAnchor>
        </div>
        <div className={css({ height, display: 'flex', flexDirection: 'column' })}>
          <div
            className={css({
              flex: '1 0 0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            })}
          >
            <div
              className={css({
                minHeight: '1px',
                display: 'flex',
                justifyContent: 'center',
                fontSize: '1.5rem',
              })}
            >
              <MaybeAnchor
                href={options.url}
                target={options.urlTargetBlank ? '_blank' : '_self'}
                title={options.title}
              >
                {replaceVariables(options.title)}
              </MaybeAnchor>
            </div>
          </div>
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflow: 'scroll',
              flex: '0 1 auto',
              '::-webkit-scrollbar': { background: 'transparent', width: '0px', display: 'none' },
            })}
          >
            <ReactMarquee hover={isHover} autoScroll={options.isAutoScrollOnOverflow}>
              <div>
                {alerts.map(({ alias, link, className, displayValue }, index) => (
                  <div key={index} className={className} style={{ color: 'inherit' }}>
                    <MaybeAnchor href={link?.href} target={link?.target} title={alias} style={{ color: 'inherit' }}>
                      {displayValue ? alias + ' - ' + displayValue : alias}
                    </MaybeAnchor>
                  </div>
                ))}
                {extraMoreAlerts && (
                  <span
                    className={css({
                      paddingTop: '2px',
                      fontSize: '0.85rem',
                    })}
                  >
                    + {extraMoreAlerts} more
                  </span>
                )}
              </div>
            </ReactMarquee>
          </div>
          <div className={css({ fontSize: '1.5rem', minHeight: '1px', flex: '1 1 0' })}></div>
          <div
            className={css({
              position: 'absolute',
              height,
              overflow: 'scroll',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              '::-webkit-scrollbar': { background: 'transparent', width: '0px', display: 'none' },
            })}
          >
            <ReactMarquee hover={isHover} autoScroll={options.isAutoScrollOnOverflow}>
              <div className={css({ fontSize: '0.85rem' })}>
                {annotations.map(({ alias, link, className, displayValue }, index) => (
                  <div key={index} className={className} style={{ color: 'inherit' }}>
                    <MaybeAnchor href={link?.href} target={link?.target} title={alias} style={{ color: 'inherit' }}>
                      {displayValue ? alias + ' - ' + displayValue : alias}
                    </MaybeAnchor>
                  </div>
                ))}
              </div>
            </ReactMarquee>
          </div>
        </div>
      </ReactCardFlip>
      {isHover && (
        <IconButton
          name={'exchange-alt'}
          onClick={() => setFlipped(!flipped)}
          className={css({ position: 'absolute', bottom: '2rem', right: '2rem' })}
          aria-label="Flip Card"
        ></IconButton>
      )}
    </div>
  );
};
