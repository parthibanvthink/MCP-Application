import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  label?: string;
  value: string;
  options: Option[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
  onChange: (id: string, value: string) => void;
}

const Select: React.FC<SelectProps> = ({
  id,
  label,
  value,
  options,
  required,
  disabled,
  error,
  onChange,
}) => {
  const baseClasses = "w-full transition-colors duration-200";
  const selectClasses = `${baseClasses} px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
    error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
  }`;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value || ''}
        onChange={(e) => onChange(id, e.target.value)}
        className={selectClasses}
        disabled={disabled}
      >
        <option value="">Choose an option...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="flex items-center mt-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default Select;
