import React from 'react';
import { css, cx, keyframes } from '@emotion/css';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  autoScroll?: boolean;
}

/**
 * A list too long for its card loops from the bottom edge to the top, at a steady
 * pace, the way the AngularJS panel scrolled it. Hovering pauses it so the alert
 * under the cursor can be read.
 */
const scrollUp = keyframes({
  '0%': { transform: 'translate(0, 100%)' },
  '100%': { transform: 'translate(0, -100%)' },
});

const marquee = css({
  backfaceVisibility: 'hidden',
  display: 'inline-block',
  animation: `${scrollUp} 15s linear infinite`,
  '&:hover': { animationPlayState: 'paused' },
});

export const ReactMarquee: React.FC<Props> = ({ autoScroll, className, children, ...props }) => {
  const div = React.useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = React.useState(false);

  // Scroll only a list that does not fit. Animating one that already fits would
  // carry a perfectly readable card off its own edges. The panel re-renders its
  // list on every refresh and every resize, which is exactly when this can change.
  React.useLayoutEffect(() => {
    const viewport = div.current?.parentElement;
    setOverflows(!!viewport && viewport.offsetHeight < viewport.scrollHeight);
  }, [children]);

  return (
    <div ref={div} className={cx(className, { [marquee]: autoScroll && overflows })} {...props}>
      {children}
    </div>
  );
};
