import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import InputField from './InputField';

const PasswordField = React.forwardRef(({
  id = 'password',
  label = 'Password',
  value,
  onChange,
  placeholder = '••••••••',
  error,
  success,
  required = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative w-full">
      <InputField
        ref={ref}
        id={id}
        label={label}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={error}
        success={success}
        required={required}
        {...props}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-[38px] p-1 text-brandtext-secondary/60 hover:text-brandtext-primary rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandblue focus-visible:ring-offset-2"
      >
        {showPassword ? (
          <EyeOff className="h-4.5 w-4.5" aria-hidden="true" />
        ) : (
          <Eye className="h-4.5 w-4.5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
});

PasswordField.displayName = 'PasswordField';

export default PasswordField;
