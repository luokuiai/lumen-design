import type {
  FileTypeIconCategory,
  FileTypeIconSource,
  ResolvedFileType,
} from './types';

export const fileTypeCategoryLabels: Record<FileTypeIconCategory, string> = {
  pdf: 'PDF',
  document: 'DOC',
  spreadsheet: 'XLS',
  presentation: 'PPT',
  image: 'IMG',
  video: 'VID',
  audio: 'AUD',
  archive: 'ZIP',
  text: 'TXT',
  app: 'APP',
  bin: 'BIN',
};

const extensionGroups: Record<Exclude<FileTypeIconCategory, 'bin'>, readonly string[]> = {
  pdf: ['pdf'],
  document: [
    'doc', 'docx', 'docm', 'dot', 'dotx', 'odt', 'rtf', 'pages', 'epub', 'mobi',
  ],
  spreadsheet: [
    'xls', 'xlsx', 'xlsm', 'xlsb', 'ods', 'csv', 'tsv', 'numbers',
  ],
  presentation: [
    'ppt', 'pptx', 'pptm', 'pps', 'ppsx', 'odp', 'key',
  ],
  image: [
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tif', 'tiff',
    'heic', 'heif', 'avif', 'jfif', 'raw', 'cr2', 'nef', 'arw',
  ],
  video: [
    'mp4', 'm4v', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'flv', 'mpg', 'mpeg',
    '3gp', 'mts', 'm2ts', 'rm', 'rmvb',
  ],
  audio: [
    'mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'opus', 'wma', 'aiff', 'ape',
    'amr', 'mid', 'midi',
  ],
  archive: [
    'zip', 'rar', '7z', 'tar', 'gz', 'tgz', 'bz2', 'xz', 'zst', 'cab', 'jar',
    'lzh', 'tar.gz', 'tar.bz2', 'tar.xz', 'tar.zst',
  ],
  text: [
    'txt', 'md', 'markdown', 'log', 'ini', 'conf', 'cfg', 'yaml', 'yml', 'json',
    'xml', 'toml', 'env', 'properties', 'html', 'htm', 'css', 'scss', 'sass',
    'less', 'js', 'mjs', 'cjs', 'jsx', 'ts', 'cts', 'tsx', 'vue',
    'svelte', 'java', 'kt', 'kts', 'py', 'go', 'rs', 'c', 'cc', 'cpp', 'cxx',
    'h', 'hpp', 'cs', 'php', 'rb', 'swift', 'dart', 'sh', 'bash', 'zsh', 'fish',
    'sql', 'tex',
  ],
  app: ['apk', 'aab', 'ipa', 'xapk', 'apks', 'hap'],
};

export const fileTypeExtensionRegistry = Object.fromEntries(
  Object.entries(extensionGroups).flatMap(([category, extensions]) =>
    extensions.map((extension) => [extension, category]),
  ),
) as Record<string, Exclude<FileTypeIconCategory, 'bin'>>;

const compoundExtensionLabels: Record<string, string> = {
  'tar.gz': 'TGZ',
  'tar.bz2': 'TBZ2',
  'tar.xz': 'TXZ',
  'tar.zst': 'TZST',
};

const mimeTypeCategories: Record<string, FileTypeIconCategory> = {
  'application/pdf': 'pdf',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.ms-excel': 'spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
  'application/vnd.ms-powerpoint': 'presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'presentation',
  'application/zip': 'archive',
  'application/x-7z-compressed': 'archive',
  'application/vnd.rar': 'archive',
  'application/gzip': 'archive',
  'application/vnd.android.package-archive': 'app',
  'application/json': 'text',
  'application/xml': 'text',
  'application/javascript': 'text',
  'application/yaml': 'text',
};

const normalizeExtension = (value?: string) =>
  value?.trim().toLowerCase().replace(/^\.+/, '') || undefined;

const getFileNameExtension = (fileName?: string) => {
  if (!fileName) return undefined;
  const baseName = fileName.split(/[\\/]/).pop()?.split(/[?#]/)[0]?.toLowerCase();
  if (!baseName) return undefined;

  const compoundExtension = Object.keys(compoundExtensionLabels).find((extension) =>
    baseName.endsWith(`.${extension}`),
  );
  if (compoundExtension) return compoundExtension;

  const separator = baseName.lastIndexOf('.');
  return separator >= 0 && separator < baseName.length - 1
    ? baseName.slice(separator + 1)
    : undefined;
};

const getCategoryByMimeType = (mimeType?: string): FileTypeIconCategory | undefined => {
  const normalizedMimeType = mimeType?.split(';')[0]?.trim().toLowerCase();
  if (!normalizedMimeType) return undefined;
  if (normalizedMimeType.startsWith('image/')) return 'image';
  if (normalizedMimeType.startsWith('video/')) return 'video';
  if (normalizedMimeType.startsWith('audio/')) return 'audio';
  if (normalizedMimeType.startsWith('text/')) return 'text';
  return mimeTypeCategories[normalizedMimeType];
};

const getExtensionLabel = (extension: string, category: FileTypeIconCategory) => {
  const compoundLabel = compoundExtensionLabels[extension];
  if (compoundLabel) return compoundLabel;
  if (/^[a-z0-9]{1,4}$/.test(extension)) return extension.toUpperCase();
  return fileTypeCategoryLabels[category];
};

export function resolveFileTypeIcon({
  fileName,
  extension,
  mimeType,
}: FileTypeIconSource): ResolvedFileType {
  const normalizedExtension = normalizeExtension(extension) ?? getFileNameExtension(fileName);
  const category = normalizedExtension
    ? fileTypeExtensionRegistry[normalizedExtension]
    : undefined;

  if (category && normalizedExtension) {
    return {
      category,
      extension: normalizedExtension,
      label: getExtensionLabel(normalizedExtension, category),
    };
  }

  const mimeCategory = getCategoryByMimeType(mimeType);
  if (mimeCategory) {
    return {
      category: mimeCategory,
      label: fileTypeCategoryLabels[mimeCategory],
    };
  }

  return { category: 'bin', label: 'BIN', extension: normalizedExtension };
}
