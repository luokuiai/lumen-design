import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Clock } from 'lucide-react';
import { Button } from './Button';
import { cn } from './classNames';
import { radiusTokens } from './designTokens';
import { TimeSelector } from './TimeSelector';

export interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'md' | 'lg';
  precision?: 'minute' | 'second';
  minuteStep?: number;
  minExclusiveTime?: string;
  disabled?: boolean;
}

const TIME_PATTERN = /^((?:[01]\d|2[0-3])):([0-5]\d)(?::([0-5]\d))?$/;
const PANEL_WIDTH = 220;
const ESTIMATED_PANEL_HEIGHT = 326;
const PANEL_GAP = 6;
const CLOSE_ANIMATION_DURATION = 120;

const pad = (value: number) => String(value).padStart(2, '0');

const parseTime = (value: string) => {
  const matched = value.match(TIME_PATTERN);
  return matched
    ? { hour: matched[1]!, minute: matched[2]!, second: matched[3] ?? '00' }
    : null;
};

const resolveInitialTime = (value: string) =>
  parseTime(value) ?? { hour: '09', minute: '00', second: '00' };

const getTimeInSeconds = (value?: string) => {
  const parsed = value ? parseTime(value) : null;
  return parsed
    ? Number(parsed.hour) * 3600 + Number(parsed.minute) * 60 + Number(parsed.second)
    : null;
};

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = '请选择时间',
  className,
  size = 'md',
  precision = 'minute',
  minuteStep = 1,
  minExclusiveTime,
  disabled = false,
}) => {
  const initialTime = resolveInitialTime(value);
  const [draftHour, setDraftHour] = useState(initialTime.hour);
  const [draftMinute, setDraftMinute] = useState(initialTime.minute);
  const [draftSecond, setDraftSecond] = useState(initialTime.second);
  const [open, setOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [dropDirection, setDropDirection] = useState<'up' | 'down'>('down');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    zIndex: 9999,
  });
  const draftTime =
    precision === 'second'
      ? `${draftHour}:${draftMinute}:${draftSecond}`
      : `${draftHour}:${draftMinute}`;
  const minimumTime = getTimeInSeconds(minExclusiveTime);
  const draftTimeInSeconds = getTimeInSeconds(draftTime);
  const draftDisabled = Boolean(
    minimumTime !== null &&
      draftTimeInSeconds !== null &&
      draftTimeInSeconds <= minimumTime,
  );

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const panelHeight =
      panelRef.current?.offsetHeight || ESTIMATED_PANEL_HEIGHT;
    const panelWidth = Math.min(PANEL_WIDTH, Math.max(0, window.innerWidth - 16));
    const shouldDropUp =
      window.innerHeight - rect.bottom < panelHeight + PANEL_GAP;
    setDropDirection(shouldDropUp ? 'up' : 'down');
    setPanelStyle({
      position: 'fixed',
      left: Math.min(
        Math.max(8, rect.left),
        Math.max(8, window.innerWidth - panelWidth - 8),
      ),
      top: shouldDropUp
        ? Math.max(8, rect.top - panelHeight - PANEL_GAP)
        : rect.bottom + PANEL_GAP,
      width: panelWidth,
      maxHeight: 'calc(100dvh - 16px)',
      zIndex: 9999,
    });
  }, []);

  const closeImmediate = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setOpen(false);
    setIsAnimatingOut(false);
  }, []);

  const close = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsAnimatingOut(true);
    closeTimeoutRef.current = setTimeout(
      closeImmediate,
      CLOSE_ANIMATION_DURATION,
    );
  }, [closeImmediate]);

  const openPanel = () => {
    const next = resolveInitialTime(value);
    setDraftHour(next.hour);
    setDraftMinute(next.minute);
    setDraftSecond(next.second);
    setIsAnimatingOut(false);
    updatePosition();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        wrapperRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      close();
    };
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    document.addEventListener('mousedown', handleOutside);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [close, open, updatePosition]);

  useEffect(
    () => () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    },
    [],
  );

  const selectNow = () => {
    const now = new Date();
    setDraftHour(pad(now.getHours()));
    setDraftMinute(pad(now.getMinutes()));
    setDraftSecond(pad(now.getSeconds()));
  };

  const parsedValue = parseTime(value);
  const displayValue = parsedValue
    ? precision === 'second'
      ? `${parsedValue.hour}:${parsedValue.minute}:${parsedValue.second}`
      : `${parsedValue.hour}:${parsedValue.minute}`
    : '';

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={placeholder}
        onClick={() => (open ? close() : openPanel())}
        className={cn(
          'flex w-full items-center border border-[var(--lumen-color-border-strong)] bg-[var(--lumen-color-surface)] outline-none transition-all hover:border-[var(--lumen-color-border-hover)] focus:border-[var(--lumen-color-primary)] focus:ring-2 focus:ring-[var(--lumen-color-primary)]/10',
          radiusTokens.control,
          size === 'md'
            ? 'h-[36px] px-3 text-[13px]'
            : 'h-[40px] px-3.5 text-[14px]',
          disabled && 'cursor-not-allowed bg-[var(--lumen-color-surface-muted)] opacity-60',
        )}
      >
        <Clock size={15} className="mr-2 shrink-0 text-[var(--lumen-color-text-placeholder)]" />
        <span
          className={cn(
            'min-w-0 flex-1 truncate whitespace-nowrap text-left',
            displayValue ? 'text-[var(--lumen-color-text)]' : 'text-[var(--lumen-color-text-placeholder)]',
          )}
        >
          {displayValue || placeholder}
        </span>
        <ChevronDown
          size={15}
          className={cn(
            'ml-auto shrink-0 text-[var(--lumen-color-text-placeholder)] transition-transform',
            open && !isAnimatingOut && 'rotate-180',
          )}
        />
      </button>

      {open
        ? createPortal(
            <div
              ref={panelRef}
              data-time-picker-panel
              className="overflow-x-hidden overflow-y-auto rounded-[8px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] shadow-[0_18px_46px_var(--lumen-color-shadow)]"
              style={{
                ...panelStyle,
                animation: isAnimatingOut
                  ? dropDirection === 'up'
                    ? 'lumen-dropdown-out-up 0.12s ease-in forwards'
                    : 'lumen-dropdown-out 0.12s ease-in forwards'
                  : dropDirection === 'up'
                    ? 'lumen-dropdown-in-up 0.12s ease-out'
                    : 'lumen-dropdown-in 0.12s ease-out',
                transformOrigin: dropDirection === 'up' ? 'bottom' : 'top',
              }}
            >
              <TimeSelector
                hour={draftHour}
                minute={draftMinute}
                second={draftSecond}
                onHourChange={setDraftHour}
                onMinuteChange={setDraftMinute}
                onSecondChange={setDraftSecond}
                precision={precision}
                minuteStep={minuteStep}
              />
              <div className="flex items-center justify-between border-t border-[var(--lumen-color-surface-muted)] px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    closeImmediate();
                  }}
                  className="text-[12px] text-[var(--lumen-color-text-placeholder)] hover:text-[var(--lumen-color-text-muted)]"
                >
                  清除
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectNow}
                    className="text-[12px] font-medium text-[var(--lumen-color-primary)]"
                  >
                    此刻
                  </button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={draftDisabled}
                    onClick={() => {
                      onChange(draftTime);
                      closeImmediate();
                    }}
                  >
                    确定
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};
