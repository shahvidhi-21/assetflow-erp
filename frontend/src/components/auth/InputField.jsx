import React from 'react';

const InputField = React.forwardRef(({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  success,
  required = false,
  className = '',
  ...props
}, ref) => {
  const hasError = !!error;
  const hasSuccess = !!success && !error;

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <label 
            htmlFor={id} 
            className="text-sm font-medium text-brandtext-primary select-none cursor-pointer"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        </div>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={`
            w-full px-3.5 py-2.5 bg-brandbg-base border rounded-lg text-brandtext-primary text-sm 
            transition-all duration-200 ease-in-out placeholder:text-brandtext-secondary/50 outline-none
            ${hasError 
              ? 'border-red-500 focus:ring-2 focus:ring-red-500/10' 
              : hasSuccess
                ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'
                : 'border-brandborder focus:border-brandblue focus:ring-4 focus:ring-brandblue-light'
            }
          `}
          {...props}
        />
      </div>

      {hasError && (
        <p 
          id={`${id}-error`} 
          className="text-xs text-red-500 font-medium animate-fade-up"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;
