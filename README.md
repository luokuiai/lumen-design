# Lumen UI

Lumen UI is LuokuiAI's React component library and design system. The default
Clarity theme is distributed separately so component behavior and visual
language can evolve independently.

## Install

```bash
bun add @luokuiai/lumen-ui @luokuiai/lumen-theme-clarity
```

## Use

```tsx
import { Button, Input } from '@luokuiai/lumen-ui';
import '@luokuiai/lumen-ui/styles.css';
import '@luokuiai/lumen-theme-clarity';

export function Example() {
  return (
    <section data-lumen-theme="clarity" data-color-scheme="light">
      <Input placeholder="Meeting name" />
      <Button>Save</Button>
    </section>
  );
}
```

`data-lumen-theme`, `data-color-scheme`, and `data-density` are independent.
Themes implement the CSS variable contract exported from
`@luokuiai/lumen-ui/theme-contract`.

## Responsive breakpoints

Lumen UI components use this mobile-first breakpoint contract:

| Variant | Viewport |
| --- | --- |
| `mobile` | below 640px |
| `pad` | 640px to 1023px |
| `l` | 1024px and above |
| `xl` | 1280px and above |
| `xxl` | 1536px and above |
| `xxxl` | 1920px and above |

Unprefixed component styles define mobile defaults. Internal component layouts
use the named variants for device-specific overrides.

## Development

```bash
bun install
bun run check
```
