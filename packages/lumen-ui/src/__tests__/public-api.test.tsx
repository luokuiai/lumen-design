import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as Lumen from '../index';

describe('public API', () => {
  it('exports the foundation components', () => {
    expect(Lumen.Alert).toBeTypeOf('object');
    expect(Lumen.Accordion).toBeTypeOf('object');
    expect(Lumen.Avatar).toBeTypeOf('object');
    expect(Lumen.Button).toBeTypeOf('function');
    expect(Lumen.Card).toBeTypeOf('object');
    expect(Lumen.CardHeader).toBeTypeOf('object');
    expect(Lumen.Collapse).toBeTypeOf('object');
    expect(Lumen.CollapseItem).toBeTypeOf('object');
    expect(Lumen.DataTable).toBeTypeOf('function');
    expect(Lumen.Divider).toBeTypeOf('object');
    expect(Lumen.Empty).toBeTypeOf('object');
    expect('EmptyState' in Lumen).toBe(false);
    expect(Lumen.FileUpload).toBeTypeOf('object');
    expect(Lumen.FileTypeIcon).toBeTypeOf('function');
    expect(Lumen.Input).toBeTypeOf('object');
    expect(Lumen.List).toBeTypeOf('object');
    expect(Lumen.ListItem).toBeTypeOf('object');
    expect(Lumen.Select).toBeTypeOf('function');
    expect(Lumen.Modal).toBeTypeOf('function');
    expect(Lumen.Pagination).toBeTypeOf('function');
    expect(Lumen.Popover).toBeTypeOf('function');
    expect(Lumen.Progress).toBeTypeOf('object');
    expect(Lumen.RadioGroup).toBeTypeOf('function');
    expect(Lumen.SegmentedControl).toBeTypeOf('function');
    expect(Lumen.SideNav).toBeTypeOf('function');
    expect(Lumen.Slider).toBeTypeOf('object');
    expect(Lumen.Skeleton).toBeTypeOf('object');
    expect(Lumen.Spinner).toBeTypeOf('object');
    expect(Lumen.Steps).toBeTypeOf('object');
    expect(Lumen.Chip).toBeTypeOf('function');
    expect('Tag' in Lumen).toBe(false);
    expect(Lumen.TreeSelect).toBeTypeOf('function');
    expect(Lumen.Transfer).toBeTypeOf('function');
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
    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('cursor-pointer');
    expect(screen.getByRole('textbox', { name: 'Name' }).className).toContain(
      '--lumen-color-border',
    );
  });
});
