import React from 'react';
import { getButtonClassNames, type ButtonSize, type ButtonVariant } from './designTokens';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconOnly?: boolean;
}

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
      data-variant={variant}
      data-size={size}
      className={getButtonClassNames({ variant, size, iconOnly, className })}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {!iconOnly && children}
    </button>
  );
};
