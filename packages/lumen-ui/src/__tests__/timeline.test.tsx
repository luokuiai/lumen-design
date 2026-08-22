import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Timeline } from '../components/Timeline';

describe('Timeline', () => {
  it('keeps an even gap around markers and uses a two-pixel connector', () => {
    const { container } = render(
      <Timeline
        items={[
          { id: '1', date: '2026-08-21', title: 'Created' },
          { id: '2', date: '2026-08-22', title: 'Reviewed' },
        ]}
      />,
    );

    const connector = container.querySelector('[data-timeline-connector]');
    expect(connector).toHaveClass(
      'left-[6px]',
      'top-[22px]',
      'bottom-0',
      'w-[2px]',
      'opacity-[0.45]',
    );
    expect(connector?.parentElement).toHaveAttribute('data-timeline-item');
  });
});
