import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none';
  
  const variantClasses = {
    primary: 'bg-zinc-900 hover:bg-zinc-800 active:bg-black text-white shadow-sm focus-visible:ring-zinc-900',
    secondary: 'bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 text-zinc-900 focus-visible:ring-zinc-500',
    outline: 'border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 shadow-sm focus-visible:ring-zinc-900',
    ghost: 'bg-transparent hover:bg-zinc-100 active:bg-zinc-200/70 text-zinc-700 hover:text-zinc-900 focus-visible:ring-zinc-500',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm focus-visible:ring-rose-500',
  };
  
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
    md: 'text-sm px-4 py-2 h-9 sm:h-10 gap-2',
    lg: 'text-base px-5 py-2.5 h-11 sm:h-12 gap-2.5',
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className="inline-flex items-center flex-shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="inline-flex items-center flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;