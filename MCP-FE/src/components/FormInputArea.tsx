// components/FormInputArea.tsx
import React from 'react';
import { CheckCircle, AlertCircle, Send, Loader2 } from 'lucide-react';
import { ChatSchema, FormErrors } from '../types/validation';

export const FormInputArea: React.FC<{
  schema: ChatSchema;
  formData: Record<string, any>;
  errors: FormErrors;
  onChange: (id: string, value: any) => void;
  onSubmit: () => void;
  isLoading: boolean;
}> = ({ schema, formData, errors, onSubmit, isLoading }) => {
  const hasValidData = Object.values(formData).some(val => (typeof val === 'string' ? val.trim() !== '' : val != null));
  return (
    <div className="bg-white border-t border-gray-200 p-4 flex items-center space-x-3">
      {Object.keys(errors).length > 0 && <div className="flex items-center text-red-600"><AlertCircle className="w-4 h-4 mr-1" />Please fix the errors above</div>}
      {Object.keys(errors).length === 0 && hasValidData && <div className="flex items-center text-green-600"><CheckCircle className="w-4 h-4 mr-1" />Ready to submit</div>}
      <button onClick={onSubmit} disabled={!hasValidData || isLoading || Object.keys(errors).length > 0} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2">
        {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Sending...</span></> : <><Send className="w-4 h-4" /><span>Send</span></>}
      </button>
    </div>
  );
};
