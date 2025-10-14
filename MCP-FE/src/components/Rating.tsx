import React from 'react';
import { Star, AlertCircle } from 'lucide-react';

interface RatingProps {
  id: string;
  label?: string;
  value?: number;
  maxRating?: number;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  onChange: (id: string, value: number) => void;
}

const Rating: React.FC<RatingProps> = ({
  id,
  label,
  value = 0,
  maxRating = 5,
  required,
  disabled,
  error,
  onChange,
}) => {
  const renderLabel = () => {
    if (!label) return null;
    return (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
  };

  const renderError = () => {
    if (!error) return null;
    return (
      <div className="flex items-center mt-1 text-sm text-red-600">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </div>
    );
  };

  return (
    <div className="mb-4">
      {renderLabel()}
      <div className="flex space-x-1">
        {[...Array(maxRating)].map((_, index) => {
          const rating = index + 1;
          const isActive = value >= rating;
          return (
            <button
              key={rating}
              type="button"
              onClick={() => !disabled && onChange(id, rating)}
              className={`transition-colors ${
                isActive ? 'text-yellow-500' : 'text-gray-300'
              } hover:text-yellow-400`}
              disabled={disabled}
            >
              <Star className="w-6 h-6 fill-current" />
            </button>
          );
        })}
        {value > 0 && (
          <span className="ml-2 text-sm text-gray-600">({value}/{maxRating})</span>
        )}
      </div>
      {renderError()}
    </div>
  );
};

export default Rating;
