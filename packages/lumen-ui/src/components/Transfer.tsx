import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Search,
} from 'lucide-react';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Input } from './Input';
import { cn } from './classNames';

export interface TransferItem {
  key: React.Key;
  label: string;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface TransferProps {
  items: TransferItem[];
  targetKeys: React.Key[];
  onChange: (targetKeys: React.Key[]) => void;
  sourceTitle?: React.ReactNode;
  targetTitle?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: React.ReactNode;
  disabled?: boolean;
  filterOption?: (query: string, item: TransferItem) => boolean;
  renderItem?: (item: TransferItem) => React.ReactNode;
  className?: string;
}

const defaultFilterOption = (query: string, item: TransferItem) =>
  `${item.label} ${typeof item.description === 'string' ? item.description : ''}`
    .toLowerCase()
    .includes(query.toLowerCase());

export const Transfer: React.FC<TransferProps> = ({
  items,
  targetKeys,
  onChange,
  sourceTitle = '可选项',
  targetTitle = '已选项',
  searchable = true,
  searchPlaceholder = '搜索',
  emptyText = '暂无数据',
  disabled = false,
  filterOption = defaultFilterOption,
  renderItem,
  className,
}) => {
  const [sourceQuery, setSourceQuery] = useState('');
  const [targetQuery, setTargetQuery] = useState('');
  const [selectedSourceKeys, setSelectedSourceKeys] = useState<React.Key[]>([]);
  const [selectedTargetKeys, setSelectedTargetKeys] = useState<React.Key[]>([]);
  const targetKeySet = useMemo(() => new Set(targetKeys), [targetKeys]);
  const itemMap = useMemo(
    () => new Map(items.map((item) => [item.key, item])),
    [items],
  );
  const sourceItems = useMemo(
    () => items.filter((item) => !targetKeySet.has(item.key)),
    [items, targetKeySet],
  );
  const targetItems = useMemo(
    () => targetKeys.map((key) => itemMap.get(key)).filter((item): item is TransferItem => Boolean(item)),
    [itemMap, targetKeys],
  );
  const visibleSourceItems = sourceItems.filter((item) => filterOption(sourceQuery.trim(), item));
  const visibleTargetItems = targetItems.filter((item) => filterOption(targetQuery.trim(), item));
  const selectedSourceSet = new Set(selectedSourceKeys);
  const selectedTargetSet = new Set(selectedTargetKeys);
  const movableSourceKeys = selectedSourceKeys.filter((key) => {
    const item = itemMap.get(key);
    return item && !item.disabled && !targetKeySet.has(key);
  });
  const movableTargetKeys = selectedTargetKeys.filter((key) => {
    const item = itemMap.get(key);
    return item && !item.disabled && targetKeySet.has(key);
  });

  const toggleItem = (
    key: React.Key,
    checked: boolean,
    selectedKeys: React.Key[],
    setSelectedKeys: React.Dispatch<React.SetStateAction<React.Key[]>>,
  ) => {
    const nextKeys = new Set(selectedKeys);
    if (checked) nextKeys.add(key);
    else nextKeys.delete(key);
    setSelectedKeys(Array.from(nextKeys));
  };

  const renderPanel = ({
    title,
    panelItems,
    query,
    setQuery,
    selectedKeys,
    selectedSet,
    setSelectedKeys,
    side,
  }: {
    title: React.ReactNode;
    panelItems: TransferItem[];
    query: string;
    setQuery: (query: string) => void;
    selectedKeys: React.Key[];
    selectedSet: Set<React.Key>;
    setSelectedKeys: React.Dispatch<React.SetStateAction<React.Key[]>>;
    side: 'source' | 'target';
  }) => {
    const selectableItems = panelItems.filter((item) => !item.disabled);
    const selectedVisibleCount = selectableItems.filter((item) => selectedSet.has(item.key)).length;
    const allVisibleSelected = selectableItems.length > 0
      && selectedVisibleCount === selectableItems.length;
    const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;
    return (
      <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[8px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)]">
        <header className="flex h-11 shrink-0 items-center gap-2 border-b border-[var(--lumen-color-surface-muted)] px-3">
          <Checkbox
            aria-label={`选择${side === 'source' ? '可选' : '已选'}列表全部可见项`}
            checked={allVisibleSelected}
            indeterminate={someVisibleSelected}
            disabled={disabled || selectableItems.length === 0}
            onChange={(checked) => {
              const nextKeys = new Set(selectedKeys);
              selectableItems.forEach((item) => {
                if (checked) nextKeys.add(item.key);
                else nextKeys.delete(item.key);
              });
              setSelectedKeys(Array.from(nextKeys));
            }}
          />
          <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-[var(--lumen-color-text)]">
            {title}
          </span>
          <span className="text-[13px] text-[var(--lumen-color-text-muted)]">
            {selectedVisibleCount}/{panelItems.length}
          </span>
        </header>
        {searchable ? (
          <div className="shrink-0 border-b border-[var(--lumen-color-surface-muted)] p-2">
            <Input
              aria-label={`${side === 'source' ? '可选' : '已选'}列表搜索`}
              size="md"
              value={query}
              prefix={<Search aria-hidden="true" size={15} />}
              placeholder={searchPlaceholder}
              disabled={disabled}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        ) : null}
        <ul
          aria-label={`${side === 'source' ? '可选' : '已选'}列表`}
          className="h-64 overflow-y-auto p-1.5"
        >
          {panelItems.length === 0 ? (
            <li className="flex h-full items-center justify-center px-3 text-[13px] text-[var(--lumen-color-text-placeholder)]">
              {emptyText}
            </li>
          ) : panelItems.map((item) => (
            <li key={item.key}>
              <Checkbox
                className="w-full rounded-[6px] px-2 py-2 hover:bg-[var(--lumen-color-surface-hover)]"
                checked={selectedSet.has(item.key)}
                disabled={disabled || item.disabled}
                label={renderItem?.(item) ?? item.label}
                description={item.description}
                onChange={(checked) => toggleItem(
                  item.key,
                  checked,
                  selectedKeys,
                  setSelectedKeys,
                )}
              />
            </li>
          ))}
        </ul>
      </section>
    );
  };

  return (
    <div
      data-ui="transfer"
      className={cn(
        'grid min-w-0 grid-cols-1 gap-3 pad:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] pad:items-center l:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] l:items-center',
        className,
      )}
    >
      {renderPanel({
        title: sourceTitle,
        panelItems: visibleSourceItems,
        query: sourceQuery,
        setQuery: setSourceQuery,
        selectedKeys: selectedSourceKeys,
        selectedSet: selectedSourceSet,
        setSelectedKeys: setSelectedSourceKeys,
        side: 'source',
      })}
      <div className="flex justify-center gap-2 pad:flex-col l:flex-col">
        <Button
          iconOnly
          size="sm"
          variant="secondary"
          aria-label="移到右侧"
          disabled={disabled || movableSourceKeys.length === 0}
          icon={(
            <>
              <ChevronDown className="pad:hidden l:hidden" size={16} />
              <ChevronRight className="hidden pad:block l:block" size={16} />
            </>
          )}
          onClick={() => {
            onChange([...targetKeys, ...movableSourceKeys]);
            setSelectedSourceKeys([]);
          }}
        />
        <Button
          iconOnly
          size="sm"
          variant="outline"
          aria-label="移到左侧"
          disabled={disabled || movableTargetKeys.length === 0}
          icon={(
            <>
              <ChevronUp className="pad:hidden l:hidden" size={16} />
              <ChevronLeft className="hidden pad:block l:block" size={16} />
            </>
          )}
          onClick={() => {
            const removingKeys = new Set(movableTargetKeys);
            onChange(targetKeys.filter((key) => !removingKeys.has(key)));
            setSelectedTargetKeys([]);
          }}
        />
      </div>
      {renderPanel({
        title: targetTitle,
        panelItems: visibleTargetItems,
        query: targetQuery,
        setQuery: setTargetQuery,
        selectedKeys: selectedTargetKeys,
        selectedSet: selectedTargetSet,
        setSelectedKeys: setSelectedTargetKeys,
        side: 'target',
      })}
    </div>
  );
};
