import React from 'react';
import ReactCardFlip from 'react-card-flip';
import { css } from '@emotion/css';
import { getActualThreshold } from '../lib/thresholdCalulationFunc';
import { FormattedStringVariables } from '../interfaces/formattedStringVariables';
import { Style } from '../interfaces/styleCSS';
import { MaybeAnchor } from './MaybeAnchor';
import { formattedString } from '../lib/formattedString';
import { StatusMetric } from './buildStatusMetric';

interface FlipCardProps {
  width: number;
  height: number;
  showMetric: boolean;
  metricUnit: string | undefined;
  value: number;
  fontStyle: string;
  options: any;
  formattedVariables: FormattedStringVariables;
  isFlipped: boolean;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  isFlipped,
  showMetric,
  metricUnit,
  value,
  fontStyle,
  options,
  formattedVariables,
  width,
  height,
}) => {
  const actualThreshold = getActualThreshold(options.thresholds, value);

  // Retrieve colors
  const textColoration = css({ color: 'white' });
  const noBackgroundColor = options.isGrayOnNoData && value === null;

  return (
    <div
      className={
        css({ width, height: '100%', minWidth: '142px', borderRadius: options.cornerRadius }) +
        ' ' +
        (!noBackgroundColor && css({ backgroundColor: actualThreshold.color })) +
        ' ' +
        textColoration
      }
    >
      <div className={Style.size100}>
        <ReactCardFlip isFlipped={isFlipped} flipDirection={'horizontal'} containerClassName={Style.size100}>
          {/* Front (severity) */}
          <div className={Style.flipCardContainer}>
            <MaybeAnchor
              href={formattedString(options.url, formattedVariables)}
              target={options.urlTargetBlank ? '_blank' : '_self'}
              className={textColoration}
            >
              <span className={Style.flipCardSeverity}>{actualThreshold.severity}</span>
            </MaybeAnchor>
          </div>

          {/* Back (metric) */}
          <div className={Style.flipCardContainer}>
            <MaybeAnchor
              href={formattedString(options.url, formattedVariables)}
              target={options.urlTargetBlank ? '_blank' : '_self'}
              className={textColoration}
            >
              {/* Pane title */}
              {options.title !== '' && (
                <div className={Style.flipCardBackTexts + ' ' + Style.flipCardTitle}>
                  <span>{formattedString(options.title, formattedVariables)}</span>
                </div>
              )}
              {/* Pane subtitle */}
              {options.subtitle !== '' && (
                <div className={Style.flipCardBackTexts + ' ' + Style.flipCardSubtitle}>
                  <span>{formattedString(options.subtitle, formattedVariables)}</span>
                </div>
              )}
              {/* Pane metric */}
              {showMetric && (
                <div className={Style.flipCardBackTexts + ' ' + Style.flipCardMetric}>
                  <StatusMetric fontStyle={fontStyle}>
                    {value}
                    {metricUnit}
                  </StatusMetric>
                </div>
              )}
            </MaybeAnchor>
          </div>
        </ReactCardFlip>
      </div>
    </div>
  );
};
