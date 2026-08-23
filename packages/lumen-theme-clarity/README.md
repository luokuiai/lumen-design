# Clarity Theme

The default clear enterprise theme for Lumen UI.

```ts
import '@luokuiai/lumen-ui/styles.css';
import '@luokuiai/lumen-theme-clarity';
```

Apply the theme and choose a color scheme on an application root:

```html
<div data-lumen-theme="clarity" data-color-scheme="dark"></div>
```

Both `light` and `dark` color schemes are included. Change `data-color-scheme`
at runtime to switch between them.

Use the optional purple accent preset independently of the color scheme:

```html
<div
  data-lumen-theme="clarity"
  data-color-scheme="light"
  data-accent="purple"
></div>
```
