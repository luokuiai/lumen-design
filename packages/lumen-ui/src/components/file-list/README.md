# FileList

Display local files or remote attachment metadata independently of FileUpload.

```tsx
import { FileList } from '@luokuiai/lumen-ui';

<FileList
  items={[{ id: 'report', name: 'report.pdf', size: 1258291, progress: 58,
    badge: { label: 'Uploading', variant: 'warning' } }]}
  onRemove={(file) => removeAttachment(file.id)}
/>
```

- `items`: metadata with unique stable `id`, `name`, optional byte `size`, MIME `type`, upload `progress`, and `badge` (`label`, optional Badge `variant`).
- `showSize`: defaults to `true`; unknown or invalid sizes are omitted, zero displays as `0 B`.
- `density`: defaults to `default`. In `compact` mode, file size moves to the right of the name area and immediately before the badge; progress stays below the name.
- `progress`: optional per-file upload progress rendered with the shared `Progress` component below the file name; finite values are clamped to 0-100, and no numeric percentage is shown.
- `wrapName`: defaults to `false`. Single-line names truncate and reveal full text in Tooltip only when overflowing. Set `true` to wrap the complete name, including unbroken strings.
- Badges occupy at most 35% of the row and truncate with an overflow-only Tooltip.
- FileUpload forwards its `density` to FileList, so compact upload areas and file rows use the same layout mode.
- `renderActions(file)`: custom trailing controls such as preview or download buttons, displayed before removal. `FileListItem` accepts the equivalent `actions` node. Callers control disabled states for custom actions.
- `onRemove`: omit for a read-only list; `disabled` disables removal.
- `FileListItem` exposes the same row options with a `file` prop; render it inside a `ul` or `ol`.
- Both components accept native attributes for their list elements.

FileUpload reuses FileList and exposes `showFileSize`, `wrapFileName`, `getFileBadge(file)`, `getFileProgress(file)`, and `renderFileActions(file)`. During upload, `getFileProgress(file)` renders each file's progress below its name. The existing `progress` number remains a shared fallback when no per-file callback is provided. Uploading or disabled state disables removal.
