// client/src/components/common/Button.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { getButtonClasses } from '../../theme/index.js';

export function Button({
  children,
  colorScheme = 'brand',
  variant = 'solid',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const classes = getButtonClasses({
    colorScheme,
    variant,
    size,
    isDisabled,
    isLoading
  });

  return (
    <button
      type={type}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      className={`${classes} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex items-center text-current">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="inline-flex items-center text-current">{rightIcon}</span>
      )}
    </button>
  );
}
export default Button;
