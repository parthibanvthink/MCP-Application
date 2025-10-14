import React from 'react';
import { AlertCircle } from 'lucide-react';

interface SwitchProps {
  id: string;
  label?: string;
  value: boolean;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  onChange: (id: string, value: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({
  id,
  label,
  value,
  required,
  disabled,
  error,
  onChange,
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => onChange(id, !value)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            value ? 'bg-blue-600' : 'bg-gray-200'
          }`}
          disabled={disabled}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              value ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        {label && (
          <span className="ml-3 text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        )}
      </div>
      {error && (
        <div className="flex items-center mt-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default Switch;
