import React from 'react';
import { render, screen } from '@testing-library/react';
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
});
