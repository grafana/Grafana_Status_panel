import { PanelProps } from '@grafana/data';
import { IconButton } from '@grafana/ui';
import { css } from '@emotion/css';
import React from 'react';
import ReactCardFlip from 'react-card-flip';
import { useHover, useInterval } from 'hooks/index';
import { StatusPanelOptions } from 'interfaces/statusPanelOptions';
import { MaybeAnchor } from './MaybeAnchor';
import { getActualThreshold, getQueryValueAggregation } from '../lib/thresholdCalulationFunc';
import { StatusMetric } from './buildStatusMetric';

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
  const queryValue = getQueryValueAggregation(data, fieldConfig.defaults.custom.aggregation);
  const actualThreshold = getActualThreshold(data, options.thresholds, queryValue);

  // setup flipper
  const [flipped, setFlipped] = React.useState(true);
  const wrapper = React.useRef<HTMLDivElement>(null);
  const isHover = useHover(wrapper);
  useInterval(() => options.flipCard && !isHover && setFlipped(!flipped), 1000 * options.flipTime);

  // Retrieve colors
  const backgroundColor = actualThreshold.color;
  const textColor = css({ color: 'white' });

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
        {/* view 2 (severity) */}
        <div
          className={css(
            {
              width,
              height,
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '2rem',
            },
            textColor
          )}
        >
          <MaybeAnchor href={options.url} target={options.urlTargetBlank ? '_blank' : '_self'} title={options.title}>
            <span>{actualThreshold.severity}</span>
          </MaybeAnchor>
        </div>
        {/* view 1 (metrics) */}
        <div className={css({ height, display: 'flex', flexDirection: 'column' })}>
          <div
            className={css(
              {
                flex: '1 0 0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              },
              textColor
            )}
          >
            {/* Pane title */}
            {options.title !== '' && (
              <div
                className={css({
                  minHeight: '1px',
                  display: 'flex',
                  justifyContent: 'center',
                  fontSize: '2rem',
                })}
              >
                <span>{replaceVariables(options.title)}</span>
              </div>
            )}
            {/* Pane subtitle */}
            {options.subtitle !== '' && (
              <div
                className={css({
                  minHeight: '1px',
                  display: 'flex',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                })}
              >
                <span>{replaceVariables(options.subtitle)}</span>
              </div>
            )}
            {/* Pane metric */}
            {fieldConfig.defaults.custom.displayValueMetric && (
              <div
                className={css({
                  minHeight: '1px',
                  display: 'flex',
                  justifyContent: 'center',
                  fontSize: '2.1rem',
                  marginTop: '1rem',
                })}
              >
                <StatusMetric fontStyle={fieldConfig.defaults.custom.fontFormat}>
                  {queryValue}
                  {fieldConfig.defaults.custom.metricUnit}
                </StatusMetric>
              </div>
            )}
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
