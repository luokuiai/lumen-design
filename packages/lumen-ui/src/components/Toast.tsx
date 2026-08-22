import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastOptions {
  duration?: number;
}

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastViewItem extends ToastItem {
  closing: boolean;
}

interface ToastTimer {
  timeoutId: number | null;
  remaining: number;
  startedAt: number;
}

type ToastListener = (item: ToastItem | null) => void;

const DEFAULT_DURATION = 2600;
const TOAST_ROOT_ID = 'global-toast-root';

const TONE_MAP = {
  success: {
    icon: CheckCircle2,
    iconWrap: 'bg-[var(--lumen-color-success-soft)] text-[var(--lumen-color-success)]',
    title: '操作成功',
  },
  info: {
    icon: Info,
    iconWrap: 'bg-[var(--lumen-color-info-soft)] text-[var(--lumen-color-primary)]',
    title: '提示',
  },
  warning: {
    icon: AlertCircle,
    iconWrap: 'bg-[var(--lumen-color-warning-soft)] text-[var(--lumen-color-warning)]',
    title: '请注意',
  },
  error: {
    icon: AlertCircle,
    iconWrap: 'bg-[var(--lumen-color-danger-soft)] text-[var(--lumen-color-danger-hover)]',
    title: '操作失败',
  },
} as const;

let toastRoot: Root | null = null;
let toastContainer: HTMLDivElement | null = null;
const listeners = new Set<ToastListener>();
const pendingItems: ToastItem[] = [];
const activeToastKeys = new Set<string>();

const createToastId = () => `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const getToastKey = (item: Pick<ToastItem, 'message' | 'type'>) =>
  `${item.type}:${item.message}`;

const notify = (item: ToastItem | null) => {
  if (listeners.size === 0 && item) {
    pendingItems.push(item);
    return;
  }

  listeners.forEach((listener) => listener(item));
};

const ensureToastHost = () => {
  if (typeof document === 'undefined') return;
  if (toastContainer && !document.body.contains(toastContainer)) {
    toastRoot?.unmount();
    toastRoot = null;
    toastContainer = null;
    listeners.clear();
  }
  if (toastRoot && toastContainer) return;

  const existing = document.getElementById(TOAST_ROOT_ID) as HTMLDivElement | null;
  toastContainer = existing || document.createElement('div');
  toastContainer.id = TOAST_ROOT_ID;

  if (!existing) {
    document.body.appendChild(toastContainer);
  }

  toastRoot = createRoot(toastContainer);
  toastRoot.render(<ToastViewport />);
};

const subscribe = (listener: ToastListener) => {
  listeners.add(listener);
  pendingItems.splice(0).forEach((item) => listener(item));
  return () => {
    listeners.delete(listener);
  };
};

const ToastViewport: React.FC = () => {
  const [items, setItems] = useState<ToastViewItem[]>([]);
  const timersRef = useRef<Map<string, ToastTimer>>(new Map());

  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer?.timeoutId != null && typeof window !== 'undefined') {
      window.clearTimeout(timer.timeoutId);
    }
    timersRef.current.delete(id);
  }, []);

  const startClose = useCallback((id: string) => {
    if (typeof window === 'undefined') return;
    clearTimer(id);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, closing: true } : item)),
    );
  }, [clearTimer]);

  const startTimer = useCallback((id: string, duration: number) => {
    if (typeof window === 'undefined') return;
    const timeoutId = window.setTimeout(() => startClose(id), duration);
    timersRef.current.set(id, {
      timeoutId,
      remaining: duration,
      startedAt: Date.now(),
    });
  }, [startClose]);

  const pauseTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (!timer || timer.timeoutId == null || typeof window === 'undefined') return;
    window.clearTimeout(timer.timeoutId);
    timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));
    timer.timeoutId = null;
  }, []);

  const resumeTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (!timer || timer.timeoutId != null) return;
    startTimer(id, timer.remaining);
  }, [startTimer]);

  const removeToast = useCallback((id: string) => {
    clearTimer(id);
    setItems((prev) => {
      const removed = prev.find((item) => item.id === id);
      if (removed) {
        activeToastKeys.delete(getToastKey(removed));
      }
      return prev.filter((item) => item.id !== id);
    });
  }, [clearTimer]);

  useEffect(() => {
    const timers = timersRef.current;
    const unsubscribe = subscribe((item) => {
      if (!item) {
        timers.forEach((timer) => {
          if (timer.timeoutId != null) window.clearTimeout(timer.timeoutId);
        });
        timers.clear();
        activeToastKeys.clear();
        setItems([]);
        return;
      }

      setItems((prev) => [...prev, { ...item, closing: false }]);
      startTimer(item.id, item.duration);
    });

    return () => {
      unsubscribe();
      timers.forEach((timer) => {
        if (timer.timeoutId != null) window.clearTimeout(timer.timeoutId);
      });
      timers.clear();
    };
  }, [startTimer]);

  if (items.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-3 top-3 z-[120] flex w-[calc(100vw-1.5rem)] flex-col items-end gap-2 pad:right-4 pad:top-4 pad:w-[328px] pad:gap-3 l:w-[344px] xl:right-6 xl:top-6"
      data-toast-container
    >
      {items.map((item) => (
        <ToastCard
          key={item.id}
          item={item}
          onClose={() => startClose(item.id)}
          onExited={() => removeToast(item.id)}
          onPause={() => pauseTimer(item.id)}
          onResume={() => resumeTimer(item.id)}
        />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{
  item: ToastViewItem;
  onClose: () => void;
  onExited: () => void;
  onPause: () => void;
  onResume: () => void;
}> = ({ item, onClose, onExited, onPause, onResume }) => {
  const tone = TONE_MAP[item.type];
  const Icon = tone.icon;

  return (
    <div
      className={`pointer-events-auto relative flex w-full min-w-0 max-w-full items-start gap-2.5 overflow-hidden rounded-[10px] bg-[var(--lumen-color-surface-glass)]/85 px-3 py-3 shadow-[0_3px_10px_var(--lumen-color-shadow)] ring-1 ring-white/70 backdrop-blur-[5px] backdrop-saturate-125 pad:gap-3 pad:px-4 ${
        item.closing
          ? 'animate-[lumen-toast-out_160ms_ease-in_forwards]'
          : 'animate-[lumen-toast-in_180ms_ease-out]'
      }`}
      data-toast-id={item.id}
      onAnimationEnd={() => {
        if (item.closing) onExited();
      }}
      onMouseEnter={onPause}
      onMouseLeave={onResume}
      role="status"
      aria-live="polite"
    >
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-white/70 ${tone.iconWrap}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-[var(--lumen-color-text-strong)]">{tone.title}</div>
        <div className="mt-1 text-[14px] leading-6 text-[var(--lumen-color-text-muted)]">{item.message}</div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="relative isolate flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-[var(--lumen-color-text-placeholder)] transition-colors after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-current after:opacity-0 after:transition-opacity hover:text-[var(--lumen-color-text-secondary)] hover:after:opacity-[0.08] active:after:opacity-[0.14] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20"
        aria-label="关闭消息提示"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export class Toast {
  static show(message: string, type: ToastType = 'info', options: ToastOptions = {}) {
    const key = getToastKey({ message, type });
    if (activeToastKeys.has(key)) {
      return;
    }
    activeToastKeys.add(key);
    ensureToastHost();
    notify({
      id: createToastId(),
      message,
      type,
      duration: options.duration ?? DEFAULT_DURATION,
    });
  }

  static success(message: string, options?: ToastOptions) {
    Toast.show(message, 'success', options);
  }

  static info(message: string, options?: ToastOptions) {
    Toast.show(message, 'info', options);
  }

  static warning(message: string, options?: ToastOptions) {
    Toast.show(message, 'warning', options);
  }

  static error(message: string, options?: ToastOptions) {
    Toast.show(message, 'error', options);
  }

  static clear() {
    pendingItems.splice(0);
    activeToastKeys.clear();
    notify(null);
  }

  static resetForTests() {
    Toast.clear();
    listeners.clear();
    toastRoot?.unmount();
    if (toastContainer?.parentNode) {
      toastContainer.parentNode.removeChild(toastContainer);
    }
    toastRoot = null;
    toastContainer = null;
  }
}
