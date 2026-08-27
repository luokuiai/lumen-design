import type { SVGAttributes } from 'react';

export type FileTypeIconCategory =
  | 'pdf'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'image'
  | 'video'
  | 'audio'
  | 'archive'
  | 'text'
  | 'app'
  | 'bin';

export type FileTypeIconSize = 'sm' | 'md' | 'lg';

export interface FileTypeIconSource {
  fileName?: string;
  extension?: string;
  mimeType?: string;
}

export interface ResolvedFileType {
  category: FileTypeIconCategory;
  label: string;
  extension?: string;
}

export interface FileTypeIconProps
  extends Omit<SVGAttributes<SVGSVGElement>, 'children'>,
    FileTypeIconSource {
  category?: FileTypeIconCategory;
  label?: string;
  size?: FileTypeIconSize;
  title?: string;
}
