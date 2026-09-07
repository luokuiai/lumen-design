import React, { useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../classNames';

export interface TreeNode {
  /** Unique across the entire tree. */
  key: string;
  label: string;
  children?: TreeNode[];
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Prevent selection while allowing expansion and navigation. */
  selectable?: boolean;
}

export interface TreeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'children'> {
  nodes: TreeNode[];
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  onExpandedChange?: (keys: string[], node: TreeNode) => void;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelectionChange?: (keys: string[], node: TreeNode) => void;
  /** Click or Space toggles each node independently; no modifier key required. */
  multiple?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  renderLabel?: (node: TreeNode) => React.ReactNode;
  emptyContent?: React.ReactNode;
}

const sizes = {
  sm: 'min-h-[var(--lumen-control-height-sm)] text-[13px]',
  md: 'min-h-[var(--lumen-control-height-md)] text-[14px]',
  lg: 'min-h-[var(--lumen-control-height-lg)] text-[15px]',
};

/** A tree view with independent selection and visible-node keyboard navigation. */
export function Tree({
  nodes, expandedKeys, defaultExpandedKeys = [], onExpandedChange,
  selectedKeys, defaultSelectedKeys = [], onSelectionChange,
  multiple = false, disabled = false, size = 'md', renderLabel,
  emptyContent, className, onKeyDown, ...props
}: TreeProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpandedKeys);
  const [internalSelected, setInternalSelected] = useState(defaultSelectedKeys);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const items = useRef(new Map<string, HTMLDivElement>());
  const typeahead = useRef({ text: '', time: 0 });
  const expanded = new Set(expandedKeys ?? internalExpanded);
  const selection = selectedKeys ?? internalSelected;
  const selected = new Set(multiple ? selection : selection.slice(0, 1));
  const visible: { node: TreeNode; parent?: string }[] = [];
  const collect = (entries: TreeNode[], parent?: string) => {
    entries.forEach((node) => {
      visible.push({ node, parent });
      if (expanded.has(node.key)) collect(node.children ?? [], node.key);
    });
  };
  collect(nodes);
  const activeKey = visible.some(({ node }) => node.key === focusedKey)
    ? focusedKey
    : visible.find(({ node }) => selected.has(node.key))?.node.key ?? visible[0]?.node.key;

  const focus = (key: string | undefined) => {
    if (key === undefined) return;
    setFocusedKey(key);
    items.current.get(key)?.focus();
  };
  const toggleExpanded = (node: TreeNode) => {
    if (disabled || node.disabled || !node.children?.length) return;
    const next = new Set(expanded);
    if (next.has(node.key)) next.delete(node.key);
    else next.add(node.key);
    if (expandedKeys === undefined) setInternalExpanded([...next]);
    onExpandedChange?.([...next], node);
  };
  const select = (node: TreeNode) => {
    if (disabled || node.disabled || node.selectable === false) return;
    const next = multiple
      ? selected.has(node.key) ? [...selected].filter((key) => key !== node.key) : [...selected, node.key]
      : [node.key];
    if (selectedKeys === undefined) setInternalSelected(next);
    onSelectionChange?.(next, node);
  };
  const handleKey = (event: React.KeyboardEvent<HTMLDivElement>, node: TreeNode) => {
    const index = visible.findIndex((entry) => entry.node.key === node.key);
    switch (event.key) {
      case 'ArrowDown': focus(visible[index + 1]?.node.key); break;
      case 'ArrowUp': focus(visible[index - 1]?.node.key); break;
      case 'Home': focus(visible[0]?.node.key); break;
      case 'End': focus(visible.at(-1)?.node.key); break;
      case 'ArrowRight':
        if (!expanded.has(node.key)) toggleExpanded(node);
        else focus(node.children?.[0]?.key);
        break;
      case 'ArrowLeft':
        if (expanded.has(node.key) && node.children?.length) toggleExpanded(node);
        else focus(visible[index]?.parent);
        break;
      case 'Enter': case ' ': select(node); break;
      default: {
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
        const now = Date.now();
        const previous = now - typeahead.current.time < 500 ? typeahead.current.text : '';
        const text = previous + event.key.toLocaleLowerCase();
        typeahead.current = { text, time: now };
        const query = [...text].every((letter) => letter === text[0]) ? text[0]! : text;
        const ordered = [...visible.slice(index + 1), ...visible.slice(0, index + 1)];
        focus(ordered.find(({ node: candidate }) => candidate.label.toLocaleLowerCase().startsWith(query))?.node.key);
      }
    }
    event.preventDefault();
  };

  const renderNodes = (entries: TreeNode[], level: number): React.ReactNode => entries.map((node) => {
    const branch = Boolean(node.children?.length);
    const isDisabled = disabled || node.disabled;
    return (
      <div
        key={node.key}
        role="treeitem"
        aria-label={node.label}
        aria-expanded={branch ? expanded.has(node.key) : undefined}
        aria-selected={node.selectable !== false ? selected.has(node.key) : undefined}
        aria-disabled={isDisabled || undefined}
        tabIndex={!disabled && activeKey === node.key ? 0 : -1}
        ref={(element) => { if (element) items.current.set(node.key, element); else items.current.delete(node.key); }}
        className="outline-none [&:focus-visible>div:first-child]:ring-2 [&:focus-visible>div:first-child]:ring-[var(--lumen-color-primary)]"
        onFocus={(event) => { if (event.target === event.currentTarget) setFocusedKey(node.key); }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          onKeyDown?.(event);
          if (!event.defaultPrevented && !disabled) handleKey(event, node);
          event.stopPropagation();
        }}
      >
        <div
          className={cn(
            'flex items-center gap-1 rounded-[var(--lumen-radius-control)] pr-2 text-[var(--lumen-color-text)]',
            sizes[size],
            selected.has(node.key) && 'bg-[var(--lumen-color-primary-soft)] text-[var(--lumen-color-primary)]',
            isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-[var(--lumen-color-surface-muted)]',
          )}
          style={{ paddingInlineStart: level * 20 + 4 }}
          onClick={() => { focus(node.key); select(node); }}
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center"
            onClick={(event) => { if (!branch) return; event.stopPropagation(); focus(node.key); toggleExpanded(node); }}
          >
            {branch && <ChevronRight size={16} className={cn('transition-transform motion-reduce:transition-none', expanded.has(node.key) && 'rotate-90')} />}
          </span>
          {node.icon && <span aria-hidden="true" className="flex shrink-0 items-center">{node.icon}</span>}
          <span className="min-w-0 break-words py-1">{renderLabel?.(node) ?? node.label}</span>
        </div>
        {branch && expanded.has(node.key) && <div role="group">{renderNodes(node.children!, level + 1)}</div>}
      </div>
    );
  });

  return (
    <div
      {...props}
      role="tree"
      aria-multiselectable={multiple || undefined}
      aria-disabled={disabled || undefined}
      className={cn('min-w-0', className)}
    >
      {nodes.length ? renderNodes(nodes, 0) : emptyContent}
    </div>
  );
}
