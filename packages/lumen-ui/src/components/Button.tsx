import React from 'react';
import { getButtonClassNames, type ButtonSize, type ButtonVariant } from './designTokens';

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
  ...props
}) => {
  return (
    <button
      {...props}
      data-ui="button"
      data-icon-only={iconOnly || undefined}
      data-variant={variant}
      data-size={size}
      className={getButtonClassNames({ variant, size, iconOnly, className })}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {!iconOnly && children}
    </button>
  );
};
