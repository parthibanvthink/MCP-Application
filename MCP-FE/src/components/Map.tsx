import React from 'react';
import { MapPin, AlertCircle } from 'lucide-react';

interface MapProps {
  id: string;
  label?: string;
  value?: string | any;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  onChange: (id: string, value: any) => void;
}

const Map: React.FC<MapProps> = ({
  id,
  label,
  value,
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
      <div
        className={`relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onClick={() => !disabled && onChange(id, 'Custom Location')}
      >
        <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-600">Interactive map would be rendered here</p>
        <p className="text-sm text-gray-500 mt-1">Click to select location</p>
        {value && (
          <div className="mt-2 text-sm text-blue-600">
            Selected: {typeof value === 'string' ? value : 'Custom Location'}
          </div>
        )}
      </div>
      {renderError()}
    </div>
  );
};

export default Map;
