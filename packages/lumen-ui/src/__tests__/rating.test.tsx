import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Rating } from '../components/rating/Rating';

describe('Rating', () => {
  it('exposes numeric slider semantics and supports half-step keyboard input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Rating
        aria-label="Service rating"
        defaultValue={2.5}
        allowHalf
        onChange={onChange}
      />,
    );

    const rating = screen.getByRole('slider', { name: 'Service rating' });
    expect(rating).toHaveAttribute('aria-valuenow', '2.5');
    expect(rating).toHaveAttribute('aria-valuetext', '2.5 / 5');

    await user.click(rating);
    await user.keyboard('{ArrowRight}');
    expect(rating).toHaveAttribute('aria-valuenow', '3');
    expect(onChange).toHaveBeenLastCalledWith(3);

    await user.keyboard('{End}');
    expect(rating).toHaveAttribute('aria-valuenow', '5');
  });

  it('keeps read-only ratings out of the mutation path', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating aria-label="Read only rating" value={4} readOnly onChange={onChange} />);

    const rating = screen.getByRole('slider', { name: 'Read only rating' });
    await user.click(rating);
    await user.keyboard('{ArrowLeft}');
    expect(rating).toHaveAttribute('aria-readonly', 'true');
    expect(rating).toHaveAttribute('aria-valuenow', '4');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('uses the rating theme token and supports a custom color', () => {
    const { rerender } = render(<Rating value={3} />);
    expect(document.querySelector('[data-rating-fill]')).toHaveStyle({
      color: 'var(--lumen-color-rating)',
    });

    rerender(<Rating value={3} color="oklch(70% 0.18 45)" />);
    expect(document.querySelector('[data-rating-fill]')).toHaveStyle({
      color: 'oklch(70% 0.18 45)',
    });
  });
});
