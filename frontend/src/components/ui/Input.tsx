import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  leftIcon?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', leftIcon, ...props }, ref) => {
    return (
      <div className={`flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-black ${className}`}>
        {leftIcon}
        <input ref={ref} className="w-full outline-none text-sm bg-transparent text-black placeholder-neutral-400" {...props} />
      </div>
    );
  }
);
Input.displayName = 'Input';
