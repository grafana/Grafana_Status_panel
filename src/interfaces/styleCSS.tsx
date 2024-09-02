import { css } from '@emotion/css';

/**
 * CSS class style
 * for better code readability
 */
export const Style = {
  wrapperContainer: css({ boxSizing: 'border-box', zIndex: 10 }),
  row: css({ display: 'flex', flexWrap: 'wrap', overflow: 'auto' }),
  col: css({ flexBasis: 'auto', flexGrow: '0', maxWidth: '100%', padding: '5px' }),
  size100: css({ width: '100%', height: '100%' }),
  flipButton: css({ position: 'absolute', bottom: '1.2rem', right: '1.2rem' }),
  /* Flip Card */
  flipCardContainer: css({
    height: '100%',
    minHeight: '142px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    containerType: 'inline-size',
    overflow: 'hidden',
    textAlign: 'center',
  }),
  flipCardBackTexts: css({
    minHeight: '1px',
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
  }),
  flipCardTitle: css({ fontSize: '12cqw' }),
  flipCardSubtitle: css({ fontSize: '9.5cqw' }),
  flipCardMetric: css({ fontSize: '12.5cqw' }),
  flipCardSeverity: css({ fontSize: '14cqw' }),
  /* help modal */
  helpUl: css({ marginLeft: '1rem', listStylePosition: 'inside' }),
};
