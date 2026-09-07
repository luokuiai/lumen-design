# Tree

Use `Tree` for file hierarchies, organization structures, and nested navigation.
Every node needs a globally unique string `key` and a plain-text `label`, which
also provides its accessible name and typeahead text.

```tsx
import { Tree, type TreeNode } from '@luokuiai/lumen-ui';

const nodes: TreeNode[] = [
  {
    key: 'src',
    label: 'src',
    children: [{ key: 'app', label: 'App.tsx' }],
  },
];

<Tree
  aria-label="Project files"
  nodes={nodes}
  defaultExpandedKeys={['src']}
  onSelectionChange={(keys, node) => console.log(keys, node)}
/>
```

- Supply `expandedKeys` / `selectedKeys` with `onExpandedChange` /
  `onSelectionChange` for controlled state, or use `defaultExpandedKeys` /
  `defaultSelectedKeys` for initial uncontrolled state.
- Single selection replaces the previous selection. With `multiple`, click,
  Enter, or Space toggles individual nodes without modifier keys or parent-child
  cascading. Selection persists when a branch is collapsed.
- `disabled` prevents selection and expansion. A disabled node remains reachable
  with arrow keys so its label and state can be discovered. Disabling the whole
  tree removes it from the Tab sequence.
- `selectable: false` allows a branch to expand without being selectable.
- Provide decorative `icon` content per node or `renderLabel` for custom label
  presentation. Keep labels free of interactive controls.
- `size` accepts `sm`, `md` (default), or `lg`. `emptyContent` supplies an optional
  empty-state message. Label the tree using `aria-label` or `aria-labelledby`.

Up/Down navigate visible nodes; Right expands or enters a branch; Left collapses
or moves to its parent; Home/End move to the first/last visible node. Typing a
label prefix moves focus to a matching visible node. Focus movement does not
change selection.
