import { Tooltip } from '../Tooltip';
import { cn } from '../classNames';

export function OverflowText({ text, wrap = false, className }: {
  text: string;
  wrap?: boolean;
  className?: string;
}) {
  return (
    <Tooltip content={text} disabled={wrap} onlyWhenOverflow className="max-w-[min(24rem,calc(100vw-2rem))] !whitespace-normal [overflow-wrap:anywhere]">
      <span className={cn('block min-w-0', wrap ? 'whitespace-normal [overflow-wrap:anywhere]' : 'truncate', className)}>
        {text}
      </span>
    </Tooltip>
  );
}
