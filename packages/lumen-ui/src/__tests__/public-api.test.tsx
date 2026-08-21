import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as Lumen from '../index';

describe('public API', () => {
  it('exports the foundation components', () => {
    expect(Lumen.Avatar).toBeTypeOf('object');
    expect(Lumen.Button).toBeTypeOf('function');
    expect(Lumen.FileUpload).toBeTypeOf('object');
    expect(Lumen.Input).toBeTypeOf('object');
    expect(Lumen.Select).toBeTypeOf('function');
    expect(Lumen.Modal).toBeTypeOf('function');
    expect(Lumen.Pagination).toBeTypeOf('function');
    expect(Lumen.SegmentedControl).toBeTypeOf('function');
    expect(Lumen.TreeSelect).toBeTypeOf('function');
    expect('CompactPagination' in Lumen).toBe(false);
    expect('TimeSelector' in Lumen).toBe(false);
  });

  it('renders controls against semantic theme variables', () => {
    render(
      <section
        data-lumen-theme="clarity"
        data-color-scheme="light"
        data-density="comfortable"
      >
        <Lumen.Input aria-label="Name" />
        <Lumen.Button>Save</Lumen.Button>
      </section>,
    );

    expect(screen.getByRole('button', { name: 'Save' }).className).toContain(
      '--lumen-color-primary',
    );
    expect(screen.getByRole('textbox', { name: 'Name' }).className).toContain(
      '--lumen-color-border',
    );
  });
});
