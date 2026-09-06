import React, { useRef, useState } from 'react';
import { getButtonClassNames, type ButtonSize, type ButtonVariant } from './designTokens';

type ButtonRipple = {
  id: number;
  size: number;
  x: number;
  y: number;
};

interface ButtonBaseProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export type ButtonProps =
  | (ButtonBaseProps & {
    iconOnly: true;
    icon: React.ReactNode;
    children?: never;
    'aria-label': string;
  })
  | (ButtonBaseProps & {
    iconOnly?: false;
    icon?: React.ReactNode;
    children: React.ReactNode;
  });

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary' as ButtonVariant,
  size = 'md' as ButtonSize,
  icon,
  iconOnly = false,
  className = '',
  disabled,
  onKeyDown,
  onPointerDown,
  ...props
}) => {
  const nextRippleId = useRef(0);
  const [ripples, setRipples] = useState<ButtonRipple[]>([]);

  const addRipple = (button: HTMLButtonElement, clientX?: number, clientY?: number) => {
    const bounds = button.getBoundingClientRect();
    const x = clientX === undefined ? bounds.width / 2 : clientX - bounds.left;
    const y = clientY === undefined ? bounds.height / 2 : clientY - bounds.top;
    const radius = Math.hypot(
      Math.max(x, bounds.width - x),
      Math.max(y, bounds.height - y),
    );
    nextRippleId.current += 1;
    setRipples((current) => [...current, {
      id: nextRippleId.current,
      size: radius * 2,
      x: x - radius,
      y: y - radius,
    }]);
  };

  return (
    <button
      {...props}
      disabled={disabled}
      data-ui="button"
      data-icon-only={iconOnly || undefined}
      data-variant={variant}
      data-size={size}
      className={getButtonClassNames({ variant, size, iconOnly, className })}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (!disabled && !event.defaultPrevented) {
          addRipple(event.currentTarget, event.clientX, event.clientY);
        }
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!disabled && !event.defaultPrevented && !event.repeat && ['Enter', ' '].includes(event.key)) {
          addRipple(event.currentTarget);
        }
      }}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {!iconOnly && children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          aria-hidden="true"
          data-button-ripple
          className="lumen-button-ripple"
          style={{
            width: ripple.size,
            height: ripple.size,
            left: ripple.x,
            top: ripple.y,
          }}
          onAnimationEnd={() => {
            setRipples((current) => current.filter((item) => item.id !== ripple.id));
          }}
        />
      ))}
    </button>
  );
};
