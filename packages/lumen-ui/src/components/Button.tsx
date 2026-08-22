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
      className={getButtonClassNames({ variant, size, iconOnly, className })}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {!iconOnly && children}
    </button>
  );
};
