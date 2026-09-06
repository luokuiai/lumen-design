import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Input } from '../components/Input';

describe('Input', () => {
  it('exposes a stable theme hook on a plain input', () => {
    render(<Input aria-label="Name" invalid />);

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('data-ui', 'input');
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('data-invalid', 'true');
  });

  it('exposes the theme hook on the affix container', () => {
    render(<Input aria-label="Search" prefix={<span>Prefix</span>} />);

    expect(screen.getByRole('textbox', { name: 'Search' }).parentElement).toHaveAttribute(
      'data-ui',
      'input',
    );
  });

  it('toggles password visibility while preserving suffix content and autocomplete', async () => {
    const user = userEvent.setup();
    render(
      <Input
        aria-label="Password"
        type="password"
        passwordToggle
        passwordToggleLabels={{ show: 'Reveal password', hide: 'Conceal password' }}
        suffix={<span>Required</span>}
        autoComplete="current-password"
      />,
    );

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autocomplete', 'current-password');
    expect(screen.getByText('Required')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reveal password' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Conceal password' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Conceal password' }));
    expect(input).toHaveAttribute('type', 'password');
  });
});
