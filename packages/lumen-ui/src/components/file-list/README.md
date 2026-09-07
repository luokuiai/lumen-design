# FileList

Display local files or remote attachment metadata independently of FileUpload.

```tsx
import { FileList } from '@luokuiai/lumen-ui';

<FileList
  items={[{ id: 'report', name: 'report.pdf', size: 1258291,
    badge: { label: 'Approved', variant: 'success' } }]}
  onRemove={(file) => removeAttachment(file.id)}
/>
```

- `items`: metadata with unique stable `id`, `name`, optional byte `size`, MIME `type`, and `badge` (`label`, optional Badge `variant`).
- `showSize`: defaults to `true`; unknown or invalid sizes are omitted, zero displays as `0 B`.
- `wrapName`: defaults to `false`. Single-line names truncate and reveal full text in Tooltip only when overflowing. Set `true` to wrap the complete name, including unbroken strings.
- Badges occupy at most 35% of the row and truncate with an overflow-only Tooltip.
- `density`: `default` or `compact`.
- `renderActions(file)`: custom trailing controls such as preview or download buttons, displayed before removal. `FileListItem` accepts the equivalent `actions` node. Callers control disabled states for custom actions.
- `onRemove`: omit for a read-only list; `disabled` disables removal.
- `FileListItem` exposes the same row options with a `file` prop; render it inside a `ul` or `ol`.
- Both components accept native attributes for their list elements.

FileUpload reuses FileList and exposes `showFileSize`, `wrapFileName`, `getFileBadge(file)`, and `renderFileActions(file)`. Its existing selection, validation, progress, and removal behavior is preserved. Uploading or disabled state disables removal.
