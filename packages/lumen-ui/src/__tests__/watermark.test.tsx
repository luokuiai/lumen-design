import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Watermark } from '../components/Watermark';

const decodePattern = (value: string) => {
  const encoded = value.match(/base64,([^"')]+)/)?.[1];
  return encoded ? atob(encoded) : '';
};

describe('Watermark', () => {
  it('renders repeated multiline text without blocking its content', () => {
    const { container } = render(
      <Watermark content={['Lumen & Design', 'User <1024>']}>
        <button type="button">Open report</button>
      </Watermark>,
    );

    expect(screen.getByRole('button', { name: 'Open report' })).toBeVisible();
    const root = container.querySelector('[data-ui="watermark"]')!;
    const overlay = container.querySelector('[data-watermark-overlay]') as HTMLElement;
    expect(root).toHaveClass('isolate', 'relative');
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
    expect(overlay).toHaveClass('pointer-events-none', 'absolute');
    expect(overlay.style.maskImage).toContain('data:image/svg+xml');
    expect(decodePattern(overlay.style.maskImage)).toContain('Lumen &amp; Design');
    expect(decodePattern(overlay.style.maskImage)).toContain('User &lt;1024&gt;');
  });

  it('applies layout, font, and full-page options', () => {
    const { container } = render(
      <Watermark
        content="Internal"
        fullPage
        rotate={-30}
        opacity={2}
        gap={[80, 60]}
        offset={[12, 16]}
        markSize={[120, 48]}
        font={{ color: 'rebeccapurple', fontSize: 16, fontWeight: 600 }}
        zIndex={20}
      />,
    );

    const overlay = container.querySelector('[data-watermark-overlay]') as HTMLElement;
    expect(overlay).toHaveClass('fixed');
    expect(overlay.style.backgroundColor).toBe('rebeccapurple');
    expect(overlay.style.maskPosition).toBe('12px 16px');
    expect(overlay.style.maskSize).toBe('200px 108px');
    expect(overlay.style.opacity).toBe('1');
    expect(overlay.style.zIndex).toBe('20');
    expect(decodePattern(overlay.style.maskImage)).toContain('rotate(-30)');
    expect(decodePattern(overlay.style.maskImage)).toContain('font-size="16"');
    expect(decodePattern(overlay.style.maskImage)).toContain('font-weight="600"');
  });

  it('supports image watermarks and an empty state', () => {
    const { container, rerender } = render(
      <Watermark image="data:image/png;base64,mark" markSize={[80, 40]} />,
    );

    const overlay = container.querySelector('[data-watermark-overlay]') as HTMLElement;
    expect(overlay.style.backgroundImage).toContain('data:image/svg+xml');
    expect(decodePattern(overlay.style.backgroundImage)).toContain(
      'href="data:image/png;base64,mark"',
    );

    rerender(<Watermark />);
    expect(container.querySelector('[data-watermark-overlay]')).not.toBeInTheDocument();
  });
});
