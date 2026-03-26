import { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, className = "", id, ...props }, ref) => {
  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`px-3 py-2 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white border rounded-md shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 
        ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700'} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
