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

## Package exports

- `@luokuiai/lumen-ui` - React components and theme contract
- `@luokuiai/lumen-ui/styles.css` - base component styles
- `@luokuiai/lumen-ui/theme-contract` - theme tokens and types

## Requirements

- React 19 or later
- React DOM 19 or later
