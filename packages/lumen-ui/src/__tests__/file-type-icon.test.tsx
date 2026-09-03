import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  FileTypeIcon,
  resolveFileTypeIcon,
} from '../components/file-type-icon';

describe('FileTypeIcon', () => {
  it.each([
    ['report.pdf', 'pdf', 'PDF'],
    ['brief.docx', 'document', 'DOCX'],
    ['budget.xlsx', 'spreadsheet', 'XLSX'],
    ['slides.pptx', 'presentation', 'PPTX'],
    ['photo.webp', 'image', 'WEBP'],
    ['meeting.mp4', 'video', 'MP4'],
    ['recording.mp3', 'audio', 'MP3'],
    ['source.tar.gz', 'archive', 'TGZ'],
    ['notes.md', 'text', 'MD'],
    ['client.apk', 'app', 'APK'],
    ['client.aab', 'app', 'AAB'],
    ['client.ipa', 'app', 'IPA'],
    ['client.hap', 'app', 'HAP'],
  ] as const)('resolves %s as %s', (fileName, category, label) => {
    expect(resolveFileTypeIcon({ fileName })).toMatchObject({ category, label });
  });

  it('falls back to BIN for unknown or missing extensions', () => {
    expect(resolveFileTypeIcon({ fileName: 'payload.xyz' })).toEqual({
      category: 'bin',
      extension: 'xyz',
      label: 'BIN',
    });
    expect(resolveFileTypeIcon({ fileName: 'README' })).toEqual({
      category: 'bin',
      extension: undefined,
      label: 'BIN',
    });
  });

  it('uses MIME types when an extension is unavailable', () => {
    expect(resolveFileTypeIcon({ mimeType: 'video/mp4' })).toMatchObject({
      category: 'video',
      label: 'VID',
    });
  });

  it('renders resolved metadata and an accessible title', () => {
    render(<FileTypeIcon fileName="meeting.mp4" title="会议录像" size="lg" />);

    const icon = screen.getByRole('img', { name: '会议录像' });
    expect(icon).toHaveAttribute('data-file-type-category', 'video');
    expect(icon).toHaveAttribute('data-file-type-label', 'MP4');
    expect(icon).toHaveAttribute('width', '40');
    expect(icon).toHaveTextContent('MP4');
    expect(icon.querySelector('path')).toHaveAttribute(
      'fill',
      'var(--lumen-color-file-icon-border)',
    );
    expect(icon.querySelector('path')).toHaveAttribute('fill-opacity', '0.18');
  });
});
