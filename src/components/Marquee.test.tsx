import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReactMarquee } from './Marquee';

let scrollHeight = 100;

beforeAll(() => {
  // jsdom reports 0 for both, so the overflow check can never see a difference.
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => 100 });
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get: () => scrollHeight });
});

function renderMarquee({ autoScroll, overflowing }: { autoScroll: boolean; overflowing: boolean }) {
  scrollHeight = overflowing ? 300 : 100;
  render(
    <div>
      <ReactMarquee autoScroll={autoScroll} data-testid="marquee">
        <div>alert</div>
      </ReactMarquee>
    </div>
  );
  return screen.getByTestId('marquee');
}

describe('ReactMarquee - scrolling (regression #12)', () => {
  test('an overflowing list scrolls', () => {
    expect(renderMarquee({ autoScroll: true, overflowing: true }).className).not.toBe('');
  });

  test('a list that fits stays put, even with auto-scroll on', () => {
    // The Angular panel only animated when the content overflowed its card.
    // Animating a list that fits would scroll it out of an otherwise readable card.
    expect(renderMarquee({ autoScroll: true, overflowing: false }).className).toBe('');
  });

  test('auto-scroll off never scrolls, however long the list', () => {
    expect(renderMarquee({ autoScroll: false, overflowing: true }).className).toBe('');
  });
});
