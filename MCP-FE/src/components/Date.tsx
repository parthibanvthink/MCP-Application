import React from 'react';
import { Calendar } from 'lucide-react';
import { AlertCircle } from 'lucide-react';

interface DateProps {
  id: string;
  label?: string;
  value: string;
  required?: boolean;
  disabled?: boolean;
  dateType?: 'date' | 'datetime' | 'time';
  error?: string;
  onChange: (id: string, value: string) => void;
}

const Date: React.FC<DateProps> = ({
  id,
  label,
  value,
  required,
  disabled,
  dateType = 'date',
  error,
  onChange,
}) => {
  const baseClasses =
    'w-full transition-colors duration-200 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const inputClasses = `${baseClasses} ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'} pr-10`;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={dateType === 'datetime' ? 'datetime-local' : dateType}
          value={value || ''}
          onChange={(e) => onChange(id, e.target.value)}
          className={inputClasses}
          disabled={disabled}
        />
        <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
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

export default Date;
