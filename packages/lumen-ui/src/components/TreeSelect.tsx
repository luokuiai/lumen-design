import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown,
  ChevronRight,
  ChevronDown as ExpandChevronDown,
  Search,
  X,
} from 'lucide-react';
import { cn } from './classNames';
import { radiusTokens } from './designTokens';
import { dropdownTransformOrigin } from './dropdownMotion';

const DROPDOWN_CLOSE_ANIMATION_MS = 120;
const SHOULD_SKIP_CLOSE_ANIMATION_IN_TEST = import.meta.env.MODE === 'test';

type TreeSelectSize = 'sm' | 'md' | 'lg';

export interface TreeSelectProps<TNode> {
  nodes: TNode[];
  value: string | null;
  onChange: (value: string | null, node: TNode | null) => void;
  values?: string[];
  lockedValues?: string[];
  onMultiChange?: (values: string[], nodes: TNode[]) => void;
  multiple?: boolean;
  exclusiveHierarchySelection?: boolean;
  searchable?: boolean;
  expandSearchResults?: boolean;
  searchPlaceholder?: string;
  getValue: (node: TNode) => string;
  getLabel: (node: TNode) => string;
  getChildren?: (node: TNode) => TNode[] | undefined;
  isNodeSelectable?: (node: TNode) => boolean;
  renderPrefix?: (node: TNode) => React.ReactNode;
  defaultExpandedDepth?: number;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  emptyText?: string;
  className?: string;
  size?: TreeSelectSize;
}

function withChildren<TNode>(node: TNode, children: TNode[]): TNode {
  if (typeof node === 'object' && node !== null) {
    return {
      ...(node as Record<string, unknown>),
      children,
    } as TNode;
  }
  return node;
}

function filterTreeNodes<TNode>(
  nodes: TNode[],
  keyword: string,
  getLabel: (node: TNode) => string,
  getChildren?: (node: TNode) => TNode[] | undefined,
): TNode[] {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) {
    return nodes;
  }

  return nodes
    .map((node) => {
      const label = getLabel(node).toLowerCase();
      const children = getNodeChildren(node, getChildren);
      const filteredChildren = filterTreeNodes(
        children,
        normalizedKeyword,
        getLabel,
        getChildren,
      );
      const matched = label.includes(normalizedKeyword);
      if (!matched && filteredChildren.length === 0) {
        return null;
      }
      return matched
        ? withChildren(node, children)
        : withChildren(node, filteredChildren);
    })
    .filter((node): node is TNode => node !== null);
}

const sizeTokens: Record<TreeSelectSize, string> = {
  sm: 'min-h-[var(--lumen-control-height-sm)] px-2.5 text-[13px]',
  md: 'min-h-[var(--lumen-control-height-md)] px-3 text-[14px]',
  lg: 'min-h-[var(--lumen-control-height-lg)] px-3.5 text-[15px]',
};

const optionSizeTokens: Record<TreeSelectSize, string> = {
  sm: 'text-[13px]',
  md: 'text-[14px]',
  lg: 'text-[15px]',
};

function getNodeChildren<TNode>(
  node: TNode,
  getChildren?: (node: TNode) => TNode[] | undefined,
) {
  if (getChildren) {
    return getChildren(node) ?? [];
  }
  if (
    typeof node === 'object' &&
    node !== null &&
    'children' in (node as Record<string, unknown>) &&
    Array.isArray((node as { children?: unknown[] }).children)
  ) {
    return ((node as { children?: TNode[] }).children ?? []) as TNode[];
  }
  return [];
}

function findNodeByValue<TNode>(
  nodes: TNode[],
  value: string,
  getValue: (node: TNode) => string,
  getLabel: (node: TNode) => string,
  getChildren?: (node: TNode) => TNode[] | undefined,
): TNode | null {
  for (const node of nodes) {
    if (getValue(node) === value) {
      return node;
    }
    getLabel(node);
    const children = getNodeChildren(node, getChildren);
    if (children.length > 0) {
      const matched = findNodeByValue(
        children,
        value,
        getValue,
        getLabel,
        getChildren,
      );
      if (matched) {
        return matched;
      }
    }
  }
  return null;
}

function findRelatedHierarchyValues<TNode>(
  nodes: TNode[],
  targetValue: string,
  getValue: (node: TNode) => string,
  getChildren?: (node: TNode) => TNode[] | undefined,
): Set<string> {
  const relatedValues = new Set<string>();

  const collectDescendants = (node: TNode) => {
    getNodeChildren(node, getChildren).forEach((child) => {
      relatedValues.add(getValue(child));
      collectDescendants(child);
    });
  };

  const visit = (currentNodes: TNode[], ancestors: string[]): boolean => {
    for (const node of currentNodes) {
      const nodeValue = getValue(node);
      if (nodeValue === targetValue) {
        ancestors.forEach((ancestor) => relatedValues.add(ancestor));
        collectDescendants(node);
        return true;
      }
      if (
        visit(getNodeChildren(node, getChildren), [...ancestors, nodeValue])
      ) {
        return true;
      }
    }
    return false;
  };

  visit(nodes, []);
  return relatedValues;
}

function getDefaultExpandedKeys<TNode>(
  nodes: TNode[],
  getValue: (node: TNode) => string,
  getChildren?: (node: TNode) => TNode[] | undefined,
  defaultExpandedDepth = 1,
) {
  const keys: string[] = [];
  const visit = (currentNodes: TNode[], depth: number) => {
    if (depth >= defaultExpandedDepth) {
      return;
    }
    currentNodes.forEach((node) => {
      const children = getNodeChildren(node, getChildren);
      if (children.length === 0) {
        return;
      }
      keys.push(getValue(node));
      visit(children, depth + 1);
    });
  };
  visit(nodes, 0);
  return keys;
}

export const TreeSelect = <TNode,>({
  nodes,
  value,
  onChange,
  values,
  lockedValues = [],
  onMultiChange,
  multiple = false,
  exclusiveHierarchySelection = false,
  searchable = false,
  expandSearchResults = false,
  searchPlaceholder = '搜索组织节点',
  getValue,
  getLabel,
  getChildren,
  isNodeSelectable,
  renderPrefix,
  defaultExpandedDepth = 1,
  placeholder = '请选择',
  disabled = false,
  loading = false,
  emptyText = '无可选节点',
  className,
  size = 'md',
}: TreeSelectProps<TNode>) => {
  const lockedValueSet = useMemo(() => new Set(lockedValues), [lockedValues]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const [shouldDropUp, setShouldDropUp] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>(
    getDefaultExpandedKeys(nodes, getValue, getChildren, defaultExpandedDepth),
  );
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const updateDropdownPosition = useCallback(() => {
    if (!containerRef.current) {
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const estimatedHeight = 280;
    const dropdownHeight = portalRef.current?.offsetHeight || estimatedHeight;
    const gap = 6;
    const viewportPadding = 8;
    const shouldOpenUp = window.innerHeight - rect.bottom < dropdownHeight;
    const top = shouldOpenUp
      ? Math.max(viewportPadding, rect.top - dropdownHeight - gap)
      : Math.min(window.innerHeight - viewportPadding, rect.bottom + gap);
    const availableWidth = Math.max(0, window.innerWidth - viewportPadding * 2);
    const triggerWidth = Math.min(rect.width, availableWidth);
    const maxWidth = Math.min(Math.max(triggerWidth, triggerWidth * 2.8), availableWidth, 480);
    const width = Math.max(
      triggerWidth,
      Math.min(
        maxWidth,
        Math.max(triggerWidth, portalRef.current?.offsetWidth || triggerWidth),
      ),
    );
    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      Math.max(viewportPadding, window.innerWidth - width - viewportPadding),
    );

    setShouldDropUp(shouldOpenUp);
    setDropdownStyle({
      position: 'fixed',
      top,
      left,
      width: 'max-content',
      minWidth: triggerWidth,
      maxWidth,
      zIndex: 9999,
    });
    setIsPositioned(true);
  }, []);

  const selectedNode =
    value == null ? null : findNodeByValue(nodes, value, getValue, getLabel, getChildren);

  const selectedValues = multiple ? (values ?? []) : [];
  const latestSelectedValuesRef = useRef(selectedValues);
  latestSelectedValuesRef.current = selectedValues;

  const selectedNodes = selectedValues
    .map((selectedValue) =>
      findNodeByValue(nodes, selectedValue, getValue, getLabel, getChildren),
    )
    .filter((node): node is TNode => node !== null);

  const visibleNodes = filterTreeNodes(
    nodes,
    searchable ? searchKeyword : '',
    getLabel,
    getChildren,
  );
  const shouldExpandSearchResults =
    expandSearchResults && searchable && searchKeyword.trim().length > 0;

  useEffect(() => {
    setExpandedKeys(
      getDefaultExpandedKeys(
        nodes,
        getValue,
        getChildren,
        defaultExpandedDepth,
      ),
    );
    // Reset expansion only when the tree data/depth changes; callback props may be inline.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultExpandedDepth, nodes]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIsPositioned(false);
      return;
    }
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) {
        return;
      }
      if (portalRef.current?.contains(target)) {
        return;
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      setIsAnimatingOut(true);
      closeTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
        setIsAnimatingOut(false);
      }, 120);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    updateDropdownPosition();
    const frameId = window.requestAnimationFrame(updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen, nodes, loading, updateDropdownPosition]);

  useEffect(() => {
    if (!isOpen) {
      setSearchKeyword('');
    }
  }, [isOpen]);

  const closeDropdown = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    if (SHOULD_SKIP_CLOSE_ANIMATION_IN_TEST) {
      setIsOpen(false);
      setIsAnimatingOut(false);
      return;
    }
    setIsAnimatingOut(true);
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsAnimatingOut(false);
    }, DROPDOWN_CLOSE_ANIMATION_MS);
  };

  const closeDropdownImmediate = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setIsOpen(false);
    setIsAnimatingOut(false);
  };

  const openDropdown = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setIsPositioned(false);
    updateDropdownPosition();
    setIsOpen(true);
    setIsAnimatingOut(false);
  };

  const toggleExpand = (nodeValue: string) => {
    setExpandedKeys((current) =>
      current.includes(nodeValue)
        ? current.filter((key) => key !== nodeValue)
        : [...current, nodeValue],
    );
  };

  const renderNode = (node: TNode, depth: number): React.ReactNode => {
    const nodeValue = getValue(node);
    const children = getNodeChildren(node, getChildren);
    const hasChildren = children.length > 0;
    const isExpanded =
      shouldExpandSearchResults || expandedKeys.includes(nodeValue);
    const selectable = isNodeSelectable?.(node) ?? true;
    const expandableOnly = !selectable && hasChildren;
    const isSelected = multiple
      ? selectedValues.includes(nodeValue)
      : value === nodeValue;

    return (
      <div key={nodeValue} className="space-y-1">
        <div
          className={cn(
            'flex items-center rounded-[8px] px-2 py-1.5 transition-colors',
            optionSizeTokens[size],
            isSelected
              ? 'bg-[var(--lumen-color-primary-soft)] font-normal text-[var(--lumen-color-primary)]'
              : selectable || expandableOnly
                ? 'text-[var(--lumen-color-text-secondary)] hover:bg-[var(--lumen-color-surface-muted)]'
                : 'text-[var(--lumen-color-text-placeholder)]',
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {hasChildren ? (
            <button
              type="button"
              data-testid={`tree-select-expand-${nodeValue}`}
              className="mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-[var(--lumen-color-text-muted)] transition-colors hover:bg-[var(--lumen-color-surface-muted)] hover:text-[var(--lumen-color-text-secondary)]"
              onClick={(event) => {
                event.stopPropagation();
                toggleExpand(nodeValue);
              }}
            >
              {isExpanded ? (
                <ExpandChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
          ) : (
            <span className="mr-1 w-[18px] shrink-0" />
          )}
          <button
            type="button"
            data-testid={`tree-select-option-${nodeValue}`}
            aria-disabled={!selectable}
            className={cn(
              'flex min-w-0 flex-1 items-center gap-2 bg-transparent text-left text-inherit',
              selectable ? 'cursor-pointer' : 'cursor-default',
            )}
            onClick={(event) => {
              if (!selectable) {
                if (hasChildren && !isExpanded) {
                  event.stopPropagation();
                  toggleExpand(nodeValue);
                }
                return;
              }
              if (multiple) {
                const currentValues = latestSelectedValuesRef.current;
                const exists = currentValues.includes(nodeValue);
                if (exists && lockedValueSet.has(nodeValue)) {
                  return;
                }
                let nextValues = currentValues.filter(
                  (item) => item !== nodeValue,
                );
                if (!exists) {
                  if (exclusiveHierarchySelection) {
                    const relatedValues = findRelatedHierarchyValues(
                      nodes,
                      nodeValue,
                      getValue,
                      getChildren,
                    );
                    nextValues = nextValues.filter(
                      (item) => !relatedValues.has(item),
                    );
                  }
                  nextValues.push(nodeValue);
                }
                const nextNodes = nextValues
                  .map((item) =>
                    findNodeByValue(
                      nodes,
                      item,
                      getValue,
                      getLabel,
                      getChildren,
                    ),
                  )
                  .filter((item): item is TNode => item !== null);
                latestSelectedValuesRef.current = nextValues;
                onMultiChange?.(nextValues, nextNodes);
                return;
              }

              onChange(nodeValue, node);
              closeDropdownImmediate();
            }}
          >
            {renderPrefix?.(node)}
            <span className="truncate">{getLabel(node)}</span>
          </button>
        </div>
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      onKeyDown={(event) => {
        if (disabled) {
          return;
        }
        if (!isOpen && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          openDropdown();
          return;
        }
        if (isOpen && event.key === 'Escape') {
          event.preventDefault();
          closeDropdownImmediate();
        }
      }}
    >
      <button
        type="button"
        data-testid="tree-select-trigger"
        disabled={disabled}
        onClick={() => {
          if (disabled) {
            return;
          }
          if (isOpen) {
            closeDropdown();
            return;
          }
          openDropdown();
        }}
        className={cn(
          'flex w-full cursor-pointer items-center gap-2 border bg-[var(--lumen-color-surface)] text-left font-normal outline-none transition-all',
          radiusTokens.control,
          sizeTokens[size],
          disabled
            ? 'cursor-not-allowed border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface-muted)] opacity-50'
            : isOpen
              ? 'border-[var(--lumen-color-primary)] ring-1 ring-[var(--lumen-color-primary)]/10'
              : 'border-[var(--lumen-color-border)] hover:border-[var(--lumen-color-border-hover)]',
        )}
      >
        {multiple ? (
          <div className="flex min-w-0 flex-1 flex-wrap gap-1.5 py-1">
            {selectedNodes.length > 0 ? selectedNodes.map((node) => {
              const nodeValue = getValue(node);
              return (
                <span
                  key={nodeValue}
                  className="inline-flex items-center gap-1 rounded-[6px] bg-[var(--lumen-color-primary-soft)] px-2 py-0.5 text-[13px] text-[var(--lumen-color-primary)]"
                >
                  {getLabel(node)}
                  {!lockedValueSet.has(nodeValue) ? (
                    <X
                      size={12}
                      aria-label={`移除 ${getLabel(node)}`}
                      className="cursor-pointer text-[var(--lumen-color-primary)]/60 hover:text-[var(--lumen-color-primary)]"
                      onClick={(event) => {
                        event.stopPropagation();
                        const nextValues = latestSelectedValuesRef.current.filter(
                          (item) => item !== nodeValue,
                        );
                        const nextNodes = nextValues
                          .map((item) =>
                            findNodeByValue(
                              nodes,
                              item,
                              getValue,
                              getLabel,
                              getChildren,
                            ),
                          )
                          .filter((item): item is TNode => item !== null);
                        latestSelectedValuesRef.current = nextValues;
                        onMultiChange?.(nextValues, nextNodes);
                      }}
                    />
                  ) : null}
                </span>
              );
            }) : <span className="text-[var(--lumen-color-text-placeholder)]">{placeholder}</span>}
          </div>
        ) : selectedNode ? (
          <span className="min-w-0 flex-1 truncate text-[var(--lumen-color-text)]">
            {getLabel(selectedNode)}
          </span>
        ) : (
          <span className="min-w-0 flex-1 truncate text-[var(--lumen-color-text-placeholder)]">
            {placeholder}
          </span>
        )}
        <ChevronDown
          size={16}
          className={cn(
            'shrink-0 text-[var(--lumen-color-text-placeholder)] transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={portalRef}
            data-ui="tree-select-dropdown"
            data-testid="tree-select-dropdown"
            className={cn(
              radiusTokens.card,
              'border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] shadow-[0_8px_30px_var(--lumen-color-shadow)]',
            )}
            style={{
              ...dropdownStyle,
              animation: isAnimatingOut
                ? shouldDropUp
                  ? 'lumen-dropdown-out-up 0.12s ease-in forwards'
                  : 'lumen-dropdown-out 0.12s ease-in forwards'
                : shouldDropUp
                  ? 'lumen-dropdown-in-up 0.12s ease-out'
                  : 'lumen-dropdown-in 0.12s ease-out',
              transformOrigin: dropdownTransformOrigin(shouldDropUp),
              visibility: isPositioned ? undefined : 'hidden',
            }}
          >
            {searchable ? (
              <div className="border-b border-[var(--lumen-color-surface-muted)] p-2.5">
                <div className="flex items-center gap-2 rounded-[8px] bg-[var(--lumen-color-surface-muted)] px-3 py-2">
                  <Search size={14} className="shrink-0 text-[var(--lumen-color-text-placeholder)]" />
                  <input
                    className="w-full bg-transparent text-[13px] text-[var(--lumen-color-text)] outline-none placeholder:text-[var(--lumen-color-text-placeholder)] mobile:text-[16px]"
                    placeholder={searchPlaceholder}
                    value={searchKeyword}
                    onChange={(event) => setSearchKeyword(event.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            ) : null}
            <div className="max-h-[280px] overflow-y-auto px-2.5 py-1.5">
              {loading ? (
                <div className="px-3 py-4 text-center text-[13px] text-[var(--lumen-color-text-placeholder)]">
                  加载中...
                </div>
              ) : visibleNodes.length === 0 ? (
                <div className="px-3 py-4 text-center text-[13px] text-[var(--lumen-color-text-placeholder)]">
                  {emptyText}
                </div>
              ) : (
                visibleNodes.map((node) => renderNode(node, 0))
              )}
            </div>
            {multiple && selectedValues.some((item) => !lockedValueSet.has(item)) ? (
              <div className="flex items-center justify-between border-t border-[var(--lumen-color-surface-muted)] px-3 py-2.5">
                <span className="text-[12px] text-[var(--lumen-color-text-placeholder)]">已选 {selectedValues.length} 项</span>
                <button
                  type="button"
                  className="text-[12px] text-[var(--lumen-color-text-placeholder)] transition-colors hover:text-[var(--lumen-color-text-muted)]"
                  onClick={() => {
                    const nextValues = latestSelectedValuesRef.current.filter((item) =>
                      lockedValueSet.has(item));
                    const nextNodes = nextValues
                      .map((item) =>
                        findNodeByValue(nodes, item, getValue, getLabel, getChildren))
                      .filter((item): item is TNode => item !== null);
                    latestSelectedValuesRef.current = nextValues;
                    onMultiChange?.(nextValues, nextNodes);
                  }}
                >
                  清空
                </button>
              </div>
            ) : null}
          </div>,
          document.body,
        )}
    </div>
  );
};
