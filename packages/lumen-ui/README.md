# Lumen UI

React component library and design system from LuokuiAI.

## Installation

```bash
npm install @luokuiai/lumen-ui @luokuiai/lumen-theme-clarity
```

## Usage

Import the component styles and a theme once in your application entry point:

```tsx
import '@luokuiai/lumen-ui/styles.css';
import '@luokuiai/lumen-theme-clarity';
```

Then use the components in your React application:

```tsx
import { Button, Input } from '@luokuiai/lumen-ui';

export function Example() {
  return (
    <section data-lumen-theme="clarity" data-color-scheme="light">
      <Input placeholder="Meeting name" />
      <Button>Save</Button>
    </section>
  );
}
```

The `data-lumen-theme`, `data-color-scheme`, and `data-density` attributes can
be configured independently. Theme authors can import the CSS variable
contract from `@luokuiai/lumen-ui/theme-contract`.

## Legacy CSS

For older Chromium WebViews that cannot load Tailwind 4 cascade layers, replace
the style import with the optional Tailwind 3.4 output:

```tsx
import '@luokuiai/lumen-ui/legacy.css';
import '@luokuiai/lumen-theme-clarity';
```

Load either `styles.css` or `legacy.css`, once. Both use the same React components
and theme variables. `bun run build` generates both files; no consumer Tailwind
configuration is required for Lumen's own components.

The legacy stylesheet targets Chromium 88+ CSS features. It contains no cascade
layers or property registrations, uses traditional media queries and viewport
units, and draws container focus with `:focus-within` instead of `:has()`.
Dynamic color mixing and color opacity modifiers fall back to theme semantic
colors, so translucent surfaces, rings and shadows may look different.

This is a CSS compatibility output, not a JavaScript polyfill or a compatibility
build for application CSS or separately supplied themes. It retains `:where()`,
`:is()`, `:focus-visible`, CSS variables and flex gap. Inline component styles
using `dvh` also require browser support. Test the final application on the
actual WebView; a vendor WebView version alone does not identify its Chromium
engine version.

## Localization

Components use Simplified Chinese defaults. Wrap the application with
`LumenProvider` to use another built-in locale:

```tsx
import { enUS, LumenProvider } from '@luokuiai/lumen-ui';

export function App() {
  return <LumenProvider locale={enUS}>{/* application */}</LumenProvider>;
}
```

The package also exports `zhCN` and the `LumenLocale` type for custom locale
packs. Component text props take precedence over provider defaults.

## Package exports

- `@luokuiai/lumen-ui` - React components and theme contract
- `@luokuiai/lumen-ui/styles.css` - base component styles
- `@luokuiai/lumen-ui/legacy.css` - optional legacy component styles
- `@luokuiai/lumen-ui/theme-contract` - theme tokens and types

## Requirements

- React 19 or later
- React DOM 19 or later
