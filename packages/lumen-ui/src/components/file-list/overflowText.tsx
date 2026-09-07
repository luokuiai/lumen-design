import { useEffect, useRef, useState } from 'react';
import { Tooltip } from '../Tooltip';
import { cn } from '../classNames';

export function OverflowText({ text, wrap = false, className }: {
  text: string;
  wrap?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const element = ref.current?.firstElementChild as HTMLElement | null;
    if (!element) return;
    const measure = () => setOverflow(!wrap && element.scrollWidth > element.clientWidth);
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(element);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [text, wrap]);

  return (
    <span ref={ref} className="block min-w-0">
      <Tooltip content={text} disabled={wrap || !overflow} className="max-w-[min(24rem,calc(100vw-2rem))] !whitespace-normal [overflow-wrap:anywhere]">
        <span className={cn('block min-w-0', wrap ? 'whitespace-normal [overflow-wrap:anywhere]' : 'truncate', className)}>
          {text}
        </span>
      </Tooltip>
    </span>
  );
}
