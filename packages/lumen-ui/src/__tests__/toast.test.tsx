import { act, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Toast } from '../components/Toast';

describe('Toast', () => {
  afterEach(() => {
    Toast.resetForTests();
  });

  it('renders notifications with the glass surface treatment', async () => {
    await act(async () => {
      Toast.success('保存成功');
    });

    const toast = await screen.findByRole('status');
    expect(toast).toHaveTextContent('保存成功');
    expect(toast).toHaveClass('bg-[var(--lumen-color-surface-glass)]/85');
    expect(toast).toHaveClass('backdrop-blur-[5px]');
    expect(toast).toHaveClass('backdrop-saturate-125');
    expect(toast).toHaveClass('shadow-[0_3px_10px_var(--lumen-color-shadow)]');
  });
});
