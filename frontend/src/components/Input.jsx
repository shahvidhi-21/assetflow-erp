import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  id,
  type = 'text',
  icon: Icon,
  placeholder,
  value,
  onChange,
  required = false,
  error = '',
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-gray-700 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4 text-gray-400 pointer-events-none">
            <Icon size={20} strokeWidth={1.5} />
          </div>
        )}
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full py-3.5 ${
            Icon ? 'pl-12' : 'pl-5'
          } ${
            isPassword ? 'pr-12' : 'pr-5'
          } bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all duration-200`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff size={20} strokeWidth={1.5} />
            ) : (
              <Eye size={20} strokeWidth={1.5} />
            )}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-red-500 mt-1 pl-1">{error}</span>}
    </div>
  );
}
